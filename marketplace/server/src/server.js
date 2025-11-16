import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./auth.routes.js";
import productRoutes from './product.routes.js';
import adminRoutes from './admin.routes.js';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Middlewares para las rutas API
app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api/admin', adminRoutes);
app.get("/", (_req, res) => res.send("API OK"));
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API escuchando en http://localhost:${PORT}`));
