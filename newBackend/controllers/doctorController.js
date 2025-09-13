import Doctor from "../list/Doctor.js";

export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().sort({ name: 1 });
        res.json({
            success: true,
            count: doctors.length,
            doctors
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

export const newDoctor = async (req, res) => {
    try {
        const doctor = new Doctor(req.body);
        const savedDoctor = await doctor.save();
        res.status(201).json({
            success: true,
            message: 'Doctor added successfully',
            doctor: savedDoctor
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};

export const bulkInsertDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.insertMany(req.body);
        res.status(201).json({
            success: true,
            message: `${doctors.length} doctors inserted successfully`,
            count: doctors.length,
            doctors
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};

// New routes for admin functionality
export const updateDoctorAvailability = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { status, reason, expectedBackTime, availableSlots } = req.body;
        
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Update availability using the schema method
        doctor.availability.status = status;
        doctor.availability.reason = reason || '';
        doctor.availability.expectedBackTime = expectedBackTime || null;
        doctor.availability.lastUpdated = new Date();
        doctor.availability.updatedBy = req.user?.name || 'admin';

        // Update available slots based on status
        if (status === 'available') {
            doctor.availableSlots = availableSlots || doctor.availableSlots;
        } else {
            doctor.availableSlots = 0;
        }

        await doctor.save();

        res.json({
            success: true,
            message: 'Doctor availability updated successfully',
            doctor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const toggleDoctorStatus = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const doctor = await Doctor.findById(doctorId);
        
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        doctor.isActive = !doctor.isActive;
        if (!doctor.isActive) {
            doctor.availableSlots = 0;
            doctor.availability.status = 'temporarily_unavailable';
            doctor.availability.reason = 'Temporarily disabled by admin';
        }

        await doctor.save();

        res.json({
            success: true,
            message: `Doctor ${doctor.isActive ? 'activated' : 'deactivated'} successfully`,
            doctor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const addDoctorNote = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { note } = req.body;
        
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        doctor.adminNotes.push({
            note,
            createdBy: req.user?.name || 'admin'
        });

        await doctor.save();

        res.json({
            success: true,
            message: 'Note added successfully',
            doctor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};