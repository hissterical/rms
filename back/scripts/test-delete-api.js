async function testDeleteAPI() {
  const API_URL = 'http://localhost:5000/api';
  
  try {
    console.log('=== Testing DELETE Room API ===\n');
    
    // First, get all rooms
    console.log('1. Fetching rooms...');
    const roomsResponse = await fetch(`${API_URL}/rooms?property_id=c77219bf-d16f-4860-9506-d1b5e64e7902`);
    const rooms = await roomsResponse.json();
    console.log(`Found ${rooms.length} rooms`);
    
    if (rooms.length === 0) {
      console.log('No rooms to test deletion');
      return;
    }
    
    const testRoom = rooms[0];
    console.log(`\n2. Testing deletion of room: ${testRoom.room_number} (ID: ${testRoom.id})`);
    
    // Try to delete
    const deleteResponse = await fetch(`${API_URL}/rooms/${testRoom.id}`, {
      method: 'DELETE'
    });
    
    console.log(`   Status: ${deleteResponse.status} ${deleteResponse.statusText}`);
    
    if (!deleteResponse.ok) {
      const error = await deleteResponse.json();
      console.log(`   Error:`, error);
    } else {
      const result = await deleteResponse.json();
      console.log(`   Success:`, result.message);
      
      // Try to restore the room
      console.log(`\n3. Restoring room...`);
      const createResponse = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          property_id: testRoom.property_id,
          room_type_id: testRoom.room_type_id,
          room_number: testRoom.room_number,
          floor: testRoom.floor,
          status: 'available'
        })
      });
      
      if (createResponse.ok) {
        console.log(`   ✓ Room restored`);
      } else {
        const error = await createResponse.json();
        console.log(`   ✗ Failed to restore:`, error);
      }
    }
    
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
}

testDeleteAPI();
