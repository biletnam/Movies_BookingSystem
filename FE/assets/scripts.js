
$(document).ready(function(){

  $.get("http://localhost:8081/getMovies", function(response, status){

    let data = JSON.parse(response);
    //  console.log(data.movies);
    for (let movie of data.movies){
      let title = movie.title;
      let block = $("<div></div>")
      block.append($("<h4></h4>").text(title));
      block.addClass("movie");
      block.appendTo($(".movies"));
    }

  });

  $.get("http://localhost:8081/getTheaters", function(response, status){

    let data = JSON.parse(response);
    console.log(data.theaters);
    printSeatingChart(data,0,0);

  });

});

function printSeatingChart(data, theaterId, hallId){

  let chart = $("<div></div>");
  chart.addClass("chart");
  for(let row of data.theaters[theaterId].halls[hallId].rows){
    console.log(row);
    let singleRow = $("<div></div>")
    singleRow.addClass("singleRow");
    for( i = 1; i < row +1;i++){
      let seat = $("<span></span>").text(i);
      seat.addClass("seat");
      singleRow.append(seat);
    }
    chart.append(singleRow);

  }
  chart.appendTo(".theaters");
}
