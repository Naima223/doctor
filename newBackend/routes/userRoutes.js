import express from "express";
import { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUserProfile 
} from "../controllers/userController.js";
import { 
    getAllDoctors
} from "../controllers/doctorController.js";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Patient Authentication Routes (Public)
router.post("/register", registerUser);
router.post("/login", loginUser);

// Patient Profile Routes (Protected)
router.get("/profile", authenticateToken, getUserProfile);
router.put("/profile", authenticateToken, updateUserProfile);

// Doctor Listing for Patients (Public with optional auth)
router.get("/doctors", optionalAuth, getAllDoctors);

export default router;