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

function getMetaData(hash, cb) {
	pickupSRV(metahub_srv, function(record) {
		var myurl = 'http://' + record.name + ':' + record.port + '/photos?hash=' + hash;
		console.log("Requesting Metahub: "+ myurl);
		request({uri: myurl}).on('response', function(response) {
			var str = '';
			response.on('data', function (chunk) { str += chunk; });
			response.on('end', function () {
				console.log("Got answer from Metahub: " + str);
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

function getPhoto(hash, path, cb) {
	pickupSRV(photohub_srv, function(record) {
		var myurl = 'http://' + record.name + ':' + record.port + '/photos/hash/' + hash;
		console.log('Uploading photo from PhotoHub: '+myurl);
		request(myurl)
		.on('error', function(err) {
			cb(err);
		})
		.on('response', function(response) {
			console.log("Reply from photohub: " + response.statusCode)
			response.on('end', function () {
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
		var filePath, fstream;
		var hash = path.basename(req.path);
		var hashPath =  path.join(staticFiles + hash);
		
		console.log("Got request for " + config.urlRoot + req.path);
		getMetaData(hash, function (e, p, type) {
			if (e) { 
				console.log("Unable to get MIME type on MetaHub");
				return common.error(req, res, next, 404, 'File not found', err);
			}
			console.log("Got from MetaHub type: " + type)
			fs.stat(hashPath, function(err){
				if (err){
					console.log("Thumb not found: " + hashPath);
					filePath = path.join(common.staticFiles + p);
					getPhoto(hash, filePath, function (err) {
						if (err) {
							console.log("Cannot download: " + err);
							return common.error(req, res, next, 404, 'File not found', err1);
						}
						jimp.read(filePath, function(err1, img) {
							if (err1) {
								console.log("Cannot read: " + err);
								return common.error(req, res, next, 404, 'File not found', err1);
							}
							img.getBuffer(type, function(err2, data){
								if (err2) {
									console.log("Cannot get buffer: " + err);
									return common.error(req, res, next, 404, 'File not found', err2);
								}
								jimp.read(data).then(function (image) {
									image.resize(256, jimp.AUTO).write(hashPath, function(err3, img) {
										if (err3) {
											console.log("Cannot write final thumb: " + hashPath + " err3: " + err3);
											return common.error(req, res, next, 404, 'File not found', err3);
										}
										console.log("Successfully created thumb: " + hashPath);
										fstream = fs.createReadStream(hashPath);
										return fstream.pipe(res);
									});
								}).catch(function (e) {
									console.log("Cannot read buffer: " + e);
									return common.error(req, res, next, 404, 'File not found', err);
								});
							});
						});
					});
				} else {
					fstream = fs.createReadStream(filePath);
					fstream.on('error', function(err){
						console.log("Cannot read thumb: " + req.path);
						return common.error(req, res, next, 404, 'File not found', err);
					});
					return fstream.pipe(res);                
				}
			});
		});	
	});
    
	return app;
}