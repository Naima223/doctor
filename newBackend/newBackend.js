import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './doctordb/connect.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { initializeAdmins } from './controllers/adminController.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'], 
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection and admin initialization
const initializeApp = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Initialize hardcoded admin accounts
    console.log('🔐 Initializing admin accounts...');
    await initializeAdmins();
    console.log('✅ Admin accounts initialized');
    
  } catch (error) {
    console.error('❌ App initialization failed:', error);
    process.exit(1);
  }
};

// Initialize the app
initializeApp();

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'QuickDoc Server v2.0 is running!',
    version: '2.0',
    port: process.env.PORT || 5001,
    features: [
      'Hardcoded Admin Emails', 
      'Complete Admin Panel', 
      'Doctor Management', 
      'User Management',
      'Analytics Dashboard',
      'Role-based Access Control'
    ],
    adminEmails: [
      'fairuzanadi.048@gmail.com (Super Admin)',
      'fairuz.cse.20230104121@aust.edu (Admin)',
      'anadi@gmail.com (New Admin)'
    ],
    endpoints: {
      patient: {
        base: '/api/user',
        routes: ['POST /register', 'POST /login', 'GET /profile', 'PUT /profile', 'GET /doctors']
      },
      admin: {
        base: '/api/admin', 
        routes: [
          'POST /login',
          'GET /profile', 
          'GET /dashboard/stats',
          'GET /analytics',
          'GET /doctors', 
          'POST /doctors',
          'PUT /doctors/:id',
          'DELETE /doctors/:id',
          'PUT /doctors/:id/availability',
          'PUT /doctors/:id/toggle-status',
          'POST /doctors/:id/notes',
          'GET /users'
        ]
      }
    }
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5001,
    hardcodedAdmins: [
      {
        email: 'fairuzanadi.048@gmail.com',
        password: 'fairuzanadi',
        role: 'super_admin'
      },
      {
        email: 'fairuz.cse.20230104121@aust.edu',
        password: 'fairuzanadifairuzanadi',
        role: 'admin'
      },
        {
    name: "New Admin Name",
    email: "anadi@gmail.com ",
    password: "newpassword",
    role: "admin"
  }

    ],
    routes: {
      patient: [
        'POST /api/user/register - Register new patient',
        'POST /api/user/login - Patient login',
        'GET /api/user/profile - Get patient profile (auth required)',
        'PUT /api/user/profile - Update patient profile (auth required)', 
        'GET /api/user/doctors - Get all doctors (public)'
      ],
      admin: [
        'POST /api/admin/login - Direct admin login',
        'GET /api/admin/profile - Get admin profile (admin auth)',
        'GET /api/admin/dashboard/stats - Dashboard statistics (admin auth)',
        'GET /api/admin/analytics - System analytics (admin auth)',
        'GET /api/admin/doctors - Get all doctors for admin (admin auth)',
        'POST /api/admin/doctors - Add new doctor (admin auth)',
        'PUT /api/admin/doctors/:id - Update doctor (admin auth)',
        'DELETE /api/admin/doctors/:id - Remove doctor (admin auth)',
        'PUT /api/admin/doctors/:id/availability - Update doctor availability (admin auth)',
        'PUT /api/admin/doctors/:id/toggle-status - Toggle doctor status (admin auth)',
        'POST /api/admin/doctors/:id/notes - Add doctor note (admin auth)',
        'GET /api/admin/users - Get all users (admin auth)'
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

// Enhanced port configuration with fallback
const PORT = process.env.PORT || 5001;

// Start server with error handling
const startServer = () => {
  const server = app.listen(PORT, (error) => {
    if (error) {
      console.error(`❌ Failed to start server on port ${PORT}:`, error);
      
      if (error.code === 'EADDRINUSE') {
        console.log(`\n🔄 Port ${PORT} is busy. Trying port ${parseInt(PORT) + 1}...`);
        
        // Try next port
        const nextPort = parseInt(PORT) + 1;
        app.listen(nextPort, () => {
          console.log(`
🚀 QuickDoc Server v2.0 running on port ${nextPort}
🏥 Health: http://localhost:${nextPort}
🔧 API Test: http://localhost:${nextPort}/api/test

👥 PATIENT ENDPOINTS:
   📝 Register: POST /api/user/register
   🔐 Login: POST /api/user/login  
   👤 Profile: GET/PUT /api/user/profile
   👨‍⚕️ Doctors: GET /api/user/doctors

🔐 ADMIN ENDPOINTS:  
   🔑 Login: POST /api/admin/login
   👤 Profile: GET /api/admin/profile
   📊 Dashboard: GET /api/admin/dashboard/stats
   📈 Analytics: GET /api/admin/analytics
   👨‍⚕️ Manage Doctors: GET/POST/PUT/DELETE /api/admin/doctors
   ⚙️ Availability: PUT /api/admin/doctors/:id/availability
   👥 Manage Users: GET /api/admin/users

📊 Database: ${process.env.MONGO_URI ? 'MongoDB Atlas' : 'Local MongoDB'}
🌍 Environment: ${process.env.NODE_ENV || 'development'}

🔑 HARDCODED ADMIN LOGINS:
   📧 Email: fairuzanadi.048@gmail.com
   🔐 Password: fairuzanadi
   👑 Role: Super Admin

   📧 Email: fairuz.cse.20230104121@aust.edu  
   🔐 Password: fairuzanadifairuzanadi
   👑 Role: Admin
   
⚠️  Server started on port ${nextPort} instead of ${PORT}
   Update your frontend to use: http://localhost:${nextPort}
          `);
        });
        
        return;
      }
      
      process.exit(1);
    }
    
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
   👤 Profile: GET /api/admin/profile
   📊 Dashboard: GET /api/admin/dashboard/stats
   📈 Analytics: GET /api/admin/analytics
   👨‍⚕️ Manage Doctors: GET/POST/PUT/DELETE /api/admin/doctors
   ⚙️ Availability: PUT /api/admin/doctors/:id/availability
   👥 Manage Users: GET /api/admin/users

📊 Database: ${process.env.MONGO_URI ? 'MongoDB Atlas' : 'Local MongoDB'}
🌍 Environment: ${process.env.NODE_ENV || 'development'}

🔑 HARDCODED ADMIN LOGINS:
   📧 Email: fairuzanadi.048@gmail.com
   🔐 Password: fairuzanadi
   👑 Role: Super Admin

   📧 Email: fairuz.cse.20230104121@aust.edu  
   🔐 Password: fairuzanadifairuzanadi
   👑 Role: Admin
   
✅ Admin accounts automatically initialized!
    `);
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`❌ Port ${PORT} is already in use.`);
      console.log(`💡 Try these solutions:`);
      console.log(`   1. Kill the process: taskkill /f /im node.exe (Windows) or sudo lsof -ti:${PORT} | xargs kill -9 (Mac/Linux)`);
      console.log(`   2. Change PORT in .env file to a different number (e.g., 3001, 4000, 8000)`);
      console.log(`   3. Run with different port: PORT=3001 npm run dev`);
    } else {
      console.error('Server error:', error);
    }
    process.exit(1);
  });
};

// Start the server
startServer();