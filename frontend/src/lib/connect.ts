import { Socket, connect } from "socket.io-client";

import { ClientToServerEvents, ServerToClientEvents } from "../../shared-types";

let localMediaEl: HTMLVideoElement;
let localStream: MediaStream;

let remoteMediaEl: HTMLVideoElement;
let remoteStream: MediaStream;

let socket: Socket<ServerToClientEvents, ClientToServerEvents>;
let peerSocketId: string;
let peerConnection: RTCPeerConnection;

let sendChannel: RTCDataChannel;
let receiveChannel: RTCDataChannel;

let iceCandidateSent = false;
let timerToSendOffer: number;

let newTextHandler: (text: string) => void;

const servers: RTCConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun1.1.google.com:19302", "stun:stun2.1.google.com:19302"],
    },
  ],
};

const getPeerConnection = async () => {
  if (peerConnection) return peerConnection;
  console.log("Creating peer connection...");
  const peerConn = new RTCPeerConnection(servers);

  remoteStream = new MediaStream();
  remoteMediaEl.srcObject = remoteStream;

  localStream.getTracks().forEach((track) => {
    peerConn.addTrack(track);
  });

  peerConn.ontrack = async (event) => {
    remoteStream.addTrack(event.track);
  };

  remoteStream.onremovetrack = () => {
    peerConn.close();
  };

  peerConn.onicecandidate = async (event) => {
    // TODO: Many icecandidates are generated; depending on requirements, it is often okay to send only a few to the remote server
    if (
      event.candidate &&
      event.candidate.type === "host" &&
      !iceCandidateSent &&
      peerSocketId
    ) {
      console.log("Emit: iceCandidateToServer", event.candidate, peerSocketId);
      socket.emit("iceCandidateToServer", {
        ice_candidate: event.candidate,
        to_socket_id: peerSocketId,
      });
      iceCandidateSent = true;
    }
  };

  sendChannel = peerConn.createDataChannel("sendDataChannel");
  sendChannel.onopen = () => {
    console.log("Data channel is now open and ready to use...");
    onSendChannelStateChange(sendChannel);
  };

  peerConn.ondatachannel = receiveChannelCallback;
  // sendChannel.onmessage = onSendChannelMessageCallback;

  return peerConn;
};

const onSendChannelStateChange = (channel: RTCDataChannel) => {
  console.log("Send channel state is: ", channel.readyState);
};

const onReceiveChannelStateChange = () => {
  console.log("Receive channel state is: ", receiveChannel.readyState);
};

const onReceiveChannelMessageCallback = (ev: MessageEvent) => {
  console.log("Received msg: ", ev);
  newTextHandler?.(ev.data);
  // const receivedMsg = ev.data;
};

const receiveChannelCallback = (ev: RTCDataChannelEvent) => {
  console.log("Receive channel callback!");
  receiveChannel = ev.channel;
  receiveChannel.onmessage = onReceiveChannelMessageCallback;
  receiveChannel.onopen = onReceiveChannelStateChange;
  receiveChannel.onclose = onReceiveChannelStateChange;
};

export const sendData = (msg: string) => {
  console.log({ msg });
  if (sendChannel) {
    onSendChannelStateChange(sendChannel);
    sendChannel.send(msg);
  } else {
    receiveChannel.send(msg);
  }
};

export const initSocket = ({
  onNewText,
}: {
  onNewText: (text: string) => void;
}) => {
  if (socket) return;
  newTextHandler = onNewText;

  console.log("Initializing Socket...");

  socket = connect("http://localhost:3001?user_name=Kusal");

  let receivedOffer = false;

  socket.on("connect", async () => {
    console.log("Got: connect");

    if (socket.connected) {
      peerConnection = await getPeerConnection();
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      timerToSendOffer = window.setTimeout(() => {
        if (!receivedOffer) {
          console.log("Emit: offerToServer");
          socket.emit("offerToServer", {
            offer: peerConnection.localDescription,
          });
        }
        clearTimeout(timerToSendOffer);
      }, 1000);
    }
  });

  socket.on("offerToClient", async (data) => {
    receivedOffer = true;
    console.log("Got: offerToClient", data);

    peerConnection = await getPeerConnection();

    if (!data.offer) {
      peerSocketId = "";
      console.log("No offer attached by server");
      return;
    }

    await peerConnection.setRemoteDescription(data.offer);
    peerSocketId = data.from_socket_id;

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    console.log("Emit: answerToServer");
    socket.emit("answerToServer", {
      answer,
      to_socket_id: data.from_socket_id,
    });
  });

  socket.on("answerToClient", async (data) => {
    console.log("Got: answerToClient", data);

    if (!peerConnection.currentRemoteDescription) {
      await peerConnection.setRemoteDescription(data.answer).then(() => {
        console.log(peerConnection);
        peerSocketId = data.from_socket_id;
      });
    }
  });

  socket.on("iceCandidateToClient", (data) => {
    console.log("Got: iceCandidateToClient", data);
    if (peerConnection.remoteDescription && data.ice_candidate) {
      peerConnection.addIceCandidate(data.ice_candidate);
    }
  });

  return socket;
};

export const initMediaElements = async (
  localMedia: HTMLVideoElement,
  remoteMedia: HTMLVideoElement,
  onSuccess: () => void
) => {
  localMediaEl = localMedia;
  remoteMediaEl = remoteMedia;

  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localMediaEl.srcObject = localStream;

    onSuccess();
  } catch (err) {
    console.error(err);
  }
};

export const cleanup = () => {
  if (socket) socket.disconnect();
  peerConnection?.close();
  if (timerToSendOffer) clearTimeout(timerToSendOffer);
};

export const sendMessageToPeer = (text: string) => {
  if (!text) return;
  sendData(text);
};
