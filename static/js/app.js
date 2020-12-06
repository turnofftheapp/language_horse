// Import and Configure the AudioRecorder Polyfill Package
// See docs here: https://github.com/ai/audio-recorder-polyfill
import AudioRecorder from '../node_modules/audio-recorder-polyfill/index.js'
import mpegEncoder from '../node_modules/audio-recorder-polyfill/mpeg-encoder/index.js'
// Enable MP3 Encoding of Audio Files
AudioRecorder.encoder = mpegEncoder
AudioRecorder.prototype.mimeType = 'audio/mpeg'
window.MediaRecorder = AudioRecorder
// End configuration for Polyfill library

// Initialize global variables that will hold the key langauges
var translateFromLang = "";
var translateToLang = "";
var translateFromLangCode = "";
var translateToLangCode = "";
var targetL1Word = "";
var placeHolderMessage = "";
var rawBase64AudioString = "";
var currentlyRecording = false;
var userL2Recording = "";
var L2TargetWord = "";
var googleHeardAudio = "";

// Connect to the record button
const recordButton = document.querySelector('#record-button');

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
  $('#carousel').slick('slickGoTo', 0);
});

$( "#submit-button" ).click(function() {
  // This method we should keep for testing purposes
  //hearL2Audio();
  submitAnswer();
  
});

$( "#try-again-button" ).click(function() {

  tryAgain();
  
});


$( "#loose-screen-google-heard-audio" ).click(function() {
  hearGoogleHeard();
});


$( "#lose-screen-target-word-audio" ).click(function() {
  hearAudio();
});




let recorder

// Request permissions to record audio
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      
      var chunks = [];
      recorder = new MediaRecorder(stream)
     
  
      // Convert blob to base 64 string when finished
      recorder.addEventListener('dataavailable', e => {
        
        var reader = new FileReader();
        reader.readAsDataURL(e.data); 
        reader.onloadend = function() {
          
          // Get the base 64 data
          var base64data = reader.result;
          // Extract the raw base64 string
          userL2Recording = base64data.substr(base64data.indexOf(',')+1)
        }


      })
    })

            
recordButton.addEventListener('click', () => {

  if (!currentlyRecording) {
    
    // Start recording
    recorder.start()

    console.log("recorder started");        
    // Changing background here is redundant the first time around
    // It is to undo the change on line 69 below
    $('#record-button').css('background','#FF0000');
    $('#record-button').css('color','yellow');
    $('#record-button-text').text('Recording...')

    currentlyRecording = true;
    

      } else {


        // Stop recording
        recorder.stop()

        console.log("Stopping media recording")
        $('#record-button').css('color','red');
        $('#record-button').css('background','#dfe0e1');
        $('#record-button-text').text('Re-record');
        
        // Remove “recording” icon from browser tab
        //recorder.stream.getTracks().forEach(i => i.stop())

        // Set currently recording to false
        currentlyRecording = false;


      }
})

var tryAgain = () => {

  // Change to the you are wrong screen
  $('#carousel').slick('slickGoTo', 2)

}


var submitAnswer = () => {


  // Make sure that there is an L2 recording
  if (!userL2Recording) {
    alert("You must record something!")
    return
  }


  var scoreURL = '/score' + '/'  + translateToLangCode + '/' + L2TargetWord + '/' + translateFromLangCode

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
            var redirectURL = result['redirectURL']
            window.location.replace(redirectURL);
            
          } else {
            
            // Change to the you are wrong screen
            $('#carousel').slick('slickGoTo', 3)

            // Update the translate_to box with the result
            $("#you-meant-to-say").text(L2TargetWord);
            
            
            // Add what google heard to the texbox
            $("#google-heard").text(result['googleHeard']);

            // Add the synthesized audio of what google heard to its global variable
            googleHeardAudio = result['googleHeardAudio']

          }

          
          
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
  targetL1Word = $("#L1-input-text-box").val()

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


// TODO: FACTOR THESE ALL INTO ONE FUNCTION:

var hearL2Audio = () => {

  alert("Close this box to here the audio that you created")
  // https://stackoverflow.com/a/17762789/5420796
  var targetL2Audio = new Audio("data:audio/mp3;base64," + userL2Recording)
  targetL2Audio.play()

}


var hearAudio = () => {

  // https://stackoverflow.com/a/17762789/5420796
  var L2Audio = new Audio("data:audio/wav;base64," + rawBase64AudioString)
  L2Audio.play()

}

var hearGoogleHeard = () => {

  console.log("Listening")
  // https://stackoverflow.com/a/17762789/5420796
  var L2Audio = new Audio("data:audio/mp3;base64," + googleHeardAudio)
  L2Audio.play()

}