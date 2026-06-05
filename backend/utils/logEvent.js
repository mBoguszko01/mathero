export async function logEvent(db, userId, eventType, metadata = {}) {
  await db.query(
    `
    INSERT INTO events_log (user_id, event_type, metadata)
    VALUES ($1, $2, $3)
    `,
    [userId, eventType, metadata],
  );
}
