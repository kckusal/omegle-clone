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

const io = new sio.Server<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>(server, {
  allowEIO3: true,
  cors: {
    origin: process.env.SOCKET_CONN_ORIGIN_HOST || undefined,
  },
});

io.on("connection", async (socket) => {
  console.log("Got: connection ", socket.id, socket.handshake.query);
  socket.data.user_name = socket.handshake.query.user_name as string;

  await prisma.connection.create({
    data: {
      user_name: socket.handshake.query.user_name as string,
      socket_id: socket.id,
      status: "available",
    },
  });

  socket.on("offerToServer", async (data) => {
    console.log("Got: offerToServer ", socket.data);

    const target_connection = await prisma.connection.findFirst({
      where: {
        status: "available",
        socket_id: {
          not: socket.id,
        },
      },
    });

    if (target_connection) {
      console.log("Emit: offerToClient ", target_connection);

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
    console.log("Got: answerToServer ", data.to_socket_id, socket.data);

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
      console.log("Emit: answerToClient");
      await prisma.session.create({
        data: {
          connection1_socket_id: socket.id,
          connection2_socket_id: data.to_socket_id,
        },
      });

      socket.to(data.to_socket_id).emit("answerToClient", {
        answer: data.answer,
        from_socket_id: socket.id,
      });
    }
  });

  socket.on("iceCandidateToServer", (data) => {
    console.log("Got: iceCandidateToServer", socket.data);

    if (data.to_socket_id && data.ice_candidate) {
      console.log("Emit: iceCandidateToClient ", data.to_socket_id);
      socket.to(data.to_socket_id).emit("iceCandidateToClient", {
        ice_candidate: data.ice_candidate,
        from_socket_id: socket.id,
      });
    }
  });

  socket.on("disconnect", async () => {
    await prisma.connection.delete({
      where: {
        socket_id: socket.id,
      },
    });

    const session = await prisma.session.findFirst({
      where: {
        OR: [
          { connection1_socket_id: socket.id },
          { connection2_socket_id: socket.id },
        ],
      },
    });

    if (session) {
      await prisma.session.delete({ where: { id: session.id } });

      const partnerConnectionSocketId =
        session.connection1_socket_id === socket.id
          ? session.connection2_socket_id
          : session.connection1_socket_id;

      await prisma.connection.update({
        data: { status: "available" },
        where: {
          socket_id: partnerConnectionSocketId,
        },
      });
    }
  });
});
