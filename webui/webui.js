var express = require('express'),
    port = 8080,
    host = "::";
    
    
    
var app = express();
app.set('view engine', 'pug');
app.get('/', function (req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!'});
});

app.listen(port, host);