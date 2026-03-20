import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";

export default function shopRoutes(pool) {
  const router = express.Router();

  router.get("/items", verifyToken, async (req, res) => {
    const userId = req.user.id;
    try {
      const result = await pool.query(
        `
        SELECT 
          si.*,
          EXISTS (
            SELECT 1
            FROM user_items ui
            WHERE ui.item_id = si.id
              AND ui.user_id = $1
          ) AS is_purchased
        FROM shop_items si
        ORDER BY si.id ASC
        `,
        [userId]
      );

      return res.json({
        data: result.rows,
      });
    } catch (e) {
      console.error(`getting items error: ${e}`);
    }
  });

  return router;
}
