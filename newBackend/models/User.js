// newBackend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true }, // bcrypt hash
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    gender: { type: String, default: "" },
    dob: { type: String, default: "" },
    role: { type: String, default: "user" }, // 'user' | 'admin'
    image: { type: String, default: null },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
