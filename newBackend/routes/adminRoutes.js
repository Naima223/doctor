import express from "express";
import { 
    adminLogin,
    getDashboardStats,
    getAllDoctorsAdmin,
    getAllUsersAdmin,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    getAdminProfile,
    getSystemAnalytics
} from "../controllers/adminController.js";
import { 
    updateDoctorAvailability as updateAvailability,
    toggleDoctorStatus,
    addDoctorNote,
    newDoctor, 
    bulkInsertDoctors
} from "../controllers/doctorController.js";
import { authenticateAdmin, checkPermission } from "../middleware/adminAuth.js";

const router = express.Router();

// Admin Authentication Routes (Public)
router.post("/login", adminLogin);

// Admin Profile Route (Protected)
router.get("/profile", authenticateAdmin, getAdminProfile);

// Admin Dashboard Routes (Protected)
router.get("/dashboard/stats", authenticateAdmin, getDashboardStats);
router.get("/analytics", authenticateAdmin, getSystemAnalytics);
// Doctor Management Routes (Protected)
router.get("/doctors", authenticateAdmin, getAllDoctorsAdmin);
router.post("/doctors", authenticateAdmin, checkPermission('manage_doctors'), addDoctor);
router.post("/doctors/bulk", authenticateAdmin, checkPermission('manage_doctors'), bulkInsertDoctors);
router.put("/doctors/:doctorId", authenticateAdmin, checkPermission('manage_doctors'), updateDoctor);
router.delete("/doctors/:doctorId", authenticateAdmin, checkPermission('manage_doctors'), deleteDoctor);

// Doctor Availability Management (Protected)
router.put("/doctors/:doctorId/availability", authenticateAdmin, updateAvailability);
router.put("/doctors/:doctorId/toggle-status", authenticateAdmin, toggleDoctorStatus);
router.post("/doctors/:doctorId/notes", authenticateAdmin, addDoctorNote);

// User Management Routes (Protected)
router.get("/users", authenticateAdmin, checkPermission('manage_users'), getAllUsersAdmin);

export default router;