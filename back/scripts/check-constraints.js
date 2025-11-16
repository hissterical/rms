import pool from '../config/db.js';

async function checkConstraints() {
  try {
    console.log('Checking foreign key constraints...\n');
    
    // Check constraints referencing rooms table
    const constraintsQuery = `
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name, 
        ccu.column_name AS foreign_column_name, 
        rc.delete_rule
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu 
        ON tc.constraint_name = kcu.constraint_name 
        AND tc.table_schema = kcu.table_schema 
      JOIN information_schema.constraint_column_usage AS ccu 
        ON ccu.constraint_name = tc.constraint_name 
        AND ccu.table_schema = tc.table_schema 
      JOIN information_schema.referential_constraints AS rc 
        ON rc.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND (tc.table_name='rooms' OR ccu.table_name='rooms')
      ORDER BY tc.table_name, kcu.column_name;
    `;
    
    const constraints = await pool.query(constraintsQuery);
    console.log('Foreign Key Constraints:', JSON.stringify(constraints.rows, null, 2));
    
    // Check if there are any bookings referencing rooms
    console.log('\n\nChecking bookings table...');
    const bookingsCount = await pool.query('SELECT COUNT(*) as count FROM bookings');
    console.log('Total bookings:', bookingsCount.rows[0].count);
    
    // Check rooms table
    console.log('\n\nChecking rooms table...');
    const roomsCount = await pool.query('SELECT COUNT(*) as count FROM rooms');
    console.log('Total rooms:', roomsCount.rows[0].count);
    
    // Sample room with its relationships
    const sampleRoom = await pool.query(`
      SELECT 
        r.id,
        r.room_number,
        r.status,
        r.booking_id,
        b.id as booking_exists
      FROM rooms r
      LEFT JOIN bookings b ON r.booking_id = b.id
      LIMIT 1
    `);
    console.log('\n\nSample room:', JSON.stringify(sampleRoom.rows[0], null, 2));
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkConstraints();
