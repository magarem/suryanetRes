// server/api/users/index.get.js
import { getDatabase } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    const {user} = await requireUserSession(event);
    const domain = user.domain;
    const db = getDatabase(domain); // Replace 'your_domain'

    const usersData = db.prepare('SELECT * FROM users').all();

    db.close();

    return usersData;
  } catch (error) {
    console.error('Error fetching users:', error);
    return { error: 'Failed to fetch users.' };
  }
});