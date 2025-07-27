import { getDatabase } from '~/server/utils/db';
import { wss } from '~/server/utils/websocket-server';

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const body = await readBody(event);
  const { to, body: content } = body;

  if (!to || !content) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' });
  }

  const db = getDatabase(user.domain);

  const stmt = db.prepare(`
    INSERT INTO messages (sender_id, receiver_id, body)
    VALUES (?, ?, ?)
  `);

  const result = stmt.run(user.id, to, content);
  const messageId = result.lastInsertRowid;

  db.prepare(`
    INSERT INTO user_messages (user_id, message_id, mailbox)
    VALUES (?, ?, 'sent'), (?, ?, 'inbox')
  `).run(user.id, messageId, to, messageId);

  db.close();

  wss.clients.forEach(client => {
  if (client.readyState === 1) {
    client.send(JSON.stringify({
      type: 'chat:newMessage',
      from: msg.from,
      to: msg.to,
      body: msg.body
    }))
  }
})

  return { success: true };
});
