var express = require("express");
var bodyParser = require("body-parser");
var cors = require('cors');
var app = express();
var fs = require("fs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


app.get('/getImage1', function (req, res){
	let img = fs.readFileSync('./pics/Dawn_of_the_Planet_of_the_Apes.jpg');
	res.writeHead(200, {'Content-Type': 'image/jpg' });
	res.end(img, 'binary');
});
app.get('/getImage2', function (req, res){
	let img = fs.readFileSync('./pics/District_nine.jpg');
	res.writeHead(200, {'Content-Type': 'image/jpg' });
	res.end(img, 'binary');
});
app.get('/getImage3', function (req, res){
	let img = fs.readFileSync('./pics/X-Men_Days_of_Future_Past.jpg');
	res.writeHead(200, {'Content-Type': 'image/jpg' });
	res.end(img, 'binary');
});
app.get('/getImage4', function (req, res){
	let img = fs.readFileSync('./pics/Tangled.jpg');
	res.writeHead(200, {'Content-Type': 'image/jpg' });
	res.end(img, 'binary');
});
app.get('/getImage5', function (req, res){
	let img = fs.readFileSync('./pics/The_Amazing_Spiderman_2.jpg');
	res.writeHead(200, {'Content-Type': 'image/jpg' });
	res.end(img, 'binary');
});
app.get('/getImage6', function (req, res){
	let img = fs.readFileSync('./pics/The_Last_Samurai.jpg');
	res.writeHead(200, {'Content-Type': 'image/jpg' });
	res.end(img, 'binary');
});
app.get('/getImage7', function (req, res){
	let img = fs.readFileSync('./pics/The_Machinist.JPG');
	res.writeHead(200, {'Content-Type': 'image/jpg' });
	res.end(img, 'binary');
});
app.get('/getImage8', function (req, res){
	let img = fs.readFileSync('./pics/Transformers_Age_of_Extinction_Poster.jpeg');
	res.writeHead(200, {'Content-Type': 'image/jpg' });
	res.end(img, 'binary');
});



app.get('/getMovies', function (req, res) {
	fs.readFile( __dirname + "/" + "movies.json", 'utf8', function (err, data) {
		res.json( data );
	});
})

app.get('/getTheaters', function (req, res) {
	fs.readFile( __dirname + "/" + "theaters.json", 'utf8', function (err, data) {
		res.json( data );
	});
})

app.post('/getUserId', function(req, res){
	let username = req.body.username;
	let password = req.body.password;
	fs.readFile( __dirname + "/" + "users.json", "utf8", function (err, data){
		let users = JSON.parse(data);
		for(let user of users){
			if(user.username == username && user.password == password){
				res.send(user.id+'');

				break;
			}
		}
	});
})
app.post('/login',function (req, res){
	var valid = false;
	var admin = false;
	let username = req.body.username;
	let password = req.body.password;


	fs.readFile( __dirname + "/" + "users.json", "utf8", function (err, data){
		let users = JSON.parse(data);

		for(let user of users){
			if(user.username == username && user.password == password){
				valid = true;
				admin = user.admin;
				break;
			}
		}
		sendView(valid, admin);
	});
	function sendView(valid, admin){
		if(valid == false){
			res.end("Login failed");
		}else if(admin == true){
			fs.readFile('./pages/adminView.html', function(err, data){
				if(err){
					res.writeHead(404);
					res.write('Not Found!');
				}
				else{
					res.write(data);
					res.end();
				}
			});
		}
		else{
			fs.readFile('./pages/customerView.html', function(err, data){
				if(err){
					res.writeHead(404);
					res.write('Not Found!');
				}
				else{
					res.write(data);
					res.end();
				}
			});
		}
	}
})


app.post('/createUser',function (req, res){
	let username = req.body.username;
	let password = req.body.password;
	let admin = false;

	if(req.body.admin === "true"){
		admin = true;
	};

	fs.readFile( __dirname + "/" + "users.json", "utf8", function (err, data){

		let users = JSON.parse(data);
		let id = users.length +1;
		users.push({username: username, password: password, admin: admin, id: id, reservations: []});

		fs.writeFile(__dirname + "/" + "users.json", JSON.stringify(users, null, 4), function (err) {
			//console.log(users);
		});
		res.end("success");

	});

})


// HANDLE RESERVATION -> add reservation info to user in users.json file
app.post('/reservation', function(req, res){
	const reservation = req.body;


	fs.readFile( __dirname + "/" + "users.json", "utf8", function (err, data){

		let users = JSON.parse(data);
		let seats = [];
		for(let seat of reservation.seats){
			seats.push(seat.seatTotal);
		}

		fs.readFile( __dirname + "/" + "theaters.json", "utf8", function (err, data){
			let t = JSON.parse(data);

			const theaters = t.map((theater)=>{
				if(theater.id == reservation.theaterId){
					for(let show of theater.shows){
						if(show.id == reservation.showId){
							show.reservations.push({userId: reservation.userId, seats: seats});
							return theater;
						}
					}
				}
				return theater;
			})

			fs.writeFile(__dirname + "/" + "theaters.json", JSON.stringify(theaters,null,4), function (err) {
			});
		})

		//create new object containing new user data
		const newUsers = users.map((u) =>{
			if(u.id == reservation.userId){
				if(u.reservations != undefined || u.reservations != null){
					u.reservations.push({theaterId: reservation.theaterId, showId: reservation.showId, seats: seats });
				}else{
					u.reservations = [{theaterId: reservation.theaterId, showId: reservation.showId, seats: seats}];
				}
			};
			return u;
		});


		fs.writeFile(__dirname + "/" + "users.json", JSON.stringify(newUsers,null,4), function (err) {
		});
		res.send("Succesfull reservation");

	});
})


///GET users reservations info
app.get('/getUserReservations/:id', function (req, res) {
	fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
		let users = JSON.parse(data);
		const user = users.filter((u)=>{
			return(u.id == req.params.id);
		})[0];

		fs.readFile( __dirname + "/" + "theaters.json", 'utf8', function (err, data) {
			const theaters = JSON.parse(data);

			fs.readFile( __dirname + "/" + "movies.json", 'utf8', function (err, data) {
				const movies = JSON.parse(data);

				let result = [];


				if(user.reservations){

					for(let r of user.reservations){
						for(let t of theaters){
							if(r.theaterId == t.id){
								r.theaterName = t.name;
								for(let show of t.shows){
									if(r.showId == show.id){
										for(let hall of t.halls){
											if(hall.id == show.hallId){
												r.hallName = hall.name;
											}
										}
										for(let movie of movies){
											if(show.movieId == movie.id){
												r.movieName = movie.title;
											}
										}
										r.showDate = show.date;

									}

								}
							}
						}
						result.push(r);
					}
				}
				res.send(JSON.stringify(result));
			});
		});
	});
})

