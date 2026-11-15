const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true, trim: true },
    type: {
      type: String,
      enum: ["General Ward", "Semi-Private", "Private Room", "ICU", "Emergency"],
      required: true,
    },
    floor: { type: String, default: "" },
    pricePerDay: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
