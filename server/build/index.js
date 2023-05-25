"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
    },
});
const PORT = process.env.PORT || 3001;
io.on("connection", (socket) => {
    socket.on("join-room", ({ roomId }) => {
        socket.join(roomId);
    });
    socket.on("client-ready", (roomId, name) => {
        socket.to(roomId).emit("get-state");
        socket.to(roomId).emit("get-members", name);
    });
    socket.on("client-ready-leader", (roomId, name) => {
        socket.to(roomId).emit("get-state");
        io.to(roomId).emit("get-members", name);
    });
    socket.on("receive-members", (roomId, members, name) => {
        io.to(roomId).emit("update-members", members, name);
    });
    socket.on("exit", (roomId, name) => {
        socket.to(roomId).emit("remove-member", name);
    });
    socket.on("canvas-state", (state, roomId) => {
        socket.to(roomId).emit("canvas-state-from-server", state);
    });
    socket.on("onDraw", ({ currentPoints, prePoints, color, size, roomId, }) => {
        socket.to(roomId).emit("onDraw", {
            currentPoints,
            prePoints,
            color,
            size,
        });
    });
    socket.on("handleClear", (roomId) => {
        io.to(roomId).emit("handleClear");
    });
});
httpServer.listen(PORT, () => {
    console.log(`Server is running at ${PORT} `);
});
