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

const router = express.Router();

router.post("/", createProperty);
router.get("/:propertyId", getPropertyById);
router.patch("/:propertyId", updateProperty);
router.delete("/:propertyId", deleteProperty);

// rooms under property
router.get("/:propertyId/rooms", getRoomsByPropertyId);
router.post("/:propertyId/rooms", createRoomByPropertyId);
router.put("/:propertyId/rooms/:roomId", updateRoomById);
router.delete("/:propertyId/rooms/:roomId", deleteRoomById);

// room types under property
router.get("/:propertyId/roomtypes", getRoomTypesByPropertyId);
router.post("/:propertyId/roomtypes", createRoomTypeByPropertyId);
router.put("/:propertyId/roomtypes/:roomTypeId", updateRoomTypeById);
router.delete("/:propertyId/roomtypes/:roomTypeId", deleteRoomTypeById);

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
