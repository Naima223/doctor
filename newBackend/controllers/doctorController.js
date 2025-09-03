import Doctor from "../list/Doctor.js";

export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const newDoctor = async (req, res) => {
    try {
        const doctor = new Doctor(req.body);
        const savedDoctor = await doctor.save();
        res.status(201).json(savedDoctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const bulkInsertDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.insertMany(req.body);
        res.status(201).json(doctors);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; 