import Database from 'better-sqlite3';
import path from 'node:path';

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event);
    console.log('user:', user);
    
    if (!user?.id || !user?.domain) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const dbPath = path.join(process.cwd(), 'server', 'data', `${user.domain}.db`);
    const db = new Database(dbPath);
    
    const body = await readBody(event);
    const { content, roleIds } = body;

    // Basic validation
    if (!Array.isArray(roleIds) || roleIds.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing required fields.' });
    }

    // Use a transaction to ensure both inserts succeed or fail together.
    const insertNoticeTx = db.transaction(() => {
        const noticeStmt = db.prepare(`
            INSERT INTO notices (content, user) VALUES (?, ?)
        `);
        const result = noticeStmt.run(content, user.id);
        const noticeId = result.lastInsertRowid;

        const roleStmt = db.prepare(`
            INSERT INTO notice_roles (notice_id, role_id) VALUES (?, ?)
        `);
        for (const roleId of roleIds) {
            roleStmt.run(noticeId, roleId);
        }
        return { id: noticeId };
    });

    try {
        const newNotice = insertNoticeTx();
        return { success: true, noticeId: newNotice.id };
    } catch (error) {
        console.error('Failed to create notice:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
        });
    }   
});
