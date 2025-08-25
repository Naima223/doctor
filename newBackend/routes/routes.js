import express from "express";
import { getAllDoctors, newDoctor } from "../controllers/doctorController.js";
import { registerUser, loginUser } from "../controllers/userController.js";


const router = express.Router();
router.get("/", getAllDoctors);
router.post("/", newDoctor);

router.post("/user/register", registerUser);
router.post("/user/login", loginUser)

export default router;

