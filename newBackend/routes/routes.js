import mongoose from "mongoose";    
import { getDoctor, newDoctor } from "../controllers/doctorController.js";

const router = express.Router();
router.get('/', getDoctor);
router.post('/', newDoctor);    
export default router;
