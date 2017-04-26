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

app.post('/createMovie', function (req, res){
	let title = req.body.title;
	let year = req.body.year;
	let genre = JSON.parse(req.body.genre);
	
	
	fs.readFile(__dirname + "/" + "movies.json", "utf8", function (err, data){
		
		let movies = JSON.parse(data);
		let id = movies.length +1; 
		
		movies.push({id: id, title: title, releaseYear: year, genre: genre});
		fs.writeFile(__dirname + "/" + "movies.json", JSON.stringify(movies, null, 4), function (err) {
			//console.log(movies);
		});
		res.end("Movie " + title + " added");
	});
});

/**
 * Deletes a movie and all its' shows
 */
app.post ('/deleteMovie', function (req, res){
	let movieTitle = req.body.movieTitle;
	let movieId = req.body.movieId;
	
	
	fs.readFile(__dirname + "/" + "movies.json", "utf8", function (err, data){
		
		let movies = JSON.parse(data);
		 
		for(let movie of movies){
			if (movieId == movie.id){
				let index = movies.indexOf(movie);
				console.log(index);
				movies.splice(index, 1);
			}
		}
		
		fs.writeFile(__dirname + "/" + "movies.json", JSON.stringify(movies, null, 4), function (err) {
			
		});
		
	});
	
	deleteShow(movieId);
	res.end(movieTitle + " and its shows have been removed");
});
/**
 * Deletes all shows according to movieId
 * @param movieId
 * 
 */
function deleteShow(movieId){
	
	fs.readFile( __dirname + "/" + "theaters.json", "utf8", function (err, data){
		let theaters = JSON.parse(data);
		
		for(let theater of theaters){
			
			for(let show of theater.shows){
				if(movieId == show.movieId){
					let index = theater.shows.indexOf(show);
					theater.shows.splice(index, 1);
				}
			}
		}
		fs.writeFile(__dirname + "/" + "theaters.json", JSON.stringify(theaters,null,4), function (err) {
		});
	})
}

/**
 * Deletes show according to theater, movieId and showId
 */
app.post ('/deleteShow', function (req, res){
	theaterName = req.body.theaterName;
	movieTitle = req.body.movieTitle;
	movieId = req.body.movieId;
	showId = req.body.showId;
	showInfo = req.body.showInfo;
	
	fs.readFile( __dirname + "/" + "theaters.json", "utf8", function (err, data){
		let theaters = JSON.parse(data);
		
		for(let theater of theaters){
			if(theaterName == theater.name){
				for(let show of theater.shows){
					if(showId == show.id){
						let index = theater.shows.indexOf(show);
						theater.shows.splice(index, 1);
					}
				}
			}

		}
		fs.writeFile(__dirname + "/" + "theaters.json", JSON.stringify(theaters,null,4), function (err) {
		});
	})
	res.end("\t\t SHOW REMOVED\n" + theaterName + "\n" +movieTitle + "\n" + showInfo);
});



/**
 * Creates a new show
 * Checks that there is not another overlapping show
 */
app.post ('/createShow', function (req, res){
	fs.readFile(__dirname + "/" + "movies.json", "utf8", function (err, data){
		let movies = JSON.parse(data);
		let theaterName = req.body.theater;
		let movieId = req.body.movieId;
		let hallId = parseInt(req.body.hallId);
		let startDate = new Date(JSON.parse(req.body.startDate));
		let endDate = new Date(JSON.parse(req.body.endDate));
		let startTime = new Date(JSON.parse(req.body.startTime));
		let endTime = new Date(JSON.parse(req.body.endTime));
		let movieTitle = getMovieTitle(movieId);
		let showId = 1;
		
		function getMovieTitle(movieId){
			for(let movie of movies){
				if(movieId == movie.id){
					return movie.title;
				}
			}
		}
		
	 	fs.readFile(__dirname + "/" + "theaters.json", "utf8", function (err, data){
	
			let theaters = JSON.parse(data);
			
			for(let theater of theaters){
				for(let show of theater.shows){
					if(show.id >= showId){
						showId = show.id +1;
					}
				}
			}
			
			
			for(let theater of theaters){
				if(theater.name == theaterName){
					for(let show of theater.shows){
						let loopStartDate = new Date(show.startDate);
						let loopEndDate = new Date(show.endDate);
						let loopStartTime = new Date(show.startTime);
						let loopEndTime = new Date(show.endTime);

						if(hallId == show.hallId){
							if((startDate < loopStartDate && endDate < loopStartDate) || (startDate > loopEndDate && endDate > loopEndDate)){
								continue;
							}else{
								if((startTime < loopStartTime && endTime <= loopStartTime) || (startTime >= loopEndTime && endTime > loopEndTime)){
									continue;
								}else{
									loopMovieTitle = getMovieTitle(show.movieId);
									res.end("\t\tSHOW NOT ADDED!" +
											"\nThere is already another show in theater " + theater.name +
											"\nMovie: " + loopMovieTitle +
											"\nStart date: " + loopStartDate.toDateString() + 
											"\nEnd date: " + loopEndDate.toDateString() +
											"\nTime: " + convertTime(loopStartTime.getHours()) + ":" + convertTime(loopStartTime.getMinutes()) +
											"-" + convertTime(loopEndTime.getHours()) + ":" + convertTime(loopEndTime.getMinutes()));
									return;
								}
							}
						}
					}
					theater.shows.push({id: showId, movieId: parseInt(movieId), startDate: startDate, endDate: endDate,
						startTime: startTime, endTime: endTime, hallId: parseInt(hallId), reservations: []});
					}
				}
			
			fs.writeFile(__dirname + "/" + "theaters.json", JSON.stringify(theaters, null, 4), function (err) {
	// console.log(movies);
			});
			res.end("\tSHOW ADDED!" +
					"\nStart date: " + startDate.toDateString() + 
					"\nEnd date: " + endDate.toDateString() +
					"\nTime: " + convertTime(startTime.getHours()) + ":" + convertTime(startTime.getMinutes()) +
					"-" + convertTime(endTime.getHours()) + ":" + convertTime(endTime.getMinutes()));
		});
	});
});




/*
 * Used to show hours and minutes in correct format
 * Adds 0 if value < 10. 
 */
function convertTime(value){
	if(value < 10) {
        return '0' + value;
    } else {
        return value;
    }	
}

app.post ('/deleteShow', function (req, res){});

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
