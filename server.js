const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const rooms = {};

io.on("connection", (socket) => {
  socket.on("JOIN_ROOM", (roomID) => {
    if (rooms[roomID]) {
      rooms[roomID].push(socket.id);
    } else {
      rooms[roomID] = [socket.id];
    }
    const otherUser = rooms[roomID].find((id) => id !== socket.id);
    if (otherUser) {
      socket.emit("REMOTE_USER", otherUser);
      socket.to(otherUser).emit("REMOTE_USER_JOINED", socket.id);
    }
  });

  socket.on("OFFER", (payload) => {
    io.to(payload.target).emit("OFFER", payload);
  });

  socket.on("ANSWER", (payload) => {
    io.to(payload.target).emit("ANSWER", payload);
  });

  socket.on("ICE_CANDIDATE", (incoming) => {
    io.to(incoming.target).emit("ICE_CANDIDATE", incoming.candidate);
  });
});

server.listen(3001, () => console.log("Server is running on port 3001"));
