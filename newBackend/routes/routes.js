import express from "express";
import { getAllDoctors, newDoctor, bulkInsertDoctors } from "../controllers/doctorController.js";

const router = express.Router();

router.get("/", getAllDoctors);
router.post("/", newDoctor);
router.post("/bulk", bulkInsertDoctors);

export default router;