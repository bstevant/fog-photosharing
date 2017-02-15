var express = require('express'),
port = 8080,
host = "::";
var fs = require('fs');
var path = require('path');
var url = require('url');
var request = require('request');
var dns = require('dns');
var tmp = require('tmp');
var os = require("os");

var metahub_srv = "bokeh-metahub.service.consul."
var photohub_srv = "bokeh-photohub-3000.service.consul."
var thumbhub_srv = "bokeh-thumbhub.service.consul."





function findBestSRV(records, func) {
	preference_table = {
	"fog8"	: [ "fog8"	, "fog11"	, "g6fog"	, "fog12"	, "fog9a"	,"fog10"],
	"fog9a"	: [ "fog9a"	, "fog11"	, "fog12"	, "fog8"	, "g6fog"	,"fog10"],
	"fog10"	: [ "fog10"	, "fog11"	, "fog12"	, "g6fog"	, "fog8"	,"fog9a"],
	"fog11"	: [ "fog11"	, "fog12"	, "fog8"	, "g6fog"	, "fog9a"	,"fog10"],
	"fog12"	: [ "fog12"	, "fog11"	, "g6fog"	, "fog8"	, "fog9a"	,"fog10"],
	"g6fog"	: [ "g6fog"	, "fog8"	, "fog12"	, "fog11"	, "fog9a"	,"fog10"],
	};
	
	myname = os.hostname();

	pref = Array();
	try{
		pref = preference_table[myname];
	} catch (err) {
	}
	best_idx = 100;
	best_record = undefined;
	records.forEach(function(i, index, array) {
		host = i.name.split(".")[0];
		idx = pref.indexOf(host);
		if (idx >= 0 && idx < best_idx) {
			best_idx = idx;
			best_record = i
		}
		if (index == (array.length-1)) {
			if (best_idx < 100) {
				func(best_record);
			}
		}
	});
}

function pickupSRV(name, func) {
	dns.resolveSrv(name, function (err, results) {
		if (results instanceof Array) {
			// Pickup a random result from the different resolved names
			//result = results[Math.floor(Math.random()*results.length)];
			//func(result);
			findBestSRV(results, func)
		} else {
			console.log("Error resolving: " + name);
			//func("");
		}
	});
}

render_function = function(res, func) {
	pickupSRV(metahub_srv, function(record) {
		var myurl = 'http://' + record.name + ':' + record.port + '/photos';
		console.log("Requesting Metahub: "+url.format(myurl));
		request({uri: myurl}).on('response', function(response) {
			var str = '';
			response.on('data', function (chunk) { str += chunk; });
			response.on('end', function () {
				var resp = JSON.parse(str);
				if (resp) {
					func(res, resp["photos"]);
				} else {
					res.status(500).send('Bad response from Metahub');
				}
			});
		}).on('error', function (error) {
			res.status(500).send('Bad response from Metahub');
		}).end();
	});
};


var app = express();
app.set('view engine', 'pug');

// Render full page
app.get('/', function (req, res) {
	console.log("Rendering whole page");
	res.render('index', { title: 'Hey', message: 'Hello there!'});
});

// Render div containing list of photos
app.get('/photos', function (req,res) {
	console.log("Rendering Photos div");
	render_function(res, function(r, photos) {
		r.render('includes/div_ng1', { title: 'Hey', message: 'Hello there!', photolist: photos});
	});
});

// Render JSON for nanoGallery
app.get('/nanoPhotosProvider.php', function (req,res) {
	console.log("Rendering Photos JSON");
	table = new Array();
	render_function(res, function(r, photos) {
		if (photos) {
			for (var i=0; i<photos.length; i++) {
				e = new Object();
				e.title = photos[i]["description"];
				e.description = photos[i]["description"];
				e.kind = 'image';
				e.ID = photos[i]["uuid"];
				e.albumID = '0'
				e.src = 'photos/hash/' + photos[i]["hash"];
				e.srct = 'thumbs/' + photos[i]["hash"];
				e.imgWidth = 150
				e.imgHeight = 100
				table.push(e);
			}
		}
		r.setHeader('Content-Type', 'application/json');
		r.send(JSON.stringify(table));
	});
});


// Pipe files like css
app.get(/files\/.+\.css$/i, function(req, res){
	var staticFiles = "./";
	var filePath = path.join(staticFiles, req.path),
	fstream;

	console.log("Get " + req.path);

	//filePath = decodeURI(filePath);

	fs.stat(filePath, function(err){
		if (err){
			return common.error(req, res, next, 404, 'File not found', err);
		}
		fstream = fs.createReadStream(filePath);
		fstream.on('error', function(err){
			return common.error(req, res, next, 404, 'File not found', err);
		});

		return fstream.pipe(res);
	});
});


