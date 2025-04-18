import express from "express";
import { nanoid } from "nanoid";
import path from "path";
import { Server } from "socket.io";

const __dirname = process.cwd();

const app = express();

app.use(express.json());

class Stack {
  #stack;
  #size;
  #top;
  constructor() {
    this.#stack = [];
    this.#size = 0;
    this.#top = -1;
  }

  push(...items) {
    for (const item of items) {
      this.#stack[++this.#top] = item;
      this.#size = this.#top + 1;
    }
  }

  prev() {
    if (this.#top === -1) return null;
    this.#top--;
    return this.#stack[this.#top];
  }

  poll() {
    if (this.#top === -1) return null;
    return this.#stack[this.#top];
  }

  next() {
    if (this.#top === this.#size - 1) return null;
    this.#top++;
    return this.#stack[this.#top];
  }

  state() {
    return this.#stack.slice(0, this.#top + 1);
  }
}

const roomIds = new Set();
const roomId_name = new Map();
const roomState = new Map();
const roomId_userId = new Map();
const socketId_roomId_userId = new Map();

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "home", "index.html"));
});

app.post("/create", function (req, res) {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({
      message: "Room name required",
      description: "Please enter a room name to create",
    });
  }

  try {
    const id = nanoid();
    while (roomIds.has(id)) {
      id = nanoid();
    }
    roomIds.add(id);
    roomId_name.set(id, name);
    roomState.set(id, new Map());
    roomId_userId.set(id, new Set());
    return res.status(201).json({
      id,
      message: "Room created successfully",
      description: "Joining...",
    });
  } catch (e) {
    return res.status(500).json({
      message: "Something went wrong",
      description: "Please try again later or contact support",
    });
  }
});

app.get("/:id", function (req, res) {
  const id = req.params.id;
  if (!id || !roomIds.has(id))
    return res.sendFile(
      path.join(__dirname, "public", "not-found", "not-found.html")
    );
  return res.sendFile(path.join(__dirname, "public", "board", "board.html"));
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.log("server running on port", process.env.PORT || 3000);
});

const SOCKET_ACTION = {
  JOIN_ROOM: "join-room",
  JOINED_USER_STATE: "joined-user-state",
  CANVAS_START: "canvas-start",
  CANVAS_UPDATE: "canvas-update",
  CANVAS_CLEAR: "canvas-clear",
  UNDO_OR_REDO: "undo-or-redo",
  GET_ROOM_STATE: "get-room-state",
  UPDATE_ROOM_STATE: "update-room-state",
};

const io = new Server(server);

io.on("connection", (socket) => {
  const socketId = socket.id;
  socket.on(SOCKET_ACTION.JOIN_ROOM, (data) => {
    socket.join(data.roomId);

    socketId_roomId_userId.set(socketId, {
      userId: data.userId,
      roomId: data.roomId,
    });

    socket.broadcast.to(data.roomId).emit(SOCKET_ACTION.JOIN_ROOM, {
      userId: data.userId,
      state: data.state,
    });

    const currentRoomState = roomState.get(data.roomId);

    const joinedUsersState = Array.from(currentRoomState.entries()).map(
      (userState) => {
        return { userId: userState[0], state: userState[1].state() };
      }
    );

    socket.emit(SOCKET_ACTION.JOINED_USER_STATE, joinedUsersState);

    const stack = new Stack();
    if (data.stack && data.stack.length) {
      stack.push(...data.state);
    }
    roomState.get(data.roomId)?.set(data.userId, stack);

    roomId_userId.get(data.roomId)?.add(data.userId);
  });

  // socket.on(SOCKET_ACTION.CANVAS_START, (data) => {
  //     socket.broadcast.to(socketId_roomId.get(socketId)).emit(SOCKET_ACTION.CANVAS_START, data)
  // })

  socket.on(SOCKET_ACTION.CANVAS_UPDATE, (data) => {
    socket.broadcast
      .to(socketId_roomId_userId.get(socketId)?.roomId)
      .emit(SOCKET_ACTION.CANVAS_UPDATE, data);
  });

  socket.on(SOCKET_ACTION.UNDO_OR_REDO, (data) => {
    socket.broadcast
      .to(socketId_roomId.get(socketId))
      .emit(SOCKET_ACTION.UNDO_OR_REDO, data);
  });

  socket.on(SOCKET_ACTION.CANVAS_CLEAR, () => {
    socket.broadcast
      .to(socketId_roomId_userId.get(socketId)?.roomId)
      .emit(SOCKET_ACTION.CANVAS_CLEAR, data);
  });

  socket.on(SOCKET_ACTION.UPDATE_ROOM_STATE, (data) => {
    console.log(data);

    try {
      const { roomId, userId } = socketId_roomId_userId.get(socketId);
      roomState.get(roomId)?.get(userId)?.push(data);
      socket.broadcast
        .to(socketId_roomId_userId.get(socketId)?.roomId)
        .emit(SOCKET_ACTION.UPDATE_ROOM_STATE, { userId, state: data });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("touchstart", (data) => {
    console.log(data);
  });

  socket.on("disconnect", () => {
    // const { roomId, userId } = socketId_roomId_userId.get(socketId);
    // roomId_userId.get(roomId).delete(userId);
    socketId_roomId_userId.delete(socketId);
  });
});
