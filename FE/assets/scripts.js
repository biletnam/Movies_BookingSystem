
$(document).ready(function(){

  $.get("http://localhost:8081/getTheaters", function(response, status){

    let data = JSON.parse(response);
    console.log(data.theaters);
    printTheaterSelection(data);
  });


//click event for seat
  $(document).on('click','.seat',function(e){
      if($(this).hasClass("selected")){
          $(this).removeClass("selected");
          return false;
      }
      if($(this).hasClass("reserved")){
        return false;
      } else{
        $(this).addClass("selected");
      }
});

});



function printTheaterSelection(data){
  $.get("http://localhost:8081/getTheaters", function(response, status){
    //print dropdown select
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
      if(t.id == theaterId){
        return t;
      }
    })[0];

    console.log(theater);
    $.get("http://localhost:8081/getMovies", function(response, status){

      let mData = JSON.parse(response);
      //print show info
      for(let show of theater.shows){
        let movie = mData.movies.filter(function(m) {
          if(show.movieId == m.id){
            console.log(m.title);
            return m;
          }
        })[0];

        let date = new Date(show.date);
        let showDiw = $("<div data-showid="+show.id+" data-theaterid="+theater.id+" onclick=console.log(this);showSeatingChart(this)></div>");
        showDiw.append($("<span></span>").text(date.getDate()+"/"+date.getMonth()+"/"+date.getYear()+" " + date.getHours() +":" + date.getMinutes()));
        showDiw.append($("<h4></h4").text(movie.title));



        showDiw.appendTo(".shows");
      }

    });

  });

}


////prints seating chart of selectedShow
function showSeatingChart(selectedShow){
  $(".chart").text("");
  $(".theaterChart").text("");
  $(".theaterChart").append($("<h3></h3>").text("VALKOKANGAS"));
  let showId = $(selectedShow).data("showid");
  let theaterId = $(selectedShow).data("theaterid");


  $.get("http://localhost:8081/getTheaters", function(response, status){
    let data = JSON.parse(response);
    //get right theater
    let theaterArray = data.theaters.filter(function(t) {
      if(t.id == theaterId){
        return t;
      }
    });
    let theater = theaterArray[0];
    let show = theater.shows.filter(function (s){
      if(showId == s.id){
        return s;
      }
    })[0];
    let showHallId = show.hallId;
    //get right hall
    let hall = theater.halls.filter(function(h){
      if(showHallId == h.id){
        return h;
      }
    })[0];

    let chart = $("<div></div>");
    chart.addClass("chart");

    ///print rows
    let index = 1;
    let seatNumber = 1;
    for(let row of hall.rows ){
      let singleRow = $("<div></div>")
      singleRow.addClass("singleRow");
      for( i = 1; i < row +1;i++){
        let seat = $("<span data-row="+index+" data-seat="+i+" data-seattotal="+seatNumber+" id="+seatNumber+" class='seat free'></span>").text(i);
        singleRow.append(seat);
        seatNumber++
      }
      chart.append(singleRow);
      index++;
    }

    chart.appendTo(".theaterChart");

    //set reserved class to reserved seats
    for(let reservations of show.reservations){
      for(let seat of reservations.seats){
        $("#"+seat).addClass("reserved");
        $("#"+seat).removeClass("free");

      }
    }

  });


}
