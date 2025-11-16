import pool from '../config/db.js';

async function testAPIDelete() {
  try {
    console.log('Testing DELETE endpoint simulation...\n');
    
    // Get a room
    const roomResult = await pool.query('SELECT id, room_number, property_id FROM rooms LIMIT 1');
    
    if (roomResult.rows.length === 0) {
      console.log('No rooms found');
      await pool.end();
      return;
    }
    
    const testRoom = roomResult.rows[0];
    console.log('Test room:', testRoom);
    
    // Test 1: Valid UUID deletion
    console.log('\n=== Test 1: Delete with valid UUID ===');
    const deleteResult = await pool.query('DELETE FROM rooms WHERE id = $1 RETURNING *', [testRoom.id]);
    if (deleteResult.rows.length > 0) {
      console.log('✓ Deletion successful with UUID');
      
      // Restore
      await pool.query(
        'INSERT INTO rooms (id, property_id, room_number, floor, status) VALUES ($1, $2, $3, $4, $5)',
        [testRoom.id, testRoom.property_id, testRoom.room_number, 2, 'available']
      );
      console.log('✓ Room restored');
    }
    
    // Test 2: Check if property_id is required for getRoomByNumberService
    console.log('\n=== Test 2: Check room number lookup ===');
    const lookupResult = await pool.query(
      'SELECT * FROM rooms WHERE room_number = $1 AND property_id = $2',
      [testRoom.room_number, testRoom.property_id]
    );
    console.log('Lookup by room_number + property_id:', lookupResult.rows.length > 0 ? '✓ Found' : '✗ Not found');
    
    const lookupResult2 = await pool.query(
      'SELECT * FROM rooms WHERE room_number = $1',
      [testRoom.room_number]
    );
    console.log('Lookup by room_number only:', lookupResult2.rows.length > 0 ? '✓ Found' : '✗ Not found');
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testAPIDelete();
