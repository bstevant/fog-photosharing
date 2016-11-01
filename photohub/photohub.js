var express = require('express'),
fs = require('fs'),
path = require('path'),
request = require('request'),
ipfsAPI = require('ipfs-api'),
dns = require('dns'),
url = require('url'),
common;


var metahub_srv = "bokeh-metahub.service.consul."
var photohub_srv = "bokeh-photohub.service.consul."
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
	common = require('./common')(config),
	ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'});

	app.get(/.+\.(jpg|bmp|jpeg|gif|png|tif)$/i, function(req, res, next){
		var filePath = path.join(staticFiles, req.path),
		fstream;

		console.log("Got request for " + config.urlRoot + req.path);

		//filePath = decodeURI(filePath);

		fs.stat(filePath, function(err){
			if (err){
				console.log("File not found on cache, try to find it on IPFS");
				var fileName = path.basename(filePath);
				var myFile = fs.createWriteStream(filePath);
				pickupSRV(metahub_srv, function(record) {
					var myurl = url.parse("http://bokeh-metahub.service.consul:5000/photos?url="+fileName);
					myurl.hostname = record.name;
					myurl.port = record.port;
					console.log("Requesting Metahub: "+url.format(myurl));
					request({uri: myurl}).on('response', function(response) {
						var str = '';
						response.on('data', function (chunk) { str += chunk; });
						response.on('end', function () {
							console.log("Got answer from Metahub: " + str);
							var resp = JSON.parse(str);
							if (resp) {
								// Only get the first photo
								myPhoto = resp['photos'][0];
								hash = myPhoto['hash'];
								console.log("Requesting IPFS hash: " + hash);
								ipfs.files.get(hash, function(err, stream) {
									if (err) {
										console.log("Error fetching file from IPFS: " + err);
										res.status(500).send('Error fetching file from IPFS');
									}
									stream.on('data', (file) => {
										file.content.pipe(myFile);
									});
									stream.on('end', () => {
										console.log("File saved to: " + filePath + " -- Now pipe HTTP response");
										fstream = fs.createReadStream(filePath);
										fstream.on('error', function(err){
											return common.error(req, res, next, 404, 'File not found', err);
										});

										return fstream.pipe(res);
									});
								});
							} else {
								console.log('Bad response from Metahub');
								res.status(500).send('Bad response from Metahub');
							}
						});
					}).on('error', function (error) {
						console.log('Error while requesting Metahub');
						res.status(500).send('Error while requesting Metahub');
					}).end();
				});
			} else {
				fstream = fs.createReadStream(filePath);
				fstream.on('error', function(err){
					return common.error(req, res, next, 404, 'File not found', err);
				});

				return fstream.pipe(res);
			}
		});
	});

	app.get(/hash\/.+$/i, function(req, res, next){
		console.log("Got request for " + config.urlRoot + req.path);
		hash = path.parse(req.path).base;
		ipfs.files.get(hash, function(err, stream) {
			if (err) {
				console.log("Error fetching file from IPFS: " + err);
				res.status(500).send('Error fetching file from IPFS');
			}
			stream.on('data', (file) => {
				file.content.pipe(res);
			});
			//stream.on('end', () => {
			//	res.end();
			//});
		});
	});
	
	
	app.post("/", function(req, res, next){
		var multiparty = require('multiparty');
		var form = new multiparty.Form();

		form.on('file', function(name,file){
			var tempPath = file.path;
			var origName = encodeURIComponent(file.originalFilename);
			fs.readFile(tempPath, function (err, data) {
				var newPath = __dirname + "/" + config.staticFiles + "/" + origName;
				fs.writeFile(newPath, data, function (err) {
					if (err) {
						console.log("Error Writing file at " + newPath);
					} else {
						console.log("Successfully saved new photo " + origName);
					}
					ipfs.util.addFromFs(newPath, {recursive: false}, function(err, r) {
						if (err) {
							console.log("Error adding file: " + err);
							res.writeHead(500);
							res.end();
						}
						res.setHeader('Content-Type', 'application/json');
						console.log("Exported to IPFS with hash: " + r[0]['hash']);
						res.send(JSON.stringify(r[0]));
					});
				});
			});
		});
		form.parse(req);
	});

	return app;
}