import mongoose from "mongoose";
const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },      
    password: { type: String, required: true },
    specialization: { type: String, required: true },   
    experience: { type: Number, required: true },
    contactNumber: { type: String, required: true },
    clinicAddress: { type: String, required: true },
    availableSlots: [{ type: String }]
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;