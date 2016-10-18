Dropzone.options.photodropzone = {
  init: function() {
      this.on("complete", function(file) {
          this.removeFile(file);
          //history.go(0);
		  $("#NG1").load(window.location.href + "photos" );
      });
  }
};

//$(document).ready(function () {
//    formDZ = document.getElementbyID("photo-dropzone");
//    formDZ.dropzone.on("complete", function(file) {
//        formDZ.dropzone.removeFile(file);
//        history.go(0);
//    });
//});
