// Compatibility between browsers.
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var app = {};

app.constraints = { video: {
                             mandatory: {
                               chromeMediaSource: "screen"
                             }
                           },
                    audio: false
                  };

app.successCallback = function(stream) {
  console.log("Success callback.");
  video = document.getElementById("video_display");
  video.src = window.URL.createObjectURL(stream);
  video.play();
};

app.errorCallback = function(error) {
  console.log("Error callback, error: " + error);
};

(function() {
  console.log("Calling navigator.getUserMedia.");
  navigator.getUserMedia(app.constraints, app.successCallback, app.errorCallback);
})();
