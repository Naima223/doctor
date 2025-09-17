// createAdmin.js - Quick admin creation script
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'super_admin'], default: 'admin' },
  permissions: [{ type: String, enum: ['manage_doctors', 'manage_users', 'view_analytics', 'manage_appointments'] }],
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: null }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

async function createAdmin() {
  try {
    console.log('🔐 Creating Admin Account for QuickDoc');
    console.log('====================================\n');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get admin details from command line arguments or use defaults
    const args = process.argv.slice(2);
    const email = args[0] || 'admin@quickdoc.com';
    const password = args[1] || 'admin123456';
    const name = args[2] || 'System Administrator';
    const role = args[3] || 'super_admin';
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log(`❌ Admin with email ${email} already exists`);
      console.log('   Use a different email or delete the existing admin first.');
      process.exit(1);
    }
    
    // Validate input
    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters long');
      process.exit(1);
    }
    
    // Create admin
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const admin = new Admin({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      permissions: ['manage_doctors', 'manage_users', 'view_analytics', 'manage_appointments']
    });
    
    await admin.save();
    
    console.log('✅ Admin created successfully!');
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Password: ${password}`);
    console.log('\n🔒 IMPORTANT: Store these credentials securely!');
    console.log('   The password will not be displayed again.\n');
    
    console.log('📝 Usage Instructions:');
    console.log('   1. Go to: http://localhost:3000/admin');
    console.log(`   2. Login with email: ${admin.email}`);
    console.log(`   3. Login with password: ${password}`);
    console.log('   4. Access admin dashboard after successful login\n');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    
    if (error.code === 11000) {
      console.log('   This email is already registered as an admin.');
    }
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Show usage if help is requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node createAdmin.js [email] [password] [name] [role]');
  console.log('');
  console.log('Examples:');
  console.log('  node createAdmin.js');
  console.log('  node createAdmin.js admin@company.com mypassword "John Doe" admin');
  console.log('  node createAdmin.js jane@example.com securepass123 "Jane Smith" super_admin');
  console.log('');
  console.log('Defaults:');
  console.log('  email: admin@quickdoc.com');
  console.log('  password: admin123456');
  console.log('  name: System Administrator');
  console.log('  role: super_admin');
  process.exit(0);
}

createAdmin();