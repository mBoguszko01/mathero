import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import pool from "./db/index.js";
import categoryRoutes from "./routes/categories.js";
import tasksRoutes from "./routes/tasks.js";
import badgeRoutes from "./routes/badges.js";
import shopRoutes from './routes/shop.js';
import statisticsRoutes from "./routes/statistics.js";

dotenv.config();
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// Testowy endpoint
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

// Główne trasy API
app.use("/api/users", userRoutes(pool));
app.use("/api/auth", authRoutes(pool)); 
app.use("/api/categories", categoryRoutes(pool));
app.use("/api/tasks", tasksRoutes(pool));
app.use("/api/badges", badgeRoutes(pool));
app.use("/api/shop", shopRoutes(pool));
app.use("/api/statistics", statisticsRoutes(pool))

// Start serwera
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
