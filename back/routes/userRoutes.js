import express from "express";

const router = express.Router();

// User routes - stub implementations
router.get("/", (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
});

router.post("/", (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
});

export default router;
