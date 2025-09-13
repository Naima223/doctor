import jwt from "jsonwebtoken";
import Admin from "../list/Admin.js";

// Middleware to verify admin JWT token
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('token');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Admin token required."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }
    
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin token or account disabled."
      });
    }

    req.admin = admin;
    next();
    
  } catch (error) {
    console.error("Admin authentication error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid admin token."
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Admin token expired."
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Server error during admin authentication."
    });
  }
};

// Middleware to check specific admin permissions
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required."
      });
    }

    if (req.admin.role === 'super_admin' || req.admin.permissions.includes(requiredPermission)) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required: ${requiredPermission}`
      });
    }
  };
};

export { authenticateAdmin, checkPermission };