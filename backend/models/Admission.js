const mongoose = require("mongoose");

const admissionSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    bed: { type: mongoose.Schema.Types.ObjectId, ref: "Bed", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    reason: { type: String },
    admitDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["Admitted", "Discharged"], default: "Admitted" },
    dischargeDate: { type: Date },
    dischargeNote: { type: String },
    daysStayed: { type: Number },
    roomCharge: { type: Number },
    bill: { type: mongoose.Schema.Types.ObjectId, ref: "Bill" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admission", admissionSchema);
