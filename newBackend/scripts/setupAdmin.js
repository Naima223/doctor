import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import Admin from '../list/Admin.js';

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const adminData = {
      name: "Admin User",
      email: "admin@quickdoc.com",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
      permissions: ["manage_doctors", "manage_users", "view_analytics", "manage_appointments"],
      isActive: true
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin already exists with email:', adminData.email);
      return;
    }

    const admin = new Admin(adminData);
    await admin.save();
    
    console.log('✅ Admin created successfully!');
    console.log('Email:', adminData.email);
    console.log('Password: admin123');
    console.log('Role:', adminData.role);
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

createAdmin();