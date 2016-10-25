$(document).ready(function () {
	$("#NG1").nanoGallery({
		//itemsBaseURL:'http://localhost:3000',
		theme:'clean',
		thumbnailWidth: 150,
		thumbnailHeight: 150,
		locationHash: false,
		thumbnailHoverEffect:'borderLighter,imageScaleIn80',
		kind: 'json',
		jsonProvider: './nanoPhotosProvider.php',
	});
});