// Import and Configure the AudioRecorder Polyfill Package
// See docs here: https://github.com/ai/audio-recorder-polyfill
import AudioRecorder from '../node_modules/audio-recorder-polyfill/index.js'
import mpegEncoder from '../node_modules/audio-recorder-polyfill/mpeg-encoder/index.js'
// Enable MP3 Encoding of Audio Files
AudioRecorder.encoder = mpegEncoder
AudioRecorder.prototype.mimeType = 'audio/mpeg'
window.MediaRecorder = AudioRecorder
// End configuration for Polyfill library

var showAudioBar;

// Check for the Audio Context API
// It appears to be the caes that you do not need to even turn on the Modern Web Audio API
// Code adapted from: https://stackoverflow.com/a/29373891/5420796
var AudioContext = window.AudioContext // Default
    || window.webkitAudioContext // Safari and old versions of Chrome
    || false; 

if (AudioContext) {
  console.log("Web Audio API is supported");
  showAudioBar = true;
    
} else {
    console.log("Web Audio API not supported");
    showAudioBar = false;
    alert("By the way, the Web Audio API is not supported by your browser. For a better experience activate this feature on Safari (Settings -> Safari -> Advanced -> Experimental Features -> Web Audio API)  ");
}

// Visaulizer set up
const canvas = document.querySelector('#audio-bar-canvas');
let audioCtx;
const canvasCtx = canvas.getContext("2d");

// Out of Box solution to get script parameter
// https://stackoverflow.com/a/21253793/5420796
function getSyncScriptParams() {
         var scripts = document.getElementsByTagName('script');
         var lastScript = scripts[scripts.length-2];
         var scriptName = lastScript;
         return {"translateToLangCode": scriptName.getAttribute('data-translate-to-code'),
                "L2TargetWord": scriptName.getAttribute('data-target-word')}
}

var specialEndpointData = getSyncScriptParams();

