import express from "express";
import {
  getAllRoomTypes,
  getRoomTypeById,
  createRoomType,
  deleteRoomType,
  updateRoomType,
} from "../controllers/roomTypeController.js";
import {
  authenticate,
  authorize,
  requireRole
} from "../middleware/authMiddleware.js";

const router = express.Router();

//Internal routes - System-wide room type management
// Hotel owners should typically use propertyRoutes.js for managing room types under their properties.
// These routes are for system administrators and super admins.

// Require authentication for all room type routes
router.use(authenticate);

// Get all room types - admins and managers only
router.get("/",
  requireRole('super_admin', 'property_owner', 'hotel_manager'),
  getAllRoomTypes
);

router.get("/:id",
  authorize('rooms', 'read'),
  getRoomTypeById
);

// Create room type - super admin only (prefer property-specific creation)
router.post("/",
  requireRole('super_admin'),
  authorize('rooms', 'create'),
  createRoomType
);

// Update room type
router.put("/:id",
  authorize('rooms', 'update'),
  updateRoomType
);

// Delete room type - super admin only
router.delete("/:id",
  requireRole('super_admin'),
  authorize('rooms', 'delete'),
  deleteRoomType
);

export default router;
