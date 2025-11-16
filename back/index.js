import express from "express";
import cors from "cors";

import dotenv from "dotenv";
dotenv.config();

import pool from "./config/db.js";
import roomRoutes from "./routes/roomRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import roomTypeRoutes from "./routes/roomType.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple request logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Debug endpoints
let requestCount = 0;
app.use((req, res, next) => { requestCount++; next(); });

app.get('/api/debug/requests', (req, res) => {
  res.json({ requestCount, uptime: process.uptime() });
});

app.get('/api/debug/db-stats', async (req, res) => {
  try {
    const counts = {};
    const tables = ['users', 'properties', 'room_types', 'rooms', 'bookings'];
    for (const t of tables) {
      const r = await pool.query(`SELECT COUNT(*)::int as count FROM ${t}`);
      counts[t] = r.rows[0].count;
    }
    res.json({ counts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch db stats', details: String(err) });
  }
});

// Routes
app.use("/api/rooms", roomRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/room-types", roomTypeRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "HMS API is running" });
});

app.listen(port, () => {
  console.log(`HMS server running on http://localhost:${port}`);
});
