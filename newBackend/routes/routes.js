import express from "express";
import { 
    getAllDoctors, 
    newDoctor, 
    bulkInsertDoctors,
    updateDoctorAvailability,
    toggleDoctorStatus,
    addDoctorNote
} from "../controllers/doctorController.js";
import { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUserProfile 
} from "../controllers/userController.js";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Doctor routes (public)
router.get("/doctors", optionalAuth, getAllDoctors);

// Doctor routes (admin only)
router.post("/doctors", authenticateToken, newDoctor);
router.post("/doctors/bulk", authenticateToken, bulkInsertDoctors);
router.put("/admin/doctors/:doctorId/availability", authenticateToken, updateDoctorAvailability);
router.put("/admin/doctors/:doctorId/toggle-status", authenticateToken, toggleDoctorStatus);
router.post("/admin/doctors/:doctorId/notes", authenticateToken, addDoctorNote);

// User authentication routes (public)
router.post("/user/register", registerUser);
router.post("/user/login", loginUser);

// User profile routes (protected)
router.get("/user/profile", authenticateToken, getUserProfile);
router.put("/user/profile", authenticateToken, updateUserProfile);

export default router;