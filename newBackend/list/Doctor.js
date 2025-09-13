import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
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
  speciality: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 4.0,
    min: 0,
    max: 5
  },
  experience: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  availableSlots: {
    type: Number,
    default: 0,
    min: 0
  },
  degree: {
    type: String,
    required: true
  },
  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Availability management fields
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
      type: String,
      default: 'system'
    }
  },
  
  // Admin notes
  adminNotes: [{
    note: String,
    createdAt: { type: Date, default: Date.now },
    createdBy: String
  }]
}, { 
  timestamps: true 
});

// Virtual for avatar URL
doctorSchema.virtual('avatarUrl').get(function() {
  if (this.image && this.image !== '/api/placeholder/400/400') return this.image;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=3b82f6&color=ffffff&size=400`;
});

// Index for better search performance
doctorSchema.index({ speciality: 1 });
doctorSchema.index({ 'availability.status': 1 });
doctorSchema.index({ isActive: 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;