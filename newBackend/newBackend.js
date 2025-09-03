import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";   

import connectDB from "./doctordb/connect.js";     
import allRoutes from "./routes/routes.js";

dotenv.config();
connectDB();

const app = express();

// Updated CORS configuration for Vite frontend (port 5173)
app.use(cors({
    origin: 'http://localhost:5173', // Your Vite frontend port
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token']
}));

app.use(express.json());    

// All routes under /api
app.use('/api', allRoutes);

app.get('/', (req, res) => {
    res.send('API is working!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => 
    console.log(`Server is running on port ${PORT}`));

/*import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";   

import connectDB from "./doctordb/connect.js";     
import doctorRoutes from "./routes/routes.js";//*

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());    

app.use('/api/doctors', doctorRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => 
    console.log(`Server is running on port ${PORT}`));*/