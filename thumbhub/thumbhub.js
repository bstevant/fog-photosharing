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

function getMIMEtype(hash, cb) {
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
					cb(false, type);
				} else {
					console.log('Bad response from Metahub');
					cb('error', '');
				}
			});
		}).on('error', function (error) {
			console.log('Error while requesting Metahub');
			cb('error', '');
		});
	});
}

module.exports = function(config){
	var app = express(),
	staticFiles = config.staticFiles,
	common = require('./common')(config);

//	app.get(/.+\.(jpg|bmp|jpeg|gif|png|tif)$/i, function(req, res, next){
	app.get(/.+$/i, function(req, res, next){
		var filePath = path.join(staticFiles, req.path),
		fstream;
		var filename = path.parse(req.path).base;

		console.log("Got request for " + config.urlRoot + req.path);

		//filePath = decodeURI(filePath);

		getMIMEtype(filename, function (e, type) {
			if (e) { 
				console.log("Unable to get MIME type on MetaHub");
				return common.error(req, res, next, 404, 'File not found', err);
			}
			console.log("Got from MetaHub type: " + type)
			fs.stat(filePath, function(err){
				if (err){
					console.log("Thumb not found: " + req.path);
					tmpFile = tmp.fileSync();
					pickupSRV(photohub_srv, function(record) {
						var myurl = 'http://' + record.name + ':' + record.port + '/photos/hash/' + filename;
						console.log('Uploading photo from PhotoHub: '+myurl);
						jimp.read(myurl, function(err, img) {
							if (err) {
								console.log("Cannot download: " + myurl);
								return common.error(req, res, next, 404, 'File not found', err);
							}
							img.resize(256, jimp.AUTO).write(filePath, function(err, img) {
								if (err) {
									console.log("Cannot write final thumb: " + filePath + " err: " + err);
									return common.error(req, res, next, 404, 'File not found', err);
								}
								console.log("Successfully created thumb: " + filePath);
								fstream = fs.createReadStream(filePath);
								return fstream.pipe(res);
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