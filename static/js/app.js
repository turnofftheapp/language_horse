// Initialize global variables that will hold the key langauges
var translateFromLang = "";
var translateToLang = ""
var translateFromLangCode = "";
var translateToLangCode = "";

// When you select languages, and click the next button
$( "#translate_next" ).click(function() {
  // Grab the langauge data from the UI
  translateFromLang = $("#ddl_lang_from :selected").text()
  translateToLang = $("#ddl_lang_to :selected").text()
  translateFromLangCode = $("#ddl_lang_from :selected").attr('label')
  translateToLangCode = $("#ddl_lang_to :selected").attr('label')

  // Change the text of the badges based on previous codes
  $('#translate-from-label').text(translateFromLang);
  $('#translate-to-label').text(translateToLang);

});

// When you hit the translate button we should make an AJAX
$( "#translate-button" ).click(function() {
  // Placeholder code for button, we will put ajax call here
  alert("Transte button pressed");
});


