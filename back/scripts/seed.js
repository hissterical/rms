import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';

async function runSeed() {
  const sqlPath = path.resolve('seeds', 'seed.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  const client = await pool.connect();
  try {
    console.log('Starting seed...');

    // Simple existence check for a key table
    const check = await client.query(`
      SELECT to_regclass('public.rooms') as rooms_table
    `);

    if (!check.rows[0] || !check.rows[0].rooms_table) {
      console.error('Database tables not found. Have you run migrations?');
      console.error('Run your migration tool or execute the SQL in back/migrations first.');
      return;
    }

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Seeding completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error running seed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

runSeed().catch((err) => {
  console.error('Unexpected error during seeding:', err);
  pool.end();
  process.exit(1);
});
