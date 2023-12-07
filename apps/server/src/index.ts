import { Server } from "socket.io";

type ServerToClientEvents = {
  enterRoom: ({ roomName }: { roomName: string }) => void;
};

type ClientToServerEvents = {
  updateUserList: ({ connectedUsers }: { connectedUsers: string[] }) => void;
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

  socket.broadcast.emit("updateUserList", { connectedUsers });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    connectedUsers = connectedUsers.filter((user) => user !== socket.id);
  });

  socket.on("enterRoom", ({ roomName }) => {
    if (roomName) {
      if (rooms.has(roomName)) {
        rooms.get(roomName).push(socket.id);
      } else {
        rooms.set(roomName, [socket.id]);
      }
    }
  });
});

io.listen(4000);

console.log("batata");
