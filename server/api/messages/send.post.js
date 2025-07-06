 // server/api/messages/send.post.js
import { getDatabase } from '~/server/utils/db';
import { wss } from '~/server/utils/websocket-server';
export default defineEventHandler(async (event) => {
  const {user} = await requireUserSession(event);
  const domain = user.domain;

  console.log('domain send email:', domain);

  const body = await readBody(event);
  const { senderId, receiverId, subject, body: messageBody } = body;


  
  if (!senderId || !receiverId || !subject || !messageBody) {
    return createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: senderId, receiverId, subject, or body.',
    });
  }

  try {
    
    const db = getDatabase(domain);
    // 1. Insert the message into the 'messages' table

    const stmt = db.prepare(`
      INSERT INTO messages (sender_id, receiver_id, subject, body)
      VALUES (?, ?, ?, ?)
      `);
    
      const messageResult = stmt.run(senderId, receiverId, subject, messageBody);

    console.log('messageResult:', messageResult);

    const messageId = messageResult.lastInsertRowid;

    if (!messageId) {
       db.close();
      return createError({
        statusCode: 500,
        statusMessage: 'Failed to save message.',
      });
    }

    // 2. Insert into 'user_messages' for the sender ('sent' mailbox)
    const stmt2 = db.prepare(
      `
      INSERT INTO user_messages (user_id, message_id, mailbox)
      VALUES (?, ?, ?)
      `
    );
    const result2 = stmt2.run(senderId, messageId, 'sent')


    // 3. Insert into 'user_messages' for the receiver ('inbox' mailbox)
    const stmt3 =  db.prepare(
      `
      INSERT INTO user_messages (user_id, message_id, mailbox)
      VALUES (?, ?, ?)
      `
    );
    const result3 = stmt3.run(receiverId, messageId, 'inbox')

     db.close();

     wss.clients.forEach(client => {
      // console.log("client::::::", client)
      if (client.readyState === 1) {

      
      
        client.send(JSON.stringify({ type: 'unreadCountUpdatedPlus', receiverId: receiverId }));
        client.send(JSON.stringify({ type: 'newMail', senderId, receiverId, subject, messageBody  }));
      }
    });

    return { success: true, messageId: messageId };

  } catch (error) {
    console.error('Error saving message:', error);
    return createError({
      statusCode: 500,
      statusMessage: 'Error saving message to the database.',
      stack: error.stack, // Only in development, remove in production
    });
  }
});