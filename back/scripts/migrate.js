import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';

async function runMigrations() {
  const migrationsDir = path.resolve('migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  if (files.length === 0) {
    console.log('No migration files found in migrations/');
    return;
  }

  const client = await pool.connect();
  try {
    console.log('Running migrations:', files);
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      console.log(`Executing ${file} ...`);
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`Applied ${file}`);
    }
    console.log('Migrations completed');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

runMigrations().catch((err) => {
  console.error('Unexpected migration error:', err);
  pool.end();
  process.exit(1);
});
