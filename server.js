var express = require('express');
var http = require('http');
var path = require('path');

var app = express();
var server = http.createServer(app);
require('./socketConfigServ')(server);
var port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

server.listen(port);
console.log('Listening on port number ' + port);