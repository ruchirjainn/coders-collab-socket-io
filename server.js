const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const { Socket } = require("socket.io-client");
const ACTIONS = require("./src/Actions");
const server = http.createServer(app);
const io = new Server(server);

// this maps the {socketId : username}
const userSocketMap = {};

function getAllConnectedClients(roomId) {
  const ClientsIdArray = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

  return ClientsIdArray.map((socketId) => {
    return {
      socketId,
      username: userSocketMap[socketId],
    };
  });
}

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  // We are connecting this socket to socketRef of EditorPage.js
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;

    // adding the current user to the room
    socket.join(roomId);

    // getting all the socketId & username of users of current room
    const clients = getAllConnectedClients(roomId);

    // sending the message to the other clients in the same room with the help of there socketId
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id, // this id joined the room
      });
    });
  });

  // Syncing the code changes
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // Syncing the code changes
  socket.on(ACTIONS.SYNC_CODE, ({ code, socketId }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // Disconnecting a specific user
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];

    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    delete userSocketMap[socket.id];

    socket.leave();
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Listening on Port 5000"));
