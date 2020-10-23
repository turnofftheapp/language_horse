$(function() {
	$("#ddl_lang_from").select2({
		width: '100%',
		placeholder: 'Select a language'
	});
	$("#ddl_lang_to").select2({
		width: '100%',
		placeholder: 'Select a language'
	});
	$("#carousel").on("init", function() {
		$("#carousel").css("opacity", 1);
	}).slick({
		arrows: false,
		touchMove: false,
		swipe: false,
		dots: true,
		fade: true,
	});

})