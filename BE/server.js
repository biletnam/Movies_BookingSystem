var express = require('express');
var cors = require('cors');
var app = express();
var fs = require("fs");

app.use(cors());

app.get('/getMovies', function (req, res) {
   fs.readFile( __dirname + "/" + "movies.json", 'utf8', function (err, data) {
       console.log( data );
       res.json( data );
   });
})

app.get('/getTheaters', function (req, res) {
   fs.readFile( __dirname + "/" + "theaters.json", 'utf8', function (err, data) {
       console.log( data );
       res.json( data );
   });
})


var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log(" app listening at http://%s:%s", host, port)

})
