import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../list/Admin.js";
import Doctor from "../list/Doctor.js";

// Allowed admin emails (move to environment variables in production)
const allowedAdminEmails = [
  process.env.ADMIN_EMAIL_1 || 'fairuzanadi.048@gmail.com',
    process.env.ADMIN_EMAIL_2 || 'fairuz.cse.20230104121@aust.edu',

  // Add more emails from environment variables as needed
];

// Admin Login with email validation
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    // Check if email is in allowed list
    if (!allowedAdminEmails.includes(email.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Unauthorized email address."
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase(), isActive: true });
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

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { 
        id: admin._id, 
        role: admin.role,
        email: admin.email 
      },
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
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in"
    });
  }
};

// Get Admin Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const availableDoctors = await Doctor.countDocuments({ isAvailable: true, status: 'active' });
    const unavailableDoctors = await Doctor.countDocuments({ 
      $or: [
        { isAvailable: false },
        { status: { $in: ['temporarily_closed', 'on_leave'] } }
      ]
    });
    const busyDoctors = await Doctor.countDocuments({ status: 'busy' });

    const doctorsBySpecialty = await Doctor.aggregate([
      { $group: { _id: "$speciality", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalDoctors,
        availableDoctors,
        unavailableDoctors,
        busyDoctors,
        doctorsBySpecialty
      }
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats"
    });
  }
};

// Get All Doctors for Admin
const getAllDoctorsAdmin = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      doctors
    });

  } catch (error) {
    console.error("Get doctors error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching doctors"
    });
  }
};

// Update Doctor Availability
const updateDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { 
      isAvailable, 
      status, 
      unavailableReason, 
      estimatedAvailableAt,
      availableSlots 
    } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    // Update fields
    if (typeof isAvailable !== 'undefined') {
      doctor.isAvailable = isAvailable;
    }
    
    if (status) {
      doctor.status = status;
    }
    
    if (unavailableReason !== undefined) {
      doctor.unavailableReason = unavailableReason;
    }
    
    if (estimatedAvailableAt !== undefined) {
      doctor.estimatedAvailableAt = estimatedAvailableAt ? new Date(estimatedAvailableAt) : null;
    }
    
    if (typeof availableSlots !== 'undefined') {
      doctor.availableSlots = availableSlots;
    }

    // Set unavailable since timestamp if becoming unavailable
    if (!isAvailable && doctor.isAvailable !== false) {
      doctor.unavailableSince = new Date();
    }

    await doctor.save();

    res.json({
      success: true,
      message: "Doctor availability updated successfully",
      doctor
    });

  } catch (error) {
    console.error("Update availability error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating doctor availability"
    });
  }
};

// Add New Doctor (Admin only)
const addDoctor = async (req, res) => {
  try {
    const doctorData = req.body;
    
    // Validate required fields
    if (!doctorData.name || !doctorData.email || !doctorData.speciality) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and speciality are required"
      });
    }
    
    // Check if doctor with email already exists
    const existingDoctor = await Doctor.findOne({ email: doctorData.email.toLowerCase() });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor with this email already exists"
      });
    }

    // Normalize email
    doctorData.email = doctorData.email.toLowerCase();

    const doctor = new Doctor(doctorData);
    await doctor.save();

    res.status(201).json({
      success: true,
      message: "Doctor added successfully",
      doctor
    });

  } catch (error) {
    console.error("Add doctor error:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error adding doctor"
    });
  }
};

// Update Doctor Details
const updateDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const updateData = req.body;

    // Normalize email if provided
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();
      
      // Check if email is already taken by another doctor
      const existingDoctor = await Doctor.findOne({ 
        email: updateData.email, 
        _id: { $ne: doctorId } 
      });
      
      if (existingDoctor) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another doctor"
        });
      }
    }

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    res.json({
      success: true,
      message: "Doctor updated successfully",
      doctor
    });

  } catch (error) {
    console.error("Update doctor error:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error updating doctor"
    });
  }
};

// Delete Doctor (Soft delete recommended)
const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    // Soft delete - set as inactive instead of actually deleting
    doctor.isActive = false;
    doctor.deletedAt = new Date();
    await doctor.save();

    res.json({
      success: true,
      message: "Doctor deactivated successfully"
    });

  } catch (error) {
    console.error("Delete doctor error:", error);
    res.status(500).json({
      success: false,
      message: "Error deactivating doctor"
    });
  }
};

// Get Admin Profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    res.json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      }
    });

  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin profile"
    });
  }
};

// Logout admin (invalidate token - client-side mainly)
const adminLogout = async (req, res) => {
  try {
    // Update last logout time
    if (req.admin && req.admin.id) {
      await Admin.findByIdAndUpdate(req.admin.id, {
        lastLogout: new Date()
      });
    }

    res.json({
      success: true,
      message: "Admin logged out successfully"
    });

  } catch (error) {
    console.error("Admin logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout"
    });
  }
};

export {
  adminLogin,
  getDashboardStats,
  getAllDoctorsAdmin,
  updateDoctorAvailability,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  getAdminProfile,
  adminLogout
};