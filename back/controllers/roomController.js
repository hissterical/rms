import {
  getAllRoomsService,
  getRoomByIdService,
  createRoomService,
  updateRoomService,
  deleteRoomService,
  updateRoomStatusService,
  getAvailableRoomsService,
  bulkCreateRoomsService,
  getRoomByNumberService,
} from "../services/roomService.js";

// Simple UUID v4 validation
const isUUID = (str) => {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

// Get all rooms
export async function getAllRooms(req, res) {
  try {
    const { property_id } = req.query;

    if (!property_id) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    if (!isUUID(property_id)) {
      return res.status(400).json({ 
        message: "Invalid property ID format. Must be a valid UUID.",
        provided: property_id,
        example: "c77219bf-d16f-4860-9506-d1b5e64e7902"
      });
    }

    const rooms = await getAllRoomsService(property_id);
    res.status(200).json(rooms);
  } catch (err) {
    console.error("Error in getAllRooms controller:", err);
    res.status(500).json({ message: "Failed to fetch rooms", error: err.message });
  }
}

// Get room by ID
export async function getRoomById(req, res) {
  try {
    const { id } = req.params;

    if (!isUUID(id)) {
      return res.status(400).json({ message: 'Invalid room id' });
    }

    const room = await getRoomByIdService(id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json(room);
  } catch (err) {
    console.error("Error in getRoomById controller:", err);
    res.status(500).json({ message: "Failed to fetch room" });
  }
}

// Create new room
export async function createRoom(req, res) {
  try {
    const { property_id, room_type_id, room_number, floor, status } = req.body;

    if (!property_id || !room_number) {
      return res
        .status(400)
        .json({ message: "Property ID and room number are required" });
    }

    if (!isUUID(property_id)) {
      return res.status(400).json({ 
        message: "Invalid property ID format. Must be a valid UUID.",
        provided: property_id,
        example: "c77219bf-d16f-4860-9506-d1b5e64e7902"
      });
    }

    if (room_type_id && !isUUID(room_type_id)) {
      return res.status(400).json({ 
        message: "Invalid room type ID format. Must be a valid UUID or null."
      });
    }

    const roomData = {
      property_id,
      room_type_id,
      room_number,
      floor,
      status,
    };

    const newRoom = await createRoomService(roomData);
    res.status(201).json(newRoom);
  } catch (err) {
    console.error("Error in createRoom controller:", err);
    if (err.code === "23505") {
      // Unique constraint violation
      res
        .status(409)
        .json({ message: "Room number already exists for this property" });
    } else if (err.code === "23503") {
      // Foreign key constraint violation
      res.status(400).json({ 
        message: "Invalid property_id or room_type_id. The referenced entity does not exist.",
        error: err.detail
      });
    } else {
      res.status(500).json({ message: "Failed to create room", error: err.message });
    }
  }
}

// Update room
export async function updateRoom(req, res) {
  try {
    const { id } = req.params;
    let roomId = id;
    // Accept user-friendly room numbers like 'room-102' or '102' and resolve to UUID
    if (!isUUID(id)) {
      // try to extract numeric portion
      const numeric = id.replace(/[^0-9]/g, '');
      if (!numeric) return res.status(400).json({ message: 'Invalid room id' });
      const found = await getRoomByNumberService(req.query.property_id || null, numeric);
      if (!found) return res.status(404).json({ message: 'Room not found' });
      roomId = found.id;
    }
  const { room_type_id, room_number, floor, status, booking_id } = req.body;

  console.log(`updateRoom: incoming id=${id}, resolved roomId=${roomId}`);

    const roomData = {
      room_type_id,
      room_number,
      floor,
      status,
      booking_id,
    };

  const updatedRoom = await updateRoomService(roomId, roomData);

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json(updatedRoom);
  } catch (err) {
    console.error("Error in updateRoom controller:", err);
    res.status(500).json({ message: "Failed to update room" });
  }
}

// Delete room
export async function deleteRoom(req, res) {
  try {
    const { id } = req.params;
  let roomId = id;
    if (!isUUID(id)) {
      const numeric = id.replace(/[^0-9]/g, '');
      if (!numeric) return res.status(400).json({ message: 'Invalid room id' });
      const found = await getRoomByNumberService(req.query.property_id || null, numeric);
      if (!found) return res.status(404).json({ message: 'Room not found' });
      roomId = found.id;
    }

    const deletedRoom = await deleteRoomService(roomId);

    if (!deletedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({ message: "Room deleted successfully", room: deletedRoom });
  } catch (err) {
    console.error("Error in deleteRoom controller:", err);
    res.status(500).json({ message: "Failed to delete room" });
  }
}

// Update room status
export async function updateRoomStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    let roomId = id;
    if (!isUUID(id)) {
      const numeric = id.replace(/[^0-9]/g, '');
      if (!numeric) return res.status(400).json({ message: 'Invalid room id' });
      const found = await getRoomByNumberService(req.query.property_id || null, numeric);
      if (!found) return res.status(404).json({ message: 'Room not found' });
      roomId = found.id;
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    console.log(`updateRoomStatus: incoming id=${id}, resolved roomId=${roomId}, status=${status}`);

    const validStatuses = ["available", "reserved", "occupied", "maintenance"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

  const updatedRoom = await updateRoomStatusService(roomId, status);

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json(updatedRoom);
  } catch (err) {
    console.error("Error in updateRoomStatus controller:", err);
    res.status(500).json({ message: "Failed to update room status" });
  }
}

// Get available rooms
export async function getAvailableRooms(req, res) {
  try {
    const { property_id, start_date, end_date } = req.query;

    if (!property_id || !start_date || !end_date) {
      return res
        .status(400)
        .json({
          message: "Property ID, start date, and end date are required",
        });
    }

    const rooms = await getAvailableRoomsService(
      property_id,
      start_date,
      end_date
    );
    res.status(200).json(rooms);
  } catch (err) {
    console.error("Error in getAvailableRooms controller:", err);
    res.status(500).json({ message: "Failed to fetch available rooms" });
  }
}

// Bulk create rooms
export async function bulkCreateRooms(req, res) {
  try {
    const { property_id, rooms } = req.body;

    if (!property_id || !rooms || !Array.isArray(rooms)) {
      return res
        .status(400)
        .json({ message: "Property ID and rooms array are required" });
    }

    const createdRooms = await bulkCreateRoomsService(property_id, rooms);
    res.status(201).json(createdRooms);
  } catch (err) {
    console.error("Error in bulkCreateRooms controller:", err);
    res.status(500).json({ message: "Failed to bulk create rooms" });
  }
}
