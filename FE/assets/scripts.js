
var userId = 0;

var url = "http://localhost:8081";

$(document).ready(function(){

	/**
	* Get the theater names for the index page
	*/
	getTheaters();



	//	LOGIN
	$("#submit").click(function(){

		let username = $("#username").val();
		let password = $("#password").val();
if(username != "" && username != undefined && password != "" && password != undefined){
		$.post(url + "/login", { username: username, password: password}, function(data){

			//Update the view
			document.getElementById('view').innerHTML = data;


			$.post(url + "/getUserId",{username: username, password: password},function(response){
				userId = response;
				if(userId != null && userId != undefined){
					$.post(url + "/isAdmin",{userid: userId}, function(res, stat){
						let isAdmin = res;

						if(isAdmin){
							getTheaters() //Get theaters for the admin view
							modalShow()

						}else{
							$.get(url + "/getTheaters", function(response, status){
								let data = JSON.parse(response);
								getUserReservations(data);
								printTheaterSelection(data);
							});
						}
					});
				}

			});
			//Get the theaters and shows (Used in customer view)

		});
	}else{
		alert("Error on login");
	}
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

	$.get(url + "/getTheaters", function(response, status){
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
	$.get(url + "/getMovies", function(response, status){

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

	$.get(url + "/getTheaters", function(response, status){
		let data = JSON.parse(response);
		for(let theater of data){
			if(theater.name == selectedTheater.text){
				let shows = theater.shows;
				for(let show of shows){
					if(movieId == show.movieId){
						let showId = show.id;
						let startDate = new Date(show.startDate);
						let endDate = new Date(show.endDate);
						let startTime = new Date(show.startTime);
						let endTime = new Date(show.endTime);
						let showDate = startDate.toDateString() + " - " + endDate.toDateString();
						let showTime = " | Time: " + convertTime(startTime.getHours()) + ":" + convertTime(startTime.getMinutes()) +
						" - " + convertTime(endTime.getHours()) + ":" + convertTime(endTime.getMinutes());
						let showDateline = $("<option value=\""+ showId + "\">" + showDate + showTime + "</option>");
						showDateline.appendTo(".showList");
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

	$.post(url + "/createUser", { username: username, password: password, admin: admin}, function(data){

		if(data == "success"){
			alert("User " + username + " created");
		}else{
			alert("Sorry, something went wrong...");
		}
	})
}
/**
* Create new users from frontpage
*/
function createNewUser(){



	let username = $("#username").val();
	let password = $("#password").val();
if(username != "" && username != undefined && password != "" && password != undefined){
	$.post(url + "/createUser", { username: username, password: password, admin: false}, function(data){

		if(data == "success"){
			alert("User " + username + " created");
		}else{
			alert("Sorry, something went wrong...");
		}
	})
}else{
	alert("Please fill in your username and password");
}
}



function printTheaterSelection(data){
	$.get(url + "/getTheaters", function(response, status){
		// print dropdown select
		let data = JSON.parse(response);

		let list = $("<select  onchange=showTheater(this);></select>");
		list.append($("<option selected disabled></option").text("Select Theater"));
		for(let theater of data){
			let singleTheater = $("<option value="+theater.id+"></option>").text(theater.name);
			list.append(singleTheater);
		}
		list.appendTo(".select");
	});
}

/**
* Create new Movie with title, release year and genre
*/
function createMovie(){

	let title = $("#newMovieTitle").val();
	let year = $("#newMovieYear").val();
	let genre = [];


	if (document.getElementById("action").checked){
		genre.push("Action");
	}
	if (document.getElementById("drama").checked){
		genre.push("Drama");
	}
	if (document.getElementById("sci-fi").checked){
		genre.push("Sci-Fi");
	}
	if (document.getElementById("thriller").checked){
		genre.push("Thriller");
	}
	if (document.getElementById("commedy").checked){
		genre.push("Commedy");
	}
	if (document.getElementById("adventure").checked){
		genre.push("Adventure");
	}

	$.post(url + "/createMovie", {title: title, year: year, genre: JSON.stringify(genre)}, function(data){
		alert(data);
	});
	document.getElementById("newMovieTitle").value = "";
	document.getElementById("newMovieYear").value = "";
	getMovies();
	document.getElementById('showList').innerHTML = "<select class=\"col-sm-12 showList\" id=\"showList\"size=4></select>";
}

/**
* Get theaters from server and attach them to .theaterList div
*
*/
function getTheaters(){

	$.get(url + "/getTheaters", function(response, status){

		document.getElementById("theaterList").innerHTML = "";

		let data = JSON.parse(response);
		for(let theater of data){
			let singleTheater = $("<option>"+ theater.name +"</option>");
			singleTheater.appendTo(".theaterList");
		}
	});
}

/**
* Get movies on the admin page
*
*/
function getMovies(){
	document.getElementById('movieList').innerHTML = "<select class=\"col-sm-12 movieList\" id=\"movieList\"size=4></select>";
	var movieIds = [];

	$.get(url + "/getMovies", function(response, status){

		let data = JSON.parse(response);
		let movies = data;
		for(let movie of movies){
			let singleMovie = $("<option value=\""+ movie.id + "\">"+ movie.title +"</option>");
			singleMovie.appendTo(".movieList");
		}
	});

}

/**
* Opens modal window to add new show
*/
function modalShow(){
	emptyModal();
	// Get the modal
	let modal = document.getElementById('modalShow');

	// Get the button that opens the modal
	let btn = document.getElementById("moviesButton");

	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("close")[0];

	// When the user clicks the button, open the modal
	btn.onclick = function() {

		let movieList = document.getElementById("movieList");
		let selectedMovie = movieList.options[movieList.selectedIndex];

		if(selectedMovie == undefined){
			alert("Select a theater and a movie");
		} else {
			modal.style.display = "block";
		}
	}

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
		modal.style.display = "none";
	}

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}
}

function emptyModal(){
	document.getElementById("startDate").value = "";
	document.getElementById("endDate").value = "";
	document.getElementById("startTimeHours").value = "";
	document.getElementById("startTimeMinutes").value = "";
	document.getElementById("endTimeHours").value = "";
	document.getElementById("endTimeMinutes").value = "";
	document.getElementById("hallId").value = "";
}


/**
* Adds a new show to select movie in admin view
*
*/
function addShow(){
	document.getElementById('showList').innerHTML = "<select class=\"col-sm-12 showList\" id=\"showList\"size=4></select>";
	let theaterList = document.getElementById("theaterList");
	let selectedTheater = theaterList.options[theaterList.selectedIndex];
	let movieList = document.getElementById("movieList");
	let selectedMovie = movieList.options[movieList.selectedIndex];
	let movieId = selectedMovie.value;


	let startDate = new Date ($("#startDate").val());
	//startDate.setHours(4); //Koska aika muuttuu kun kutsutaan JSON.stingify, korjataan etukäteen
	let endDate = new Date ($("#endDate").val());

	let startTime = new Date("2017/01/01"); // Tästä meitä kiinnostaa vain
	// kellonaika
	startTime.setHours($("#startTimeHours").val());
	startTime.setMinutes($("#startTimeMinutes").val());

	let endTime = new Date("2017/01/01"); // Tästä meitä kiinnostaa vain
	// kellonaika
	endTime.setHours($("#endTimeHours").val());
	endTime.setMinutes($("#endTimeMinutes").val());
	let hallId = $("#hallId").val();

	$.post(url + "/createShow",
	{theater: selectedTheater.text, movieId: selectedMovie.value, hallId: hallId,  startDate: JSON.stringify(startDate),
		endDate: JSON.stringify(endDate), startTime: JSON.stringify(startTime), endTime: JSON.stringify(endTime)}, function(data){
			alert(data);
		});
		document.getElementById('showList').innerHTML = "<select class=\"col-sm-12 showList\" id=\"showList\"size=4></select>";
		getMovies();
		emptyModal();
	}

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

	/**
	* Removes selected movie and its shows
	*
	*/
	function removeMovie(){
		let movieList = document.getElementById("movieList");
		let movieTitle= movieList.options[movieList.selectedIndex].text;
		let movieId = movieList.options[movieList.selectedIndex].value;
		let showList = document.getElementById("showList");
		let showInfo= showList.options[movieList.selectedIndex].text;

		if (confirm("Are you sure you want to remove the show " + movieTitle +
		"\n" + showInfo + "\nTheater: ") == false) {
			return;
		}
		$.post(url + "/deleteMovie",{movieTitle: movieTitle, movieId: movieId}, function(data){
			alert(data);
		});
		document.getElementById('showList').innerHTML = "<select class=\"col-sm-12 showList\" id=\"showList\"size=4></select>";
		getMovies();
	}

	/**
	* Removes selected show on admin page
	*
	*/
	function removeShow(){
		let theaterList = document.getElementById("theaterList");
		let theaterName = theaterList.options[theaterList.selectedIndex].text;
		let movieList = document.getElementById("movieList");
		let movieTitle= movieList.options[movieList.selectedIndex].text;
		let movieId = movieList.options[movieList.selectedIndex].value;
		let showList = document.getElementById("showList");
		let showInfo = showList.options[showList.selectedIndex].text;
		let showId = showList.options[showList.selectedIndex].value;

		if (confirm("Are you sure you want to remove the show:\n" + theaterName + "\n" +
		movieTitle + "\n" + showInfo + "?") == false) {
			return;
		}
		$.post(url + "/deleteShow",{theaterName: theaterName, movieTitle: movieTitle, movieId: movieId, showId: showId, showInfo: showInfo}, function(data){
			alert(data);
		});
		document.getElementById('showList').innerHTML = "<select class=\"col-sm-12 showList\" id=\"showList\"size=4></select>";
		getMovies();
	}

	///prints shows in selectedTheater
	function showTheater(selectedTheater){
		$(".shows").text("");
		$(".chart").text("");
		$(".theaterChart").text("");
		$.get(url + "/getTheaters", function(response, status){
			let data = JSON.parse(response);
			let theaterId = selectedTheater.value;
			let theater = data.filter(function(t) {
				return (t.id == theaterId);
			})[0];
			$.get(url + "/getMovies", function(response, status){

				let movies = JSON.parse(response);
				// print show info
				for(let show of theater.shows){
					let movie = movies.filter(function(m) {
						return (show.movieId == m.id);
					})[0];
					let date = new Date(show.startDate);
					let startTime = new Date(show.startTime);
					let endTime = new Date(show.endTime);

					let showDiv = $("<div data-showid="+show.id+" data-theaterid="+theater.id+" data-title='"+movie.title+"' onclick=console.log(this);showSeatingChart(this)></div>");
					showDiv.append($("<span>"+date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear()+" " + startTime.getHours() +":" + startTime.getMinutes()+"</span>"));
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



		$.get(url + "/getTheaters", function(response, status){
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



		$.get(url + "/getTheaters", function(response, status){
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
				return(showHallId == h.id)
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
			let selectedSeatsDiv = $("<ul class='selectedSeats'></ul>").text("Selected seats");
			for(let s of reservation.seats){
				selectedSeatsDiv.append($("<li></li>").text("Rivi: "+s.row +" Seat: "+ s.seatInRow));
			}
			selectedSeatsDiv.append($("<button onClick='reserveSeats()'>Make reservation</button>"));
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
			url: url+'/reservation',
			success: function(data){
				reservation.seats.length = 0;
				updateSeatingChart(reservation.theaterId, reservation.showId);
				getUserReservations();
				alert("Reservation complete!");
			}
		});
		$(".selected").removeClass("selected");
		$(".selectedSeats").remove();

	}

	function getUserReservations(){
		$(".customerView").empty();
		$(".customerView").append($("<h3>My page</h3>"));

		$(".customerView").append($("<h3>Reservations</h3>"));
		$(".customerView").append($("<div class='reservations'></div>"));
		$.get(url + "/getTheaters", function(response, status){
			let theaters = JSON.parse(response);


			$.get(url + "/getUserReservations/"+userId, function(resp, stat){

				let userReservations = JSON.parse(resp);
				for(let res of userReservations){
					const theater = theaters.filter(function(t){
						return(t.id == res.theaterId );
					})[0];

					const show = theater.shows.filter(function(s){
						return(s.id == res.showId);
					})[0];
					let showDate = new Date(show.startDate);
					let showStartTime = new Date(show.startTime);
					$(".reservations").append($("<div class='reservation'><h4 class='title'>"+res.movieName+"</h4><span class='date'>"
					+showDate.getDate()+"/"+showDate.getMonth()+"/"+showDate.getFullYear()+" " + showStartTime.getHours() +":" + showStartTime.getMinutes()+"</span><span class='theater-name'>"+res.theaterName+"</span>"+
					"<span class='hall-name'>"+ res.hallName+"</span><span class='reservation-seats'>"+res.seats.length+"</span><button data-theaterid="+res.theaterId+" data-showid="+res.showId+" data-seats="+res.seats+" onClick='removeReservation(this);'>Remove reservation</button></div>"));

				}
			});
		});
	}


	function removeReservation(reservation){
		let theaterId = $(reservation).data("theaterid");
		let showId = $(reservation).data("showid");
		let seats = $(reservation).data("seats");

		$.post(url + "/removeReservation", { userId: userId, theaterId: theaterId, showId: showId, seats: seats}, function(data){
			console.log(data);
			updateSeatingChart(theaterId, showId);
			getUserReservations();
		});
	}