// Proxy thumbs requests to thumbhub
app.get(/thumbs\/.+$/i, function(req, res, next){
//app.get(/thumbs\/.+(\.(png|jpg|bmp|jpeg|gif|tif))$/i, function (req, res) {
	console.log("Get " + req.path);
	pickupSRV(thumbhub_srv, function(record) {
		var myurl = 'http://' + record.name + ':' + record.port + req.path;
		console.log("Proxying request to thumbhub: "+url.format(myurl));
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
//app.get(/photos\/.+(\.(jpg|bmp|jpeg|gif|png|tif))$/i, function (req, res) {
app.get(/photos\/hash\/.+$/i, function(req, res, next){
	console.log("Get " + req.path);
	pickupSRV(photohub_srv, function(record) {
		var myurl = 'http://' + record.name + ':' + record.port + req.path;
		console.log("Proxying request to photohub: " + myurl);
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

// Proxy photo requests to photohub (faster?)
//app.get(/photos\/.+(\.(jpg|bmp|jpeg|gif|png|tif))$/i, function (req, res) {
app.get(/photox\/hash\/.+$/i, function(req, res, next){
	console.log("Get " + req.path);
	a = req.path.split('/');
	a[1]= 'photos';
	mypath = a.join('/');
	var tmpobj = tmp.fileSync();
	pickupSRV(photohub_srv, function(record) {
		var myurl = 'http://' + record.name + ':' + record.port + mypath;
		console.log('Uploading photo from PhotoHub: '+myurl);
		// Set timout for 42sec
		request({url: myurl, agentOptions: { timeout: 420000 }})
		.on('error', function(err) {
			res.writeHead(500);
			res.end();
		})
		.on('response', function(response) {
			console.log("Reply from photohub: " + response.statusCode);
			response.on('end', function () {
				console.log("Written file: " + tmpobj.name);
				fstream = fs.createReadStream(tmpobj.name);
				return fstream.pipe(res);
			});
		}).pipe(fs.createWriteStream(tmpobj.name));
	});
});



// Proxy photo delete requests to photohub
app.delete(/photos\/.+$/i, function(req, res, next){
	console.log("Delete " + req.path);
	pickupSRV(metahub_srv, function(record) {
		var myurl = 'http://' + record.name + ':' + record.port + req.path;
		console.log("Proxying request to metahub: " + myurl);
		request({method: 'DELETE', uri: myurl}).on('response', function(response) {
			response.on('end', function () {
				res.end();
			});
			response.on('close', function(){
				res.end();
			});
		}).on('error', function(e) {
			console.log(e.message);
			res.writeHead(500);
			res.end();
		}).end();
	});
});


// Upload a photo
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
			console.log("Uploading photo to Photohub: http://"+myurl.hostname+":"+myurl.port);
			request.post({url: myurl, formData: formData}, function (err, resp, body){
				if (err) {
					console.log("Failed to upload image to Photohub!:" + origName);
					res.writeHead(500);
					res.end();
					return;
				}
				console.log("Successfully uploaded photo to Photohub: " + body);
				var r = JSON.parse(body);
				if (!r) {
					console.log("Failed to read Photohub response!");
					res.writeHead(500);
					res.end();
					return;
				} else {
					hash = r['hash'];
					type = r['type'];
					console.log("Hash: " + hash);
					pickupSRV(metahub_srv, function(record) {
						myurl = url.parse("http://bokeh-metahub.service.dc1.consul:5000/photos");
						myurl.hostname = record.name;
						myurl.port = record.port;
						console.log("Uploading metadata to Metahub: http://"+myurl.hostname+":"+myurl.port);
						request({ 
							url: myurl,
							method: 'POST',
							json: {
								'hash': hash,
								'type': type,
								'url': encodeURIComponent(origName),
								'timestamp': creationDate.toString(),
								'description': origName
							}
						}, function (err2, resp2, body2){
							if (err2) {
								console.log("Failed to upload description to Metahub!:" + origName + "Resp: " + resp2);
								res.writeHead(500);
								res.end();
							}
							b = JSON.stringify(body2)
							console.log("Successfully uploaded description to Metahub: " + b);
							res.write(b)
							res.end();
							return;
						});
					});
				}
			});
		});
	});
	form.parse(req);
});



app.listen(port, host);
console.log('Bokeh-WebUI listening on ' + host  + ':' + port);
