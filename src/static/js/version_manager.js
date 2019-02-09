function VersionManager(frontendVersion ){
  this.frontendVersion = frontendVersion;

  this.update = function() {
    $.ajax({
        url: "version/",
        type: "GET",
        dataType: "json",
    }).done((json) =>{
      if (this.frontendVersion !== json.semver) {
         location.reload(true);
      }
    });
  };

  this.start = function() {
    setInterval(()=>{ this.update() }, 10000);
  };

  this.start();
};

$('document').ready(function(){
  var versionManager = new VersionManager(frontend_version);
  versionManager.start()
});
