//chce pobrać wszystkie badge -- tabela badges
//potem chce pobrać badge odblokowane przez użytkownika -- userbadges
//potem pobieram aktualny progress badgy -- user_badge_progress
//niech rarity oznacza 'poziom' odznaki - czyli za level 5 -- wood, level 10 -- silver, level 25 -- gold, level 50 -- diamond
import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";

export default function badgeRoutes(pool) {
  const router = express.Router();

  router.get("/", verifyToken, async (req, res) => {
    try {
      const userId = req.user.id;

      const allBadges = await pool.query(`SELECT * FROM badges`);
      const usersBadges = await pool.query(
        `SELECT * 
                FROM user_badges
                WHERE user_id = $1`,
        [userId],
      );

      const markIfUnlocked = allBadges.rows.map((badge) => {
        if (usersBadges.rows.some((b) => b.badge_id === badge.id)) {
          return { ...badge, isUnlocked: true };
        }
        return {...badge, isUnlocked: false};
      });

      return res.json({
        userId,
        allBadges: allBadges.rows,
        usersBadges: usersBadges.rows,
        markIfUnlocked: markIfUnlocked
      });

      //zmapować które z allbadges są zdobyte przez usera
    } catch (error) {
      res.status(500).json({ message: "Błąd serwera" });
    }
  });
  return router;
}
