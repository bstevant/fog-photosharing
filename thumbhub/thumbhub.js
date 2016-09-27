var express = require('express'),
fs = require('fs'),
path = require('path'),
common;

module.exports = function(config){
    var app = express(),
    staticFiles = config.staticFiles,
    common = require('./common')(config);

    app.get(/.+\.(jpg|bmp|jpeg|gif|png|tif)$/i, function(req, res, next){
        var filePath = path.join(staticFiles, req.path),
        fstream;

        console.log("Got request for " + config.urlRoot + req.path);

        filePath = decodeURI(filePath);

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
    
    app.put(/.+\.(jpg|bmp|jpeg|gif|png|tif)$/i, function(req, res, next){
        tempPath = req.files.displayImage.path
        fs.readFile(tempPath, function (err, data) {
          // ...
          var newPath = __dirname + "/uploads/uploadedFileName";
          fs.writeFile(newPath, data, function (err) {
            res.redirect("back");
          });
        });
    });
    
    return app;
}