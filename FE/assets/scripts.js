
var userId = 1;
$(document).ready(function(){



		/**
		 * Get the theater names for the index page
		 */
		$.get("http://localhost:8081/getTheaters", function(response, status){

			let data = JSON.parse(response);
			console.log(data.theaters);
			for(let theater of data.theaters){
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

			//Get the theaters and shows (Used in customer view)
			$.get("http://localhost:8081/getTheaters", function(response, status){

				let data = JSON.parse(response);
				console.log(data.theaters);
				printTheaterSelection(data);
			});
		});
	});

	$("#createUser").click(function(){

		let username = $("#username").val();
		let password = $("#password").val();
		$.post("http://localhost:8081/createUser", { username: username, password: password}, function(data){

			if(data == "success"){
				console.log("User created");
			}else{
				console.log("fail");
			}
		})
	})
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
		for(let theater of data.theaters){
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
			for(let movie of data.movies){
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
		for(let theater of data.theaters){
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



function printTheaterSelection(data){
	$.get("http://localhost:8081/getTheaters", function(response, status){
		// print dropdown select
		let data = JSON.parse(response);
		console.log(data.theaters);
		let list = $("<select  onchange=showTheater(this);></select>");
		list.append($("<option selected disabled></option").text("Valitse teatteri"));
		for(let theater of data.theaters){
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
		let theater = data.theaters.filter(function(t) {
			return (t.id == theaterId);
		})[0];

		console.log(theater);
		$.get("http://localhost:8081/getMovies", function(response, status){

			let mData = JSON.parse(response);
			// print show info
			for(let show of theater.shows){
				let movie = mData.movies.filter(function(m) {
				return (show.movieId == m.id);
				})[0];

				let date = new Date(show.date);
				let showDiv = $("<div data-showid="+show.id+" data-theaterid="+theater.id+" onclick=console.log(this);showSeatingChart(this)></div>");
				showDiv.append($("<span></span>").text(date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear()+" " + date.getHours() +":" + date.getMinutes()));
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
	$(".theaterChart").append($("<h3></h3>").text("VALKOKANGAS"));
	let showId = $(selectedShow).data("showid");
	let theaterId = $(selectedShow).data("theaterid");


	$.get("http://localhost:8081/getTheaters", function(response, status){
		let data = JSON.parse(response);
		// get right theater
		let theaterArray = data.theaters.filter(function(t) {
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
//var userId = 1;// /FOR DEVELOPMENT
var reservation = {userId: userId, seats:[]};
///seats click event
function selectSeat(seat){
	let theaterId = $("#chart").data("theaterid");
	let showId = $("#chart").data("showid");
	let row = $(seat).data("row");
	let seatInRow = $(seat).data("seat");
	let seatTotal = $(seat).data("seattotal");

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


	// print list of selected seats
	$(".selectedSeats").text("");
	let selectedSeatsDiv = $("<ul class='selectedSeats'></ul>").text("Valitut paikat");
	for(let s of reservation.seats){
		selectedSeatsDiv.append($("<li></li>").text("Rivi: "+s.row +" Paikka: "+ s.seatInRow));
	}
	selectedSeatsDiv.append($("<button onClick='reserveSeats()'>Varaa paikat</button>"));
	selectedSeatsDiv.appendTo(".theaterChart");
}


// Make a reservation request to server
function reserveSeats(){
	console.log(JSON.stringify(reservation));
	console.log(reservation);

		$.ajax({
		  type: 'POST',
		  data: JSON.stringify(reservation),
		  contentType: 'application/json',
		  url: 'http://localhost:8081/reservation',
			success: function(data){
				console.log(data);
				reservation.seats.length = 0;
				console.log(reservation);

			}
		});

}
