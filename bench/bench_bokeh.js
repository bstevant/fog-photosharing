var request = require('request');
var fs = require('fs');
var dns = require('dns');

var d = new Date();
//console.log('Starting Bench Bokeh at ' + d.toISOString());

var metahub_srv = "bokeh-metahub.service.consul.";
var photohub_srv = "bokeh-photohub-3000.service.consul.";
var thumbhub_srv = "bokeh-thumbhub.service.consul.";
var photo_hash = "QmVKti8kybkNsFvHyN1Poc3KUxUyppakeDcqm6bDu9eNie";

function pickupSRV(name, func) {
	dns.resolveSrv(name, function (err, results) {
		if (results instanceof Array) {
			// Pickup a random result from the different resolved names
			result = results[Math.floor(Math.random()*results.length)];
			func(result);
		} else {
			console.log("Error resolving: " + name);
			func("");
		}
	});
}

function bench_metahub() {
	pickupSRV(metahub_srv, function(record) {
		var myurl = 'http://' + record.name + ':' + record.port + '/photos';
		//console.log("MH_Bench1: Get all photos");
		var start = new Date();
		request({uri: myurl}).on('response', function(response) {
			response.on('end', function () {
				var end = new Date() - start;
				console.log("MH_Bench1: result: %dms", end)
			});
			
			myurl = 'http://' + record.name + ':' + record.port + '/photos/' + photo_hash;
			//console.log("MH_Bench2: Get one photo");
			start = new Date();
			request({uri: myurl}).on('response', function(response) {
				response.on('end', function () {
					var end = new Date() - start;
					console.log("MH_Bench2: result: %dms", end)
				});
			});
		});
	});
}

function bench_photohub() {
	pickupSRV(photohub_srv, function(record) {
		var myurl = 'http://' + record.name + ':' + record.port + '/photos/hash/' + photo_hash;
		//console.log("MH_Bench1: Get all photos");
		var start = new Date();
		request({uri: myurl}).on('response', function(response) {
			response.on('end', function () {
				var end = new Date() - start;
				console.log("PH_Bench1: result: %dms", end)
			});
			
			var imgPath = "/bench_bokeh/test_img.png"
			var formData = {
				custom_file: {
					value: fs.createReadStream(imgPath),
					options: {
						filename: "test_img.png"
					}
				}
			}
			myurl = 'http://' + record.name + ':' + record.port + '/photos/';
			//console.log("MH_Bench2: Get one photo");
			start = new Date();
			request.post({url: myurl, formData: formData}, function (err, resp, body){
				if (err) {
					console.log("Failed to upload image to Photohub!:" + err);
				} else {
					var end = new Date() - start;
					console.log("PH_Bench2: result: %dms", end)
				}
			});
		});
		
		
	});
}

function bench_thumbhub() {
	pickupSRV(thumbhub_srv, function(record) {
		var myurl = 'http://' + record.name + ':' + record.port + '/thumbs/hash/' + photo_hash;
		//console.log("MH_Bench1: Get all photos");
		var start = new Date();
		request({uri: myurl}).on('response', function(response) {
			response.on('end', function () {
				var end = new Date() - start;
				console.log("TH_Bench1: result: %dms", end)
			});
		});
	});
}

bench_metahub();
bench_photohub();
bench_thumbhub();
