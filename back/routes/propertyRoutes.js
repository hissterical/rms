import express from "express";
import {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getRoomsByPropertyId,
  getRoomTypesByPropertyId,
} from "../controllers/propertyController.js";

const router = express.Router();

router.post("/", createProperty);

router.get("/", getAllProperties);

router.get("/:id", getPropertyById);

router.put("/:id", updateProperty);

router.delete("/:id", deleteProperty);

//get all rooms for a property
router.get("/properties/:id/rooms", getRoomsByPropertyId);

//get all room types for a property
router.get("/properties/:id/roomtypes", getRoomTypesByPropertyId);

//get reviews for a property
// router.get("/:propertyId/reviews", getPropertyReviews);

export default router;
