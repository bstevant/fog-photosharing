var express = require('express'),
fs = require('fs'),
path = require('path'),
url = require('url'),
request = require('request'),
dns = require('dns'),
jimp = require('jimp'),
tmp = require("tmp"),
common;

var metahub_srv = "bokeh-metahub.service.consul."
var photohub_srv = "bokeh-photohub-3000.service.consul."
var thumbhub_srv = "bokeh-thumbhub.service.consul."

function pickupSRV(name, cb) {
	dns.resolveSrv(name, function (err, results) {
		if (results instanceof Array) {
			// Pickup a random result from the different resolved names
			result = results[Math.floor(Math.random()*results.length)];
			cb(result);
		}
	});
}

function getMetaData(hash, qosid, cb) {
	pickupSRV(metahub_srv, function(record) {
		var myurl = 'http://' + record.name + ':' + record.port + '/photos/' + hash + "?qosid=" + qosid;
		console.log("Requesting Metahub: "+ myurl);
		request({uri: myurl}).on('response', function(response) {
			var str = '';
			response.on('data', function (chunk) { str += chunk; });
			response.on('end', function () {
				var resp = JSON.parse(str);
				if (resp) {
					myPhoto = resp['photos'][0];
					type = myPhoto['type'];
					url = myPhoto['url'];
					cb(false, url, type);
				} else {
					console.log('Bad response from Metahub');
					cb('error', '', '');
				}
			});
		}).on('error', function (error) {
			console.log('Error while requesting Metahub');
			cb('error', '', '');
		});
	});
}

function getPhoto(hash, qosid, path, cb) {
	pickupSRV(photohub_srv, function(record) {
		var myurl = 'http://' + record.name + ':' + record.port + '/photos/hash/' + hash + "?qosid=" + qosid;
		console.log('Downloading photo from PhotoHub: '+myurl);
		// Set timout for 42sec
		request({url: myurl, agentOptions: { timeout: 420000 }})
		.on('error', function(err) {
			cb(err);
		})
		.on('response', function(response) {
			console.log("Reply from photohub: " + response.statusCode);
			response.on('end', function () {
				console.log("Written file: " + path);
				cb('');
			});
		}).pipe(fs.createWriteStream(path));
	});
}


module.exports = function(config){
	var app = express(),
	staticFiles = config.staticFiles,
	common = require('./common')(config);

//	app.get(/.+\.(jpg|bmp|jpeg|gif|png|tif)$/i, function(req, res, next){
	app.get(/.+$/i, function(req, res, next){ 
		var hashPath, filePath, fstream;
		var hash = path.basename(req.path);
		var qosid = req.query.qosid
		if (hash == 'test') {
			console.log("Got request for test API");
			jimp.read("./test_img.png", function(err1, img) {
	        	if (err1) {
	        		console.log("Cannot read: " + err1);
	        		return common.error(req, res, next, 404, 'File not found', err1);
	        	}
        	
				hashPath = staticFiles + "/test_img.png"
	        	img.resize(256, jimp.AUTO);
	        	img.write(hashPath, function(err3, i) {
	        		if (err3) {
	        			console.log("Cannot write final thumb: " + hashPath + " err3: " + err3);
	        			return common.error(req, res, next, 404, 'File not found', err3);
	        		}
	        		console.log("Successfully created thumb: " + hashPath);
	        		fstream = fs.createReadStream(hashPath);
					return fstream.pipe(res);
				});
			});
		} else {
		console.log("Got request for " + config.urlRoot + req.path);
		getMetaData(hash, qosid, function (e, p, type) {
			if (e) { 
				console.log("Unable to get MIME type on MetaHub");
				return common.error(req, res, next, 404, 'File not found', err);
			}
			console.log("Got from MetaHub type: " + type);
			hashPath = staticFiles + "/" + hash + path.extname(p);
			fs.stat(hashPath, function(err){
				if (err){
					console.log("Thumb not found: " + hashPath);
					filePath = staticFiles + "/" + p;
					getPhoto(hash, qosid, filePath, function (err) {
						if (err) {
							console.log("Cannot download: " + err);
							return common.error(req, res, next, 404, 'File not found', err);
						}
						jimp.read(filePath, function(err1, img) {
							if (err1) {
								console.log("Cannot read: " + err1);
								return common.error(req, res, next, 404, 'File not found', err1);
							}
							
							img.resize(256, jimp.AUTO);
							img.write(hashPath, function(err3, i) {
								if (err3) {
									console.log("Cannot write final thumb: " + hashPath + " err3: " + err3);
									return common.error(req, res, next, 404, 'File not found', err3);
								}
								console.log("Successfully created thumb: " + hashPath);
								fs.unlinkSync(filePath);
								fstream = fs.createReadStream(hashPath);
								return fstream.pipe(res);
							});
						});
					});
				} else {
					fstream = fs.createReadStream(hashPath);
					fstream.on('error', function(err){
						console.log("Cannot read thumb: " + hashPath);
						return common.error(req, res, next, 404, 'File not found', err);
					});
					return fstream.pipe(res);                
				}
			});
		});	
	}
	});
    
	return app;
}