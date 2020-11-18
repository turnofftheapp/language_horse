// Initialize global variables that will hold the key langauges
var translateFromLang = "";
var translateToLang = ""
var translateFromLangCode = "";
var translateToLangCode = "";
var targetL1Word = "";
var placeHolderMessagem = "";
var rawBase64AudioString = "";
var currentlyRecording = false;

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

// PHASE OUT TO DELETE THIS 1/1
// I HAD SCOPING ISSUES THIS WAY
//$( "#record-button" ).click(function() {
//  if (!currentlyRecording) {
//    recordAudio();
//  } else {
//    stopRecording();
//  }
//  
//});

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
            console.log(mediaRecorder.state);
            console.log("recorder started");
            currentlyRecording = true;
          } else {
            console.log("Stopping media recording")
            mediaRecorder.stop();
            currentlyRecording = false;
          }
    }


    mediaRecorder.onstop = function(e) {
      //console.log("data available after MediaRecorder.stop() called.");
//
      //const clipName = prompt('Enter a name for your sound clip?','My unnamed clip');
//
      //const clipContainer = document.createElement('article');
      //const clipLabel = document.createElement('p');
      //const audio = document.createElement('audio');
      //const deleteButton = document.createElement('button');

      //clipContainer.classList.add('clip');
      //audio.setAttribute('controls', '');
      //deleteButton.textContent = 'Delete';
      //deleteButton.className = 'delete';

      //if(clipName === null) {
      //  clipLabel.textContent = 'My unnamed clip';
      //} else {
      //  clipLabel.textContent = clipName;
      //}

      //clipContainer.appendChild(audio);
      //clipContainer.appendChild(clipLabel);
      //clipContainer.appendChild(deleteButton);
      //soundClips.appendChild(clipContainer);

      //audio.controls = true;
      
      // Create the audio blob
      const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
      console.log("Here is the blob")
      console.log(blob)

      // Clear out chunks
      chunks = [];
      
      //const audioURL = window.URL.createObjectURL(blob);
      //audio.src = audioURL;
      //console.log("recorder stopped");

      //deleteButton.onclick = function(e) {
      //  let evtTgt = e.target;
      //  evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
      //}

      //clipLabel.onclick = function() {
      //  const existingName = clipLabel.textContent;
      //  const newClipName = prompt('Enter a new name for your sound clip?');
      //  if(newClipName === null) {
      //    clipLabel.textContent = existingName;
      //  } else {
      //    clipLabel.textContent = newClipName;
      //  }
      //}
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


// I HAD SCOPING ISSUES THIS WAY
//var stopRecording = () => {
//  console.log("Recording Stopped")
//  mediaRecorder.stop();
//  $('#record-button').css('color','red');
//  currentlyRecording = false;
//
//}
//
//var recordAudio = () => {
//  console.log("Starting Recording")
//  mediaRecorder.start();
//  $('#record-button').css('color','green');
//  currentlyRecording = true;
//}

var selectLanguages = () => {
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
};

var translateLanguages = () => {

  // Get the word from the text box
  targetL1Word = $('#L1-input-text-box').val();

  // Placeholder code for button, we will put ajax call here
  var translateURL = "/translate" + "/" + translateFromLangCode + "/" + translateToLangCode + "/" + targetL1Word;


  $.ajax({url: translateURL, success: function(result) {
    
    // Update the translate_to box with the result
    $("#L2-target-word").text(result["target_word"]);

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