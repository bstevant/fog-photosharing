var express = require('express'),
    photohub = require('./thumbhub'),
    port = 3050,
    host = "::";

var app = express();
app.use('/thumbs', require('./thumbhub.js')({
    staticFiles : 'resources/thumbs',
    urlRoot : 'thumbs',
    title : 'Example Gallery',
}));

//app.get("/photos/.+(\.(jpg|bmp|jpeg|gif|png|tif)$/i", photohub.getphoto)
//app.get("/thumbs/.+(\.(jpg|bmp|jpeg|gif|png|tif)$/i", photohub.getphoto)


app.listen(port, host);
host = host || 'localhost';
console.log('ThumbHub is listening on ' + host  + ':' + port);