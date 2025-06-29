import Database from 'better-sqlite3';
import path from 'path';



// Define the API Event Handler for fetching role-specific notices
export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)

    const dbPath = path.join(process.cwd(), 'server', 'data', `${user.domain}.db`);
    const db = new Database(dbPath);


    // Get roles from the query string, e.g., /api/notices?roles=admin&roles=editor
    const query = getQuery(event);
    let userRoles = query.roles;

    // Ensure userRoles is an array, as a single role comes as a string
    if (!userRoles || userRoles.length === 0) {
        return []; // No roles provided, return no notices
    }
    if (!Array.isArray(userRoles)) {
        userRoles = [userRoles];
    }

    // Create dynamic placeholders for the IN clause to prevent SQL injection
    const placeholders = userRoles.map(() => '?').join(',');

    const sql = `
        SELECT DISTINCT
            n.id,
            n.content,
            n.created_at,
            n.user as authorName
        FROM
            notices n
        JOIN 
            notice_roles nr ON n.id = nr.notice_id
        JOIN
            roles r ON nr.role_id = r.id
        LEFT JOIN
            users u ON n.user = u.id
        WHERE
            r.id IN (${placeholders})
        ORDER BY
            n.created_at DESC
        LIMIT 10;
    `;

    console.log(`Executing SQL: ${sql} with roles: ${userRoles}`);
    

    try {
        const stmt = db.prepare(sql);
        // Pass the roles array directly to the execute function
        const notices = stmt.all(...userRoles);
        
        // Format the date for better presentation
        return notices.map(notice => ({
            ...notice,
            createdAt: new Date(notice.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            })
        }));
    } catch (error) {
        console.error('Database query for notices failed:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error: Could not fetch notices',
        });
    }
});
