
var userId = 0;


$(document).ready(function(){

	/**
	* Get the theater names for the index page
	*/
	$.get("http://localhost:8081/getTheaters", function(response, status){

		let data = JSON.parse(response);
		for(let theater of data){
			let singleTheater = $("<option>"+ theater.name +"</option>");
			singleTheater.appendTo(".theaterList");
		}
	});



	//	LOGIN
	$("#submit").click(function(){

		let username = $("#username").val();
		let password = $("#password").val();

		$.post("http://localhost:8081/login", { username: username, password: password}, function(data){

			//Update the view
			document.getElementById('view').innerHTML = data;

			$.post("http://localhost:8081/getUserId",{username: username, password: password},function(response){
				userId = response;

			});
			//Get the theaters and shows (Used in customer view)
			$.get("http://localhost:8081/getTheaters", function(response, status){

				let data = JSON.parse(response);
				getUserReservations(data);
				printTheaterSelection(data);
			});
		});
	});

});


/**
* Get the shows of the selected theaters on index page
*/
function selectMovies(){
	document.getElementById('movieList').innerHTML = "<select class=\"col-sm-12 movieList\" id=\"movieList\"size=4></select>";
	let theaterList = document.getElementById("theaterList");
	let selectedTheater = theaterList.options[theaterList.selectedIndex];
	var movieIds = [];

	$.get("http://localhost:8081/getTheaters", function(response, status){
		let data = JSON.parse(response);
		for(let theater of data){
			if(theater.name == selectedTheater.text){
				let shows = theater.shows;
				for(let show of shows){
					movieIds.push(show.movieId);
				}
			}
		}

	});
	$.get("http://localhost:8081/getMovies", function(response, status){

		let data = JSON.parse(response);
		for(i=0; i < movieIds.length; i++){;
			for(let movie of data){
				if(movieIds[i] == movie.id){
					let singleMovie = $("<option value=\""+ movie.id + "\">"+ movie.title +"</option>");
					singleMovie.appendTo(".movieList");
				}
			}
		}
	});

}

/**
* Get the shows for the selected movies on index page
*/
function selectShows(){
	document.getElementById('showList').innerHTML = "<select class=\"col-sm-12 showList\" id=\"showList\"size=4></select>";
	let theaterList = document.getElementById("theaterList");
	let selectedTheater = theaterList.options[theaterList.selectedIndex];
	let movieList = document.getElementById("movieList");
	let selectedMovie = movieList.options[movieList.selectedIndex];
	let movieId = selectedMovie.value;

	$.get("http://localhost:8081/getTheaters", function(response, status){
		let data = JSON.parse(response);
		for(let theater of data){
			if(theater.name == selectedTheater.text){
				let shows = theater.shows;
				for(let show of shows){
					if(movieId == show.movieId){
						let showDate = new Date(show.date);
						let singleShow = $("<option>" + showDate.getHours() + ":" + showDate.getMinutes() +"</option>");
						singleShow.appendTo(".showList");
					}
				}
			}
		}
	});
}

/**
 * Create new users from Admin view
 */
function createUser(){
	

	let username = $("#newUsername").val();
	let password = $("#newPassword").val();
	let admin = document.getElementById("checkAdmin").checked;
	
	$.post("http://localhost:8081/createUser", { username: username, password: password, admin: admin}, function(data){

		if(data == "success"){
			alert("User " + username + " created");
		}else{
			alert("Sorry, something went wrong...");
			}
		})
}

function printTheaterSelection(data){
	$.get("http://localhost:8081/getTheaters", function(response, status){
		// print dropdown select
		let data = JSON.parse(response);

		let list = $("<select  onchange=showTheater(this);></select>");
		list.append($("<option selected disabled></option").text("Valitse teatteri"));
		for(let theater of data){
			let singleTheater = $("<option value="+theater.id+"></option>").text(theater.name);
			list.append(singleTheater);
		}
		list.appendTo(".select");
	});
}



