// Create this file at: server/api/page-roles.get.ts

import Database from 'better-sqlite3';
import path from 'node:path';

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const query = getQuery(event);
    const pagePath = query.path as string;
    const domain = user?.domain as string;

    if (!pagePath || !domain) {
        return []; // Return no roles if path or domain is missing
    }
    
    let db;
    try {
        const dbPath = path.join(process.cwd(), 'server', 'data', `${domain}.db`);
        db = new Database(dbPath, { fileMustExist: true, readonly: true });

        const stmt = db.prepare(`
            SELECT r.name 
            FROM page_roles pr
            JOIN pages p ON pr.page_id = p.id
            JOIN roles r ON pr.role_id = r.id
            WHERE p.page = ?
        `);
        
        const requiredRolesResult = stmt.all(pagePath) as { name: string }[];
        db.close();
        return requiredRolesResult.map(row => row.name);
    } catch (error) {
        console.error(`Could not get page roles for ${pagePath}:`, error);
        if (db) db.close();
        return []; // Return empty array on error
    }
});