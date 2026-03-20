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
        `SELECT * FROM user_badges WHERE user_id = $1`,
        [userId],
      );
      const badgesProgressData = await pool.query(
        `SELECT * FROM user_badge_progress WHERE user_id = $1`,
        [userId],
      );

      const badgeTablesCombined = allBadges.rows.map((badge) => {
        const b = badgesProgressData.rows.find((x) => x.badge_id === badge.id);
        return {
          ...badge,
          progress_value: b?.progress_value || 0,
          start_date: b?.start_date || null,
          last_update: b?.last_update || null,
          completed_at: b?.completed_at || null,
          days_to_complete: b?.days_to_complete || null,
          avg_daily_gain: b?.avg_daily_gain || null,
        };
      });

      const markIfUnlocked = badgeTablesCombined.map((badge) => {
        const isUnlocked = usersBadges.rows.some(
          (b) => b.badge_id === badge.id,
        );
        return { ...badge, isUnlocked };
      });

      // 1) Grupowanie po badge_key
      const badgesMapRaw = markIfUnlocked.reduce((acc, el) => {
        const key = el.badge_key;
        (acc[key] ||= []).push(el);
        return acc;
      }, {});

      // 2) displayDetails per grupa
      const badgesMap = Object.fromEntries(
        Object.entries(badgesMapRaw).map(([key, rowBadges]) => {
          const sorted = [...rowBadges].sort(
            (a, b) => (a.id ?? 0) - (b.id ?? 0),
          );

          const withDisplayDetails = sorted.map((el, index, arr) => {
            const prevUnlocked =
              index > 0 ? !!arr[index - 1].isUnlocked : false;

            const displayDetails =
              el.rarity === "wood" || el.isUnlocked || prevUnlocked;

            return { ...el, displayDetails };
          });

          return [key, withDisplayDetails];
        }),
      );

      return res.json({ userId, badgesMap });
    } catch (error) {
      res.status(500).json({ message: `Błąd serwera: ${error.message}` });
    }
  });

  return router;
}
