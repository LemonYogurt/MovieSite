$('#avatar').change(function () {
	var file = this.files[0];
	var fd = new FileReader();
	fd.readAsDataURL(file);

	fd.onload = function () {
		$('#avatarPreview').attr('src', this.result);
		$('#avatarPreview').css('display', 'block');
	};
});