const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
    paymentMethod: { type: String, enum: ["", "Cash", "Card", "UPI", "Insurance"], default: "" },
    paidAt: { type: Date },
    admission: { type: mongoose.Schema.Types.ObjectId, ref: "Admission" }, // set for room-charge bills
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);
