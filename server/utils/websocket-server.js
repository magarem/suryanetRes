// server/utils/websocket-server.js
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3002 });
const clients = new Map(); // Mapeia userId -> ws

wss.on('connection', ws => {
  let currentUserId = null;

  console.log('Cliente conectado ao WebSocket');

  ws.on('message', raw => {
    let msg;
    try {
      msg = JSON.parse(raw);
      console.log('Mensagem recebida via WebSocket:', msg);
    } catch (err) {
      console.error('Erro ao interpretar mensagem JSON:', err);
      return;
    }

    // Identificação do usuário
    if (msg.type === 'identify') {
      currentUserId = msg.userId;
      clients.set(currentUserId, ws);
      console.log(`Usuário identificado como: ${currentUserId}`);
      return;
    }

    // Enviar mensagem
    if (msg.type === 'chat:sendMessage') {
      const { to, body } = msg;

      const payload = {
        type: 'chat:newMessage',
        from: currentUserId,
        to,
        body
      };

      // Envia ao destinatário (se conectado)
      if (clients.has(to)) {
        clients.get(to).send(JSON.stringify(payload));
      }

      // Também envia de volta ao remetente (para confirmação no frontend)
      if (clients.has(currentUserId)) {
        clients.get(currentUserId).send(JSON.stringify(payload));
      }

      // Aqui você pode salvar no banco, se quiser
    }
  });

  ws.on('close', () => {
    if (currentUserId) {
      clients.delete(currentUserId);
    }
    console.log(`Cliente desconectado (${currentUserId})`);
  });

  ws.on('error', error => {
    console.error('Erro no WebSocket:', error);
  });
});

export { wss };
