// newBackend/newBackend.js
import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing in .env");
if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing in .env");

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import routes from "./routes/routes.js";

const app = express();

/* ------------------------- Middleware ------------------------- */
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5175",
  // add your deployed frontend origin here if any, e.g.:
  // "https://your-frontend.example.com"
];

app.use(
  cors({
    origin(origin, cb) {
      // allow server-to-server / curl (no origin) and whitelisted origins
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));

/* ------------------------- Health Checks ---------------------- */
app.get("/", (_req, res) => {
  res.send("QuickDoc backend OK");
});
app.get("/api/test", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

/* ------------------------- API Routes ------------------------- */
app.use("/api", routes);

/* ------------------------- DB Connect ------------------------- */
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME || "quickdoc",
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

/* ------------------------- Start Server ----------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
