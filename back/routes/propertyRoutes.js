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

const router = express.Router();

router.post("/", createProperty);
router.get("/", getAllProperties);
router.get("/:propertyId", getPropertyById);
router.put("/:propertyId", updateProperty);
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

//reviews for a property
// router.get("/:propertyId/reviews", getPropertyReviews);

export default router;
