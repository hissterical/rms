import express from "express";

import {
  getAllRoomTypes,
  getRoomTypeById,
  createRoomType,
  deleteRoomType,
  updateRoomType,
} from "../controllers/roomTypeController.js";

const router = express.Router();

//Internal routes
// Hotel owners should not use these routes.
// Use propertyRoutes.js for creating/updating rooms under a property.

// router.get("/", getAllRoomTypes);

// router.get("/:id", getRoomTypeById);

// router.post("/", createRoomType);

// router.delete("/:id", deleteRoomType);

// router.put("/:id", updateRoomType);

// export default router;
