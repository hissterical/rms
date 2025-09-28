import express from "express";
import {
  getAllRooms,
  getRoomById,
  createRoom,
  deleteRoom,
  updateRoom,
} from "../controllers/roomController.js";
import {
  authenticate,
  authorize,
  requireRole
} from "../middleware/authMiddleware.js";

const router = express.Router();

//Internal routes - System-wide room management
// Hotel owners should typically use propertyRoutes.js for managing rooms under their properties.
// These routes are for system administrators and super admins.

// Require authentication for all room routes
router.use(authenticate);

// Get all rooms - admins and managers only
router.get("/",
  requireRole('super_admin', 'property_owner'),
  getAllRooms
);

router.get("/:id",
  authorize('rooms', 'read'),
  getRoomById
);

// Create room - super admin only (prefer property-specific creation)
router.post("/",
  requireRole('super_admin'),
  authorize('rooms', 'create'),
  createRoom
);

// Update room
router.put("/:id",
  authorize('rooms', 'update'),
  updateRoom
);

// Delete room - super admin only
router.delete("/:id",
  requireRole('super_admin'),
  authorize('rooms', 'delete'),
  deleteRoom
);

export default router;
