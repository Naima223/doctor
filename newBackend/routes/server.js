import express from "express";
import dotenv from "dotenv";    
import cors from "cors";
import mongoose from "mongoose";    
import connectDB from "../db/connect.js";
import router from "./routes.js";

dotenv.config();
connectDB();    

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/doctor', router);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
