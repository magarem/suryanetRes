// server/api/[domain]/messages/[mailbox]/messages.get.js
import {getDatabase} from '~/server/utils/db';

export default defineEventHandler(async (event) => {
	const {user} = await requireUserSession(event);
	const domain = user.domain;


	// const mailbox = event.context.params.mailbox;
	const query = getQuery(event);
	const userId = parseInt(query.userId);
	const excludeDeleted = query.excludeDeleted === 'true';

	// if (isNaN(userId) || !['inbox', 'sent', 'deleted'].includes(mailbox)) {
	// 	return createError({statusCode: 400, statusMessage: 'Invalid userId or mailbox.'});
	// }

	const db = getDatabase(domain);

	if (! db) {
		return createError({statusCode: 500, statusMessage: 'Failed to connect to the database.'});
	}

	try {
		let sql = `
      SELECT
        m.id,
        m.sender_id,
        sender.username AS sender_name,
        m.receiver_id,
        receiver.username AS receiver_name,
        m.subject,
        m.body,
        strftime('%Y-%m-%dT%H:%M:%fZ', m.sent_at) AS date,
        m.is_read,
        um.is_deleted,
        strftime('%Y-%m-%dT%H:%M:%fZ', um.deleted_at) AS deleted_at,
        um.mailbox AS user_mailbox
      FROM user_messages um
      JOIN messages m ON um.message_id = m.id
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN users receiver ON m.receiver_id = receiver.id
      WHERE um.user_id = ?
    `;

		const params = [userId];

		if (excludeDeleted && mailbox !== 'deleted') {
			sql += ' AND um.is_deleted = 0';
		}

		sql += ' ORDER BY m.sent_at DESC';

		console.log('sql:', sql);
		const stmt = db.prepare(sql);
		const messagesData = stmt.all(params);
		db.close();

		return messagesData.map(message => ({
			id: message.id,
			senderId: message.sender_id,
			senderName: message.sender_name,
			receiverId: message.receiver_id,
			receiverName: message.receiver_name,
			subject: message.subject,
			body: message.body,
			date: new Date(message.date),
			isRead: !!message.is_read,
			isDeleted: !!message.is_deleted,
			deletedAt: message.deleted_at ? new Date(message.deleted_at) : null,
			mailbox: message.user_mailbox
		}));

	} catch (error) {
		console.error('Error fetching messages:', error);
		db.close();
		return createError({statusCode: 500, statusMessage: 'Error fetching messages.', stack: error.stack});
	}
});
