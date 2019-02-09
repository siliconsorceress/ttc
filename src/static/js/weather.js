//import * as Chart from "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.3/Chart..js" ;
import Skycons from "../skycons/skycons.js";

function Weather(element, coordinates){
  this.element = $(element);
  this.coordinates = coordinates

  this.popColor = 'red';
  this.accumulationColor = 'blue';
  this.graphDuration = 8;

  this.title = function(text){
    this.header.text(text);
  }

  this.reset = function(){
    this.weatherDayText = $("<div class='weatherText' />");
    this.weatherWeekText = $("<div class='weatherText' />");
    this.temperature = $("<div class='weatherText tempBig'/>");
    this.temperatureApparent = $("<div class='weatherText tempBig'/>");
    this.temperatureHi = $("<div class='weatherText tempHi'/>");
    this.temperatureHiApparent = $("<div class='weatherText tempHi'/>");
    this.temperatureLo = $("<div class='weatherText tempLo'/>");
    this.temperatureLoApparent = $("<div class='weatherText tempLo'/>");
    this.popGraphCanvas = $("<canvas class='popGraphCanvas'/>");
    this.sunrise = $("<td />");
    this.sunset = $("<td />");
    this.moon = $("<td />");

    this.element.empty();
    $("<div class='weatherRow'/>").appendTo(this.element).append(
      $("<div class='weatherColumn' />").append(
        $("<canvas id='weatherIcon' />"),
        this.weatherDayText,
      ),
      $("<div class='weatherColumn' />").append(
        $("<div class='weatherText'>Now</div>"),
        this.temperature,
        $("<div class='weatherColumn' />").append(
          this.temperatureHi,
          this.temperatureLo
        ),
        $("<table class='weatherText' />").append(
          $("<tr />").append($("<td>Sunrise</td>"), this.sunrise),
          $("<tr />").append($("<td>Sunset</td>"), this.sunset),
        )
      ),
      $("<div class='weatherColumn' />").append(
        $("<div class='weatherText'>Feels Like</div>"),
        this.temperatureApparent,
        $("<div class='weatherColumn' />").append(
          this.temperatureHiApparent,
          this.temperatureLoApparent
        ),
        $("<table class='weatherText' />").append(
          $("<tr />").append($("<td>Moon</td>"), this.moon)
        )
      ),
      $("<div class='weatherColumn' />").append(
          this.popGraphCanvas,
      )
    );


    $("<div class='weatherRow weatherText'/>").appendTo(this.element).append(
        this.weatherWeekText
    );

    this.popGraphChart = new Chart(this.popGraphCanvas, {
      type: 'line',
      data: null,
      options: {
        maintainAspectRatio: false,
        title: {
          display: true,
        },
        animation: {
          duration: 0
        },
        scales: {
          xAxes: [{
            gridLines: {
              drawOnChartArea: false,
            }
          }],
          yAxes: [{
            id: 'pop',
            position: 'left',
            ticks: {
              min: 0,
              max: 100,
              fontColor: this.popColor,
            },
            gridLines: {
              color: this.popColor,
              drawOnChartArea: false,
            }
          }, {
            id: 'accumulation',
            position: 'right',
            ticks: {
              fontColor: this.accumulationColor,
            },
            gridLines: {
              drawOnChartArea: false,
              color: this.accumulationColor,
            }
          } ]
        }
      }
    });
  };


  this.update = function() {
    $.ajax({
        url: "weather/" + this.coordinates,
        type: "GET",
        dataType: "json",
    }).done((json) =>{

      this.weatherDayText.html(json.daily.data[0].summary);
      this.weatherWeekText.html(json.daily.summary);

      this.temperature.html(json.currently.temperature.toFixed(0) + '&deg;');
      this.temperatureApparent.html(json.currently.apparentTemperature.toFixed(0) + '&deg;');
      this.temperatureHi.html(json.daily.data[0].temperatureMax.toFixed(0) + '&deg;');
      this.temperatureLo.html(json.daily.data[0].temperatureMin.toFixed(0) + '&deg;');

      this.temperatureHiApparent.html(json.daily.data[0].apparentTemperatureMax.toFixed(0) + '&deg;');
      this.temperatureLoApparent.html(json.daily.data[0].apparentTemperatureMin.toFixed(0) + '&deg;');
      this.sunrise.html(this.formatTime(json.daily.data[0].sunriseTime));
      this.sunset.html(this.formatTime(json.daily.data[0].sunsetTime));
      this.moon.html(json.daily.data[0].moonPhase);

      var skycons = new Skycons();
      skycons.add("weatherIcon",json.daily.icon);
      skycons.play();

      this.popGraphChart.data = this.makePopChartData(json,this.graphDuration);
      this.popGraphChart.update();

    });
  };

  this.formatTime = function(unixtime) {
    var date = new Date(unixtime * 1000);
    return date.getHours() + ":" + this.pad(date.getMinutes());
  };

  this.pad = function(x) {
    return String(x).padStart(2, '0');
  };

  this.makePopChartData = function(json, duration ){
    // accepts 2 parameters: json from darksky, number of hours
    return  {
      labels: json.hourly.data.slice(0,duration).map( value => new Date(value.time*1000).getHours()),
      datasets: [
        {
          data: json.hourly.data.slice(0,duration).map( value => value.precipProbability*100),
          label: "POP",
          borderColor: this.popColor,
          yAxisID: 'pop',
          fill: false
        },
        {
          data: json.hourly.data.slice(0,duration).map( value => value.precipIntensity*100),
          label: "mm/h",
          borderColor: this.accumulationColor,
          yAxisID: 'accumulation',
          fill: false
        }
      ]
    }
  };

  this.start = function() {
    this.reset();
    this.update();
    setInterval(()=>this.update(), 60000);
  };

  this.start();
};

$('document').ready(function(){
    $.ajax({
      url: "config/",
      type: "GET",
      dataType: "json"
    }).done(function(config){
        var weather = new Weather('#weatherContainer', config.weather.coordinates );
    })
});
