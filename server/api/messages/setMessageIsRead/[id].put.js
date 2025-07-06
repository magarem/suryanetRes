
// server/api/[id]/read.js
import { getDatabase } from '~/server/utils/db';
import { wss } from '~/server/utils/websocket-server';


async function getUnreadMessagesCountFromDatabase(db, receiverId) {
  try {
    const sql = 'SELECT COUNT(id) AS unreadCount FROM messages WHERE is_read = 0 AND receiver_id = ?';
    const stmt = db.prepare(sql);
    const result = stmt.get(receiverId); // Use stmt.get() para consultas que retornam uma única linha

    return result ? result.unreadCount : 0; // Retorna a contagem ou 0 se não houver resultado
  } catch (error) {
    console.error('Erro ao obter a contagem de mensagens não lidas para o receptor:', error);
    throw error;
  }
}


export default defineEventHandler(async (event) => {
  const messageId = getRouterParam(event, 'id');
  const db = getDatabase(event.context.params.domain);

  try {
    const statement = db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?');
    const info = statement.run(messageId);
  
	  const {user} = await requireUserSession(event);

    console.log("messageId::::::", messageId)
    console.log("user::::::", user)
    console.log("info::::::", info);
    
    if (info.changes > 0) {

      const unreadCount = await getUnreadMessagesCountFromDatabase(db, user.id);
      // Envie a nova contagem para todos os clientes WebSocket conectados
      console.log("unreadCount::::::", unreadCount)
      wss.clients.forEach(client => {
        // console.log("client::::::", client)
        if (client.readyState === 1) {
          console.log("::::::::::::::::::::::::::::::")
          console.log("::::::::::::::::::::::::::::::")
          console.log("::::::::::::::::::::::::::::::")
          console.log("::::::::::::::::::::::::::::::")
          console.log("::::::::::::::::::::::::::::::")
          console.log("::::::::::::::::::::::::::::::")
          console.log("::::::::::::::::::::::::::::::")
          console.log("::::::::::::::::::::::::::::::")
          console.log("::::::::::::::::::::::::::::::")
          console.log("::::::::::::::::::::::::::::::")
          client.send(JSON.stringify({ type: 'unreadCountUpdated', unreadCount: unreadCount }));
        }
      });
      return { message: `Message with ID ${messageId} marked as read.` };
    } else {
      // ... (tratamento de erro)
    }
  } catch (error) {
    // ... (tratamento de erro)
  } finally {
    db.close();
  }
});

