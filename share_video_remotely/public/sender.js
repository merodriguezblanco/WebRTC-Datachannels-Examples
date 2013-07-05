document.addEventListener("DOMContentLoaded", function () {
  var peer = new Peer("sender_id", { key: "8mbj0jpy4ju7hkt9" }),
      streamer = new Streamer();

  peer.on("connection", function (connection) {
    console.log("SENDER ON CONNECTION");

    streamer.push = function (chunk) {
      console.log(chunk);
      connection.send(chunk);
    };

    document.querySelector("input[type=file]").addEventListener("change", function () {
      streamer.stream(this.files[0]);
    }, false);
  });
}, false);
