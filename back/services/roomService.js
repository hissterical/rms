import pool from "../config/db.js";

// Get all rooms for a property
export async function getAllRoomsService(propertyId) {
  const query = `
    SELECT 
      r.id,
      r.room_number,
      r.floor,
      r.status,
      r.booking_id,
      rt.room_type_name,
      rt.capacity,
      rt.price,
      rt.description as room_type_description,
      b.start_date,
      b.end_date,
      b.status as booking_status,
      u.first_name as guest_first_name,
      u.last_name as guest_last_name,
      u.email as guest_email,
      u.phone as guest_phone
    FROM rooms r
    LEFT JOIN room_types rt ON r.room_type_id = rt.id
    LEFT JOIN bookings b ON r.booking_id = b.id
    LEFT JOIN users u ON b.user_id = u.id
    WHERE r.property_id = $1
    ORDER BY r.floor, r.room_number;
  `;

  try {
    const result = await pool.query(query, [propertyId]);
    return result.rows;
  } catch (err) {
    console.error("Error getting all rooms:", err);
    throw err;
  }
}

// Get single room by ID
export async function getRoomByIdService(roomId) {
  const query = `
    SELECT 
      r.*,
      rt.room_type_name,
      rt.capacity,
      rt.price,
      rt.description as room_type_description,
      b.start_date,
      b.end_date,
      b.status as booking_status,
      u.first_name as guest_first_name,
      u.last_name as guest_last_name,
      u.email as guest_email,
      u.phone as guest_phone
    FROM rooms r
    LEFT JOIN room_types rt ON r.room_type_id = rt.id
    LEFT JOIN bookings b ON r.booking_id = b.id
    LEFT JOIN users u ON b.user_id = u.id
    WHERE r.id = $1;
  `;

  try {
    const result = await pool.query(query, [roomId]);
    return result.rows[0];
  } catch (err) {
    console.error("Error getting room by ID:", err);
    throw err;
  }
}

// Create new room
export async function createRoomService(data) {
  const { property_id, room_type_id, room_number, floor, status } = data;

  const query = `
    INSERT INTO rooms (property_id, room_type_id, room_number, floor, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [
    property_id,
    room_type_id || null,
    room_number,
    floor || null,
    status || "available",
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error("Error creating room:", err);
    throw err;
  }
}

// Update room
export async function updateRoomService(roomId, data) {
  const { room_type_id, room_number, floor, status, booking_id } = data;

  const query = `
    UPDATE rooms
    SET 
      room_type_id = COALESCE($1, room_type_id),
      room_number = COALESCE($2, room_number),
      floor = COALESCE($3, floor),
      status = COALESCE($4, status),
      booking_id = COALESCE($5, booking_id)
    WHERE id = $6
    RETURNING *;
  `;

  const values = [room_type_id, room_number, floor, status, booking_id, roomId];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error("Error updating room:", err);
    throw err;
  }
}

// Delete room
export async function deleteRoomService(roomId) {
  const query = `DELETE FROM rooms WHERE id = $1 RETURNING *;`;

  try {
    const result = await pool.query(query, [roomId]);
    return result.rows[0];
  } catch (err) {
    console.error("Error deleting room:", err);
    throw err;
  }
}

// Update room status only
export async function updateRoomStatusService(roomId, status) {
  const query = `
    UPDATE rooms
    SET status = $1
    WHERE id = $2
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [status, roomId]);
    return result.rows[0];
  } catch (err) {
    console.error("Error updating room status:", err);
    throw err;
  }
}

// Get available rooms for date range
export async function getAvailableRoomsService(propertyId, startDate, endDate) {
  const query = `
    SELECT 
      r.id,
      r.room_number,
      r.floor,
      r.status,
      rt.room_type_name,
      rt.capacity,
      rt.price,
      rt.description
    FROM rooms r
    LEFT JOIN room_types rt ON r.room_type_id = rt.id
    WHERE r.property_id = $1
    AND r.status = 'available'
    AND r.id NOT IN (
      SELECT room_id FROM bookings
      WHERE daterange(start_date, end_date, '[]') && daterange($2, $3, '[]')
      AND status NOT IN ('cancelled', 'checked_out')
    )
    ORDER BY r.floor, r.room_number;
  `;

  try {
    const result = await pool.query(query, [propertyId, startDate, endDate]);
    return result.rows;
  } catch (err) {
    console.error("Error getting available rooms:", err);
    throw err;
  }
}

// Bulk create rooms (useful for initial setup)
export async function bulkCreateRoomsService(propertyId, roomsData) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const createdRooms = [];

    for (const room of roomsData) {
      const query = `
        INSERT INTO rooms (property_id, room_type_id, room_number, floor, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;

      const values = [
        propertyId,
        room.room_type_id || null,
        room.room_number,
        room.floor || null,
        room.status || "available",
      ];

      const result = await client.query(query, values);
      createdRooms.push(result.rows[0]);
    }

    await client.query("COMMIT");
    return createdRooms;
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error bulk creating rooms:", err);
    throw err;
  } finally {
    client.release();
  }
}

// Find a room row by property and room number (or just room number if propertyId is null)
export async function getRoomByNumberService(propertyId, roomNumber) {
  try {
    let result;
    if (propertyId) {
      const query = `SELECT * FROM rooms WHERE property_id = $1 AND room_number = $2 LIMIT 1`;
      result = await pool.query(query, [propertyId, roomNumber]);
    } else {
      const query = `SELECT * FROM rooms WHERE room_number = $1 LIMIT 1`;
      result = await pool.query(query, [roomNumber]);
    }
    return result.rows[0] || null;
  } catch (err) {
    console.error("Error finding room by number:", err);
    throw err;
  }
}
