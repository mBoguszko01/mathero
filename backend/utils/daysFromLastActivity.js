async function daysFromLastActivity(userId, pool){
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
}