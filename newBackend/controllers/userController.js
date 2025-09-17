import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const pickUserData = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role || "user",
  phone: u.phone || "",
  address: u.address || "",
  gender: u.gender || "",
  dob: u.dob || "",
  image:
    u.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      u.name
    )}&background=3b82f6&color=ffffff&size=400`,
});

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: passwordHash });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      userData: pickUserData(user),
    });
  } catch (e) {
    console.error("Registration error:", e);
    return res.status(500).json({ success: false, message: "Error creating account. Please try again." });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      success: true,
      message: "Login successful",
      token,
      userData: pickUserData(user),
    });
  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({ success: false, message: "Error logging in. Please try again." });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, userData: pickUserData(user) });
  } catch (e) {
    console.error("Get profile error:", e);
    return res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address, gender, dob } = req.body || {};
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      userData: pickUserData(user),
    });
  } catch (e) {
    console.error("Update profile error:", e);
    return res.status(500).json({ success: false, message: "Error updating profile" });
  }
};
