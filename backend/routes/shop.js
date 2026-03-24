import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { addExp } from "../utils/addExp.js";
//util

export default function shopRoutes(pool) {
  const normalize = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  async function updateBadges(
    badgeKey,
    userId,
    addingValue,
    useAbsoluteValue = false,
  ) {
    console.log("[shop/updateBadges] start", {
      badgeKey,
      userId,
      addingValue,
      useAbsoluteValue,
    });
    const { rows } = await pool.query(
      `SELECT ub.id, ub.badge_id, ub.progress_value, ub.start_date, b.requirement_value, b.rarity
    FROM user_badge_progress ub
    JOIN badges b ON b.id = ub.badge_id
    WHERE ub.user_id = $1
    AND b.badge_key = $2 AND ub.completed = FALSE;`,
      [userId, badgeKey],
    );
    const currentlyAcqouringBadge = rows[0];
    if (!currentlyAcqouringBadge) {
      console.log("[shop/updateBadges] no active badge", { badgeKey, userId });
      return;
    }

    const today = normalize(new Date());
    const currentProgress = Number(currentlyAcqouringBadge.progress_value || 0);
    const incomingValue = Number(addingValue || 0);
    const newValue = useAbsoluteValue
      ? Math.max(currentProgress, incomingValue)
      : currentProgress + incomingValue;
    console.log("[shop/updateBadges] computed progress", {
      badgeKey,
      userId,
      badgeProgressId: currentlyAcqouringBadge.id,
      rarity: currentlyAcqouringBadge.rarity,
      requirementValue: currentlyAcqouringBadge.requirement_value,
      currentProgress,
      incomingValue,
      newValue,
    });
    if (newValue >= currentlyAcqouringBadge.requirement_value) {
      const startDate = normalize(new Date(currentlyAcqouringBadge.start_date));
      const diffInDays = Math.floor(
        (today - startDate) / (1000 * 60 * 60 * 24),
      );

      await pool.query(
        `
      UPDATE user_badge_progress
      SET progress_value = $1,
          last_update = $6,
          completed = $2,
          completed_at = $3,
          days_to_complete = $4
      WHERE id = $5
      `,
        [
          currentlyAcqouringBadge.requirement_value,
          true,
          today,
          diffInDays,
          currentlyAcqouringBadge.id,
          today,
        ],
      );

      if (currentlyAcqouringBadge.rarity != "diamond") {
        const nextRarityMap = {
          wood: "silver",
          silver: "gold",
          gold: "diamond",
        };
        const nextBadgeId = await pool.query(
          `SELECT id FROM badges
          WHERE rarity=$1 AND badge_key=$2`,
          [nextRarityMap[currentlyAcqouringBadge.rarity], badgeKey],
        );
        await pool.query(
          `
      INSERT INTO user_badge_progress (user_id, badge_id, progress_value, start_date, last_update, completed)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
          [userId, nextBadgeId.rows[0].id, newValue, today, today, false],
        );
      }

      const insertUserBadgeResult = await pool.query(
        `
      INSERT INTO user_badges (user_id, badge_id, earned_at, highlighted)
      VALUES ($1, $2, $3, $4)
      `,
        [userId, currentlyAcqouringBadge.badge_id, today, false],
      );
      console.log("[shop/updateBadges] inserted user_badges", {
        badgeKey,
        userId,
        badgeId: currentlyAcqouringBadge.badge_id,
        rowCount: insertUserBadgeResult.rowCount,
      });
    } else {
      await pool.query(
        `
      UPDATE user_badge_progress
      SET progress_value = $1,
          last_update = $2
      WHERE id = $3
        `,
        [newValue, today, currentlyAcqouringBadge.id],
      );
      console.log("[shop/updateBadges] updated progress only", {
        badgeKey,
        userId,
        badgeProgressId: currentlyAcqouringBadge.id,
        newValue,
      });
    }
  }
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
        [userId],
      );

      return res.json({
        data: result.rows,
      });
    } catch (e) {
      console.error(`getting items error: ${e}`);
    }
  });
  router.post("/purchase/:itemId", verifyToken, async (req, res) => {
    const userId = req.user.id;
    const itemId = Number(req.params.itemId);

    if (!Number.isInteger(itemId)) {
      return res.status(400).json({
        error: "Invalid itemId",
      });
    }

    try {
      const { rows: itemRows } = await pool.query(
        `SELECT * FROM shop_items WHERE id = $1`,
        [itemId],
      );

      const item = itemRows[0]; //na poziomie DB jest ustawione UNIQUE
      if (!item) {
        return res.status(404).json({
          error: `Item with id=${itemId} not found`,
        });
      }

      const { rows: userRows } = await pool.query(
        `SELECT * FROM users WHERE id=$1`,
        [userId],
      );
      const user = userRows[0];
      if (!user) {
        return res.status(404).json({
          error: `User with id=${userId} not found`,
        });
      }

      if (user.money < item.price) {
        return res.status(400).json({
          error: "Not enough money",
        });
      }

      const isPermanent = item.type === "permanent";
      if (isPermanent) {
        const { rows: usersItemRows } = await pool.query(
          `SELECT * FROM user_items WHERE user_id = $1 AND item_id = $2`,
          [userId, itemId],
        );

        if (usersItemRows.length === 0) {
          await pool.query(
            `INSERT INTO user_items (user_id, item_id)
   VALUES ($1, $2)
   ON CONFLICT (user_id, item_id) DO NOTHING`,
            [userId, itemId],
          );
          return res.json({
            message: "Item purchased successfully",
            data: {
              item,
              user: {
                money: user.money - item.price,
              },
            },
          });
        } else {
          return res.status(400).json({
            error: "Item already unlocked",
          });
        }
      } else {
        const effectType = item.effect_type;
        switch (effectType) {
          case "exp boost": {
            const effectValue = Number(item.effect_value || 0);

            const expResult = addExp(user.exp, user.level, effectValue);
            if (expResult.leveledUp) {
              await updateBadges("level", userId, expResult.level, true);
            }
            await pool.query(
              `
    UPDATE users
    SET exp = $1,
        level = $2,
        money = money - $3
    WHERE id = $4
    `,
              [expResult.exp, expResult.level, item.price, userId],
            );

            return res.json({
              message: "Item purchased successfully",
              data: {
                item,
                gainedExp: effectValue,
                user: {
                  exp: expResult.exp,
                  level: expResult.level,
                  money: user.money - item.price,
                },
                leveledUp: expResult.leveledUp,
                levelsGained: expResult.levelsGained,
              },
            });
          }
          default: {
            return res.status(500).json({
              error: `There is no handler for this item purchase`,
            });
          }
        }
      }
    } catch (e) {
      console.error(`purchasing item error: ${e}`);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  });

  return router;
}
