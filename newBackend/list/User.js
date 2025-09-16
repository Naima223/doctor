import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
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
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', ''],
    default: ''
  },
  dob: {
    type: Date,
    default: null
  },
  image: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    default: 'patient'  // To distinguish from admin
  }
}, {
  timestamps: true
});

// Generate avatar URL based on name if no image provided
userSchema.virtual('avatarUrl').get(function() {
  if (this.image) return this.image;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=3b82f6&color=ffffff&size=400`;
});

const User = mongoose.model('User', userSchema);

export default User;