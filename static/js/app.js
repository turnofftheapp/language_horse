// Initialize global variables that will hold the key langauges
var translateFromLang = "";
var translateToLang = ""
var translateFromLangCode = "";
var translateToLangCode = "";
var targetL1Word = "";
var placeHolderMessagem = "";

// Raw audio string to be replaced by dynamic data from AJAX
var rawBase64AudioString = "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"

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

  // Embed translate from variable into custom language message for L1 Input Text Box placeholder
  placeHolderMessage = "Type your word in " + translateFromLang + " here..."
  $("#L1-input-text-box").attr("placeholder", placeHolderMessage).val("").focus().blur();

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
    
    
  }});

  // Update the transalated_from box with the target L1 word
  $("#L1-target-word").text(targetL1Word);

});

// When you hit the translate button we should make an AJAX 
$( "#hear-pronunciation-button" ).click(function() {
  


  // https://stackoverflow.com/a/17762789/5420796
  var targetAudio = new Audio("data:audio/wav;base64," + rawBase64AudioString)
  targetAudio.play()
  

});




