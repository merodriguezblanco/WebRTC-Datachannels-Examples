document.addEventListener("DOMContentLoaded", function () {
  var peer = new Peer("receiver_id", { key: "8mbj0jpy4ju7hkt9" }),
      connection,
      streamer = new Streamer(),
      onData;

  streamer.video = document.querySelector("video");

  onData = function (data) {
    console.log(data);
    if (data.end) {
      streamer.end();
    } else {
      streamer.append(data);
    }
  };

  connection = peer.connect("sender_id");
  connection.on("open", function () {
    console.log("RECEIVER ON OPEN");

    connection.on("data", function (data) {
      console.log("RECEIVER ON DATA");
      onData(data);
    });

    streamer.receive();
  });
}, false);