// For Vanilla Javascript, Wrap everything in an initListeners() function and
// Call this function at the end
var initListeners = (L2TargetWord, translateToLangCode) => {

    // Do a check for getUserMedia, if not present then throw an error
    try {
      navigator.mediaDevices.getUserMedia
      console.log("User media is supported");
    }
    catch(err) {
      console.log(err);
      alert("Greetings Language Learner! Your browser still does not support our recording functionality. If you are on an iPhone, you must use Safari. If you are on an Android you must use Chrome.");
      window.location.replace("https://language-horse.herokuapp.com/");
    }
    
    
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
    let recorder;
    var firstTime = true;
    
    // Connect to the record button
    const recordButton = document.querySelector('#record-button');

    
    // Check for the user coming back into focus
    $(window).focus(function() {

      // IF there is already a target word then
      // turn the mic back on
      if (L2TargetWord != "") {


        console.log("Starting mic inpput");

        // We want to turn the mic on
        // Only if the user left off on the third screen
        initMic(firstTime=false);
      }



    });

    // Listener to check when user leaves tab
    $(window).blur(function() {

      // If L2TargetWord is not a blank string
      // That means the mic stream is on

      if (L2TargetWord != "") {

        console.log("Stopping mic input");

        // Close mic stream
        recorder.stream.getTracks().forEach(i => i.stop())

      }
      
    });
    
    // Set the default value as English in the drop down
    $('#ddl_lang_from').val('English (US)')
    
    // Use JQUERY to bind click events to the functions below
    $( "#translate_next" ).click(function() {
      selectLanguages();
    })
    
    $( "#translate-button" ).click(function() {
      // Get the word from the text box
      targetL1Word = $("#L1-input-text-box").val()

      // Pass it in as a parameter
      translateLanguages(targetL1Word);
    })
    
    $( "#hear-pronunciation-button" ).click(function() {
      hearAudio(rawBase64AudioString);
    });
    
    $( "#reset-inputs" ).click(function() {
      $('#carousel').slick('slickGoTo', 0);
    });
    
    $( "#submit-button" ).click(function() {
      submitAnswer();
      
    });
    
    $( "#try-again-button" ).click(function() {
      tryAgain();
    });
    
    
    $( "#loose-screen-google-heard-audio" ).click(function() {
      hearAudio(googleHeardAudio);
    });


    $( "#win-screen-google-heard-audio" ).click(function() {
      hearAudio(rawBase64AudioString);
    });

    $( "#lose-screen-target-word-audio" ).click(function() {
      hearAudio(rawBase64AudioString);
    });
    
    
    $( "#win-screen-target-word-audio").click(function() {
      hearAudio(userL2Recording);
    });

    $( "#lose-screen-user-audio").click(function() {
      hearAudio(userL2Recording);
    });
    
    $( "#question-mark" ).click(function() {
      alert("We made this game so you can show off your language skills, and practice! Start out with easy words in languages you know. Try to say 'table', in Spanish. Then try languages you don't know. Try to say 'horse' in Thai. Language Horse works using Google translate's Speech-To-Text and Text-To-Speech features. Contact us! LanguageHorse@gmail.com, Credits: Project Leader: Graham Derry, Lead Developer: Max Carey (TOTAGO)")
    });
    
    
    var initMic = (firstTime) => {

          // Request permissions to record audio
          navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
          
          var chunks = [];
          recorder = new MediaRecorder(stream)
          
          
          // Only show the audio bar if the Web Audio API is supported
          // showAudioBar is set at top of file
          if (showAudioBar) {
            visualize(stream);
          }
      
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
    
      // Only add the event listener the first time the mic gets turned on
      // Otherwise there will be multiple event listeners being called a bunch
      if (firstTime) {
                
        recordButton.addEventListener('click', () => {
    
        if (!currentlyRecording) {
        
        // Start recording
        recorder.start()
    
        console.log("recorder started!");
        $('#audio-bar-canvas').css('visibility', 'visible');
        // Changing background here is redundant the first time around
        // It is to undo the change on line 69 below
        $('#record-button').css('background','#FF0000');
        $('#record-button').css('color','yellow');
        $('#record-button-text').text('Recording...')
    
        currentlyRecording = true;
        
    
          } else {
    
    
            // Stop recording
            recorder.stop()

            $('#audio-bar-canvas').css('visibility', 'hidden');
    
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
      }
  }

    
    var tryAgain = () => {
    
      initMic(firstTime=false);

      // Change to the you are wrong screen
      $('#carousel').slick('slickGoTo', 2)
    
    }
    
    
    var submitAnswer = () => {

      // If user is currently recording, then stop recording and send alert
      if (currentlyRecording) {
        // Stop recording
        recorder.stop()
        $('#audio-bar-canvas').css('visibility', 'hidden');
        console.log("Stopping media recording");
        $('#record-button').css('color','red');
        $('#record-button').css('background','#dfe0e1');
        $('#record-button-text').text('Re-record');
            
        // Set currently recording to false
        currentlyRecording = false;
        alert("Press Submit again to see if you're correct");
        return
      }
    
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

                console.log("You got the answer correct")
                console.log("Google is this confident in it's transcription: ");
                console.log(result['recognizedSpeechConfidene']);

                
                var message = "You said " + L2TargetWord + " in " + translateToLang + " -> Click to listen!";
                $('#correct-screen-target-word').text(message);
                
                $('#correct-screen-target-word-your-recording').text("Click to listen to your recording ->");
                

                // Change to the you are correct screen
                $('#carousel').slick('slickGoTo', 4);
                
              } else {

                // Close mic button in browser
                recorder.stream.getTracks().forEach(i => i.stop())
                
                // Change to the you are wrong screen
                $('#carousel').slick('slickGoTo', 3)
    
                // Update the translate_to box with the result
                $("#you-meant-to-say").text(L2TargetWord);
                
                
                // Add what google heard to the texbox
                $("#google-heard").text(result['googleHeard']);
    
                // Add the synthesized audio of what google heard to its global variable
                googleHeardAudio = result['googleHeardAudio'];

                console.log("Google is this confident in it's transcription: ");
                console.log(result['recognizedSpeechConfidene']);
    
              }
    
              
              
      }});
    
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
    
    var translateLanguages = (targetL1Word) => {
    
      initMic(firstTime);
    
      // Placeholder code for button, we will put ajax call here
      var translateURL = "/translate" + "/" + translateFromLangCode + "/" + translateToLangCode + "/" + targetL1Word;
    
    
      $.ajax({url: translateURL, success: function(result) {
        
        
        L2TargetWord = result["target_word"]
    
        // Update the translate_to box with the result
        $("#L2-target-word").text(L2TargetWord);
    
        // Update the global variable of the base 64 audio string
        rawBase64AudioString = result["target_audio"]
    
        $('#carousel').slick('slickGoTo', 2)
        
        // Show everything once the function call is done
        $('body').show();
        
      }});
    
      // Update the transalated_from box with the target L1 word
      $("#L1-target-word").text(targetL1Word);
    
    };
    
    var hearAudio = (audio) => {
    
      // https://stackoverflow.com/a/17762789/5420796
      var L2Audio = new Audio("data:audio/wav;base64," + audio)
      L2Audio.play()
    
    }

    if (specialEndpointData.L2TargetWord && specialEndpointData.translateToLangCode) {

      // Hide everything while we wait for results of translateLanguages()
      $('body').hide();

      translateToLangCode = specialEndpointData.translateToLangCode;     
      translateFromLangCode = 'en-US'
      translateLanguages(specialEndpointData.L2TargetWord);
    }   
}

function visualize(stream) {
  if(!audioCtx) {
    audioCtx = new AudioContext();
  }

  const source = audioCtx.createMediaStreamSource(stream);

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  //analyser.connect(audioCtx.destination);

  draw()

  function draw() {
    const WIDTH = canvas.width
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(250,250,250)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    let sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;


    for(let i = 0; i < bufferLength; i++) {

      let v = dataArray[i] / 128.0;
      let y = v * HEIGHT/2;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();

  }
}


initListeners(specialEndpointData.L2TargetWord, specialEndpointData.translateToLangCode);