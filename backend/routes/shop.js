import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { addExp } from "../utils/addExp.js";
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
        }else{
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