app.post('/removeReservation',function (req, res){
	let theaterId = req.body.theaterId;
	let userId = req.body.userId;
	let showId = req.body.showId;
	let seats = req.body.seats;
	console.log(theaterId, userId, showId, seats);

	fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
		let users = JSON.parse(data);


		//create new object containing new user data
		const newUsers = users.map((u) =>{
				if(u.id == userId){
					if(u.reservations != null && u.reservations != undefined && u.reservations.length != 0){
				 u.reservations = 	u.reservations.filter((r)=>{
						return(r.theaterId != theaterId || r.showId != showId || r.seats != seats);
					})
				}
					}
					return u;

		});
		fs.writeFile(__dirname + "/" + "users.json", JSON.stringify(newUsers,null,4), function (err) {
			res.send("success");
		});
	});


			fs.readFile( __dirname + "/" + "theaters.json", "utf8", function (err, data){
			let t = JSON.parse(data);

			const theaters = t.map((theater)=>{
				if(theater.id == theaterId){
				theater.shows = theater.shows.map((show)=>{
					if(showId == show.id){
					if(show.reservations != null || show.reservations.length != 0 || show.reservations != undefined){
						show.reservations = show.reservations.filter((res)=>{
							return (res.userId != userId || res.seats != seats);
						});
					}
				}
				return show;
			});
					}
					return theater;
				});
				fs.writeFile(__dirname + "/" + "theaters.json", JSON.stringify(theaters,null,4), function (err) {
				});
			})


		})





	var server = app.listen(8081, function () {

		var host = server.address().address
		var port = server.address().port

		console.log(" app listening at http://%s:%s", host, port)

	})
