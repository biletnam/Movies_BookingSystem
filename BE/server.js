var express = require("express");
var bodyParser = require("body-parser");
var cors = require('cors');
var app = express();
var fs = require("fs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
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

app.post('/login',function (req, res){
  let username = req.body.username;
  let password = req.body.password;
  console.log(username, password);
  fs.readFile( __dirname + "/" + "users.json", "utf8", function (err, data){
    let users = JSON.parse(data);
    console.log(users);
    for(let user of users.users){
      console.log(user);
      if(user.username == username && user.password == password){
        res.end("success");
        break;
      }
    }
    res.end("failure");
  });

})

app.post('/createUser',function (req, res){
  let username = req.body.username;
  let password = req.body.password;
  console.log(username, password);

  fs.readFile( __dirname + "/" + "users.json", "utf8", function (err, data){

    let users = JSON.parse(data);
    users.users.push({username: username, password: password});

    fs.writeFile(__dirname + "/" + "users.json", JSON.stringify(users), function (err) {
      console.log(users);
    });
    res.end("success");

  });

})

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log(" app listening at http://%s:%s", host, port)

})
