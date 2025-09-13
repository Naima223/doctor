import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/doctordb')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Doctor Schema
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
  consultationFee: Number
});

const Doctor = mongoose.model('Doctor', doctorSchema);

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working!',
    routes: [
      'GET /api/doctors',
      'POST /api/doctors',
      'POST /api/doctors/bulk',
      'POST /api/user/register',
      'POST /api/user/login'
    ]
  });
});

// Get all doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find();
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
app.post('/api/doctors', async (req, res) => {
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

// Bulk insert doctors - THE MAIN ROUTE YOU NEED
app.post('/api/doctors/bulk', async (req, res) => {
  try {
    console.log('Bulk insert request received');
    console.log('Data:', req.body);
    
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

// Register user
app.post('/api/user/register', async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json({
      success: true,
      message: 'User registered',
      user: savedUser
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Login user
app.post('/api/user/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      res.json({
        success: true,
        message: 'Login successful',
        user
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🚀 Server running on port ${PORT}
📍 Health: http://localhost:${PORT}
📍 Test: http://localhost:${PORT}/api/test
📍 Bulk Insert: POST http://localhost:${PORT}/api/doctors/bulk
  `);
});