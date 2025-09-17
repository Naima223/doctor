import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Admin from "../list/Admin.js";

// In-memory storage for verification codes (in production, use Redis or database)
const verificationCodes = new Map();

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_APP_PASSWORD || 'your-app-password'
    }
  });
};

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request admin access with email verification
const requestAdminAccess = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email address"
      });
    }

    // Check if admin exists with this email
    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "No admin account found with this email address"
      });
    }

    // Generate verification code and ID
    const verificationCode = generateVerificationCode();
    const verificationId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store verification data (expires in 10 minutes)
    const expiresAt = Date.now() + (10 * 60 * 1000);
    verificationCodes.set(verificationId, {
      email,
      code: verificationCode,
      expiresAt,
      attempts: 0,
      verified: false
    });

    // Send email with verification code (optional in development)
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@quickdoc.com',
        to: email,
        subject: 'QuickDoc Admin Access - Verification Code',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin-bottom: 10px;">🛡️ QuickDoc Admin Access</h1>
              <p style="color: #666; font-size: 16px;">Verification Code Request</p>
            </div>
            
            <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h2 style="color: #1e293b; margin-bottom: 16px; font-size: 18px;">Admin Access Verification</h2>
              <p style="color: #475569; margin-bottom: 20px;">
                Someone requested admin access for your account. Use the verification code below to continue:
              </p>
              
              <div style="text-align: center; margin: 24px 0;">
                <div style="background: #2563eb; color: white; font-size: 28px; font-weight: bold; padding: 16px 24px; border-radius: 8px; letter-spacing: 4px; display: inline-block; font-family: monospace;">
                  ${verificationCode}
                </div>
              </div>
              
              <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 12px; margin-top: 20px;">
                <p style="color: #92400e; font-size: 14px; margin: 0;">
                  ⏰ <strong>This code expires in 10 minutes</strong>
                </p>
              </div>
            </div>
            
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #6b7280; font-size: 12px;">
              <p>© 2024 QuickDoc Healthcare Platform</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Verification code sent to ${email}: ${verificationCode}`);
      
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
      // For development, we'll continue even if email fails
      console.log(`📧 DEV MODE: Verification code for ${email}: ${verificationCode}`);
    }

    res.json({
      success: true,
      message: "Verification code sent to your email",
      verificationId,
      // Remove in production - only for development
      ...(process.env.NODE_ENV === 'development' && { 
        devCode: verificationCode 
      })
    });

  } catch (error) {
    console.error("Request admin access error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending verification code"
    });
  }
};

// Verify the email code
const verifyEmailCode = async (req, res) => {
  try {
    const { email, code, verificationId } = req.body;

    if (!email || !code || !verificationId) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, code, and verification ID"
      });
    }

    // Get verification data
    const verificationData = verificationCodes.get(verificationId);
    
    if (!verificationData) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification session"
      });
    }

    // Check if expired
    if (Date.now() > verificationData.expiresAt) {
      verificationCodes.delete(verificationId);
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one."
      });
    }

    // Check attempt limit
    if (verificationData.attempts >= 3) {
      verificationCodes.delete(verificationId);
      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. Please request a new verification code."
      });
    }

    // Verify email and code
    if (verificationData.email !== email || verificationData.code !== code) {
      verificationData.attempts += 1;
      return res.status(400).json({
        success: false,
        message: "Invalid verification code"
      });
    }

    // Mark as verified
    verificationData.verified = true;
    verificationData.verifiedAt = Date.now();

    res.json({
      success: true,
      message: "Email verified successfully"
    });

  } catch (error) {
    console.error("Verify email code error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying code"
    });
  }
};

// Resend verification code
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email address"
      });
    }

    // Check if admin exists
    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "No admin account found with this email address"
      });
    }

    // Generate new verification code and ID
    const verificationCode = generateVerificationCode();
    const verificationId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store new verification data
    const expiresAt = Date.now() + (10 * 60 * 1000);
    verificationCodes.set(verificationId, {
      email,
      code: verificationCode,
      expiresAt,
      attempts: 0,
      verified: false
    });

    // Send email (optional in development)
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@quickdoc.com',
        to: email,
        subject: 'QuickDoc Admin Access - New Verification Code',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb;">🛡️ QuickDoc Admin Access</h1>
              <p style="color: #666;">New Verification Code</p>
            </div>
            
            <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <p style="color: #475569; margin-bottom: 20px;">
                Here's your new verification code for admin access:
              </p>
              
              <div style="text-align: center; margin: 24px 0;">
                <div style="background: #2563eb; color: white; font-size: 28px; font-weight: bold; padding: 16px 24px; border-radius: 8px; letter-spacing: 4px; display: inline-block; font-family: monospace;">
                  ${verificationCode}
                </div>
              </div>
              
              <p style="color: #ef4444; font-size: 14px; text-align: center;">
                ⏰ This code expires in 10 minutes
              </p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ New verification code sent to ${email}: ${verificationCode}`);
      
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
      console.log(`📧 DEV MODE: New verification code for ${email}: ${verificationCode}`);
    }

    res.json({
      success: true,
      message: "New verification code sent to your email",
      verificationId,
      // Remove in production
      ...(process.env.NODE_ENV === 'development' && { 
        devCode: verificationCode 
      })
    });

  } catch (error) {
    console.error("Resend verification code error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending new verification code"
    });
  }
};

// Admin login with email verification
const adminLoginWithVerification = async (req, res) => {
  try {
    const { email, password, verificationId } = req.body;

    if (!email || !password || !verificationId) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, password, and verification ID"
      });
    }

    // Check verification status
    const verificationData = verificationCodes.get(verificationId);
    
    if (!verificationData || !verificationData.verified || verificationData.email !== email) {
      return res.status(400).json({
        success: false,
        message: "Email verification required. Please verify your email first."
      });
    }

    // Check if verification is still valid (within 30 minutes of verification)
    const thirtyMinutes = 30 * 60 * 1000;
    if (Date.now() - verificationData.verifiedAt > thirtyMinutes) {
      verificationCodes.delete(verificationId);
      return res.status(400).json({
        success: false,
        message: "Verification expired. Please start over."
      });
    }

    // Find admin and verify credentials
    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Clean up verification data
    verificationCodes.delete(verificationId);

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: 'admin', email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });

  } catch (error) {
    console.error("Admin login with verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in"
    });
  }
};

// Cleanup expired verification codes (run periodically)
const cleanupExpiredCodes = () => {
  const now = Date.now();
  for (const [id, data] of verificationCodes.entries()) {
    if (now > data.expiresAt) {
      verificationCodes.delete(id);
    }
  }
};

// Set up periodic cleanup (every 5 minutes)
setInterval(cleanupExpiredCodes, 5 * 60 * 1000);

export {
  requestAdminAccess,
  verifyEmailCode,
  resendVerificationCode,
  adminLoginWithVerification
};