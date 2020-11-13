// Initialize global variables that will hold the key langauges
var translateFromLang = "";
var translateToLang = ""
var translateFromLangCode = "";
var translateToLangCode = "";
var targetL1Word = "";

// Se the default value as English
$('#ddl_lang_from').val('English (US)')

// When you select languages, and click the next button
$( "#translate_next" ).click(function() {
  // Grab the langauge data from the UI
  translateFromLang = $("#ddl_lang_from :selected").text();
  translateToLang = $("#ddl_lang_to :selected").text();
  translateFromLangCode = $("#ddl_lang_from :selected").attr('label');
  translateToLangCode = $("#ddl_lang_to :selected").attr('label');

  // Change the text of the badges based on previous codes
  $('.translate-from-label').text(translateFromLang);
  $('.translate-to-label').text(translateToLang);

});

// When you hit the translate button we should make an AJAX 
$( "#translate-button" ).click(function() {
  
  // Get the word from the text box
  targetL1Word = $('#L1-input-text-box').val();

  // Placeholder code for button, we will put ajax call here
  var translateURL = "/translate" + "/" + translateFromLangCode + "/" + translateToLangCode + "/" + targetL1Word;


  $.ajax({url: translateURL, success: function(result) {
    // Print out the resulting data for testing purposes, remove later
    console.log(result);
    
    // Update the translate_to box with the result
    $("#L2-target-word").text(result);
    
    // Update the transalated_from box with the target L1 word
    $("#L1-target-word").text(targetL1Word);
  }});
});


