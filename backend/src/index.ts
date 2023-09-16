import express from "express";
import sio from "socket.io";
import cors from "cors";

const PORT = process.env.PORT || 3000;

const app = express();

app.all("*", (req, res, next) => {
  console.log("=============> ", JSON.stringify(req.headers));
  next();
});

app.use(
  cors({
    origin: process.env.CORS_ALLOW_ALL_ORIGIN_HOST,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

app.use((req, res) => {
  res.status(404);

  return res.json({
    success: false,
    payload: null,
    message: `API SAYS: Handler not found for path: ${req.path}`,
  });
});

const server = app.listen(PORT, () =>
  console.log(`REST API server ready at: http://localhost:${PORT}`)
);

let userConnections: Array<{
  username?: string;
  connectionId: string;
  offerSent?: boolean;
}> = [];

const io = new sio.Server(server, {
  allowEIO3: true,
  cors: {
    origin: process.env.SOCKET_CONN_ORIGIN_HOST || "",
  },
});

const onSocketConnection = (connectionId: string) => {
  userConnections.push({ connectionId });
  console.log("Received: Connection ", connectionId);
  console.log("USER CONNECTIONS: ", userConnections);
};
const onSocketDisconnect = (connectionId: string) => {
  userConnections = userConnections.filter(
    (uc) => uc.connectionId !== connectionId
  );
  console.log("Received: disconnect ", connectionId);
  console.log("USER CONNECTIONS: ", userConnections);
};
const onUserConnected = (connectionId: string, username: string) => {
  const idx = userConnections.findIndex(
    (uc) => uc.connectionId === connectionId
  );
  userConnections[idx].username = username;
  console.log("Received: userconnect ", username);
  console.log("USER CONNECTIONS: ", userConnections);
};

io.on("connection", (socket) => {
  onSocketConnection(socket.id);

  socket.on("userconnect", (data) => {
    onUserConnected(socket.id, data.username);
  });

  socket.on("offerSentToRemote", (data) => {
    console.log("Received: offerSentToRemote ");
    const targetUserIdx = userConnections.findIndex(
      (u) => u.username === data.target_user
    );

    const offerReceiver = userConnections[targetUserIdx];

    if (offerReceiver) {
      console.log("Emitting: ReceiveOffer");
      socket.to(offerReceiver.connectionId).emit("ReceiveOffer", data);
      userConnections;
    }
  });

  socket.on("answerSent", (data) => {
    console.log("Received: answerSent");
    const answerReceiver = userConnections.find(
      (u) => u.username === data.target_user
    );

    if (answerReceiver) {
      console.log("Emitting: ReceiveAnswer");
      socket.to(answerReceiver.connectionId).emit("ReceiveAnswer", data);
    }
  });

  socket.on("candidateSentToUser", (data) => {
    console.log("Received: candidateSentToUser");
    const candidateReceiver = userConnections.find(
      (u) => u.username === data.target_user
    );

    if (candidateReceiver) {
      console.log(
        "Emitting: candidateReceiver",
        candidateReceiver.connectionId
      );
      socket.to(candidateReceiver.connectionId).emit("candidateReceiver", data);
    }
  });

  socket.on("disconnect", () => {
    onSocketDisconnect(socket.id);
  });
});
