async function startNewBadges(userId, pool) {
  const result = await pool.query(
    `
    INSERT INTO user_badge_progress (user_id, badge_id, progress_value, start_date)
    SELECT $1, b.id, 0, NOW()
    FROM badges b
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
