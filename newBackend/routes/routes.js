// routes/routes.js - CORRECTED VERSION
import express from "express";
import { getAllDoctors, newDoctor, bulkInsertDoctors } from "../controllers/doctorController.js";
import { registerUser, loginUser, getUserProfile, updateUserProfile } from "../controllers/userController.js";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Doctor routes
router.get("/doctors", optionalAuth, getAllDoctors);
router.post("/doctors", authenticateToken, newDoctor);
router.post("/doctors/bulk", authenticateToken, bulkInsertDoctors);

// User authentication routes (public)
router.post("/user/register", registerUser);
router.post("/user/login", loginUser);

// User profile routes (protected)
router.get("/user/profile", authenticateToken, getUserProfile);
router.put("/user/profile", authenticateToken, updateUserProfile);

export default router;
