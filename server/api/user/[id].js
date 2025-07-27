import Database from "better-sqlite3";
import path from "node:path";
// Define o caminho para o seu arquivo de banco de dados.
// O caminho é relativo à raiz do seu projeto.

/**
 * Define o manipulador de eventos da API para buscar um usuário por ID.
 * @param {object} event - O objeto de evento do H3 (framework de servidor do Nuxt).
 */
export default defineEventHandler(async event => {
  const {user} = await requireUserSession(event);

  const dbPath = path.join(process.cwd(), "server", "data", `${user.domain}.db`);
  const db = new Database(dbPath);
  // Pega o 'id' dos parâmetros da rota (do nome do arquivo [id].js).
  
  
  let userId = getRouterParam(event, "id");
  let username = null
  let userData = null

 if (!userId) {
    setResponseStatus(event, 400); // Bad Request
    return {error: "O ID do usuário é obrigatório."};
  }

  if (userId == 'me') {
    userId = user.id; // Se o ID for 'me', usamos o ID do usuário autenticado.
  }

   if (userId == 'all') {
    userId = 0; // Se o ID for 'me', usamos o ID do usuário autenticado.
  } 
  
  if (String(userId).startsWith('username:')) {
    username = userId.split(':')[1]; // Se o ID for 'me', usamos o ID do usuário autenticado.
  }
  // Validação básica para garantir que o ID foi fornecido.
 

  console.log(`Buscando usuário com ID: ${userId} no domínio: ${user.domain}`);
  console.log(`Buscando usuário com username: ${username} no domínio: ${user.domain}`);
  
  try {
    // Prepara a consulta SQL para evitar SQL Injection.
    // **IMPORTANTE**: Selecionamos explicitamente os campos que queremos retornar,
    // excluindo dados sensíveis como 'password' e tokens.
    if (username) {
      const stmt = db.prepare(`SELECT id, username, name, email, phone, description, status FROM users WHERE username = ?`);
      // Executa a consulta com o nome de usuário fornecido.
      userData = stmt.get(username);
    }else{
      const stmt = db.prepare(`SELECT id, username, name, email, phone, description, status FROM users WHERE (? = 0 OR id = ?)`);
      userData = stmt.all(userId, userId);
    }
    // Se nenhum usuário for encontrado, 'user' será undefined.
    if (!userData) {
      setResponseStatus(event, 404); // Not Found
      return {error: "Usuário não encontrado."};
    }

    // Se o usuário for encontrado, retorna os dados como JSON com status 200 (OK).
    return userData;
  } catch (error) {
    // Log do erro no console do servidor para depuração.
    console.error("Erro ao buscar usuário no banco de dados:", error);

    // Retorna uma resposta de erro genérica para o cliente.
    setResponseStatus(event, 500); // Internal Server Error
    return {error: "Ocorreu um erro ao processar sua solicitação."};
  }
});
