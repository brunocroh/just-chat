import { Server } from "socket.io";

type Room = {
  id: string;
  peer: null;
  users: string[];
};

type ServerToClientEvents = {
  enterRoom: (props: { room: string }) => void;
  createRoom: (props: { room: string; peer: string; owner: string }) => void;
  mediaOffer: (props: { from: string; to: string; offer: any }) => void;
  mediaAnswer: (props: { from: string; to: string; answer: any }) => void;
  iceCandidate: (props: { to: string; candidate: any }) => void;
};

type ClientToServerEvents = {
  updateUserList: (props: { connectedUsers: string[] }) => void;
  roomDetails: (props: { room: Room }) => void;
  roomCreated: (props: { room: Room }) => void;
  mediaOffer: (props: { from: string; offer: any }) => void;
  mediaAnswer: (props: { from: string; answer: any }) => void;
  remotePeerIceCandidate: (props: { candidate: any }) => void;
};

const rooms = new Map();

const io = new Server<ServerToClientEvents, ClientToServerEvents>({
  cors: {
    origin: "http://localhost:3000",
  },
});

let connectedUsers: string[] = [];

io.on("connection", (socket) => {
  console.log("A user connected");

  connectedUsers.push(socket.id);

  socket.emit("updateUserList", { connectedUsers });
  socket.broadcast.emit("updateUserList", { connectedUsers });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    connectedUsers = connectedUsers.filter((user) => user !== socket.id);

    socket.broadcast.emit("updateUserList", { connectedUsers });
  });

  socket.on("enterRoom", ({ room: roomName }) => {
    socket.join(roomName);
    let room: Room = {
      id: roomName,
      peer: null,
      users: [],
    };

    if (rooms.has(roomName)) {
      room = rooms.get(roomName);
    }

    const newRoomState = {
      ...room,
      users: [...room.users, socket.id],
    };

    rooms.set(roomName, newRoomState);

    io.to(roomName).emit("roomDetails", { room: newRoomState });
  });

  socket.on("mediaOffer", (data) => {
    socket.to(data.to).emit("mediaOffer", {
      from: data.from,
      offer: data.offer,
    });
  });

  socket.on("mediaAnswer", (data) => {
    socket.to(data.to).emit("mediaAnswer", {
      from: data.from,
      answer: data.answer,
    });
  });

  socket.on("iceCandidate", (data) => {
    socket.to(data.to).emit("remotePeerIceCandidate", {
      candidate: data.candidate,
    });
  });
});

io.listen(4000);

console.log("Server up");
