import * as sio from "socket.io-client";

let localMediaEl: HTMLVideoElement;
let localStream: MediaStream;

let localUser: string | undefined;
let remoteUser: string | undefined;

let remoteMediaEl: HTMLVideoElement;
let remoteStream: MediaStream;

let socket: sio.Socket;
let peerConnection: RTCPeerConnection;

let sendChannel: RTCDataChannel;
let receiveChannel: RTCDataChannel;

let iceCandidateSent = false;
let timerToSendOffer: number;

let newTextHandler: (text: string) => void;

interface Offer {
  source_user: string | undefined;
  target_user: string | undefined;
  offer: RTCSessionDescription | null;
}

interface Answer {
  source_user: string | undefined;
  target_user: string | undefined;
  answer: RTCSessionDescriptionInit;
}

interface IceCandidateEvData {
  source_user: string | undefined;
  target_user: string | undefined;
  ice_candidate: RTCIceCandidate;
}

export const initUsers = (
  localUsername: string | undefined,
  remoteUsername: string | undefined
) => {
  localUser = localUsername;
  remoteUser = remoteUsername;
};

const servers: RTCConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun1.1.google.com:19302", "stun:stun2.1.google.com:19302"],
    },
  ],
};

const createPeerConnection = async () => {
  console.log("Creating peer connection...");
  const peerConnection = new RTCPeerConnection(servers);

  remoteStream = new MediaStream();
  remoteMediaEl.srcObject = remoteStream;

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track);
  });

  peerConnection.ontrack = async (event) => {
    remoteStream.addTrack(event.track);
  };

  remoteStream.onremovetrack = () => {
    peerConnection.close();
  };

  peerConnection.onicecandidate = async (event) => {
    // TODO: Many icecandidates are generated; depending on requirements, it is often okay to send only a few to the remote server
    if (
      event.candidate &&
      event.candidate.type === "host" &&
      !iceCandidateSent
    ) {
      console.log("Emitting: candidateSentToUser", event.candidate);
      socket.emit("candidateSentToUser", {
        source_user: localUser,
        target_user: remoteUser,
        ice_candidate: event.candidate,
      } satisfies IceCandidateEvData);
      iceCandidateSent = true;
    }
  };

  sendChannel = peerConnection.createDataChannel("sendDataChannel");
  sendChannel.onopen = () => {
    console.log("Data channel is now open and ready to use...");
    onSendChannelStateChange(sendChannel);
  };

  peerConnection.ondatachannel = receiveChannelCallback;
  // sendChannel.onmessage = onSendChannelMessageCallback;

  return peerConnection;
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

// TODO: Maybe wait for a while to see if it will receive offer before sending one?
export const createAndSendOffer = async () => {
  peerConnection = peerConnection || (await createPeerConnection());
  const offer = await peerConnection.createOffer();

  await peerConnection.setLocalDescription(offer);

  console.log("Emitting: offerSentToRemote");
  socket.emit("offerSentToRemote", {
    source_user: localUser,
    target_user: remoteUser,
    offer: peerConnection.localDescription,
  } satisfies Offer);
};

const sendAnswerToOffer = async (data: Offer) => {
  peerConnection = peerConnection || (await createPeerConnection());

  if (!data.offer) {
    console.log("No offer on createAnswer");
    return;
  }

  await peerConnection.setRemoteDescription(data.offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  console.log("Emitting: answerSent");
  socket.emit("answerSent", {
    answer,
    source_user: data.target_user,
    target_user: data.source_user,
  } satisfies Answer);
};

const receiveAnswer = async (data: Answer) => {
  if (!peerConnection.currentRemoteDescription) {
    await peerConnection.setRemoteDescription(data.answer).then(() => {
      console.log(peerConnection);
    });
  }
};

export const initSocket = ({
  onNewText,
}: {
  onNewText: (text: string) => void;
}) => {
  if (socket) return;

  newTextHandler = onNewText;

  socket = sio.connect("http://localhost:3001");

  let receivedOffer = false;

  socket.on("connect", () => {
    console.log("Received: connect");

    if (socket.connected && localUser) {
      console.log("Emitting: userconnect");
      socket.emit("userconnect", {
        username: localUser,
      });

      timerToSendOffer = window.setTimeout(() => {
        if (!receivedOffer) {
          createAndSendOffer();
        }
        clearTimeout(timerToSendOffer);
      }, 1000);
    }
  });

  socket.on("ReceiveOffer", (data: Offer) => {
    receivedOffer = true;
    console.log("Received: ReceiveOffer", data);
    sendAnswerToOffer(data);
  });

  socket.on("ReceiveAnswer", (data: Answer) => {
    console.log("Received: ReceiveAnswer", data);
    receiveAnswer(data);
  });

  socket.on("candidateReceiver", (data: IceCandidateEvData) => {
    console.log("Received: candidateReceiver");
    peerConnection.addIceCandidate(data.ice_candidate);
  });

  return socket;
};

export const initMediaElements = async (
  localMedia: HTMLVideoElement,
  remoteMedia: HTMLVideoElement,
  onDone: () => void
) => {
  localMediaEl = localMedia;
  remoteMediaEl = remoteMedia;

  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localMediaEl.srcObject = localStream;
  } catch (err) {
    console.error(err);
  }

  onDone();
};

export const cleanup = () => {
  socket?.disconnect();
  peerConnection?.close();
  if (timerToSendOffer) clearTimeout(timerToSendOffer);
};

export const sendMessageToPeer = (text: string) => {
  if (!text) return;
  sendData(text);
};
