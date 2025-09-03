import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";   

import connectDB from "./doctordb/connect.js";     
import doctorRoutes from "./routes/routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());    
app.use('/api/doctors', doctorRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => 
    console.log(`Server is running on port ${PORT}`));