import express from "express";
import {
  getAllRooms,
  getRoomById,
  createRoom,
  deleteRoom,
  updateRoom,
  updateRoomStatus,
  getAvailableRooms,
  bulkCreateRooms,
} from "../controllers/roomController.js";

const router = express.Router();

//Internal routes
// Hotel owners should not use these routes.
// Use propertyRoutes.js for creating/updating rooms under a property.

// Get all rooms for a property
router.get("/", getAllRooms);

// Get available rooms for date range
router.get("/available", getAvailableRooms);

// Get single room by ID
router.get("/:id", getRoomById);

// Create new room
router.post("/", createRoom);

// Bulk create rooms
router.post("/bulk", bulkCreateRooms);

// Update room status only
router.patch("/:id/status", updateRoomStatus);

// Update entire room
router.put("/:id", updateRoom);

// Delete room
router.delete("/:id", deleteRoom);

export default router;
