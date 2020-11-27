// Initialize global variables that will hold the key langauges
var translateFromLang = "";
var translateToLang = ""
var translateFromLangCode = "";
var translateToLangCode = "";
var targetL1Word = "";
var placeHolderMessage = "";
var rawBase64AudioString = "";
var currentlyRecording = false;
var userL2Recording = "";
var L2TargetWord = "";

// Connect to the record button
const record = document.querySelector('#record-button');


// Set the default value as English in the drop down
$('#ddl_lang_from').val('English (US)')


// Use JQUERY to bind click events to the functions below
$( "#translate_next" ).click(function() {
  selectLanguages();
})

$( "#translate-button" ).click(function() {
  translateLanguages();
})

$( "#hear-pronunciation-button" ).click(function() {
  hearAudio();
});

$( "#reset-inputs" ).click(function() {
  hearL2Audio();
});

$( "#submit-button" ).click(function() {
  // This method we should keep for testing purposes
  //hearL2Audio();
  submitAnswer();
  
});

if (navigator.mediaDevices.getUserMedia) {
  console.log('getUserMedia supported.');

  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function(stream) {
    const mediaRecorder = new MediaRecorder(stream);

    // TODO: Implement a similar function
    // visualize(stream);

    record.onclick = function() {
      if (!currentlyRecording) { 
            mediaRecorder.start();
            console.log("recorder started");
            
            // Changing background here is redundant the first time around
            // It is to undo the change on line 69 below
            $('#record-button').css('background','#FF0000');
            
            $('#record-button').css('color','yellow');
            $('#record-button-text').text('Recording...')
            console.log(mediaRecorder.state);
            currentlyRecording = true;
          } else {
            console.log("Stopping media recording")
            $('#record-button').css('color','red');
            $('#record-button').css('background','#dfe0e1');
            $('#record-button-text').text('Re-record')
            mediaRecorder.stop();
            currentlyRecording = false;
          }
    }


    mediaRecorder.onstop = function(e) {
      
      const blob = new Blob(chunks, { 'type' : 'audio/mp3' });

      // Clear out chunks
      chunks = [];

      // Convert the blob to a base 64 string
      // See: https://stackoverflow.com/a/18650249/5420796
      var reader = new FileReader();
      reader.readAsDataURL(blob); 
      reader.onloadend = function() {
      var base64data = reader.result;                
        // Add the raw base64 string to the top
        userL2Recording = base64data.substr(base64data.indexOf(',')+1)
      }
    }

    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    }
  }

  let onError = function(err) {
    console.log('The following error occured: ' + err);
  }

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

} else {
   console.log('getUserMedia not supported on your browser!');
}

var submitAnswer = () => {

  // Make sure that there is an L2 recording
  if (!userL2Recording) {
    alert("You must record somet")
    return
  }

  scoreURL = '/score' + '/'  + translateToLangCode + '/' + L2TargetWord

  console.log("Here is the recording");
  console.log(userL2Recording);
  $.post({url: scoreURL,
          data: JSON.stringify({'userL2Recording': userL2Recording}),
          processData: false,
          contentType: "application/json", 
          success: function(result) {

          if (result['error']) {
            alert("Please send another recording, your audio could not be heard. Here is the error: " + result['error'])
            return
          }

          if (result['isCorrect']) {
            // https://stackoverflow.com/a/506004
            redirectURL = result['redirectURL']
            
          } else {
            redirectURL = result['redirectURL'] + '/' + result['googleHeard'] + '/' + result['targetL2Word'];
          }

          window.location.replace(redirectURL);
          
  }});

}

var hearL2Audio = () => {

  alert("Close this box to here the audio that you created")
  // https://stackoverflow.com/a/17762789/5420796
  var targetL2Audio = new Audio("data:audio/mp3;base64," + userL2Recording)
  targetL2Audio.play()

}

var selectLanguages = () => {
  // Grab the langauge data from the UI
  translateFromLang = $("#ddl_lang_from :selected").text();
  translateToLang = $("#ddl_lang_to :selected").text();
  translateFromLangCode = $("#ddl_lang_from :selected").attr('label');
  translateToLangCode = $("#ddl_lang_to :selected").attr('label');

  // Validation: Check to make sure the languages are not the same
  if (translateFromLang == translateToLang) {
    alert("You must select different languages")
    return
  }

  // Validation: Check to make sure that
  if (!translateFromLang || !translateToLang) {
    alert("You must select a \"Translate From\" and a \"Translate To\" method")
    return

  }

  // Change the text of the badges based on previous codes
  $('.translate-from-label').text(translateFromLang);
  $('.translate-to-label').text(translateToLang);

  // Embed translate from variable into custom language message for L1 Input Text Box placeholder
  placeHolderMessage = "Type your word in " + translateFromLang + " here..."
  $("#L1-input-text-box").attr("placeholder", placeHolderMessage).val("").focus().blur();

  $('#carousel').slick('slickGoTo', 1)
};

var translateLanguages = () => {

  // Get the word from the text box
  targetL1Word = $('#L1-input-text-box').val();

  // Placeholder code for button, we will put ajax call here
  var translateURL = "/translate" + "/" + translateFromLangCode + "/" + translateToLangCode + "/" + targetL1Word;


  $.ajax({url: translateURL, success: function(result) {
    
    
    L2TargetWord = result["target_word"]

    // Update the translate_to box with the result
    $("#L2-target-word").text(L2TargetWord);

    // Update the global variable of the base 64 audio string
    rawBase64AudioString = result["target_audio"]

    $('#carousel').slick('slickGoTo', 2)
    
    
  }});

  // Update the transalated_from box with the target L1 word
  $("#L1-target-word").text(targetL1Word);

};

var hearAudio = () => {

  // https://stackoverflow.com/a/17762789/5420796
  var L2Audio = new Audio("data:audio/wav;base64," + rawBase64AudioString)
  L2Audio.play()

}