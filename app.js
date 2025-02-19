const express = require("express");
const { nanoid } = require("nanoid");
const socket = require("socket.io")
const path = require("path");
const app = express()

const socketId_roomId = new Map();
const roomIds = [];

app.get("/", function (req, res) {
    const id = nanoid();
    roomIds.push(id);
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



const io = socket(server)

io.on("connection", (socket) => {
    const socketId = socket.id;
    socket.on("join-room", (roomId) => {
        socket.join(roomId)
        socketId_roomId.set(socketId, roomId);
        io.to(roomId).emit("message", "Hello i joined room!");
    })

    socket.on("beginPath", (data) => {
        io.to(socketId_roomId.get(socketId)).emit("beginPath", data)
    })

    socket.on("drawStroke", (data) => {
        io.to(socketId_roomId.get(socketId)).emit("drawStroke", data)
    })

    socket.on("ru", (data) => {
        io.to(socketId_roomId.get(socketId)).emit("ru", data)
    })

    socket.on("clear", () => {
        io.to(socketId_roomId.get(socketId)).emit("clear")
    })

    socket.on("disconnect", () => {
        socketId_roomId.delete(socketId)
    })
})