///prints shows in selectedTheater
function showTheater(selectedTheater){
	$(".shows").text("");
	$(".chart").text("");
	$(".theaterChart").text("");
	$.get("http://localhost:8081/getTheaters", function(response, status){
		let data = JSON.parse(response);
		let theaterId = selectedTheater.value;
		let theater = data.filter(function(t) {
			return (t.id == theaterId);
		})[0];

		console.log(theater);
		$.get("http://localhost:8081/getMovies", function(response, status){

			let movies = JSON.parse(response);
			// print show info
			for(let show of theater.shows){
				let movie = movies.filter(function(m) {
					return (show.movieId == m.id);
				})[0];

				let date = new Date(show.date);
				let showDiv = $("<div data-showid="+show.id+" data-theaterid="+theater.id+" data-title='"+movie.title+"' onclick=console.log(this);showSeatingChart(this)></div>");
				showDiv.append($("<span>"+date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear()+" " + date.getHours() +":" + date.getMinutes()+"</span>"));
				showDiv.append($("<h4></h4").text(movie.title));



				showDiv.appendTo(".shows");
			}

		});

	});
}




////prints seating chart of selectedShow
function showSeatingChart(selectedShow){
	reservation.seats.length = 0;
	$(".chart").text("");
	$(".theaterChart").text("");
	let title = $(selectedShow).data("title");

	$(".theaterChart").append($("<h3></h3>").text(title));
	let sId = $(selectedShow).data("showid");
	let theaterId = $(selectedShow).data("theaterid");



	$.get("http://localhost:8081/getTheaters", function(response, status){
		let data = JSON.parse(response);
		// get right theater
		let theaterArray = data.filter(function(t) {
			return (t.id == theaterId)
		});
		let theater = theaterArray[0];
		let show = theater.shows.filter(function (s){
			return (sId == s.id);
		})[0];
		let showHallId = show.hallId;
		// get right hall
		let hall = theater.halls.filter(function(h){
			if(showHallId == h.id){
				return h;
			}
		})[0];

		let chart = $("<div data-theaterid="+theaterId+" data-showid="+show.id+" id ='chart'></div>");


		// /print rows
		let index = 1;
		let seatNumber = 1;
		for(let row of hall.rows ){
			let singleRow = $("<div></div>")
			singleRow.addClass("singleRow");
			for( i = 1; i < row +1;i++){
				let seat = $("<span data-row="+index+" data-seat="+i+" data-seattotal="+seatNumber+" id="+seatNumber+" class='seat free' onclick=selectSeat(this)></span>").text(i);
				singleRow.append(seat);
				seatNumber++
			}
			chart.append(singleRow);
			index++;
		}

		chart.appendTo(".theaterChart");

		// set reserved class to reserved seats
		for(let reservations of show.reservations){
			for(let seat of reservations.seats){
				$("#"+seat).addClass("reserved");
				$("#"+seat).removeClass("free");
			}
		}
	});
}



function updateSeatingChart(tId, id){
	reservation.seats.length = 0;
	$(".chart").text("");
	$(".theaterChart").text("");


	$(".theaterChart").append($("<h3></h3>").text("VALKOKANGAS"));
	let showId = id;
	let theaterId = tId;



	$.get("http://localhost:8081/getTheaters", function(response, status){
		let data = JSON.parse(response);
		// get right theater
		let theaterArray = data.filter(function(t) {
			return (t.id == theaterId)
		});
		let theater = theaterArray[0];
		let show = theater.shows.filter(function (s){
			return (showId == s.id);
		})[0];
		let showHallId = show.hallId;
		// get right hall
		let hall = theater.halls.filter(function(h){
			if(showHallId == h.id){
				return h;
			}
		})[0];

		let chart = $("<div data-theaterid="+theaterId+" data-showid="+show.id+" id ='chart'></div>");


		// /print rows
		let index = 1;
		let seatNumber = 1;
		for(let row of hall.rows ){
			let singleRow = $("<div></div>")
			singleRow.addClass("singleRow");
			for( i = 1; i < row +1;i++){
				let seat = $("<span data-row="+index+" data-seat="+i+" data-seattotal="+seatNumber+" id="+seatNumber+" class='seat free' onclick=selectSeat(this)></span>").text(i);
				singleRow.append(seat);
				seatNumber++
			}
			chart.append(singleRow);
			index++;
		}

		chart.appendTo(".theaterChart");

		// set reserved class to reserved seats
		for(let reservations of show.reservations){
			for(let seat of reservations.seats){
				$("#"+seat).addClass("reserved");
				$("#"+seat).removeClass("free");
			}
		}
	});
}





