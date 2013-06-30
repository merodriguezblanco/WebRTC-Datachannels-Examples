document.addEventListener("DOMContentLoaded", function() {
  var streamer = new Streamer();
  var offerer, answerer;
  var offererDataChannel, answererDataChannel;
  var iceServers;
  var onData;
  var optionalRtpDataChannels;
  var mediaConstraints;
  var createAnswer;
  var setChannelEvents;
  var setBandwidth;

  // Pre-recorded media sender
  streamer.push = function(chunk) {
    chunk = JSON.stringify(chunk);
    offererDataChannel.send(chunk);
  };

  document.querySelector("input[type=file]").addEventListener("change", function () {
    streamer.stream(this.files[0]);
  }, false);

  // Pre-recorded media receiver
  streamer.video = document.querySelector("video");
  streamer.receive();

  onData = function (data) {
    console.log(data);
    if (data.end) {
      streamer.end();
    } else {
      streamer.append(data);
    }
  }

  iceServers = { iceServers: [{ url: "stun:stun.l.google.com:19302" }] };

  optionalRtpDataChannels = { optional: [{ RtpDataChannels: true }] };

  mediaConstraints = {
    optional: [],
    mandatory: {
      OfferToReceiveAudio: false, // Hmm!!
      OfferToReceiveVideo: false // Hmm!!
    }
  };

  offerer = new webkitRTCPeerConnection(iceServers, optionalRtpDataChannels),
  offererDataChannel = offerer.createDataChannel("RTCDataChannel", { reliable: false });
  offerer.onicecandidate = function (event) {
    if (!event || !event.candidate) return;
    answerer && answerer.addIceCandidate(event.candidate);
  };
  offerer.createOffer(function (sessionDescription) {
    sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
    offerer.setLocalDescription(sessionDescription);
    createAnswer(sessionDescription);
  }, null, mediaConstraints);

  createAnswer = function (offerSDP) {
    answerer = new webkitRTCPeerConnection(iceServers, optionalRtpDataChannels);
    answererDataChannel = answerer.createDataChannel("RTCDataChannel", { reliable: false });

    setChannelEvents(answererDataChannel, "answerer");

    answerer.onicecandidate = function (event) {
      if (!event || !event.candidate) {
        return;
      }
      offerer && offerer.addIceCandidate(event.candidate);
    };

    answerer.setRemoteDescription(offerSDP);
    answerer.createAnswer(function (sessionDescription) {
      sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
      answerer.setLocalDescription(sessionDescription);
      offerer.setRemoteDescription(sessionDescription);
    }, null, mediaConstraints);
  }

  setChannelEvents = function (channel, channelNameForConsoleOutput) {
    channel.onmessage = function (event) {
      console.debug(channelNameForConsoleOutput, "received a message:", event.data);

      var data = JSON.parse(event.data);
      console.log(data);
      onData(data);
    };

    channel.onopen = function () {
      channel.send("first text message over RTP data ports");
    };
  }

  setBandwidth = function (sdp) {
    // Remove existing bandwidth lines
    sdp = sdp.replace( /b=AS([^\r\n]+\r\n)/g , '');
    sdp = sdp.replace( /a=mid:data\r\n/g , 'a=mid:data\r\nb=AS:1638400\r\n');

    return sdp;
  }
}, false);
