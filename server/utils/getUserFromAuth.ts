// server/utils/getUserFromAuth.ts
import jwt from 'jsonwebtoken';
import { H3Event, getCookie } from 'h3';

export function getUserFromAuth(event: H3Event) {
  const authToken = getCookie(event, 'auth_token');
  if (!authToken) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const decoded = jwt.verify(authToken, 'chave_secreta');
  return decoded;
}
