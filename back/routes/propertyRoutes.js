import express from "express";
import {
  createProperty,
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
  requireRole,
  requirePropertyAccess,
} from "../middleware/auth.js";

const router = express.Router();

// Create property - only property owners
router.post("/", authenticate, requireRole("property_owner"), createProperty);

// Get property - requires property access
router.get(
  "/:propertyId",
  authenticate,
  requirePropertyAccess,
  getPropertyById
);

// Update/Delete property - requires property access
router.patch(
  "/:propertyId",
  authenticate,
  requirePropertyAccess,
  updateProperty
);
router.delete(
  "/:propertyId",
  authenticate,
  requirePropertyAccess,
  deleteProperty
);

// rooms under property - all require property access
router.get(
  "/:propertyId/rooms",
  authenticate,
  requirePropertyAccess,
  getRoomsByPropertyId
);
router.post(
  "/:propertyId/rooms",
  authenticate,
  requirePropertyAccess,
  createRoomByPropertyId
);
router.put(
  "/:propertyId/rooms/:roomId",
  authenticate,
  requirePropertyAccess,
  updateRoomById
);
router.delete(
  "/:propertyId/rooms/:roomId",
  authenticate,
  requirePropertyAccess,
  deleteRoomById
);

// room types under property - all require property access
router.get(
  "/:propertyId/roomtypes",
  authenticate,
  requirePropertyAccess,
  getRoomTypesByPropertyId
);
router.post(
  "/:propertyId/roomtypes",
  authenticate,
  requirePropertyAccess,
  createRoomTypeByPropertyId
);
router.put(
  "/:propertyId/roomtypes/:roomTypeId",
  authenticate,
  requirePropertyAccess,
  updateRoomTypeById
);
router.delete(
  "/:propertyId/roomtypes/:roomTypeId",
  authenticate,
  requirePropertyAccess,
  deleteRoomTypeById
);

// //reviews for a property
// // router.get("/:propertyId/re views", getPropertyReviews);

// // Property-wide availability summary (for all room types)
// router.get("/:propertyId/availability", getPropertyAvailability);

// // Optional: simplified manager calendar (aggregated per day)
// router.get("/:propertyId/calendar", getPropertyCalendar);

// // Availability by type
// router.get(
//   "/:propertyId/roomtypes/:roomTypeId/availability",
//   getRoomTypeAvailability
// );

export default router;
