import express from "express";
import bcrypt from "bcrypt";
import pool from "../db/index.js"; // połączenie z bazą

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, birthDate } = req.body;

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Użytkownik już istnieje" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (username, email, password_hash, birth_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email`,
      [name, email, hashedPassword, birthDate]
    );

    res.status(201).json({
      message: "Konto utworzone pomyślnie",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

export default router;
