import express from "express";
import pool from "../db/index.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { addExp } from "../utils/addExp.js";
export default function tasksRoutes() {
  const router = express.Router();

  const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

  // Funkcja generująca 3 błędne odpowiedzi
  const generateWrongAnswers = (correct) => {
    const wrongAnswers = new Set();

    while (wrongAnswers.size < 3) {
      const offset = Math.floor(Math.random() * 11) - 5; // -5..+5
      const value = correct + offset;

      if (value !== correct && value >= 0) {
        wrongAnswers.add(value);
      }
    }

    return Array.from(wrongAnswers);
  };

  router.get("/random", async (req, res) => {
    try {
      const { class: classLevel, topic, subtopic } = req.query;

      if (!classLevel || !topic || !subtopic) {
        return res.status(400).json({
          message: "Wymagane parametry: class, topic, subtopic",
        });
      }

      const query = `
      SELECT id, question, correct_answer, difficulty_level
      FROM tasks
      WHERE class_level = $1
        AND category_id = $2
        AND subcategory_id = $3
      ORDER BY RANDOM()
      LIMIT 5;
    `;

      const result = await pool.query(query, [classLevel, topic, subtopic]);

      const tasksWithAnswers = result.rows.map((task) => {
        const correct = Number(task.correct_answer);
        const wrong = generateWrongAnswers(correct);
        const possibleAnswers = shuffleArray([correct, ...wrong]);

        return {
          ...task,
          possible_answers: possibleAnswers,
        };
      });

      return res.json({
        count: tasksWithAnswers.length,
        tasks: tasksWithAnswers,
      });
    } catch (err) {
      console.error("❌ Błąd pobierania zadań:", err);
      return res.status(500).json({ message: "Błąd serwera" });
    }
  });

  /**
   * POST /api/tasks/session
   * Body:
   * {
   *   class_level: number,
   *   category_id: number,
   *   subcategory_id: number,
   *   results: [
   *     { task_id: number, correct: boolean }
   *   ]
   * }
   */
  router.post("/session", verifyToken, async (req, res) => {
    const client = await pool.connect();

    try {
      const userId = req.user.id;
      const { class_level, category_id, subcategory_id, results } = req.body;

      if (
        !class_level ||
        !category_id ||
        !subcategory_id ||
        !Array.isArray(results) ||
        results.length === 0
      ) {
        return res
          .status(400)
          .json({ message: "Brak wymaganych danych sesji." });
      }

      const classLevel = Number(class_level);
      const catId = Number(category_id);
      const subId = Number(subcategory_id);

      const taskIds = results.map((r) => Number(r.task_id));
      const correctArray = results.map((r) => !!r.correct);

      const totalQuestions = results.length;
      const correctCount = results.filter((r) => r.correct).length;

      await client.query("BEGIN");

      const tasksRes = await client.query(
        `
      SELECT id, points
      FROM tasks
      WHERE id = ANY($1::int[])
      `,
        [taskIds],
      );

      const pointsMap = new Map();
      for (const row of tasksRes.rows) {
        pointsMap.set(Number(row.id), Number(row.points || 0));
      }

      let earnedExp = 0;
      for (const r of results) {
        if (r.correct) {
          const pts = pointsMap.get(Number(r.task_id)) || 0;
          earnedExp += pts;
        }
      }

      let earnedCoins = 0;
      for (const r of results) {
        if (r.correct && Math.random() < 0.2) {
          earnedCoins += 10;
        }
      }

      await client.query(
        `
      INSERT INTO task_attempts (user_id, task_id, correct)
      SELECT $1, UNNEST($2::int[]), UNNEST($3::boolean[])
      `,
        [userId, taskIds, correctArray],
      );

      await client.query(
        `
      INSERT INTO user_progress (user_id, category_id, tasks_solved, tasks_correct, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id, category_id)
      DO UPDATE SET
        tasks_solved  = user_progress.tasks_solved  + EXCLUDED.tasks_solved,
        tasks_correct = user_progress.tasks_correct + EXCLUDED.tasks_correct,
        updated_at    = NOW()
      `,
        [userId, catId, totalQuestions, correctCount],
      );

      const userRes = await client.query(
        `
      SELECT exp, level, money, streak_days, highest_streak
      FROM users
      WHERE id = $1
      FOR UPDATE
      `,
        [userId],
      );

      if (userRes.rowCount === 0) {
        throw new Error("Użytkownik nie znaleziony");
      }

      let { exp, level, money, streak_days, highest_streak } = userRes.rows[0];
      exp = Number(exp || 0);
      level = Number(level || 1);
      money = Number(money || 0);
      streak_days = Number(streak_days || 0);
      highest_streak = Number(highest_streak || 0);

      // aktualizacja monet
      money += earnedCoins;

      // badge za kasę
      await updateBadges(client, "money", userId, earnedCoins);

      // exp / level
      const expResult = addExp(exp, level, earnedExp);
      exp = expResult.exp;
      level = expResult.level;
      const leveledUp = expResult.leveledUp;
      const levelsGained = expResult.levelsGained;

      if (leveledUp) {
        await updateBadges(client, "level", userId, level, true);
      }

      // Pobierz ostatnią aktywność PRZED zapisem dzisiejszej aktywności
      const activityResult = await client.query(
        `
      SELECT date
      FROM user_activity_log
      WHERE user_id = $1
      ORDER BY date DESC
      LIMIT 1
      `,
        [userId],
      );

      const today = normalize(new Date());
      let didUpdateStreak = false;

      if (activityResult.rowCount === 0) {
        // Nowy użytkownik - pierwsza aktywność
        streak_days = 1;
        didUpdateStreak = true;
      } else {
        const lastSolvedDate = new Date(activityResult.rows[0].date);
        const fromDb = normalize(lastSolvedDate);

        if (Number.isNaN(fromDb.getTime())) {
          throw new Error("Nieprawidłowa data w user_activity_log");
        }

        const diffInDays = Math.floor((today - fromDb) / (1000 * 60 * 60 * 24));

        if (diffInDays === 1) {
          // aktywność dzień po dniu
          streak_days += 1;
          didUpdateStreak = true;
        } else if (diffInDays > 1) {
          // przerwana passa
          streak_days = 1;
          didUpdateStreak = true;
        }
        // diffInDays === 0 -> już była aktywność dzisiaj, nie zwiększamy
      }

      if (didUpdateStreak) {
        await updateBadges(client, "streak", userId, 1);
      }

      await updateBadges(client, "tasks", userId, correctCount);

      if (streak_days > highest_streak) {
        highest_streak = streak_days;
      }

      // dopiero teraz zapis dzisiejszej aktywności
      await client.query(
        `
      INSERT INTO user_activity_log (user_id, date, tasks_solved, correct_answers)
      VALUES ($1, CURRENT_DATE, $2, $3)
      ON CONFLICT (user_id, date)
      DO UPDATE SET
        tasks_solved    = user_activity_log.tasks_solved    + EXCLUDED.tasks_solved,
        correct_answers = user_activity_log.correct_answers + EXCLUDED.correct_answers
      `,
        [userId, totalQuestions, correctCount],
      );

      await client.query(
        `
      UPDATE users
      SET exp = $1,
          level = $2,
          money = $3,
          streak_days = $4,
          highest_streak = $5
      WHERE id = $6
      `,
        [exp, level, money, streak_days, highest_streak, userId],
      );

      await client.query("COMMIT");

      return res.json({
        message: "Sesja zapisana pomyślnie",
        earned: {
          exp: earnedExp,
          coins: earnedCoins,
          correctAnswers: correctCount,
          totalQuestions,
          leveledUp,
        },
        user: {
          exp,
          level,
          money,
          streak_days,
          highest_streak,
          didUpdateStreak,
        },
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("❌ Błąd zapisu sesji:", err);
      return res
        .status(500)
        .json({ message: "Błąd serwera przy zapisie sesji" });
    } finally {
      client.release();
    }
  });

  return router;
}
const normalize = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

async function updateBadges(
  db,
  badgeKey,
  userId,
  addingValue,
  useAbsoluteValue = false,
) {
  console.log("[tasks/updateBadges] start", {
    badgeKey,
    userId,
    addingValue,
    useAbsoluteValue,
  });
  const { rows } = await db.query(
    `SELECT ub.id, ub.badge_id, ub.progress_value, ub.start_date, b.requirement_value, b.rarity
    FROM user_badge_progress ub
    JOIN badges b ON b.id = ub.badge_id
    WHERE ub.user_id = $1
    AND b.badge_key = $2 AND ub.completed = FALSE;`,
    [userId, badgeKey],
  );
  const currentlyAcqouringBadge = rows[0];
  if (!currentlyAcqouringBadge) {
    console.log("[tasks/updateBadges] no active badge", { badgeKey, userId });
    return;
  }

  const today = normalize(new Date());
  const currentProgress = Number(currentlyAcqouringBadge.progress_value || 0);
  const incomingValue = Number(addingValue || 0);
  const newValue = useAbsoluteValue
    ? Math.max(currentProgress, incomingValue)
    : currentProgress + incomingValue;
  console.log("[tasks/updateBadges] computed progress", {
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
    const diffInDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

    await db.query(
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
      const nextBadgeId = await db.query(
        `SELECT id FROM badges
          WHERE rarity=$1 AND badge_key=$2`,
        [nextRarityMap[currentlyAcqouringBadge.rarity], badgeKey],
      );
      await db.query(
        `
      INSERT INTO user_badge_progress (user_id, badge_id, progress_value, start_date, last_update, completed)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
        [userId, nextBadgeId.rows[0].id, newValue, today, today, false],
      );
    }

    const insertUserBadgeResult = await db.query(
      `
      INSERT INTO user_badges (user_id, badge_id, earned_at, highlighted)
      VALUES ($1, $2, $3, $4)
      `,
      [userId, currentlyAcqouringBadge.badge_id, today, false],
    );
    console.log("[tasks/updateBadges] inserted user_badges", {
      badgeKey,
      userId,
      badgeId: currentlyAcqouringBadge.badge_id,
      rowCount: insertUserBadgeResult.rowCount,
    });
  } else {
    await db.query(
      `
      UPDATE user_badge_progress
      SET progress_value = $1,
          last_update = $2
      WHERE id = $3
      `,
      [newValue, today, currentlyAcqouringBadge.id],
    );
    console.log("[tasks/updateBadges] updated progress only", {
      badgeKey,
      userId,
      badgeProgressId: currentlyAcqouringBadge.id,
      newValue,
    });
  }
}
