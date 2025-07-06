// server/api/messages/delete/[messageId].post.js
import { getDatabase } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const messageId = parseInt(event.context.params.messageId);
  const body = await readBody(event);
  const { userId, mailbox } = body;

//   if (isNaN(messageId) || isNaN(userId) || mailbox !== 'deleted') {
//     return createError({
//       statusCode: 400,
//       statusMessage: 'Invalid userId, messageId, or mailbox.',
//     });
//   }

  const db = getDatabase(event.context.params.domain);

  if (!db) {
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to connect to the database.',
    });
  }

  try {
    const stmt = db.prepare(`
      UPDATE user_messages
      SET mailbox = ?,
          is_deleted = 1,
          deleted_at = DATETIME('now')
      WHERE user_id = ? AND message_id = ?
    `);
    const result = stmt.run(mailbox, userId, messageId);

    db.close();

    if (result.changes > 0) {
      return { success: true, message: `Message ${messageId} moved to deleted for user ${userId}.` };
    } else {
      return createError({
        statusCode: 404,
        statusMessage: 'Message not found for this user.',
      });
    }
  } catch (error) {
    console.error('Error moving message to deleted:', error);
    db.close();
    return createError({
      statusCode: 500,
      statusMessage: 'Error moving message to deleted.',
      stack: error.stack,
    });
  }
});