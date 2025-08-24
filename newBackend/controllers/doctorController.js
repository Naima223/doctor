import Doctor from "../models/Doctor.js";
export const getDoctor = async (req, res) => {
    try {
        const doctors= await Doctor.find();
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message:error.message });
    }
};
export const newDoctor  = async (req, res) => {
    try {
        const { name, email, password, specialization, experience, contactNumber, clinicAddress, availableSlots } = req.body;
        const doctor = new Doctor({ name, email, password, specialization, experience, contactNumber, clinicAddress, availableSlots });
        await doctor.save();
        res.status(201).json(doctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
    