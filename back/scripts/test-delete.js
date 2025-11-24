import pool from '../config/db.js';

async function testDelete() {
  try {
    console.log('Testing room deletion...\n');
    
    // Get a room to delete
    const roomResult = await pool.query('SELECT id, room_number FROM rooms LIMIT 1');
    
    if (roomResult.rows.length === 0) {
      console.log('No rooms found to test deletion');
      await pool.end();
      return;
    }
    
    const roomToDelete = roomResult.rows[0];
    console.log('Attempting to delete room:', roomToDelete);
    
    try {
      const deleteResult = await pool.query('DELETE FROM rooms WHERE id = $1 RETURNING *', [roomToDelete.id]);
      console.log('Delete successful!');
      console.log('Deleted room:', deleteResult.rows[0]);
      
      // Restore the room for future tests
      console.log('\nRestoring room...');
      await pool.query(
        'INSERT INTO rooms (id, property_id, room_number, status) SELECT $1, property_id, $2, $3 FROM properties LIMIT 1',
        [roomToDelete.id, roomToDelete.room_number, 'available']
      );
      console.log('Room restored');
    } catch (deleteError) {
      console.error('Delete failed with error:');
      console.error('Code:', deleteError.code);
      console.error('Message:', deleteError.message);
      console.error('Detail:', deleteError.detail);
      console.error('Hint:', deleteError.hint);
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testDelete();
