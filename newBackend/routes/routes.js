// newBackend/routes/routes.js
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

import {
  authenticateToken,
  optionalAuth,
  authorizeAdmin
} from "../middleware/auth.js";

import {
  getMyAppointments,
  createAppointment,
  cancelAppointment
} from "../controllers/appointmentController.js";

const router = express.Router();

/* =============== Doctor routes (public) =============== */
router.get("/doctors", optionalAuth, getAllDoctors);

/* =============== Doctor routes (admin only) =============== */
router.post("/doctors", authenticateToken, authorizeAdmin, newDoctor);
router.post("/doctors/bulk", authenticateToken, authorizeAdmin, bulkInsertDoctors);
router.put("/admin/doctors/:doctorId/availability", authenticateToken, authorizeAdmin, updateDoctorAvailability);
router.put("/admin/doctors/:doctorId/toggle-status", authenticateToken, authorizeAdmin, toggleDoctorStatus);
router.post("/admin/doctors/:doctorId/notes", authenticateToken, authorizeAdmin, addDoctorNote);

/* =============== User auth =============== */
router.post("/user/register", registerUser);
router.post("/user/login", loginUser);

/* =============== User profile (protected) =============== */
router.get("/user/profile", authenticateToken, getUserProfile);
router.put("/user/profile", authenticateToken, updateUserProfile);

/* =============== Appointments (protected) =============== */
router.get("/appointments/my", authenticateToken, getMyAppointments);
router.post("/appointments", authenticateToken, createAppointment);
router.patch("/appointments/:id/cancel", authenticateToken, cancelAppointment);

export default router;
