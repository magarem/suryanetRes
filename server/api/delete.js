
import { getDatabase } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { table, condition } = body;

  const domain = event.context.params.domain;
  const db = getDatabase(domain);

  if (!table || !condition) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Table and condition are required',
    });
  }

  try {
    const stmt = db.prepare(`DELETE FROM ${table} WHERE ${condition}`);
    const result = stmt.run();

    return { message: 'Row deleted', result };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});