function WallClock(element, coordinates){
  this.element = $(element);


  this.updateClock = function() {
    var t = new Date();
    var delay = 1000 - t.getMilliseconds();
    this.element.text(this.formatTime(t));
    setTimeout(this.updateClock.bind(this), delay);
  };

  this.formatTime = function(t){
    return  [t.getFullYear(), t.getMonth()+1, t.getDate()].join("/") + " " +
      [t.getHours(), this.pad(t.getMinutes()), this.pad(t.getSeconds())].join(":");
  };

  this.pad = function(x) {
    return String(x).padStart(2, '0');
  };

  this.updateClock();
};

$('document').ready(function(){
        var wallClock = new WallClock('#wallClockContainer');
});
