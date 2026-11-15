const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    availableDays: { type: [String], default: [] },
    photo: { type: String, default: "" }, // small image saved as a data URL
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
