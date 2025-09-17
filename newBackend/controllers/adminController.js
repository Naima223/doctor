import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../list/Admin.js";
import Doctor from "../list/Doctor.js";
import User from "../list/User.js";

// Hardcoded admin emails with their details
const HARDCODED_ADMINS = [
  {
    name: "Fairuz Anadi",
    email: "fairuzanadi.048@gmail.com",
    password: "fairuzanadi", // This will be hashed
    role: "super_admin"
  },
  {
    name: "Fairuz AUST",
    email: "fairuz.cse.20230104121@aust.edu",
    password: "fairuzanadifairuzanadi", // This will be hashed
    role: "admin"
  },
  {
    name: "New Admin Name",
    email: "anadi@gmail.com",
    password: "newpassword",
    role: "admin"
  }
];

// Initialize hardcoded admins in database
const initializeAdmins = async () => {
  try {
    for (const adminData of HARDCODED_ADMINS) {
      const existingAdmin = await Admin.findOne({ email: adminData.email });
      
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminData.password, 12);
        
        const newAdmin = new Admin({
          name: adminData.name,
          email: adminData.email.toLowerCase(),
          password: hashedPassword,
          role: adminData.role,
          permissions: ['manage_doctors', 'manage_users', 'view_analytics', 'manage_appointments'],
          isActive: true
        });
        
        await newAdmin.save();
        console.log(`✅ Admin initialized: ${adminData.email}`);
      }
    }
  } catch (error) {
    console.error("Error initializing admins:", error);
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    // Check if email is in hardcoded list
    const hardcodedAdmin = HARDCODED_ADMINS.find(admin => 
      admin.email.toLowerCase() === email.toLowerCase()
    );

    if (!hardcodedAdmin) {
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
    // Doctor stats
    const totalDoctors = await Doctor.countDocuments();
    const availableDoctors = await Doctor.countDocuments({ 
      isActive: true, 
      'availability.status': 'available' 
    });
    const unavailableDoctors = await Doctor.countDocuments({ 
      $or: [
        { 'availability.status': { $in: ['temporarily_unavailable', 'on_leave'] } },
        { isActive: false }
      ]
    });
    const busyDoctors = await Doctor.countDocuments({ 'availability.status': 'busy' });

    // User stats
    const totalUsers = await User.countDocuments({ role: 'patient' });
    const newUsersToday = await User.countDocuments({
      role: 'patient',
      createdAt: { 
        $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
      }
    });

    // Available slots
    const totalSlots = await Doctor.aggregate([
      { $match: { isActive: true, 'availability.status': 'available' } },
      { $group: { _id: null, totalSlots: { $sum: '$availableSlots' } } }
    ]);

    const doctorsBySpecialty = await Doctor.aggregate([
      { $group: { _id: "$speciality", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent activity (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentlyUpdatedDoctors = await Doctor.countDocuments({
      'availability.lastUpdated': { $gte: yesterday }
    });

    res.json({
      success: true,
      stats: {
        doctors: {
          total: totalDoctors,
          available: availableDoctors,
          unavailable: unavailableDoctors,
          busy: busyDoctors,
          totalSlots: totalSlots[0]?.totalSlots || 0,
          recentlyUpdated: recentlyUpdatedDoctors
        },
        users: {
          total: totalUsers,
          newToday: newUsersToday
        },
        doctorsBySpecialty,
        lastUpdated: new Date()
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

// Get All Users for Admin
const getAllUsersAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    
    let query = { role: 'patient' };
    
    if (search) {
      query = {
        ...query,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users"
    });
  }
};

// Add New Doctor
const addDoctor = async (req, res) => {
  try {
    const doctorData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'speciality', 'experience', 'location', 'phone', 'degree', 'consultationFee'];
    const missingFields = requiredFields.filter(field => !doctorData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
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

    // Create doctor with default values
    const doctor = new Doctor({
      ...doctorData,
      email: doctorData.email.toLowerCase(),
      availableSlots: doctorData.availableSlots || 5,
      rating: doctorData.rating || 4.0,
      isActive: true,
      availability: {
        status: 'available',
        reason: '',
        expectedBackTime: null,
        lastUpdated: new Date(),
        updatedBy: req.admin?.name || 'Admin'
      }
    });

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

// Delete Doctor (Soft delete)
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

    // Soft delete - set as inactive
    doctor.isActive = false;
    doctor.availability.status = 'temporarily_unavailable';
    doctor.availability.reason = 'Removed by admin';
    doctor.availability.lastUpdated = new Date();
    doctor.availability.updatedBy = req.admin?.name || 'Admin';
    doctor.availableSlots = 0;
    
    await doctor.save();

    res.json({
      success: true,
      message: "Doctor removed successfully"
    });

  } catch (error) {
    console.error("Delete doctor error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing doctor"
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

// Get System Analytics
const getSystemAnalytics = async (req, res) => {
  try {
    const { period = 'week' } = req.query; // week, month, year
    
    let startDate;
    switch (period) {
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // week
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    // User registrations over time
    const userRegistrations = await User.aggregate([
      {
        $match: {
          role: 'patient',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Doctor status distribution
    const doctorStatusDistribution = await Doctor.aggregate([
      {
        $group: {
          _id: "$availability.status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Most popular specialties
    const popularSpecialties = await Doctor.aggregate([
      {
        $group: {
          _id: "$speciality",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          totalSlots: { $sum: "$availableSlots" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      analytics: {
        period,
        userRegistrations,
        doctorStatusDistribution,
        popularSpecialties,
        summary: {
          totalDoctors: await Doctor.countDocuments(),
          totalUsers: await User.countDocuments({ role: 'patient' }),
          activeDoctors: await Doctor.countDocuments({ isActive: true }),
          avgDoctorRating: await Doctor.aggregate([
            { $group: { _id: null, avg: { $avg: "$rating" } } }
          ]).then(result => result[0]?.avg.toFixed(1) || '0.0')
        }
      }
    });

  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics"
    });
  }
};

export {
  initializeAdmins,
  adminLogin,
  getDashboardStats,
  getAllDoctorsAdmin,
  getAllUsersAdmin,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  getAdminProfile,
  getSystemAnalytics
};