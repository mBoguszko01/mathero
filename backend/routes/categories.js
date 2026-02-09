import express from "express";
import pool from "../db/index.js";

export default function categoryRoutes() {
  const router = express.Router();

  router.get("/full", async (req, res) => {
    try {
      const categoriesRes = await pool.query(`
      SELECT id, name, class_levels
      FROM categories
      ORDER BY id
    `);

      const categories = categoriesRes.rows;
      const subRes = await pool.query(`
      SELECT id, category_id, name, class_levels
      FROM subcategories
      ORDER BY id
    `);

      const subcategories = subRes.rows;

      const combined = categories.map((cat) => ({
        ...cat,
        subcategories: subcategories.filter((s) => s.category_id === cat.id),
      }));

      res.json(combined);
    } catch (error) {
      console.error("❌ Błąd w /api/categories/full:", error);
      res.status(500).json({ message: "Błąd serwera" });
    }
  });
  router.get("/by-class/:classNumber", async (req, res) => {
    try {
      const classNumber = parseInt(req.params.classNumber);

      if (isNaN(classNumber)) {
        return res.status(400).json({ message: "Nieprawidłowa klasa." });
      }

      const result = await pool.query(
        `SELECT id, name, subcategories
       FROM categories
       WHERE $1 = ANY(class_levels)
       ORDER BY id`,
        [classNumber],
      );

      res.json(result.rows);
    } catch (error) {
      console.error("❌ Błąd pobierania kategorii:", error);
      res.status(500).json({ message: "Błąd serwera." });
    }
  });

  return router;
}
