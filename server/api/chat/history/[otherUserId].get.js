export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const otherUserId = parseInt(event.context.params.otherUserId);
  const db = getDatabase(user.domain);

  const rows = db.prepare(`
    SELECT * FROM messages
    WHERE (sender_id = ? AND receiver_id = ?)
       OR (sender_id = ? AND receiver_id = ?)
    ORDER BY timestamp ASC
  `).all(user.id, otherUserId, otherUserId, user.id);

  db.close();
  return rows;
});
