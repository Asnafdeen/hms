const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Salaries", "Medicines", "Equipment", "Utilities", "Maintenance", "Supplies", "Other"],
      default: "Other",
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, required: true }, // 2026-10-25
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
