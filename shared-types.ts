interface JoinEventData {
  user_name: string;
}

interface OfferToServer {
  offer: any | null;
}

interface OfferToClient {
  offer: any | null;
  from_socket_id: string;
}

interface AnswerToServer {
  answer: any;
  to_socket_id: string;
}

interface AnswerToClient {
  answer: any;
  from_socket_id: string;
}

interface IceCandidateToServer {
  ice_candidate: any;
  to_socket_id: string;
}

interface IceCandidateToClient {
  ice_candidate: any;
  from_socket_id: string;
}

export interface ClientToServerEvents {
  join: (data: JoinEventData) => void;
  offerToServer: (data: OfferToServer) => void;
  answerToServer: (data: AnswerToServer) => void;
  iceCandidateToServer: (data: IceCandidateToServer) => void;
}

export interface ServerToClientEvents {
  joined: () => void;
  offerToClient: (data: OfferToClient) => void;
  answerToClient: (data: AnswerToClient) => void;
  iceCandidateToClient: (data: IceCandidateToClient) => void;
}

export interface SocketData {
  user_name: string;
}

// client connect to socket
// client send join request
// on join success, client send offer request
// if (some client is waiting), send offer to that client; else, record client and wait for offers
// on offer received, client sends answer to server
// if
