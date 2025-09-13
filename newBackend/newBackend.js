import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/doctordb')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Updated Doctor Schema with availability
const doctorSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  speciality: String,
  image: String,
  rating: Number,
  experience: String,
  location: String,
  phone: String,
  availableSlots: Number,
  degree: String,
  consultationFee: Number,
  
  // Availability management fields
  isActive: { 
    type: Boolean, 
    default: true 
  },
  availability: {
    status: {
      type: String,
      enum: ['available', 'temporarily_unavailable', 'on_leave', 'busy'],
      default: 'available'
    },
    reason: {
      type: String,
      default: ''
    },
    expectedBackTime: {
      type: Date,
      default: null
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: String,
      default: 'system'
    }
  },
  
  // Admin notes
  adminNotes: [{
    note: String,
    createdAt: { type: Date, default: Date.now },
    createdBy: String
  }]
}, { 
  timestamps: true 
});

const Doctor = mongoose.model('Doctor', doctorSchema);

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', ''],
    default: ''
  },
  dob: {
    type: Date,
    default: null
  },
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

// Auth middleware
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token."
    });
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'QuickDoc Server is working!' });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working!',
    routes: [
      'GET /api/doctors',
      'POST /api/doctors',
      'POST /api/doctors/bulk',
      'PUT /api/admin/doctors/:doctorId/availability',
      'PUT /api/admin/doctors/:doctorId/toggle-status',
      'POST /api/admin/doctors/:doctorId/notes',
      'POST /api/user/register',
      'POST /api/user/login',
      'GET /api/user/profile',
      'PUT /api/user/profile'
    ]
  });
});

// Get all doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ name: 1 });
    res.json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create single doctor
app.post('/api/doctors', authenticateToken, async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    const savedDoctor = await doctor.save();
    res.status(201).json({
      success: true,
      message: 'Doctor created',
      doctor: savedDoctor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Bulk insert doctors
app.post('/api/doctors/bulk', authenticateToken, async (req, res) => {
  try {
    console.log('Bulk insert request received');
    
    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Data must be an array'
      });
    }

    const doctors = await Doctor.insertMany(req.body);
    res.status(201).json({
      success: true,
      message: `${doctors.length} doctors inserted`,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    console.error('Bulk insert error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Admin Routes
// Update doctor availability
app.put('/api/admin/doctors/:doctorId/availability', authenticateToken, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status, reason, expectedBackTime, availableSlots } = req.body;
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    doctor.availability.status = status;
    doctor.availability.reason = reason || '';
    doctor.availability.expectedBackTime = expectedBackTime || null;
    doctor.availability.lastUpdated = new Date();
    doctor.availability.updatedBy = req.user?.name || 'admin';

    if (status === 'available') {
      doctor.availableSlots = availableSlots || doctor.availableSlots;
    } else {
      doctor.availableSlots = 0;
    }

    await doctor.save();

    res.json({
      success: true,
      message: 'Doctor availability updated successfully',
      doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Toggle doctor active status
app.put('/api/admin/doctors/:doctorId/toggle-status', authenticateToken, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    doctor.isActive = !doctor.isActive;
    if (!doctor.isActive) {
      doctor.availableSlots = 0;
      doctor.availability.status = 'temporarily_unavailable';
      doctor.availability.reason = 'Temporarily disabled by admin';
    }

    await doctor.save();

    res.json({
      success: true,
      message: `Doctor ${doctor.isActive ? 'activated' : 'deactivated'} successfully`,
      doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add admin note to doctor
app.post('/api/admin/doctors/:doctorId/notes', authenticateToken, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { note } = req.body;
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    doctor.adminNotes.push({
      note,
      createdBy: req.user?.name || 'admin'
    });

    await doctor.save();

    res.json({
      success: true,
      message: 'Note added successfully',
      doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Register user
app.post('/api/user/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    const user = await newUser.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating account. Please try again."
    });
  }
});

// Login user
app.post('/api/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in. Please try again."
    });
  }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || '',
        dob: user.dob || '',
        image: user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=ffffff&size=400`
      }
    });

  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile"
    });
  }
});

// Update user profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, address, gender, dob } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update user fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || '',
        dob: user.dob || '',
        image: user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=ffffff&size=400`
      }
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile"
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🚀 QuickDoc Server running on port ${PORT}
🏥 Health: http://localhost:${PORT}
🔧 API Test: http://localhost:${PORT}/api/test
👨‍⚕️ Admin Panel: Available for logged-in users
📊 Database: ${process.env.MONGO_URI ? 'MongoDB Atlas' : 'Local MongoDB'}
  `);
});