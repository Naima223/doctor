// newBackend/newBackend.js
import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing in .env");
if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing in .env");

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import routes from "./routes/routes.js"; // mounts all app routes under /api

const app = express();

/* -------------------------
   Middleware
-------------------------- */
app.use(
  cors({
    origin: "http://localhost:5173", // Vite dev origin
    credentials: false,              // cookies না হলে false-ই থাক
  })
);
app.use(express.json());

/* -------------------------
   Routes Mount
-------------------------- */
app.use("/api", routes);

/* -------------------------
   MongoDB Connection
-------------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/* -------------------------
   Health / Test Routes
-------------------------- */
app.get("/", (req, res) => {
  res.json({ message: "QuickDoc Server is working!" });
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
    routes: [
      "GET /api/doctors",
      "POST /api/doctors",
      "POST /api/doctors/bulk",
      "PUT /api/admin/doctors/:doctorId/availability",
      "PUT /api/admin/doctors/:doctorId/toggle-status",
      "POST /api/admin/doctors/:doctorId/notes",
      "POST /api/user/register",
      "POST /api/user/login",
      "GET /api/user/profile",
      "PUT /api/user/profile",
    ],
  });
});

/* -------------------------
   Start Server
-------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🚀 QuickDoc Server running on port ${PORT}
🏥 Health: http://localhost:${PORT}
🔧 API Test: http://localhost:${PORT}/api/test
📊 Database: ${process.env.MONGO_URI ? "MongoDB Atlas" : "Local MongoDB"}
  `);
});
