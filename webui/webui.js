var express = require('express'),
    port = 8080,
    host = "::";
var fs = require('fs');
var url = require('url');
var request = require('request');
var dns = require('dns');

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

render_photos = function(res) {
	pickupSRV(metahub_srv, function(record) {
		myurl = url.parse("http://bokeh-metahub.service.consul:5000/photos");
		myurl.hostname = record.name;
		myurl.port = record.port;
		request({uri: myurl}).on('response', function(response) {
			var str = '';
			response.on('data', function (chunk) { str += chunk; });
			response.on('end', function () {
				var resp = JSON.parse(str);
				if (resp) {
					res.render('index', { title: 'Hey', message: 'Hello there!', photolist: resp["photos"]});                
				} else {
					res.status(500).send('Bad response from Metahub');
				}
			});
		}).end();
	});
};


var app = express();
app.set('view engine', 'pug');
app.get('/', function (req, res) {
    render_photos(res)
});


// Proxy thumbs requests to thumbhub
app.get(/thumbs\/.+(\.(png|jpg|bmp|jpeg|gif|tif))$/i, function (req, res) {
	pickupSRV(thumbhub_srv, function(record) {
		myurl = url.parse("http://bokeh-thumbhub.service.consul:3050"+req.path);
		myurl.hostname = record.name;
		myurl.port = record.port;
		console.log("Proxying request to: "+url.format(myurl));
		request({uri: myurl}).on('response', function(response) {
			response.on('data', function (chunk) { res.write(chunk); });
			response.on('end', function () {
				//res.writeHead(response.statusCode);
				res.end();
			});
			response.on('close', function(){
				//res.writeHead(response.statusCode);
				res.end();
			});
		}).on('error', function(e) {
			console.log(e.message);
			res.writeHead(500);
			res.end();
		}).end();
	});
});



// Proxy photo requests to photohub
app.get(/photos\/.+(\.(jpg|bmp|jpeg|gif|png|tif))$/i, function (req, res) {
	pickupSRV(photohub_srv, function(record) {
		myurl = url.parse("http://bokeh-photohub.service.dc1.consul:3000"+req.path);
		myurl.hostname = record.name;
		myurl.port = record.port;
		console.log("Proxying request to: "+url.format(myurl));
		request({uri: myurl}).on('response', function(response) {
			response.on('data', function (chunk) { res.write(chunk); });
			response.on('end', function () {
				//res.writeHead(response.statusCode);
				res.end();
			});
			response.on('close', function(){
				//res.writeHead(response.statusCode);
				res.end();
			});
		}).on('error', function(e) {
			console.log(e.message);
			res.writeHead(500);
			res.end();
		}).end();
	});
});

app.post("/photos", function (req, res) {
	var multiparty = require('multiparty');
	var form = new multiparty.Form();
	form.on('file', function(name,file){
		var tempPath = file.path;
		var origName = file.originalFilename;
		var creationDate = Date.now();
		fs.stat(tempPath,function (err, stats) {
			if (!err) {
				creationDate = stats.ctime.getTime();
			}
		});
		pickupSRV(metahub_srv, function(record) {
			myurl = url.parse("http://bokeh-metahub.service.dc1.consul:5000/photos");
			myurl.hostname = record.name;
			myurl.port = record.port;
			request({ 
				url: myurl,
				method: 'POST',
				json: {
					'url': encodeURIComponent(origName),
					'timestamp': creationDate,
					'description': origName
				}
			}, function (err, resp, body){
				if (err) {
					console.log("Failed to upload description to Metahub!:" + origName);
				}
				console.log("Successfully uploaded description to Metahub: " + origName);

				var formData = {
					custom_file: {
						value: fs.createReadStream(tempPath),
						options: {
							filename: origName
						}
					}
				}
				pickupSRV(photohub_srv, function(record) {
					myurl = url.parse("http://bokeh-photohub.service.dc1.consul:3000/photos");
					myurl.hostname = record.name;
					myurl.port = record.port;
					request.post({url: myurl, formData: formData}, function (err, resp, body){
						if (err) {
							console.log("Failed to upload image to Photohub!:" + origName);
						}
						console.log("Successfully uploaded photo to Photohub: " + origName);
						res.redirect("/");
					});
				});
			});
		});
	});
	form.parse(req);
});




app.listen(port, host);
console.log('Bokeh-WebUI listening on ' + host  + ':' + port);