// newBackend/models/Appointment.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
    slotDate: { type: Date, required: true },
    slotTime: { type: String, required: true },
    status: { type: String, enum: ["pending", "upcoming", "completed", "canceled"], default: "upcoming", index: true },
    complaint: { type: String, default: "" }
  },
  { timestamps: true }
);

appointmentSchema.index({ userId: 1, slotDate: 1 });
appointmentSchema.index({ doctorId: 1, slotDate: 1, slotTime: 1 });

const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);
export default Appointment;
