var express = require('express'),
    port = 8080,
    host = "::";
var fs = require('fs');
var request = require('request');

render_photos = function(res) {
    request("http://metahub:5000/photos").on('response', function(response) {
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
};


var app = express();
app.set('view engine', 'pug');
app.get('/', function (req, res) {
    render_photos(res)
});

// Proxy photo requests to photohub
app.get(/photos\/.+\.jpg|bmp|jpeg|gif|png|tif$/i, function (req, res) {
    console.log("Proxying request to http://photohub:3000"+req.path);
    request("http://photohub:3000"+req.path).on('response', function(response) {
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

app.post("/photos", function (req, res) {
    var options= {
        host: 'photohub',
        port: '3000',
        path: req.path
    }
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
        request({ 
            url: "http://metahub:5000/photos",
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
        });

        var formData = {
            custom_file: {
                value: fs.createReadStream(tempPath),
                options: {
                    filename: origName
                }
            }
        }
        request.post({url: "http://photohub:3000/photos", formData: formData}, function (err, resp, body){
            if (err) {
                console.log("Failed to upload image to Photohub!:" + origName);
            }
            console.log("Successfully uploaded photo to Photohub: " + origName);
        });
        res.redirect("/");
    });
    form.parse(req);
});


// Proxy thumbs requests to thumbhub
app.get(/thumbs\/.+\.jpg|bmp|jpeg|gif|png|tif$/i, function (req, res) {
    var options= {
        host: 'thumbhub',
        port: '3050',
        path: req.path
    }
    console.log("Proxying request to http://thumbhub:3050"+req.path);
    request("http://thumbhub:3050"+req.path).on('response', function(response) {
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




app.listen(port, host);
console.log('WebUI listening on ' + host  + ':' + port);