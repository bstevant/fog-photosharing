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

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
  res.render('error', { error: err });
}
app.use(errorHandler);

app.listen(port, host);
host = host || 'localhost';
console.log('PhotoHub listening on ' + host  + ':' + port);