import { getDatabase } from '~/server/utils/db';

async function getUnreadCountForReceiverd(db, receiverId) {
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
  const domain = event.context.params.domain;
  const db = getDatabase(domain); 

  // Repassar o cookie manualmente
  const authToken = getCookie(event, 'auth_token');

  const {user} = await requireUserSession(event);

  console.log("user::::::", user)

  const ret = await getUnreadCountForReceiverd(db, user.id);
  return ret;
});
