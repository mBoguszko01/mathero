import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import userRoutes from "./routes/users.js";

dotenv.config();
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// Połączenie z bazą
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Przykładowy endpoint testowy
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

// Import routes
app.use("/api/users", userRoutes(pool));

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
