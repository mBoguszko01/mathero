async function resetStreak(userId, currentStreak, maxStreak, pool){
    if(currentStreak > maxStreak){
        maxStreak = currentStreak;
    }
    currentStreak = 0;


    await pool.query(
      `
      UPDATE users
      SET streak_days = $1, highest_streak = $2, streak_frozen = FALSE
      WHERE id = $3
      `,
      [currentStreak, maxStreak, userId]
    );
}
export default resetStreak;

/*
UPDATE users
SET streak_days = 0, highest_streak = 100, streak_frozen = FALSE
WHERE id = 23
*/