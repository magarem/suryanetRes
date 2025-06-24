// server/utils/auth.ts
import { getCookie } from 'h3';
import jwt from 'jsonwebtoken';
import { getDatabase } from '~/server/utils/db';

const SECRET_KEY = "chave_secreta";

export function getUserFromEvent(event) {
    const token = getCookie(event, 'auth_token');

    if (!token) {
        throw new Error('Token not found');
    }

    const data = jwt.verify(token, SECRET_KEY);

    const domain = data.domain;
    const db = getDatabase(domain);

     // Convert string "1,2,3" to array of integers
    const userRoleIds = data.roles.split(',').map(id => parseInt(id.trim()));

    if (userRoleIds.length === 0) {
        return { success: true, user: { ...data, allowedPages: [] } };
    }

     // Build placeholders for the SQL query
    const placeholders = userRoleIds.map(() => '?').join(',');

    // Query to get pages allowed for the user's roles
    const stmt = db.prepare(`
        SELECT DISTINCT p.page
        FROM pages p
        JOIN page_roles pr ON p.id = pr.page_id
        WHERE pr.role_id IN (${placeholders})
    `);

    const pages = stmt.all(...userRoleIds).map(row => row.page);

    return { success: true, user: { ...data, allowedPages: pages } };

}
