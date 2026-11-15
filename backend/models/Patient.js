const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    phone: { type: String, required: true },
    address: { type: String },
    bloodGroup: { type: String },
    disease: { type: String },
    admitted: { type: Boolean, default: false }, // set automatically by the Admissions module
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
