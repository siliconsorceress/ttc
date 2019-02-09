
function busStops(element, stopid){
  this.stopid = stopid;
  this.element = $(element);

  this.title = function(text){
    this.header.text(text);
  }

  this.reset = function(){
    // build header/table for bus stop
    this.element.empty();
    this.header = $("<div class='stopTitle' />")
    this.busTable = $("<div />");
    this.element.append(this.header, this.busTable);
  };


  this.update_schedule = function() {
    // populate schedule
    console.log("updating schedule " + this.stopid);
    $.ajax({
        url: "schedule/" + stopid,
        type: "GET",
        dataType: "json",
    }).done((json)=>{
        this.busTable.empty();
        $.each(json.slice(0,3), (index,value)=>{
          var busTableRow = $("<div class='busArrivalRow' />")
          busTableRow.appendTo(this.busTable);
          arrivalTime = $("<div class='busArrivalTimeDetails'/>").appendTo(busTableRow);
          if (value.route_tag.match('3\\d\\d')) {
            arrivalTime.addClass("busArrivalNightService");
          } else { 
            arrivalTime.addClass("busArrivalRegularService");
          }
          arrivalTime.append(
            $("<div class='busArrivalTime' />").append($("<div class='busArrivalTimeInner' />").append(value.minutes)),
            $("<div class='busArrivalVehicle' />").append(value.vehicle)
          );

          arrivalDetails = $("<div class='busArrivalRouteDetails'/>").appendTo(busTableRow);
          arrivalDetails.append(
            $("<div class='busArrivalTitle' />").append(value.stop_titles[0]),
            $("<div class='busArrivalTitle separator'>&bullet;</div>"),
            $("<div class='busArrivalTitle' />").append(value.stop_titles[1])
          );
        });
        console.log("finished updating schedule " + this.stopid);
    });

  };
  
  this.start = function() {
    this.reset();
    this.title("StopID " + stopid + " loading...");

   // populate stop title
    console.log("updating title " + this.stopid);
    $.ajax({
        url: "stops/" + stopid,
        type: "GET",
        dataType: "json",
    }).done((json)=>{
        this.title(json['stopTitle']);
        console.log("done updating title " + this.stopid);
    });

    this.update_schedule();
    setInterval(()=>{ this.update_schedule() }, 30000, this);
  };

  this.start();
}

$('document').ready(
  $.ajax({
    url: "config/",
    type: "GET",
    dataType: "json"
  }).done(function(config){
      var stops = config.ttc.stops;
      var widgets = [];

      for (var stop in stops) {
        $('#busSchedulesContainer').append(
          $("<div class='busSchedule' />").attr("id", "stop" + stop )
        )
        widgets.push(new busStops("#stop" + stop, stops[stop]));
      }
  })
);
