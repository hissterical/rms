import express from "express";
import {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getRoomsByPropertyId,
  createRoomByPropertyId,
  updateRoomById,
  deleteRoomById,
  getRoomTypesByPropertyId,
  createRoomTypeByPropertyId,
  updateRoomTypeById,
  deleteRoomTypeById,
} from "../controllers/propertyController.js";
import {
  authenticate,
  authorize,
  authorizePropertyAccess,
  optionalAuthenticate
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public property listing (with optional authentication for enhanced features)
router.get("/", optionalAuthenticate, getAllProperties);
router.get("/:propertyId", optionalAuthenticate, getPropertyById);

// Property management routes - require authentication and proper permissions
router.post("/",
  authenticate,
  authorize('properties', 'create'),
  createProperty
);

router.put("/:propertyId",
  authenticate,
  authorize('properties', 'update'),
  authorizePropertyAccess,
  updateProperty
);

router.delete("/:propertyId",
  authenticate,
  authorize('properties', 'delete'),
  authorizePropertyAccess,
  deleteProperty
);

// Room management routes under property
router.get("/:propertyId/rooms",
  authenticate,
  authorize('rooms', 'read'),
  authorizePropertyAccess,
  getRoomsByPropertyId
);

router.post("/:propertyId/rooms",
  authenticate,
  authorize('rooms', 'create'),
  authorizePropertyAccess,
  createRoomByPropertyId
);

router.put("/:propertyId/rooms/:roomId",
  authenticate,
  authorize('rooms', 'update'),
  authorizePropertyAccess,
  updateRoomById
);

router.delete("/:propertyId/rooms/:roomId",
  authenticate,
  authorize('rooms', 'delete'),
  authorizePropertyAccess,
  deleteRoomById
);

// Room type management routes under property
router.get("/:propertyId/roomtypes",
  authenticate,
  authorize('rooms', 'read'),
  authorizePropertyAccess,
  getRoomTypesByPropertyId
);

router.post("/:propertyId/roomtypes",
  authenticate,
  authorize('rooms', 'create'),
  authorizePropertyAccess,
  createRoomTypeByPropertyId
);

router.put("/:propertyId/roomtypes/:roomTypeId",
  authenticate,
  authorize('rooms', 'update'),
  authorizePropertyAccess,
  updateRoomTypeById
);

router.delete("/:propertyId/roomtypes/:roomTypeId",
  authenticate,
  authorize('rooms', 'delete'),
  authorizePropertyAccess,
  deleteRoomTypeById
);

//reviews for a property
// router.get("/:propertyId/reviews", getPropertyReviews);

export default router;
