import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js"; // ✅ DODAJ TEN IMPORT
import pool from "./db/index.js";

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
app.use("/api/users", userRoutes(pool)); // Twoje obecne endpointy użytkownika
app.use("/api/auth", authRoutes);        // ✅ Trasa do rejestracji i logowania

// Start serwera
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
