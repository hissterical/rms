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

// router.get("/", getAllRooms);

// router.get("/:id", getRoomById);

// router.post("/", createRoom);

// router.delete("/:id", deleteRoom);

// router.put("/:id", updateRoom);

// export default router;
