import jwt from "jsonwebtoken";
import User from "../models/User.js";

// --- helpers part ---
const getTokenFromHeader = (req) => {
  const authHeader = req.get("Authorization") || "";
  const parts = authHeader.split(" ");
  return parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1].trim() : null;
};

const ensureJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }
  return process.env.JWT_SECRET;
};

// --- Required authentication---
export const authenticateToken = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, ensureJwtSecret());
    const uid = decoded.id || decoded._id || decoded.userId;

    const user = await User.findById(uid).select("-password -passwordHash").lean();
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token. User not found." });
    }

    req.user = user;
    req.userId = uid;
    req.userRole = user.role || "user";
    return next();
  } catch (error) {
    const isExpired = error && error.name === "TokenExpiredError";
    return res.status(401).json({
      success: false,
      message: isExpired ? "Token expired. Please log in again." : "Invalid token.",
    });
  }
};

// --- Optional authentication ---
export const optionalAuth = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (token) {
      const decoded = jwt.verify(token, ensureJwtSecret());
      const uid = decoded.id || decoded._id || decoded.userId;

      const user = await User.findById(uid).select("-password -passwordHash").lean();
      if (user) {
        req.user = user;
        req.userId = uid;
        req.userRole = user.role || "user";
      }
    }
    return next();
  } catch {
    return next(); // ignore invalid/expired token
  }
};

// --- Admin guard ---
export const authorizeAdmin = (req, res, next) => {
  const role = req.userRole || (req.user && req.user.role);
  if (role === "admin") return next();
  return res.status(403).json({ success: false, message: "Forbidden: admin only" });
};
