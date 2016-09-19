var express = require('express'),
    photohub = require('./photohub'),
    port = 3000,
    host = "::";

var app = express();
app.use('/photohub', require('./photohub.js')({
    staticFiles : 'resources/photos',
    urlRoot : 'photohub',
    title : 'Example Gallery',
}));

//app.get("/photos/.+(\.(jpg|bmp|jpeg|gif|png|tif)$/i", photohub.getphoto)
//app.get("/thumbs/.+(\.(jpg|bmp|jpeg|gif|png|tif)$/i", photohub.getphoto)


app.listen(port, host);
host = host || 'localhost';
console.log('node-gallery listening on ' + host  + ':' + port);