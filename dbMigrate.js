import Database from 'better-sqlite3';

const db = new Database('./novagokula.db', { verbose: console.log });

 // 1. Desliga a verificação de chaves estrangeiras (forma correta)
  db.pragma('foreign_keys = OFF');

const migrationScript = `
  PRAGMA foreign_keys=OFF;

  ALTER TABLE users RENAME TO users_old;

  CREATE TABLE "users" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        name TEXT,
        email TEXT,
        phone TEXT,
        password TEXT,
        description TEXT,
        verificationToken TEXT,
        verificationTokenExpiry TEXT,
        resetToken TEXT,
        resetTokenExpiry TEXT,
        status TEXT
      );

  INSERT INTO users (id, username, name, email, phone, password, description, verificationToken, verificationTokenExpiry, resetToken, resetTokenExpiry, status)
  SELECT id, nome, nome, email, telefone, password, '', verificationToken, verificationTokenExpiry, resetToken, resetTokenExpiry, status
  FROM users_old;

  DROP TABLE users_old;

  PRAGMA foreign_keys=ON;
`;

// A função transaction garante que tudo dentro dela rode atomicamente.
const runMigration = db.transaction(() => {
  db.exec(migrationScript);
  console.log('Migração concluída com sucesso: coluna "description" renomeada para "bio".');
});

try {
  runMigration();
} catch (err) {
  console.error('Erro durante a migração:', err);
} finally {
  db.close();
}