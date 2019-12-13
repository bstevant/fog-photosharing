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

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error.message);
});

app.listen(port, host);
host = host || 'localhost';
console.log('PhotoHub listening on ' + host  + ':' + port);