import AudioRecorder from '../node_modules/audio-recorder-polyfill/index.js'
import mpegEncoder from '../node_modules/audio-recorder-polyfill/mpeg-encoder/index.js'
AudioRecorder.encoder = mpegEncoder
AudioRecorder.prototype.mimeType = 'audio/mpeg'

window.MediaRecorder = AudioRecorder

// Initialize global variables that will hold the key langauges
var translateFromLang = "";
var translateToLang = ""
var translateFromLangCode = "";
var translateToLangCode = "";
var targetL1Word = "Hello world";
var placeHolderMessage = "";
var rawBase64AudioString = "";
var currentlyRecording = false;
var userL2Recording = "";
var L2TargetWord = "";

// Connect to the record button
const recordButton = document.querySelector('#record-button');


// Connect to the audio element
const audio = document.querySelector('#invisible-audio');


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

let recorder


recordButton.addEventListener('click', () => {


  if (!currentlyRecording) {
    // Request permissions to record audio
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      
      var chunks = [];
      recorder = new MediaRecorder(stream)
     
  
      // Set record to <audio> when recording will be finished
      recorder.addEventListener('dataavailable', e => {
        audio.src = URL.createObjectURL(e.data);
        console.log(e.data);

        var reader = new FileReader();
        reader.readAsDataURL(e.data); 
        reader.onloadend = function() {
        var base64data = reader.result;                
        
        // Extract the raw base64 string
        userL2Recording = base64data.substr(base64data.indexOf(',')+1)
        console.log(userL2Recording);
 }


      })
  
      // Start recording
      recorder.start()

      currentlyRecording = true;
    })

      } else {


        // Stop recording
        recorder.stop()
        
        // Remove “recording” icon from browser tab
        recorder.stream.getTracks().forEach(i => i.stop())

        // Set currently recording to false
        currentlyRecording = false;


      }
})



var submitAnswer = () => {


  // Make sure that there is an L2 recording
  if (!userL2Recording) {
    alert("You must record something!")
    return
  }

  console.log("Here is what we are submitting!")
  console.log(userL2Recording);

  var scoreURL = '/score' + '/'  + translateToLangCode + '/' + L2TargetWord

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
            var redirectURL = result['redirectURL']
            
          } else {
            var redirectURL = result['redirectURL'] + '/' + result['googleHeard'] + '/' + result['targetL2Word'];
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

var hearAudio = () => {

  // https://stackoverflow.com/a/17762789/5420796
  var L2Audio = new Audio("data:audio/wav;base64," + rawBase64AudioString)
  L2Audio.play()

}

