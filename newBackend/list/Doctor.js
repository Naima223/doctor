// newBackend/list/Doctor.js - Updated with availability status
import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  speciality: { type: String, required: true },
  image: String,
  rating: Number,
  experience: String,
  location: String,
  phone: String,
  availableSlots: Number,
  degree: String,
  consultationFee: Number,
  
  // New availability management fields
  isActive: { 
    type: Boolean, 
    default: true 
  },
  availability: {
    status: {
      type: String,
      enum: ['available', 'temporarily_unavailable', 'on_leave', 'busy'],
      default: 'available'
    },
    reason: {
      type: String,
      default: ''
    },
    expectedBackTime: {
      type: Date,
      default: null
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: String, // Admin who made the change
      default: 'system'
    }
  },
  
  // Admin notes for internal use
  adminNotes: [{
    note: String,
    createdAt: { type: Date, default: Date.now },
    createdBy: String
  }]
}, { 
  timestamps: true 
});

// Virtual field to check if doctor is currently available
doctorSchema.virtual('isCurrentlyAvailable').get(function() {
  return this.isActive && this.availability.status === 'available';
});

// Method to update availability
doctorSchema.methods.updateAvailability = function(status, reason = '', expectedBackTime = null, updatedBy = 'admin') {
  this.availability.status = status;
  this.availability.reason = reason;
  this.availability.expectedBackTime = expectedBackTime;
  this.availability.lastUpdated = new Date();
  this.availability.updatedBy = updatedBy;
  
  // If setting to unavailable, reset available slots to 0
  if (status !== 'available') {
    this.availableSlots = 0;
  }
  
  return this.save();
};

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;