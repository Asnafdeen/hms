const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema(
  {
    bedNumber: { type: String, required: true, trim: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    status: {
      type: String,
      enum: ["Available", "Occupied", "Cleaning", "Maintenance"],
      default: "Available",
    },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", default: null },
    occupiedSince: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bed", bedSchema);
