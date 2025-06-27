import Database from 'better-sqlite3';
import path from 'path';


// --- One-time Database Setup and Seeding Logic ---
// This block runs once when the server starts.


// --- Define the API Event Handler ---
export default defineEventHandler(async (event) => { // Get the userId from the query string: /api/navigation?userId=1
	
    const {user} = await requireUserSession(event)
    const domain = user.domain;
    const db = getDatabase(domain);
    
    const query = getQuery(event);
	const userId = query.userId;

	if (! userId) {
		throw createError({statusCode: 400, statusMessage: 'Bad Request: userId query parameter is required'});
	}

	// CORRECTED: The placeholder for prepared statements in better-sqlite3 is '?'
	const sql = `
        SELECT DISTINCT
            p.page as href
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN page_roles pr ON ur.role_id = pr.role_id
        JOIN pages p ON pr.page_id = p.id
        WHERE u.id = ?
        ORDER BY p.id;
    `;

	try {
		const stmt = db.prepare(sql);
		const pages = stmt.all(userId);
		return pages;
	} catch (error) {
		console.error('Database query failed:', error);
		throw createError({statusCode: 500, statusMessage: 'Internal Server Error: Could not fetch navigation data'});
	}
});
