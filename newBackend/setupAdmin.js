// setupAdmin.js - Secure version
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import readline from 'readline';

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

// Create readline interface for secure input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to hide password input
function hidePassword(query) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    
    process.stdout.write(query);
    let password = '';
    
    stdin.on('data', function(char) {
      char = char + '';
      
      switch(char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.setRawMode(false);
          stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f': // backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

async function createSecureAdmin() {
  try {
    console.log('🔐 Secure Admin Setup for QuickDoc');
    console.log('=====================================\n');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Check if any admin already exists
    const existingAdmins = await Admin.countDocuments();
    if (existingAdmins > 0) {
      console.log('⚠️  Admin accounts already exist in the database.');
      
      rl.question('Do you want to create another admin? (y/N): ', async (answer) => {
        if (answer.toLowerCase() !== 'y') {
          console.log('Setup cancelled.');
          process.exit(0);
        }
        
        await promptForAdminDetails();
      });
    } else {
      await promptForAdminDetails();
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
}

async function promptForAdminDetails() {
  try {
    // Get admin details
    const name = await new Promise(resolve => {
      rl.question('Enter admin name: ', resolve);
    });
    
    const email = await new Promise(resolve => {
      rl.question('Enter admin email: ', resolve);
    });
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format');
      process.exit(1);
    }
    
    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log('❌ Admin with this email already exists');
      process.exit(1);
    }
    
    const password = await hidePassword('Enter admin password (min 6 chars): ');
    
    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters');
      process.exit(1);
    }
    
    const role = await new Promise(resolve => {
      rl.question('Enter role (admin/super_admin) [default: admin]: ', (answer) => {
        resolve(answer || 'admin');
      });
    });
    
    if (!['admin', 'super_admin'].includes(role)) {
      console.log('❌ Invalid role. Must be admin or super_admin');
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
    
    console.log('\n✅ Admin created successfully!');
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log('\n🔒 Store these credentials securely - they will not be displayed again.');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    rl.close();
    await mongoose.connection.close();
    process.exit(0);
  }
}

createSecureAdmin();