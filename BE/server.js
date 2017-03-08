var http = require("http");
var fs = require("fs");

http.createServer(function(request, response) {
		if(request.url === '/'){
		fs.readFile('../FE/index.html', function(err, data){
				if(err){
				response.writeHead(404);
				response.write('Not Found!');
				}
				else{
				response.writeHead(200, {'Content-Type': 'text/html' })
				response.write(data);
				response.end();
				}
				});
		}
		else{
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write('<b>Hey there!</b><br /><br />Requested URL ' + request.url + ' does not exist..');
		response.end();
		}
		}).listen(8081);

// Console will print the message
console.log('Server running ');





/**
  var express = require('express');
  var cors = require('cors');
  var app = express();
  var fs = require("fs");

  app.use(cors());

  app.get('/listUsers', function (req, res) {
  fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
  console.log( data );
  res.end( data );
  });
  })
  app.get('/:id', function (req, res) {
// First read existing users.
fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
users = JSON.parse( data );
var user = users["user" + req.params.id] 
console.log( user );
res.end( JSON.stringify(user));
});
})


var server = app.listen(8081, function () {

var host = server.address().address
var port = server.address().port

console.log("Example app listening at http://%s:%s", host, port)

})
 **/
