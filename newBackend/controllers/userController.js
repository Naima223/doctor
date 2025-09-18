import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* ---------- helpers ---------- */
const ensureJwt = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
  return process.env.JWT_SECRET;
};

const signToken = (id) => jwt.sign({ id }, ensureJwt(), { expiresIn: "7d" });

const pickUserData = (u) => {
  const id = u._id?.toString?.() || u._id || u.id;
  return {
    _id: id,                 // keep _id for Mongo-style consumers
    id,                      // and id for UI/other code that expects `id`
    name: u.name,
    email: (u.email || "").toLowerCase(),
    role: u.role || "user",
    phone: u.phone || "",
    address: u.address || "",
    gender: u.gender || "",
    dob: u.dob || "",
    image:
      u.image ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        u.name || ""
      )}&background=3b82f6&color=ffffff&size=400`,
  };
};

/* ---------- controllers ---------- */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all required fields" });
    }

    const emailLc = email.toLowerCase();
    const existing = await User.findOne({ email: emailLc });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists with this email" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: emailLc, password: passwordHash });

    const token = signToken(user._id);
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      userData: pickUserData(user),
    });
  } catch (e) {
    console.error("Registration error:", e);
    return res
      .status(500)
      .json({ success: false, message: "Error creating account. Please try again." });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    const emailLc = email.toLowerCase();
    const user = await User.findOne({ email: emailLc });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken(user._id);
    return res.json({
      success: true,
      message: "Login successful",
      token,
      userData: pickUserData(user),
    });
  } catch (e) {
    console.error("Login error:", e);
    return res
      .status(500)
      .json({ success: false, message: "Error logging in. Please try again." });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    // auth middleware already sets req.user (sans password)
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

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (gender !== undefined) user.gender = gender;
    if (dob !== undefined) user.dob = dob;

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
