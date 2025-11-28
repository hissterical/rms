import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  getMyProperties,
  assignManager,
  unassignManager,
  getManagers,
} from "../controllers/userController.js";
import {
  authenticate,
  requireRole,
  requirePropertyAccess,
} from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);

// Property owner and manager routes
router.get(
  "/my-properties",
  authenticate,
  requireRole("property_owner", "manager"),
  getMyProperties
);

// Property owner only routes
router.post(
  "/properties/:propertyId/managers",
  authenticate,
  requireRole("property_owner"),
  requirePropertyAccess,
  assignManager
);

router.delete(
  "/properties/:propertyId/managers",
  authenticate,
  requireRole("property_owner"),
  requirePropertyAccess,
  unassignManager
);

router.get(
  "/properties/:propertyId/managers",
  authenticate,
  requirePropertyAccess,
  getManagers
);

export default router;
