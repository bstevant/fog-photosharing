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

function pickupSRV(name, func) {
	dns.resolveSrv(name, function (err, results) {
		if (results instanceof Array) {
			// Pickup a random result from the different resolved names
			result = results[Math.floor(Math.random()*results.length)];
			func(result);
		}
	});
}


module.exports = function(config){
	var app = express(),
	staticFiles = config.staticFiles,
	common = require('./common')(config);

//	app.get(/.+\.(jpg|bmp|jpeg|gif|png|tif)$/i, function(req, res, next){
	app.get(/hash\/.+$/i, function(req, res, next){
		var filePath = path.join(staticFiles, req.path),
		fstream;
		var filename = path.parse(req.path).base;

		console.log("Got request for " + config.urlRoot + req.path);

		//filePath = decodeURI(filePath);

		fs.stat(filePath, function(err){
			if (err){
				console.log("Thumb not found: " + req.path);
				tmpFile = tmp.fileSync();
				pickupSRV(photohub_srv, function(record) {
					var myurl = url.parse('http://bokeh-photohub.service.consul:3000/photos/hash/' + filename);
					myurl.hostname = record.name;
					myurl.port = record.port;
					console.log('Uploading photo from PhotoHub: '+myurl.format());
					request({uri: myurl})
					.on('error', function(err) {
						console.log("Unable to create thumb: " + req.path);
						return common.error(req, res, next, 404, 'File not found', err);
					})
					.on('response', function(response) {
						console.log("Reply from photohub: " + response.statusCode)
						response.on('end', function () {
							jimp.read(tmpFile.name, function(err, img) {
								if (err) {
									console.log("Cannot read temp file: " + tmpFile.name)
									return common.error(req, res, next, 404, 'File not found', err);
								}
								img.resize(256, jimp.AUTO).write(filePath, function(err, img) {
									if (err) {
										console.log("Cannot write final thumb: " + tmpFile.name)
										return common.error(req, res, next, 404, 'File not found', err);                                        
									}
									console.log("Successfully created thumb: " + filePath);
									fstream = fs.createReadStream(filePath);
									return fstream.pipe(res);                  
								});
							});
						});
					}).pipe(fs.createWriteStream(tmpFile.name));
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
    
	return app;
}