import jwt from 'jsonwebtoken';
import User from '../list/User.js';

// Required authentication middleware for patients
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify it's a patient token
    if (decoded.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Patient access required."
      });
    }
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || user.role !== 'patient') {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Patient authentication error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid token."
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again."
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Server error during authentication."
    });
  }
};

// Optional authentication middleware (doesn't block if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Only attach user if it's a patient token
      if (decoded.role === 'patient') {
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.role === 'patient') {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    // If token is invalid, continue without user
    console.log("Optional auth error (ignored):", error.message);
    next();
  }
};