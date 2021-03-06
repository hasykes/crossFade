const mp3Button = document.querySelector("#mp3Button");
const micButton = document.querySelector("#micButton");
const iosButton = document.querySelector("#iosButton");
const songURL = "audio/Mk.gee - Over Here.mp3";
let stream;

// Create an AudioContext instance for both microphone and mp3 (1 context 2 sources)
var audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Create a buffer for the incoming mp3 sound content
const mp3Source = audioContext.createBufferSource();
const mp3GainNode = audioContext.createGain();

// Create the XHR which will grab the audio contents
var request = new XMLHttpRequest();
// Set the audio file src here
request.open("GET", songURL, true);
// Setting the responseType to arraybuffer sets up the audio decoding
request.responseType = "arraybuffer";

request.onload = function() {
  // Decode the audio once the require is complete
  audioContext.decodeAudioData(
    request.response,
    function(buffer) {
      mp3Source.buffer = buffer;
      // Simple setting for the buffer
      mp3Source.loop = true;
      mp3Source.start(0);
    },
    function(e) {
      console.log("Audio error! ", e);
    }
  );
};

// Send the request which kicks off
request.send();

//turn on by playing a silent note on iOS devices
function iosSwitch() {
  //request access to Microphone and process accordingly
  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(handleSuccess)
    .catch(handleError);
}

//toggle mp3
function mp3Switch() {
  if (stream) {
    if (mp3Button.dataset.state == 0) {
      mp3Source.connect(mp3GainNode);
      mp3GainNode.connect(audioContext.destination);
      mp3Button.dataset.state = 1;
    } else {
      mp3GainNode.disconnect(audioContext.destination);
      mp3Source.disconnect(mp3GainNode);
      mp3Button.dataset.state = 0;
    }
  } else {
    console.log("please click Start in iOS before proceeding");
  }
}

//make variables available globally
let micSource;
let micGainNode;

//toggle mic
function micSwitch() {
  if (stream) {
    if (micButton.dataset.state == 0) {
      // connect the source to the context's destination (the speakers)
      micSource.connect(micGainNode);
      micGainNode.connect(audioContext.destination);
      micButton.dataset.state = 1;
    } else {
      micGainNode.disconnect(audioContext.destination);
      micSource.disconnect(micGainNode);
      micButton.dataset.state = 0;
    }
  } else {
    console.log("please click Start in iOS before proceeding");
  }
}

function handleSuccess(stream) {
  console.log(stream.getAudioTracks());

  audioContext.resume(); //resume audio context for iOS issues

  micSource = audioContext.createMediaStreamSource(stream);
  micGainNode = audioContext.createGain();

  // make variable available to browser console
  window.stream = stream;
  window.micSource = micSource;
}

function handleError(error) {
  console.log("navigator.getUserMedia error: ", error);
}

// Fades between 0 (all source 1) and 1 (all source 2)
//taken from https://www.html5rocks.com/en/tutorials/webaudio/intro/#toc-load
function crossFade(element) {
  var x = parseInt(element.value) / parseInt(element.max);
  // Use an equal-power crossfading curve:
  var gain1 = Math.cos(x * 0.5 * Math.PI);
  var gain2 = Math.cos((1.0 - x) * 0.5 * Math.PI);

  mp3GainNode.gain.value = gain1;
  micGainNode.gain.value = gain2;
}
