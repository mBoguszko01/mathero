import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/index.js";
import dotenv from "dotenv";
import { verifyToken } from "../middleware/verifyToken.js";

dotenv.config();
const router = express.Router();

const makeTempToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, stage: "register_step1" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

const makeFullToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      stage: "completed",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    }
  );

router.post("/register-step1", async (req, res) => {
  try {
    const { name, email, password, birthDate } = req.body;

    if (!name || !email || !password || !birthDate) {
      return res.status(400).json({ message: "Wszystkie pola są wymagane." });
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Użytkownik o podanym adresie e-mail już istnieje." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password_hash, birth_date, is_completed)
       VALUES ($1, $2, $3, $4, false)
       RETURNING id, name, email`,
      [name, email, hashedPassword, birthDate]
    );

    const user = newUser.rows[0];

    const tempToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        stage: "register_step1",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: `Cześć ${user.name}! Etap 1 zakończony pomyślnie. Kontynuuj proces rejestracji.`,
      user: { id: user.id, name: user.name, email: user.email },
      tempToken,
    });
  } catch (error) {
    console.error("❌ Błąd podczas rejestracji (step 1):", error);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

router.patch("/register-step2", verifyToken, async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const userId = req.user.id;

    if (!username || !avatar) {
      return res
        .status(400)
        .json({ message: "Nazwa użytkownika i avatar są wymagane." });
    }

    const existing = await pool.query(
      "SELECT id, is_completed FROM users WHERE id = $1",
      [userId]
    );
    if (existing.rowCount === 0) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony." });
    }
    if (existing.rows[0].is_completed) {
      return res
        .status(400)
        .json({ message: "Rejestracja tego konta została już zakończona." });
    }

    const usernameCheck = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (usernameCheck.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Nazwa użytkownika jest już zajęta." });
    }

    await pool.query(
      `UPDATE users
       SET username = $1, avatar = $2, is_completed = true
       WHERE id = $3`,
      [username, avatar, userId]
    );

    const finalToken = jwt.sign(
      {
        id: userId,
        username,
        stage: "completed",
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    res.json({
      message: "Rejestracja zakończona pomyślnie!",
      user: { id: userId, username, avatar },
      token: finalToken,
    });
  } catch (error) {
    console.error("❌ Błąd podczas rejestracji (step 2):", error);
    res.status(500).json({ message: "Błąd serwera" });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Podaj email i hasło." });
    }

    const result = await pool.query(
      `SELECT id, email, name, username, avatar, password_hash, is_completed
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      return res
        .status(400)
        .json({ message: "Nieprawidłowy email lub hasło." });
    }

    const user = result.rows[0];

    if (!user.is_completed) {
      const tempToken = makeTempToken(user);
      return res.status(200).json({
        requiresStep2: true,
        message: "Dokończ rejestrację (krok 2).",
        tempToken,
        name: user.name,
      });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res
        .status(400)
        .json({ message: "Nieprawidłowy email lub hasło." });
    }

    const token = makeFullToken(user);

    res.json({
      message: "Zalogowano pomyślnie",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("❌ Błąd logowania:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

export default router;
