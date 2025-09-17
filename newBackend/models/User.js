// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    // keep one canonical email: lowercase + unique
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // store the HASH here (bcrypt hashed value)
    password: { type: String, required: true },

    // profile fields
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    gender: { type: String, default: "" }, // or enum: ['male','female','other','']
    dob: { type: String, default: "" },    // keep as string since controller expects string

    // app-level fields
    role: { type: String, default: "user" }, // 'user' | 'admin'
    image: { type: String, default: null },  // optional avatar URL
  },
  { timestamps: true }
);

// Prevent model overwrite on hot reload (Vite/Next style dev)
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
