// newBackend/scripts/addSampleData.js
// Run this script to add sample doctors with different availability statuses

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const doctorSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  speciality: String,
  image: String,
  rating: Number,
  experience: String,
  location: String,
  phone: String,
  availableSlots: Number,
  degree: String,
  consultationFee: Number,
  isActive: { type: Boolean, default: true },
  availability: {
    status: { type: String, enum: ['available', 'temporarily_unavailable', 'on_leave', 'busy'], default: 'available' },
    reason: { type: String, default: '' },
    expectedBackTime: { type: Date, default: null },
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: { type: String, default: 'system' }
  },
  adminNotes: [{
    note: String,
    createdAt: { type: Date, default: Date.now },
    createdBy: String
  }]
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);

const sampleDoctors = [
  {
    name: "Dr. Aminul Islam",
    email: "aminul.islam@hospital.com",
    speciality: "General physician",
    image: "/api/placeholder/400/400",
    rating: 4.8,
    experience: "8 years",
    location: "Ibn Sina Medical College Hospital",
    phone: "+880 1711-123456",
    availableSlots: 12,
    degree: "MBBS, FCPS",
    consultationFee: 800,
    isActive: true,
    availability: {
      status: 'available',
      reason: '',
      expectedBackTime: null
    }
  },
  {
    name: "Dr. Fatema Khatun",
    email: "fatema.khatun@hospital.com",
    speciality: "Dermatologist",
    image: "/api/placeholder/400/400",
    rating: 4.9,
    experience: "12 years",
    location: "Square Hospitals Ltd.",
    phone: "+880 1712-234567",
    availableSlots: 0,
    degree: "MBBS, DDV",
    consultationFee: 1200,
    isActive: true,
    availability: {
      status: 'temporarily_unavailable',
      reason: 'Emergency surgery scheduled',
      expectedBackTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
    }
  },
  {
    name: "Dr. Rashida Begum",
    email: "rashida.begum@hospital.com",
    speciality: "Gynecologist",
    image: "/api/placeholder/400/400",
    rating: 4.7,
    experience: "10 years",
    location: "Labaid Specialized Hospital",
    phone: "+880 1713-345678",
    availableSlots: 0,
    degree: "MBBS, FCPS (Gynae)",
    consultationFee: 1000,
    isActive: true,
    availability: {
      status: 'on_leave',
      reason: 'Annual vacation',
      expectedBackTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next week
    }
  },
  {
    name: "Dr. Mohammad Rahman",
    email: "mohammad.rahman@hospital.com",
    speciality: "Pediatrician",
    image: "/api/placeholder/400/400",
    rating: 4.9,
    experience: "15 years",
    location: "Bangladesh Specialized Hospital",
    phone: "+880 1714-456789",
    availableSlots: 0,
    degree: "MBBS, DCH, FCPS",
    consultationFee: 900,
    isActive: true,
    availability: {
      status: 'busy',
      reason: 'In conference until 5 PM',
      expectedBackTime: null
    }
  },
  {
    name: "Dr. Nazrul Islam",
    email: "nazrul.islam@hospital.com",
    speciality: "Neurologist",
    image: "/api/placeholder/400/400",
    rating: 4.8,
    experience: "18 years",
    location: "National Institute of Neurosciences & Hospital",
    phone: "+880 1715-567890",
    availableSlots: 4,
    degree: "MBBS, FCPS (Neuro)",
    consultationFee: 1500,
    isActive: true,
    availability: {
      status: 'available',
      reason: '',
      expectedBackTime: null
    }
  },
  {
    name: "Dr. Shahida Parveen",
    email: "shahida.parveen@hospital.com",
    speciality: "Gastroenterologist",
    image: "/api/placeholder/400/400",
    rating: 4.6,
    experience: "14 years",
    location: "United Hospital Limited",
    phone: "+880 1716-678901",
    availableSlots: 0,
    degree: "MBBS, FCPS (Medicine)",
    consultationFee: 1100,
    isActive: false, // Temporarily closed
    availability: {
      status: 'temporarily_unavailable',
      reason: 'System maintenance',
      expectedBackTime: null
    }
  }
];

async function addSampleData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing doctors
    await Doctor.deleteMany({});
    console.log('Cleared existing doctors');
    
    // Add sample doctors
    const result = await Doctor.insertMany(sampleDoctors);
    console.log(`Added ${result.length} sample doctors with various availability statuses`);
    
    console.log('\nSample doctors added:');
    result.forEach(doc => {
      console.log(`- ${doc.name} (${doc.speciality}) - Status: ${doc.availability.status}`);
    });
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

addSampleData();