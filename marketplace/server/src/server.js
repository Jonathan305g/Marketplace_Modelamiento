// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import adminRoutes from "./admin.routes.js";

dotenv.config();

const app = express();

// --- middlewares HTTP normales ---
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// --- rutas API ---
app.use("/api/auth", authRoutes);
app.use("/api", productRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (_req, res) => res.send("API OK"));

// --- crear servidor HTTP a partir de express ---
const server = http.createServer(app);

// --- SOCKET.IO ---
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // tu frontend (Vite)
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// función helper para generar un room único para 2 usuarios
const getRoomId = (userA, userB) => {
  const ids = [String(userA), String(userB)].sort();
  return `chat_${ids[0]}_${ids[1]}`;
};

io.on("connection", (socket) => {
  console.log("🔌 Cliente conectado:", socket.id);

  // el cliente dice con quién quiere chatear
  socket.on("join_room", ({ userId, otherUserId }) => {
    const roomId = getRoomId(userId, otherUserId);
    socket.join(roomId);
    console.log(`👥 Usuario ${userId} se unió al room ${roomId}`);
  });

  // cuando el cliente envía un mensaje
  socket.on("send_message", ({ from, to, text }) => {
    const roomId = getRoomId(from, to);

    const payload = {
      from,
      to,
      text,
      created_at: new Date().toISOString(),
    };

    // mandar a todos los sockets del room (ambos usuarios)
    io.to(roomId).emit("receive_message", payload);
  });

  // indicador de que alguien está escribiendo
  socket.on("typing", ({ from, to }) => {
    const roomId = getRoomId(from, to);
    // reenviamos a la sala (el otro cliente lo verá)
    io.to(roomId).emit("typing", { from, to });
  });

  socket.on("disconnect", () => {
    console.log("❌ Cliente desconectado:", socket.id);
  });
});

// --- arrancar servidor HTTP + websockets ---
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 API + WebSocket escuchando en http://localhost:${PORT}`);
});
