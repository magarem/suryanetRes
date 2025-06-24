// server/utils/db.js
import Database from 'better-sqlite3';
import { join } from 'path';
import { stat } from 'node:fs/promises';

export async function databaseExists(domain) {
  console.log(`[databaseExists] domain: ${domain}`);
  const dbPath = join(process.cwd(), 'server/data', `${domain}.db`);
  try {
    const stats = await stat(dbPath);
    return stats.isFile();
  } catch (error) {
    return false; // File doesn't exist or other error
  }
}

export function getDatabase(domain) {
  console.log(`[getDatabase] domain: ${domain}`);

  const dbPath = join(process.cwd(), 'server/data', `${domain}.db`);
  try {
    return new Database(dbPath, { fileMustExist: true });
  } catch (error) {
    console.error(`[getDatabase] Error opening database for domain ${domain}:`, error.message);
    return null; // Or throw an error, depending on your error handling strategy
  }
}