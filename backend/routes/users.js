import express from "express";
import { getAllUsers } from "../controllers/usersController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import resetStreak from "../utils/resetStreak.js";

export default function userRoutes(pool) {
  const router = express.Router();

  router.get("/", (req, res) => getAllUsers(req, res, pool));
  router.get("/me", verifyToken, async (req, res) => {
    try {
      const userId = req.user.id;

      const userResult = await pool.query(
        `SELECT id, name, username, email, level, money, streak_days, streak_frozen, avatar, exp, highest_streak
       FROM users
       WHERE id = $1`,
        [userId],
      );

      if (userResult.rowCount === 0) {
        return res.status(404).json({ message: "Użytkownik nie znaleziony" });
      }

      const user = userResult.rows[0];

      const todayResult = await pool.query(
        `SELECT tasks_solved, correct_answers
       FROM user_activity_log
       WHERE user_id = $1 AND date = CURRENT_DATE`,
        [userId],
      );

      const todayRow = todayResult.rows[0];
      const todayTasks = Number(todayRow?.tasks_solved || 0);
      const todayCorrect = Number(todayRow?.correct_answers || 0);

      const bestResult = await pool.query(
        `SELECT COALESCE(MAX(tasks_solved), 0) AS best_daily_tasks
       FROM user_activity_log
       WHERE user_id = $1`,
        [userId],
      );

      const bestDailyTasks = Number(bestResult.rows[0].best_daily_tasks);

      const totalResult = await pool.query(
        `SELECT COALESCE(SUM(tasks_solved), 0) AS total_tasks_solved
       FROM user_activity_log
       WHERE user_id = $1`,
        [userId],
      );

      const totalTasksSolved = Number(totalResult.rows[0].total_tasks_solved);

      const highlightedBadgesResult = await pool.query(
        `SELECT
         ub.badge_id,
         ub.earned_at,
         ub.highlighted,
         b.*
       FROM user_badges ub
       JOIN badges b ON b.id = ub.badge_id
       WHERE ub.user_id = $1
         AND ub.highlighted = true
       ORDER BY ub.earned_at DESC`,
        [userId],
      );

      const highlightedBadges = highlightedBadgesResult.rows;

      const last7DaysTasksResult = await pool.query(
        `SELECT
     TO_CHAR(gs.day::date, 'YYYY-MM-DD') AS date,
     COALESCE(ual.tasks_solved, 0) AS tasks_solved
   FROM generate_series(
     CURRENT_DATE - INTERVAL '6 days',
     CURRENT_DATE,
     INTERVAL '1 day'
   ) AS gs(day)
   LEFT JOIN user_activity_log ual
     ON ual.user_id = $1
    AND ual.date = gs.day::date
   ORDER BY gs.day ASC`,
        [userId],
      );

      const last7DaysTasks = last7DaysTasksResult.rows.map((row) => ({
        date: row.date,
        tasks_solved: Number(row.tasks_solved),
      }));

      res.json({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        level: user.level,
        exp: user.exp,
        money: user.money,
        streak_days: user.streak_days,
        highest_streak: user.highest_streak,
        streak_frozen: user.streak_frozen,

        today_tasks_solved: todayTasks,
        today_correct_answers: todayCorrect,
        best_daily_tasks_solved: bestDailyTasks,
        total_tasks_solved: totalTasksSolved,

        highlighted_badges: highlightedBadges,
        last_7_days_tasks: last7DaysTasks,
      });
    } catch (error) {
      console.error("❌ Błąd przy pobieraniu danych użytkownika:", error);
      res.status(500).json({ message: "Błąd serwera" });
    }
  });

  router.post("/check-streak", verifyToken, async (req, res) => {
    try {
      const userId = req.user.id;

      // 1) Pobierz ostatnią aktywność użytkownika
      const activityResult = await pool.query(
        `SELECT date
       FROM user_activity_log
       WHERE user_id = $1
       ORDER BY date DESC
       LIMIT 1`,
        [userId],
      );

      // Jeśli user nie ma jeszcze żadnej aktywności -> nic nie resetujemy
      if (activityResult.rows.length === 0) {
        return res.json({ didReset: false, data: null });
      }

      const lastSolvedDate = new Date(activityResult.rows[0].date);

      // Normalizacja do "początku dnia" (żeby liczyć pełne dni)
      const normalize = (d) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate());

      const today = normalize(new Date());
      const fromDb = normalize(lastSolvedDate);

      // Jeśli data z DB jest niepoprawna
      if (Number.isNaN(fromDb.getTime())) {
        return res
          .status(500)
          .json({ message: "Nieprawidłowa data w user_activity_log" });
      }

      const diffInDays = Math.floor((today - fromDb) / (1000 * 60 * 60 * 24));

      // Jeśli dzisiaj (0) albo wczoraj (1) -> nic nie resetujemy
      if (diffInDays <= 1) {
        return res.json({ didReset: false, data: null });
      }

      // 2) Pobierz dane streakowe usera
      const userDataResult = await pool.query(
        `SELECT streak_frozen, streak_days, highest_streak
       FROM users
       WHERE id = $1`,
        [userId],
      );

      if (userDataResult.rows.length === 0) {
        return res.status(404).json({ message: "Nie znaleziono użytkownika" });
      }

      const { streak_frozen, streak_days, highest_streak } =
        userDataResult.rows[0];

      // 3) Jeśli przerwa 2-3 dni i jest freeze -> nic nie resetujemy
      if (diffInDays > 1 && diffInDays <= 3) {
        if (streak_frozen === true) {
          return res.json({ didReset: false, data: null });
        }

        // Brak freeza -> reset
        await resetStreak(userId, streak_days, highest_streak, pool);

        // Dociągnij aktualne wartości po resecie (żeby nie zwracać "user is not defined")
        const afterReset = await pool.query(
          `SELECT streak_days, highest_streak
         FROM users
         WHERE id = $1`,
          [userId],
        );

        return res.json({
          didReset: true,
          data: afterReset.rows[0] || null,
        });
      }

      // 4) Jeśli przerwa > 3 dni -> reset zawsze
      if (diffInDays > 3) {
        await resetStreak(userId, streak_days, highest_streak, pool);

        const afterReset = await pool.query(
          `SELECT streak_days, highest_streak
         FROM users
         WHERE id = $1`,
          [userId],
        );

        return res.json({
          didReset: true,
          data: afterReset.rows[0] || null,
        });
      }

      // fallback (teoretycznie nieosiągalny, ale bezpieczny)
      return res.json({ didReset: false, data: null });
    } catch (err) {
      console.error("check-streak error:", err);
      return res.status(500).json({ message: "Błąd serwera" });
    }
  });
  router.get("/rankings/top-exp", verifyToken, async (req, res) => {
    try {
      const topExpPlayers = await pool.query(`
          SELECT username, level, exp, avatar FROM users
          ORDER BY level DESC, exp DESC
          LIMIT 100
        `);

      if (topExpPlayers.rows.length === 0) {
        return res.json({ no_users: "No users found." });
      }
      return res.json({
        data: topExpPlayers.rows,
      });
    } catch (e) {
      console.error(`top-exp error: ${e}`);
    }
  });
  router.get("/rankings/top-earnings", verifyToken, async (req, res) => {
    try {
      const topEarningsPlayers = await pool.query(`
          SELECT username, total_earnings, avatar FROM users
          ORDER BY total_earnings DESC
          LIMIT 100
        `);

      if (topEarningsPlayers.rows.length === 0) {
        return res.json({ no_users: "No users found." });
      }
      return res.json({
        data: topEarningsPlayers.rows,
      });
    } catch (e) {
      console.error(`top-earnings error: ${e}`);
    }
  });
  router.get("/rankings/highest-streak", verifyToken, async (req, res) => {
    try {
      const topHighestStreak = await pool.query(`
           SELECT username, highest_streak, avatar FROM users
          ORDER BY highest_streak DESC
          LIMIT 100
        `);

      if (topHighestStreak.rows.length === 0) {
        return res.json({ no_users: "No users found." });
      }
      return res.json({
        data: topHighestStreak.rows,
      });
    } catch (e) {
      console.error(`highest-streak error: ${e}`);
    }
  });
  router.post("/setNewAvatar/:avatarName", verifyToken, async (req, res) => {
    const userId = req.user.id;
    const avatarName = req.params.avatarName;

    if (!isCorrectAvatarName(avatarName)) {
      return res.status(404).json({
        message: "Wrong avatar name",
      });
    }

    if (isPremiumAvatar(avatarName)) {
      const avatarIdMap = {
        11: "1",
        12: "5",
        13: "6",
        14: "7",
        15: "8",
      };
      const avatarId = avatarIdMap[avatarName.slice(6)];
      const { rows: isUnlocked } = await pool.query(
        `SELECT EXISTS(SELECT 1 FROM user_items WHERE user_id=$1 AND item_id=$2)`,
        [userId, avatarId],
      );
      if (!isUnlocked[0].exists) {
        return res.status(404).json({
          error: `User does not have avatar with id=${avatarId} unlocked`,
        });
      }
    }
    await pool.query(
      `UPDATE users
          SET avatar = $1
          WHERE id = $2
        `,
      [`/${avatarName}.png`, userId],
    );

    return res.json({ message: "Avatar set successfully" });

    //ustaw
  });
  router.get("/getPurchasedAvatars", verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { rows: avatars } = await pool.query(
      ` SELECT *
      FROM user_items ui
      JOIN shop_items si ON ui.item_id = si.id
      WHERE ui.user_id = $1`,
      [userId],
    );
    return res.json({
      data: avatars,
    });
  });

  return router;
  //Util
  function isCorrectAvatarName(avatarName) {
    const regex = /^avatar([1-9]|1[0-5])$/;
    return regex.test(avatarName);
  }
  function isPremiumAvatar(avatarName) {
    const regex = /^avatar(1[1-5])$/;
    return regex.test(avatarName);
  }
}
