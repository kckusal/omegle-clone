import express from "express";
import sio from "socket.io";
import cors from "cors";

import { prisma } from "./prisma";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
} from "../shared-types";

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

const io = new sio.Server<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>(server, {
  allowEIO3: true,
  cors: {
    origin: process.env.SOCKET_CONN_ORIGIN_HOST || "",
  },
});

const onSocketDisconnect = (connectionId: string) => {
  userConnections = userConnections.filter(
    (uc) => uc.connectionId !== connectionId
  );
  console.log("Received: disconnect ", connectionId);
  console.log("USER CONNECTIONS: ", userConnections);
};

io.on("connection", async (socket) => {
  console.log("Received: Connection ", socket.id);

  socket.on("join", async (data) => {
    console.log("Received: join ", data);

    await prisma.connection.create({
      data: {
        user_name: data.user_name,
        socket_id: socket.id,
        status: "available",
      },
    });
  });

  socket.on("offerToServer", async (data) => {
    console.log("Received: offerToServer ", data);

    const target_connection = await prisma.connection.findFirst({
      where: {
        status: "available",
        socket_id: {
          not: socket.id,
        },
      },
    });

    if (target_connection) {
      console.log("Emitting: ReceiveOffer");

      await prisma.connection.updateMany({
        data: {
          status: "handshaking",
        },
        where: {
          socket_id: {
            in: [socket.id, target_connection.socket_id],
          },
        },
      });

      socket.to(target_connection.socket_id).emit("offerToClient", {
        offer: data.offer,
        from_socket_id: socket.id,
      });
    }
  });

  socket.on("answerToServer", async (data) => {
    console.log("Received: answerToServer");

    await prisma.connection.updateMany({
      data: {
        status: data.answer ? "engaged" : "available",
      },
      where: {
        socket_id: {
          in: [socket.id, data.to_socket_id],
        },
      },
    });

    if (data.answer) {
      console.log("Emitting: ReceiveAnswer");
      socket.to(data.to_socket_id).emit("answerToClient", {
        answer: data.answer,
        from_socket_id: socket.id,
      });
    }
  });

  socket.on("iceCandidateToServer", (data) => {
    if (data) {
      console.log("Emitting: candidateReceiver", socket.id);
      socket.to(data.to_socket_id).emit("iceCandidateToClient", {
        ice_candidate: data.ice_candidate,
        from_socket_id: socket.id,
      });
    }
  });

  socket.on("disconnect", () => {
    onSocketDisconnect(socket.id);
  });
});
