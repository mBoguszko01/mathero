import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";

export default function statisticsRoutes(pool) {
  const router = express.Router();

  router.get("/", verifyToken, async (req, res) => {
    const userId = req.user.id;

    try {
      const { rows: userRows } = await pool.query(
        `
        SELECT id, streak_days, highest_streak
        FROM users
        WHERE id = $1
        `,
        [userId],
      );

      const user = userRows[0];

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      const { rows: summaryRows } = await pool.query(
        `
        SELECT
          COALESCE(SUM(tasks_solved), 0) AS total_tasks_solved,
          COALESCE(MAX(tasks_solved), 0) AS best_daily_tasks_solved
        FROM user_activity_log
        WHERE user_id = $1
        `,
        [userId],
      );

      const summary = summaryRows[0];

      const { rows: bestDayRows } = await pool.query(
        `
        SELECT
          TO_CHAR(date, 'YYYY-MM-DD') AS date,
          tasks_solved
        FROM user_activity_log
        WHERE user_id = $1
        ORDER BY tasks_solved DESC, date DESC
        LIMIT 1
        `,
        [userId],
      );

      const bestDayRow = bestDayRows[0] || null;

      const { rows: attemptsRows } = await pool.query(
        `
        SELECT
          COUNT(*) AS total_attempts,
          COUNT(*) FILTER (WHERE correct = true) AS correct_attempts,
          COUNT(*) FILTER (WHERE correct = false) AS incorrect_attempts
        FROM task_attempts
        WHERE user_id = $1
        `,
        [userId],
      );

      const attempts = attemptsRows[0];

      const totalAttempts = Number(attempts.total_attempts || 0);
      const correctAttempts = Number(attempts.correct_attempts || 0);
      const incorrectAttempts = Number(attempts.incorrect_attempts || 0);

      const accuracy =
        totalAttempts > 0
          ? Number(((correctAttempts / totalAttempts) * 100).toFixed(2))
          : 0;

      const { rows: last7DaysRows } = await pool.query(
        `
        SELECT
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
        ORDER BY gs.day ASC
        `,
        [userId],
      );

      const { rows: last30DaysRows } = await pool.query(
        `
        SELECT
          TO_CHAR(gs.day::date, 'YYYY-MM-DD') AS date,
          COALESCE(ual.tasks_solved, 0) AS tasks_solved
        FROM generate_series(
          CURRENT_DATE - INTERVAL '29 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        ) AS gs(day)
        LEFT JOIN user_activity_log ual
          ON ual.user_id = $1
         AND ual.date = gs.day::date
        ORDER BY gs.day ASC
        `,
        [userId],
      );

      const { rows: last90DaysRows } = await pool.query(
        `
        SELECT
          TO_CHAR(gs.day::date, 'YYYY-MM-DD') AS date,
          COALESCE(ual.tasks_solved, 0) AS tasks_solved
        FROM generate_series(
          CURRENT_DATE - INTERVAL '89 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        ) AS gs(day)
        LEFT JOIN user_activity_log ual
          ON ual.user_id = $1
         AND ual.date = gs.day::date
        ORDER BY gs.day ASC
        `,
        [userId],
      );

      const { rows: difficultyRows } = await pool.query(
        `
        SELECT
          t.difficulty_level,
          COUNT(*) AS attempts,
          COUNT(*) FILTER (WHERE ta.correct = true) AS correct_attempts,
          COUNT(*) FILTER (WHERE ta.correct = false) AS incorrect_attempts,
          ROUND(
            COUNT(*) FILTER (WHERE ta.correct = true) * 100.0 / NULLIF(COUNT(*), 0),
            2
          ) AS accuracy
        FROM task_attempts ta
        JOIN tasks t ON t.id = ta.task_id
        WHERE ta.user_id = $1
        GROUP BY t.difficulty_level
        ORDER BY t.difficulty_level ASC
        `,
        [userId],
      );

      const { rows: categoryRows } = await pool.query(
        `
        SELECT
          c.id AS category_id,
          c.name AS category_name,
          COUNT(*) AS attempts,
          COUNT(*) FILTER (WHERE ta.correct = true) AS correct_attempts,
          COUNT(*) FILTER (WHERE ta.correct = false) AS incorrect_attempts,
          ROUND(
            COUNT(*) FILTER (WHERE ta.correct = true) * 100.0 / NULLIF(COUNT(*), 0),
            2
          ) AS accuracy
        FROM task_attempts ta
        JOIN tasks t ON t.id = ta.task_id
        JOIN categories c ON c.id = t.category_id
        WHERE ta.user_id = $1
        GROUP BY c.id, c.name
        ORDER BY attempts DESC, c.name ASC
        `,
        [userId],
      );

      const { rows: strongestSubcategoriesRows } = await pool.query(
        `
        SELECT
          s.id AS subcategory_id,
          s.name AS subcategory_name,
          c.id AS category_id,
          c.name AS category_name,
          COUNT(*) AS attempts,
          COUNT(*) FILTER (WHERE ta.correct = true) AS correct_attempts,
          COUNT(*) FILTER (WHERE ta.correct = false) AS incorrect_attempts,
          ROUND(
            COUNT(*) FILTER (WHERE ta.correct = true) * 100.0 / NULLIF(COUNT(*), 0),
            2
          ) AS accuracy
        FROM task_attempts ta
        JOIN tasks t ON t.id = ta.task_id
        JOIN subcategories s ON s.id = t.subcategory_id
        JOIN categories c ON c.id = s.category_id
        WHERE ta.user_id = $1
        GROUP BY s.id, s.name, c.id, c.name
        HAVING COUNT(*) >= 5
        ORDER BY accuracy DESC, attempts DESC, s.name ASC
        LIMIT 3
        `,
        [userId],
      );

      const { rows: weakestSubcategoriesRows } = await pool.query(
        `
        SELECT
          s.id AS subcategory_id,
          s.name AS subcategory_name,
          c.id AS category_id,
          c.name AS category_name,
          COUNT(*) AS attempts,
          COUNT(*) FILTER (WHERE ta.correct = true) AS correct_attempts,
          COUNT(*) FILTER (WHERE ta.correct = false) AS incorrect_attempts,
          ROUND(
            COUNT(*) FILTER (WHERE ta.correct = true) * 100.0 / NULLIF(COUNT(*), 0),
            2
          ) AS accuracy
        FROM task_attempts ta
        JOIN tasks t ON t.id = ta.task_id
        JOIN subcategories s ON s.id = t.subcategory_id
        JOIN categories c ON c.id = s.category_id
        WHERE ta.user_id = $1
        GROUP BY s.id, s.name, c.id, c.name
        HAVING COUNT(*) >= 5
        ORDER BY accuracy ASC, attempts DESC, s.name ASC
        LIMIT 3
        `,
        [userId],
      );

      return res.json({
        data: {
          summary: {
            total_tasks_solved: Number(summary.total_tasks_solved || 0),
            total_attempts: totalAttempts,
            correct_attempts: correctAttempts,
            incorrect_attempts: incorrectAttempts,
            accuracy,
            current_streak: Number(user.streak_days || 0),
            highest_streak: Number(user.highest_streak || 0),
            best_daily_tasks_solved: Number(
              summary.best_daily_tasks_solved || 0,
            ),
            best_day: bestDayRow
              ? {
                  date: bestDayRow.date,
                  tasks_solved: Number(bestDayRow.tasks_solved || 0),
                }
              : null,
          },

          activity_chart: {
            last_7_days: last7DaysRows.map((row) => ({
              date: row.date,
              tasks_solved: Number(row.tasks_solved || 0),
            })),
            last_30_days: last30DaysRows.map((row) => ({
              date: row.date,
              tasks_solved: Number(row.tasks_solved || 0),
            })),
            last_90_days: last90DaysRows.map((row) => ({
              date: row.date,
              tasks_solved: Number(row.tasks_solved || 0),
            })),
          },

          difficulty_stats: difficultyRows.map((row) => ({
            difficulty_level: Number(row.difficulty_level),
            attempts: Number(row.attempts || 0),
            correct_attempts: Number(row.correct_attempts || 0),
            incorrect_attempts: Number(row.incorrect_attempts || 0),
            accuracy: Number(row.accuracy || 0),
          })),

          category_stats: categoryRows.map((row) => ({
            category_id: Number(row.category_id),
            category_name: row.category_name,
            attempts: Number(row.attempts || 0),
            correct_attempts: Number(row.correct_attempts || 0),
            incorrect_attempts: Number(row.incorrect_attempts || 0),
            accuracy: Number(row.accuracy || 0),
          })),

          subcategory_stats: {
            strongest: strongestSubcategoriesRows.map((row) => ({
              subcategory_id: Number(row.subcategory_id),
              subcategory_name: row.subcategory_name,
              category_id: Number(row.category_id),
              category_name: row.category_name,
              attempts: Number(row.attempts || 0),
              correct_attempts: Number(row.correct_attempts || 0),
              incorrect_attempts: Number(row.incorrect_attempts || 0),
              accuracy: Number(row.accuracy || 0),
            })),
            weakest: weakestSubcategoriesRows.map((row) => ({
              subcategory_id: Number(row.subcategory_id),
              subcategory_name: row.subcategory_name,
              category_id: Number(row.category_id),
              category_name: row.category_name,
              attempts: Number(row.attempts || 0),
              correct_attempts: Number(row.correct_attempts || 0),
              incorrect_attempts: Number(row.incorrect_attempts || 0),
              accuracy: Number(row.accuracy || 0),
            })),
          },
        },
      });
    } catch (e) {
      console.error(`getting statistics error: ${e}`);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  });

  return router;
}
