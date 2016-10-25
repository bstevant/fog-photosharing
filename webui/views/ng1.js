$(document).ready(function () {
	$("#NG1").nanoGallery({
		//itemsBaseURL:'http://localhost:3000',
		theme:'clean',
		thumbnailWidth: 'auto',
		thumbnailHeight: 100,
		locationHash: false,
		thumbnailHoverEffect:'borderLighter,imageScaleIn80',
		kind: 'json',
		jsonProvider: './nanoPhotosProvider.php',
	});
});