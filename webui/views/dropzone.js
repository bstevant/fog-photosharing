Dropzone.options.photodropzone = {
  init: function() {
      this.on("complete", function(file) {
          this.removeFile(file);
          //history.go(0);
		  $("#NG1").load(window.location.href + "photos", function() {
		      $("#NG1").nanoGallery({
		          //itemsBaseURL:'http://localhost:3000',
		          thumbnailWidth: 'auto',
		          thumbnailHeight: 100,
		          locationHash: false,
		          thumbnailHoverEffect:'borderLighter,imageScaleIn80'
		      });
		  });
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
