import mongoose from "mongoose";

const doctorschema = new mongoose.Schema(
    {
        name:{type: String, required: true},
        email:{type: String, required: true, unique: true},
    }
);

const Doctor = mongoose.model('Doctor', doctorschema);

export default Doctor;