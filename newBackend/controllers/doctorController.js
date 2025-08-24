import Doctor from "../list/Doctor.js";

export const getAllDoctors = async (req, res) => 
    {
    try {
        const doctors = await Doctor.find();
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const newDoctor = async (req, res) => {

   try {
        const { name, email } = req.body;
        const doctor = new Doctor({name, email});
        await doctor.save();
        res.status(201).json(doctor);
   }catch (error) {
        res.status(500).json({ message: error.message });
   }

}