import pool from '../config/db.js';

async function getPropertyId() {
  try {
    const result = await pool.query('SELECT id, name FROM properties LIMIT 1');
    if (result.rows.length > 0) {
      console.log('Property found:');
      console.log('ID:', result.rows[0].id);
      console.log('Name:', result.rows[0].name);
    } else {
      console.log('No properties found in database');
    }
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

getPropertyId();
