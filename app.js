import express from "express";
import { nanoid } from "nanoid";
import path from "path";
import { Server } from "socket.io";
import { Stack } from "./public/board/stack.js";
import { faker } from "@faker-js/faker";
import { SOCKET_ACTION } from "./public/board/enums.js";

const __dirname = process.cwd();

const app = express();

app.use(express.json());

const rooms = new Map();

const user_room = new Map();

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "home", "index.html"));
});

app.post("/create", function (req, res) {
  const { name } = req.body;
  if (!name.trim()) {
    return res.status(400).json({
      message: "Room name required",
      description: "Please enter a room name to create",
    });
  }

  if (name.trim().length > 15) {
    return res.status(400).json({
      message: "Room name too long",
      description: "Please enter a room name that is less than 15 characters",
    });
  }

  try {
    const id = nanoid();
    while (rooms.has(id)) {
      id = nanoid();
    }

    rooms.set(id, {
      id: id,
      name,
      users: new Map(),
      expireAt: Date.now() * 1000 * 60 * 60 * 24 * 30, // 30 days
    });

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
  if (!id.trim() || !rooms.has(id.trim()))
    return res.sendFile(
      path.join(__dirname, "public", "not-found", "not-found.html")
    );

  rooms.get(id.trim()).expireAt = Date.now() * 1000 * 60 * 60 * 24 * 30; // 30 days
  return res.sendFile(path.join(__dirname, "public", "board", "board.html"));
});

app.post("/actives", async (req, res) => {
  const { savedRooms } = req.body;

  if (!savedRooms || savedRooms.length === 0) {
    return res.status(200).json({
      rooms: [],
    });
  }

  const actives = [];
  for (const room of savedRooms) {
    if (rooms.has(room.id) && rooms.get(room.id).expireAt > Date.now()) {
      actives.push(room);
    }
  }

  return res.status(200).json({
    actives,
  });
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.log("server running on port", process.env.PORT || 3000);
});

const io = new Server(server);

/**
 * Rooms structure  
 * 
 * rooms: {
 *   roomId: {
 *     id: roomId,
 *     name: roomName,
 *     expireAt: Date.now() * 1000 * 60 * 60 * 24 * 30, // 30 days
 *     users: {
 *       userId: {
 *         userId: userId,
 *         name: userName,
 *         color: userColor,
 *         isOnline: true,
 *         stack: new Stack(),
 *       }
 *     }  
 *   }
 * }
 * 
 * 
 */


io.on("connection", (socket) => {
  const socketId = socket.id;

  socket.emit(SOCKET_ACTION.USER_ID, socketId);

  socket.on(SOCKET_ACTION.JOIN_ROOM, async (data) => {
    await socket.join(data.roomId);
    user_room.set(socketId, data.roomId);

    rooms.get(data.roomId)?.users?.set(socketId, {
      userId: socketId,
      name: faker.person.fullName(),
      color: faker.color.rgb(),
      isOnline: true,
      stack: new Stack(),
    });

    socket.broadcast.to(data.roomId).emit(SOCKET_ACTION.JOIN_ROOM, {
      ...(rooms.get(data.roomId)?.users?.get(socketId) ?? {}),
      top: rooms.get(data.roomId)?.users?.get(socketId)?.stack?.top(),
      stack: rooms.get(data.roomId)?.users?.get(socketId)?.stack?.state(),
    });

    socket.emit(SOCKET_ACTION.JOINED_USERS_STATE, {
      ...rooms.get(data.roomId),
      users: Array.from(rooms.get(data.roomId)?.users?.entries() ?? [])?.map(
        (userState) => {
          return {
            ...userState[1],
            top: userState[1].stack.top(),
            stack: userState[1]?.stack.state(),
          };
        }
      ),
    });
  });

  // socket.on(SOCKET_ACTION.CANVAS_START, (data) => {
  //     socket.broadcast.to(socketId_roomId.get(socketId)).emit(SOCKET_ACTION.CANVAS_START, data)
  // })

  // socket.on(SOCKET_ACTION.CANVAS_UPDATE, (data) => {
  //   socket.broadcast
  //     .to(socketId_roomId_userId.get(socketId)?.roomId)
  //     .emit(SOCKET_ACTION.CANVAS_UPDATE, data);
  // });

  socket.on(SOCKET_ACTION.UNDO_OR_REDO, (data) => {
    socket.broadcast
      .to(socketId_roomId.get(socketId))
      .emit(SOCKET_ACTION.UNDO_OR_REDO, data);
  });

  socket.on(SOCKET_ACTION.CANVAS_CLEAR, () => {
    const roomId = user_room.get(socketId);
    socket.broadcast.to(roomId).emit(SOCKET_ACTION.CANVAS_CLEAR);
  });

  socket.on(SOCKET_ACTION.UPDATE_ROOM_STATE, (data) => {
    const roomId = user_room.get(socketId);
    rooms.get(roomId)?.users?.get(socketId)?.stack.push(data);

    socket.broadcast.to(roomId).emit(SOCKET_ACTION.UPDATE_ROOM_STATE, {
      userId: socketId,
      state: data,
    });
  });

  socket.on("disconnect", () => {
    const roomId = user_room.get(socketId);
    if (rooms.get(roomId)?.users?.get(socketId).isOnline) {
      rooms.get(roomId)?.users?.set(socketId, {
        ...rooms.get(roomId)?.users?.get(socketId),
        isOnline: false,
      });
    }
  });
});

setInterval(() => {
  const now = Date.now();
  for (const [id, room] of rooms) {
    if (now > room.expireAt) {
      rooms.delete(id);
    }
  }
}, 1000 * 60 * 60);
