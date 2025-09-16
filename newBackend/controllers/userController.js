import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../list/User.js';

// Register new user (Patient)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'patient'
    });

    const user = await newUser.save();

    // Generate JWT token for patient
    const token = jwt.sign(
      { 
        id: user._id, 
        role: 'patient',
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.avatarUrl
      }
    });

  } catch (error) {
    console.error("Patient registration error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error creating account. Please try again."
    });
  }
};

// Login user (Patient)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    // Find user and verify it's a patient
    const user = await User.findOne({ email, role: 'patient' });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT token for patient
    const token = jwt.sign(
      { 
        id: user._id, 
        role: 'patient',
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || '',
        dob: user.dob || '',
        image: user.avatarUrl
      }
    });

  } catch (error) {
    console.error("Patient login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in. Please try again."
    });
  }
};

// Get user profile (Patient)
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user || user.role !== 'patient') {
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
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || '',
        dob: user.dob || '',
        image: user.avatarUrl
      }
    });

  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile"
    });
  }
};

// Update user profile (Patient)
export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address, gender, dob, image } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update user fields
    if (name && name.trim()) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (gender !== undefined) user.gender = gender;
    if (dob !== undefined) user.dob = dob ? new Date(dob) : null;
    if (image !== undefined) user.image = image;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || '',
        dob: user.dob || '',
        image: user.avatarUrl
      }
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile"
    });
  }
};