var reservation = {seats:[]};
///seats click event
function selectSeat(seat){
	$(".selectedSeats").remove();

	let theaterId = $("#chart").data("theaterid");
	let showId = $("#chart").data("showid");
	let row = $(seat).data("row");
	let seatInRow = $(seat).data("seat");
	let seatTotal = $(seat).data("seattotal");
	reservation.theaterId = theaterId;
	reservation.showId = showId;

	if($(seat).hasClass("reserved")){
		return false;
	}
	if($(seat).hasClass("selected")){
		$(seat).removeClass("selected");
		// remove selected seat form selectedSeats array
		reservation.seats =   reservation.seats.filter(function(s){
			return(s.seatTotal != seatTotal);
		});
	}else {
		$(seat).addClass("selected");
		// add selected seat to selectedSeats array
		reservation.seats.push({theaterId: theaterId, showId: showId, row: row, seatInRow: seatInRow, seatTotal: seatTotal});
	}

	if(reservation.seats == null || reservation.seats == undefined || reservation.seats.length == 0){
		$(".selectedSeats").remove();
	}else{
		// print list of selected seats
		let selectedSeatsDiv = $("<ul class='selectedSeats'></ul>").text("Valitut paikat");
		for(let s of reservation.seats){
			selectedSeatsDiv.append($("<li></li>").text("Rivi: "+s.row +" Paikka: "+ s.seatInRow));
		}
		selectedSeatsDiv.append($("<button onClick='reserveSeats()'>Varaa paikat</button>"));
		selectedSeatsDiv.appendTo(".theaterChart");
	}
}


// Make a reservation request to server
function reserveSeats(){
	reservation.userId = userId;
	console.log(reservation);
	$.ajax({
		type: 'POST',
		data: JSON.stringify(reservation),
		contentType: 'application/json',
		url: 'http://localhost:8081/reservation',
		success: function(data){
			reservation.seats.length = 0;
			updateSeatingChart(reservation.theaterId, reservation.showId);
			getUserReservations();
			alert("Varaus onnistui!");
		}
	});
	$(".selected").removeClass("selected");
	$(".selectedSeats").remove();

}

function getUserReservations(){
	$(".customerView").empty();
	$(".customerView").append($("<h3>Oma sivu</h3>"));

	$(".customerView").append($("<h3>Varaukset</h3>"));
	$(".customerView").append($("<div class='reservations'></div>"));

	$.get("http://localhost:8081/getUserReservations/"+userId, function(resp, stat){
		let userReservations = JSON.parse(resp);
		for(let res of userReservations){
			console.log(res);
			let date = new Date(res.showDate);
			$(".reservations").append($("<div class='reservation'><h4 class='title'>"+res.movieName+"</h4><span class='date'>"
			+date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear()+" " + date.getHours() +":" + date.getMinutes()+"</span><span class='theater-name'>"+res.theaterName+"</span>"+
			"<span class='hall-name'>"+ res.hallName+"</span><span class='reservation-seats'>"+res.seats.length+"</span><button data-theaterid="+res.theaterId+" data-showid="+res.showId+" data-seats="+res.seats+" onClick='removeReservation(this);'>Poista varaus</button></div>"));


		}
	});
	$.get("http://localhost:8081/getMovies", function(response, status){
		let movies = JSON.parse(response);

	});
}


function removeReservation(reservation){
	let theaterId = $(reservation).data("theaterid");
	let showId = $(reservation).data("showid");
	let seats = $(reservation).data("seats");
	console.log(theaterId, userId, showId, seats);


	$.post("http://localhost:8081/removeReservation", { userId: userId, theaterId: theaterId, showId: showId, seats: seats}, function(data){
		console.log(data);
		updateSeatingChart(theaterId, showId);
		getUserReservations();
	});
}
