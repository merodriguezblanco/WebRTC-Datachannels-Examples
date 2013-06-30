var app = {};
var mediaConstraints = { optional: [], mandatory: { OfferToReceiveAudio: false, OfferToReceiveVideo: false } }
window.streamer = new Streamer();

app.sendTextButton = document.getElementById("send_text");

app.sendTextButton.onclick = function(event) {
  var text = document.getElementById("datachannel_send").value;

  console.log("Send text callback.");
  app.senderDataChannel.send(text);
  console.log("Sent text: " + text);
};

app.createPeerConnections = function() {
  var servers = null;

  try {
    app.localPeerConnection = new webkitRTCPeerConnection(servers, {optional: [{RtpDataChannels: true}]});
    console.log("Created local RTCPeerConnection.");
  } catch(exception) {
    console.log("Failed to create local RTCPeerConnection: " + exception.message);
  };

  try {
    app.senderDataChannel = app.localPeerConnection.createDataChannel("senderDataChannel", {reliable: false});
    console.log("Created sender datachannel.");
  } catch(exception) {
    console.log("createDataChannel failed with exception: " + exception.message);
  };

  app.localPeerConnection.onicecandidate = app.gotLocalIceCandidate;
  app.senderDataChannel.onopen = app.handleSenderChannelState;
  app.senderDataChannel.onclose = app.handleSenderChannelState;

  try {
    app.remotePeerConnection = new webkitRTCPeerConnection(servers, {optional: [{RtpDataChannels: true}]});
    console.log("Created remote RTCPeerConnection.");
  } catch(exception) {
    console.log("Failed to create remote RTCPeerConnection: " + exception.message);
  };

  app.remotePeerConnection.onicecandidate = app.gotRemoteIceCandidate;
  app.remotePeerConnection.ondatachannel = app.gotReceiverDataChannel;

  app.localPeerConnection.createOffer(app.gotLocalDescription, null, mediaConstraints);
};

app.handleSenderChannelState = function() {
  var readyState = app.senderDataChannel.readyState;
  console.log("Sender datachannel state is: " + readyState);
};

app.handleReceiverChannelState = function() {
  var readyState = app.receiverDataChannel.readyState;
  console.log("Receiver datachannel state is: " + readyState);
};

app.gotLocalIceCandidate = function(event) {
  console.log("Local ICE callback.");
  if (event.candidate) {
    app.remotePeerConnection.addIceCandidate(event.candidate);
    console.log("Local ICE candidate: " + event.candidate.candidate);
  };
};

app.gotRemoteIceCandidate = function(event) {
  console.log("Remote ICE callback.");
  if (event.candidate) {
    app.localPeerConnection.addIceCandidate(event.candidate);
    console.log("Remote ICE candidate: " + event.candidate.candidate);
  };
};

app.gotReceiverDataChannel = function(event) {
  console.log("Receive Channel callback.");
  app.receiverDataChannel = event.channel;
  app.receiverDataChannel.onmessage = app.handleReceivedMessage;
  app.receiverDataChannel.onopen = app.handleReceiverChannelState;
  app.receiverDataChannel.onclose = app.handleReceiverChannelState;
};

app.handleReceivedMessage = function(event) {
  var message = event.data;
  console.log("Handle Receive Message callback. Message: " + message);
  document.getElementById("datachannel_receive").value = message;
};

app.gotLocalDescription = function(description) {
  console.log("Offer from localPeerConnection: " + description.sdp);
  app.localPeerConnection.setLocalDescription(description);
  app.remotePeerConnection.setRemoteDescription(description);
  app.remotePeerConnection.createAnswer(app.gotRemoteDescription, null, mediaConstraints);
};

app.gotRemoteDescription = function(description) {
  console.log("Answer from remotePeerConnection: " + description.sdp);
  app.remotePeerConnection.setLocalDescription(description);
  app.localPeerConnection.setRemoteDescription(description);
};

document.addEventListener("DOMContentLoaded", function() {
  app.createPeerConnections();
}, false);
