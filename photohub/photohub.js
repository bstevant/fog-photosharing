var express = require('express'),
fs = require('fs'),
path = require('path'),
request = require('request'),
ipfsAPI = require('ipfs-api'),
dns = require('dns'),
url = require('url'),
mime = require('mime-types'),
common;


var metahub_srv = "bokeh-metahub.service.consul."
var photohub_srv = "bokeh-photohub-4001.service.consul."
var thumbhub_srv = "bokeh-thumbhub.service.consul."

function pickupSRV(name, res, func) {
	dns.resolveSrv(name, function (err, results) {
		if (results instanceof Array) {
			// Pickup a random result from the different resolved names
			result = results[Math.floor(Math.random()*results.length)];
			func(result);
			//findBestSRV(results, func)
		} else {
			console.log("Error resolving: " + name);
			res.status(500).send("Error resolving: " + name);
			res.end();
		}
	});
}


module.exports = function(config){
	var app = express(),
	staticFiles = config.staticFiles,
	common = require('./common')(config),
	ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'});

	// EXPERIMENTAL: Make 


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
				pickupSRV(metahub_srv, res, function(record) {
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
		var hash = path.parse(req.path).base;
		
		const stream = ipfs.files.getReadableStream(hash)
		if (stream == null) {
			console.log("Error fetching file from IPFS: " + err);
			res.status(500).send('Error fetching file from IPFS');
		}
		stream.on('data', (file) => {
			console.log("File found on IPFS: " + file.path);
			file.content.pipe(res);
		});
			//stream.on('end', () => {
			//	res.end();
			//});
	});
	
	app.delete(/hash\/.+$/i, function(req, res, next){
		console.log("Delete " + req.path);
		var hash = path.parse(req.path).base;
		
		try {
			ipfs.pin.rm(hash, function (err, pinset) {
			if (err) {
				console.log("Error deleting hash " + hash + " " + err);
				res.writeHead(500);
				res.end();
			}
			ipfs.repo.gc();
			res.end();
			});
		} catch (error) {
			console.log("Error deleting hash " + hash + " " + err);
			res.writeHead(500);
			res.end();
		}
	});
	
	app.post("/", function(req, res, next){
		var multiparty = require('multiparty');
		var form = new multiparty.Form();

		form.on('file', function(name, file){
			var type = mime.contentType(file.originalFilename) || 'application/octet-stream';
			console.log("Got POST request for " + file.path + " with type " + type);
			ipfs.util.addFromFs(file.path, {recursive: false}, function(err, r) {
				if (err) {
					console.log("Error adding file: " + err);
					res.writeHead(500);
					res.end();
				}
				res.setHeader('Content-Type', 'application/json');
				console.log("Exported to IPFS with hash: " + r[0]['hash']);
				r[0]['type'] = type;
				res.send(JSON.stringify(r[0]));
			});
		});
		form.parse(req);
	});

	return app;
}