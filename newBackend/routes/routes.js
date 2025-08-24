import express from "express";
import { getAllDoctors, newDoctor } from "../controllers/doctorController.js";

const router = express.Router();
router.get("/", getAllDoctors);
router.post("/", newDoctor);

export default router;