// server/api/users/[userId]/messages/[messageId]/read.post.js
import { getDatabase } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const {user} = await requireUserSession(event);
  const userId = user.id; // Use the authenticated user's ID
  const messageId = parseInt(event.context.params.messageId);
  const body = await readBody(event);
  const { isRead } = body;

  if (isNaN(userId) || isNaN(messageId) || typeof isRead !== 'boolean') {
    return createError({
      statusCode: 400,
      statusMessage: 'Invalid userId, messageId, or isRead status.',
    });
  }

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
      SET is_read = ?
      WHERE user_id = ? AND message_id = ?
    `);
    const result = stmt.run(isRead ? 1 : 0, userId, messageId);

    db.close();

    if (result.changes > 0) {
      return { success: true, message: `Message ${messageId} marked as read for user ${userId}.` };
    } else {
      return createError({
        statusCode: 404,
        statusMessage: 'Message not found for this user.',
      });
    }
  } catch (error) {
    console.error('Error marking message as read:', error);
    db.close();
    return createError({
      statusCode: 500,
      statusMessage: 'Error marking message as read.',
      stack: error.stack,
    });
  }
});