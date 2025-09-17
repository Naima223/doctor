import jwt from "jsonwebtoken";
import User from "../models/User.js";

// --- helpers ---
const getTokenFromHeader = (req) => {
  const authHeader = req.get("Authorization") || "";
  const parts = authHeader.split(" ");
  return parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1].trim() : null;
};

const ensureJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    // Fail fast: better than silently using a weak default
    throw new Error("JWT_SECRET is not set in environment variables");
  }
  return process.env.JWT_SECRET;
};

// --- Required authentication ---
export const authenticateToken = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, ensureJwtSecret());
    // NOTE: use lean for lightweight plain object
    const user = await User.findById(decoded.id).select("-password -passwordHash").lean();

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token. User not found." });
    }

    // attach for downstream use
    req.user = user;                          // full safe user object (no secrets)
    req.userId = user._id?.toString?.() || user._id; // convenience
    req.userRole = user.role || "user";
    return next();
  } catch (error) {
    const isExpired = error?.name === "TokenExpiredError";
    return res.status(401).json({
      success: false,
      message: isExpired ? "Token expired. Please log in again." : "Invalid token.",
    });
  }
};

// --- Optional authentication (doesn't block on missing/invalid token) ---
export const optionalAuth = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (token) {
      const decoded = jwt.verify(token, ensureJwtSecret());
      const user = await User.findById(decoded.id).select("-password -passwordHash").lean();
      if (user) {
        req.user = user;
        req.userId = user._id?.toString?.() || user._id;
        req.userRole = user.role || "user";
      }
    }
    return next();
  } catch {
    // Ignore invalid/expired token and continue unauthenticated
    return next();
  }
};

// --- Admin guard (use after authenticateToken) ---
export const authorizeAdmin = (req, res, next) => {
  const role = req.userRole || req.user?.role;
  if (role === "admin") return next();
  return res.status(403).json({ success: false, message: "Forbidden: admin only" });
};
