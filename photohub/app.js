var express = require('express'),
    photohub = require('./photohub'),
    port = 3000,
    host = "::";

var app = express();
app.use('/photos', require('./photohub.js')({
    staticFiles : 'resources/photos',
    urlRoot : 'photos',
    title : 'Example Gallery',
}));
app.use('/thumbs', require('./photohub.js')({
    staticFiles : 'resources/thumbs',
    urlRoot : 'thumbs',
    title : 'Example Gallery',
}));

//app.get("/photos/.+(\.(jpg|bmp|jpeg|gif|png|tif)$/i", photohub.getphoto)
//app.get("/thumbs/.+(\.(jpg|bmp|jpeg|gif|png|tif)$/i", photohub.getphoto)


app.listen(port, host);
host = host || 'localhost';
console.log('PhotoHub listening on ' + host  + ':' + port);