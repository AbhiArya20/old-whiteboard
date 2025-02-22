import express from "express";
import { nanoid } from "nanoid";
import path from "path";
import { Server } from "socket.io";
import cors from "cors"

const __dirname = process.cwd();

const app = express()

const socketId_roomId = new Map();
const roomState = new Map();
const roomIds = [];

app.get("/", function (req, res) {
    const id = nanoid();
    roomIds.push(id);
    roomState.set(id, []);
    return res.status(301).redirect(id);
})

app.get("/:id", function (req, res) {
    const id = req.params.id;
    if (!id || !roomIds.includes(id))
        return res.sendFile(path.join(__dirname + "/whiteboard/not-found.html"))
    return res.sendFile(path.join(__dirname, "whiteboard", "index.html"))
})

app.use(express.static(path.join(__dirname, "whiteboard")));


const server = app.listen(process.env.PORT || 3000, () => {
    console.log('server start on port =', process.env.PORT || 3000);
})

const io = new Server(server)

const SOCKET_ACTION = {
    JOIN_ROOM: "join-room",
    CANVAS_START: "canvas-start",
    CANVAS_UPDATE: "canvas-update",
    CANVAS_CLEAR: "canvas-clear",
    UNDO_OR_REDO: "undo-or-redo",
    GET_ROOM_STATE: "get-room-state",
    UPDATE_ROOM_STATE: "update-room-state",
}



io.on("connection", (socket) => {
    const socketId = socket.id;
    socket.on(SOCKET_ACTION.JOIN_ROOM, (roomId) => {
        socket.join(roomId)
        socketId_roomId.set(socketId, roomId);
        socket.emit(SOCKET_ACTION.GET_ROOM_STATE, roomState.get(roomId));
    })

    socket.on(SOCKET_ACTION.CANVAS_START, (data) => {
        io.to(socketId_roomId.get(socketId)).emit(SOCKET_ACTION.CANVAS_START, data)
    })

    socket.on(SOCKET_ACTION.CANVAS_UPDATE, (data) => {
        io.to(socketId_roomId.get(socketId)).emit(SOCKET_ACTION.CANVAS_UPDATE, data)
    })

    socket.on(SOCKET_ACTION.UNDO_OR_REDO, (data) => {
        io.to(socketId_roomId.get(socketId)).emit(SOCKET_ACTION.UNDO_OR_REDO, data)
    })

    socket.on(SOCKET_ACTION.CANVAS_CLEAR, () => {
        io.to(socketId_roomId.get(socketId)).emit(SOCKET_ACTION.CANVAS_CLEAR)
    })

    socket.on(SOCKET_ACTION.UPDATE_ROOM_STATE, (data) => {
        const roomId = socketId_roomId.get(socketId);
        roomState.set(roomId, [...roomState.get(roomId), data])
    })

    socket.on("disconnect", () => {
        socketId_roomId.delete(socketId)
    })
})