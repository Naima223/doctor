// newBackend/scripts/setupAdmin.js
// Run this script once to create default admin accounts

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  permissions: [{
    type: String,
    enum: ['manage_doctors', 'manage_users', 'view_analytics', 'manage_appointments']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const Admin = mongoose.model('Admin', adminSchema);

const defaultAdmins = [
  {
    name: "System Admin",
    email: "admin@quickdoc.com",
    password: "admin123",
    role: "super_admin",
    permissions: ['manage_doctors', 'manage_users', 'view_analytics', 'manage_appointments']
  },
  {
    name: "Doctor Manager",
    email: "manager@quickdoc.com", 
    password: "manager123",
    role: "admin",
    permissions: ['manage_doctors', 'view_analytics']
  }
];

async function setupDefaultAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Check if admins already exist
    const existingAdmins = await Admin.find({});
    if (existingAdmins.length > 0) {
      console.log('\n⚠️  Admin accounts already exist:');
      existingAdmins.forEach(admin => {
        console.log(`- ${admin.email} (${admin.role})`);
      });
      console.log('\nTo reset admin accounts, delete them first and run this script again.');
      return;
    }
    
    console.log('Creating default admin accounts...\n');
    
    for (const adminData of defaultAdmins) {
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
      
      const admin = new Admin({
        ...adminData,
        password: hashedPassword
      });
      
      await admin.save();
      
      console.log(`✅ Created admin: ${adminData.email}`);
      console.log(`   Name: ${adminData.name}`);
      console.log(`   Role: ${adminData.role}`);
      console.log(`   Password: ${adminData.password}`);
      console.log(`   Permissions: ${adminData.permissions.join(', ')}`);
      console.log('');
    }
    
    console.log('🎉 Default admin accounts created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Super Admin:');
    console.log('  Email: admin@quickdoc.com');
    console.log('  Password: admin123');
    console.log('');
    console.log('Doctor Manager:');
    console.log('  Email: manager@quickdoc.com');
    console.log('  Password: manager123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  Remember to change these passwords in production!');
    
  } catch (error) {
    console.error('❌ Error setting up admin accounts:', error);
    
    if (error.code === 11000) {
      console.log('\n💡 Tip: Admin with this email already exists');
    }
    
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
}

setupDefaultAdmins();