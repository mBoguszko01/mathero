async function startNewBadges(userId, pool) {
  const result = await pool.query(
    `
    INSERT INTO user_badge_progress (user_id, badge_id, progress_value, start_date)
    SELECT
      $1,
      b.id,
      CASE
        WHEN b.badge_key = 'level' THEN COALESCE(u.level, 1)
        ELSE 0
      END,
      NOW()
    FROM badges b
    JOIN users u ON u.id = $1
    WHERE b.rarity = 'wood'
      AND NOT EXISTS (
        SELECT 1
        FROM user_badge_progress ub
        WHERE ub.badge_id = b.id AND ub.user_id = $1
      )
    RETURNING id, badge_id;
    `,
    [userId],
  );

  return result.rowCount;
}
export { startNewBadges };
