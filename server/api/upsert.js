import { getDatabase } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const body = await readBody(event);
  const { table, data, condition } = body;


  console.log('body', body);
  console.log('table', table);
  console.log('data', data);
  console.log('condition', condition);
  
  const domain = user.domain;
  const db = getDatabase(domain);

  if (!table || !data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Table and data are required',
    });
  }

  const keys = Object.keys(data);
  // const values = Object.values(data);
  const values = keys.map((key) => {
    const value = data[key];
    if (Array.isArray(value)) {
      return JSON.stringify(value); // Serialize arrays
    }
    return value;
  });

  // const values_to_zero = keys.map((key) => {
  //   const value = data[key];
  //   if (Array.isArray(value)) {
  //     return ''; // Serialize arrays
  //   }
  //   return value;
  // });
  const placeholders = keys.map(() => '?').join(', ');

  try {
    if (condition) {
      // Upsert: tente atualizar, senão insira
      // const setClause = keys.map((key) => `${key} = ?`).join(', ');
      // console.log(`UPDATE ${table} SET ${setClause} WHERE ${condition}`);
      // console.log('[...values_to_zero]', [...values_to_zero]);
      // const updateStmt = db.prepare(`UPDATE ${table} SET ${setClause} WHERE ${condition}`);
      // const updateResult = updateStmt.run([...values_to_zero]);


      const setClause = keys.map((key) => `${key} = ?`).join(', ');
      console.log(`UPDATE ${table} SET ${setClause} WHERE ${condition}`);
      console.log([...values]);
      const updateStmt = db.prepare(`UPDATE ${table} SET ${setClause} WHERE ${condition}`);
      const updateResult = updateStmt.run([...values]);


      if (updateResult.changes === 0) {
        // Nenhuma linha foi atualizada, então insira
        const insertStmt = db.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`);
        const insertResult = insertStmt.run([...values]);
        return { message: 'Row inserted', result: insertResult };
      }

      return { success: true, message: 'Row updated', result: updateResult };
    } else {
      // Inserir diretamente (sem condição)
      console.log(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`);
      console.log([...values]);
      
      const insertStmt = db.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`);
      const insertResult = insertStmt.run([...values]);
      return { message: 'Row inserted', result: insertResult };
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});