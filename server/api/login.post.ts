// Save this file as `server/api/login.post.ts`

import Database from 'better-sqlite3';
import path from 'node:path';
import { z } from 'zod';

const bodySchema = z.object({
  domain: z.string().min(1, { message: 'Domain is required' }),
  email: z.string().min(1, { message: 'Email or username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export default defineEventHandler(async (event) => {
  try {
    const { domain, email, password } = await readValidatedBody(event, bodySchema.parse);

    const dbPath = path.join(process.cwd(), 'server', 'data', `${domain}.db`);
    let db;

    try {
        db = new Database(dbPath, { fileMustExist: true });
    } catch (dbError) {
        throw createError({ statusCode: 401, message: 'Bad credentials' });
    }

    // Find the user first
    const userStmt = db.prepare('SELECT id, name, username, email FROM users WHERE (email = ? OR username = ?) AND password = ?');
    const user = userStmt.get(email, email, password);

    if (!user) {
      db.close();
      throw createError({ statusCode: 401, message: 'Bad credentials' });
    }

    // --- NEW: Fetch user roles ---
    const rolesStmt = db.prepare(`
        SELECT r.name 
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ?
    `);
    const userRolesResult = rolesStmt.all(user.id) as { name: string }[];
    const roles = userRolesResult.map(row => row.name);
    // --- End of new logic ---

    db.close();

    // Set the user session, now including their roles
    await setUserSession(event, {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        domain: domain,
        roles: roles // Add the roles array to the session
      }
    });
      
    return { message: 'Login successful' };

  } catch (error) {
    if (error.statusCode === 401) {
      throw error;
    }
    console.error('An unexpected error occurred during login:', error);
    throw createError({
      statusCode: 400,
      message: 'Invalid request. Please check your inputs.',
    });
  }
});
