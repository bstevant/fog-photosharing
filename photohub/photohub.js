var express = require('express'),
fs = require('fs'),
path = require('path'),
common;

module.exports = function(config){
    var app = express(),
    staticFiles = config.staticFiles,
    common = require('./common')(config);

    app.get(/.+(\.(jpg|bmp|jpeg|gif|png|tif)(\?tn=(1|0))?)$/i, function(req, res, next){
        var filePath = path.join(staticFiles, req.path),
        fstream;

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
    
    app.put(/.+(\.(jpg|bmp|jpeg|gif|png|tif)(\?tn=(1|0))?)$/i, function(req, res, next){
        var pathArray = req.files.image.path.split( '/' );
    });
    
    return app;
}