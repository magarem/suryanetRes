// server/utils/websocket-server.js
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3002 }); // Use a porta que você configurou para o WebSocket

wss.on('connection', ws => {
  console.log('Cliente conectado ao WebSocket (server/utils/websocket-server.js)');

  ws.on('message', message => {
    console.log('Mensagem recebida:', message.toString());
    // Lógica para broadcast da mensagem (opcionalmente mova isso para outro módulo)
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === 1) {
        client.send(JSON.stringify({ message: `Outro cliente disse: ${message.toString()}` }));
      }
    });
  });

  ws.on('close', () => {
    console.log('Cliente desconectado do WebSocket (server/utils/websocket-server.js)');
  });

  ws.on('error', error => {
    console.error('Erro no WebSocket (server/utils/websocket-server.js):', error);
  });
});

// Exporte a instância do WebSocketServer
export { wss };