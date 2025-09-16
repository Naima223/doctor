import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './doctordb/connect.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Add your frontend URLs
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'QuickDoc Server v2.0 is running!',
    version: '2.0',
    features: ['Separate Admin/Patient Login', 'Enhanced Security', 'Role-based Access'],
    endpoints: {
      patient: {
        base: '/api/user',
        routes: ['POST /register', 'POST /login', 'GET /profile', 'PUT /profile', 'GET /doctors']
      },
      admin: {
        base: '/api/admin', 
        routes: ['POST /login', 'GET /dashboard/stats', 'GET /doctors', 'PUT /doctors/:id/availability']
      }
    }
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    routes: {
      patient: [
        'POST /api/user/register - Register new patient',
        'POST /api/user/login - Patient login',
        'GET /api/user/profile - Get patient profile (auth required)',
        'PUT /api/user/profile - Update patient profile (auth required)', 
        'GET /api/user/doctors - Get all doctors (public)'
      ],
      admin: [
        'POST /api/admin/login - Admin login',
        'GET /api/admin/dashboard/stats - Dashboard statistics (admin auth)',
        'GET /api/admin/doctors - Get all doctors for admin (admin auth)',
        'POST /api/admin/doctors - Add new doctor (admin auth)',
        'PUT /api/admin/doctors/:id/availability - Update doctor availability (admin auth)',
        'PUT /api/admin/doctors/:id/toggle-status - Toggle doctor status (admin auth)'
      ]
    }
  });
});

// API Routes
app.use('/api/user', userRoutes);    // Patient routes
app.use('/api/admin', adminRoutes);  // Admin routes

// Legacy route support (for existing frontend)
app.get('/api/doctors', (req, res) => {
  res.redirect('/api/user/doctors');
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: {
      patient: '/api/user/*',
      admin: '/api/admin/*',
      health: '/',
      test: '/api/test'
    }
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry found'
    });
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.log('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️  Shutting down server...');
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🚀 QuickDoc Server v2.0 running on port ${PORT}
🏥 Health: http://localhost:${PORT}
🔧 API Test: http://localhost:${PORT}/api/test

👥 PATIENT ENDPOINTS:
   📝 Register: POST /api/user/register
   🔐 Login: POST /api/user/login  
   👤 Profile: GET/PUT /api/user/profile
   👨‍⚕️ Doctors: GET /api/user/doctors

🔐 ADMIN ENDPOINTS:  
   🔑 Login: POST /api/admin/login
   📊 Dashboard: GET /api/admin/dashboard/stats
   👨‍⚕️ Doctors: GET/POST /api/admin/doctors
   ⚙️ Availability: PUT /api/admin/doctors/:id/availability

📊 Database: ${process.env.MONGO_URI ? 'MongoDB Atlas' : 'Local MongoDB'}
🌍 Environment: ${process.env.NODE_ENV || 'development'}

📋 SETUP INSTRUCTIONS:
   1. Run: node scripts/setupAdmin.js (to create admin accounts)
   2. Run: node scripts/addSampledata.js (to add sample doctors)
   
🔑 DEFAULT ADMIN LOGIN:
   Email: admin@quickdoc.com
   Password: admin123
  `);
});