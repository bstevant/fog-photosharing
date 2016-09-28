var express = require('express'),
fs = require('fs'),
path = require('path'),
common;

module.exports = function(config){
    var app = express(),
    staticFiles = config.staticFiles,
    common = require('./common')(config);

    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Cache-Control");
      next();
    });

    app.get(/.+\.(jpg|bmp|jpeg|gif|png|tif)$/i, function(req, res, next){
        var filePath = path.join(staticFiles, req.path),
        fstream;

        console.log("Got request for " + config.urlRoot + req.path);

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
                    res.redirect("/");
                });
            });
        });
        form.parse(req);
    });

    return app;
}