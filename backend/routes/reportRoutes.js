const express = require("express");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Bill = require("../models/Bill");
const Bed = require("../models/Bed");
const Admission = require("../models/Admission");
const Expense = require("../models/Expense");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(verifyToken);

router.get("/summary", requireRole("admin"), async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const paid = await Bill.find({ status: "Paid" });
    const unpaid = await Bill.find({ status: "Unpaid" });
    const expenses = await Expense.find().lean();

    const totalRevenue = paid.reduce((s, b) => s + b.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

    const expensesByCategory = {};
    expenses.forEach((e) => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    });

    const totalBeds = await Bed.countDocuments();
    const occupiedBeds = await Bed.countDocuments({ status: "Occupied" });
    const availableBeds = await Bed.countDocuments({ status: "Available" });

    res.json({
      totalPatients: await Patient.countDocuments(),
      totalDoctors: await Doctor.countDocuments(),
      totalAppointments: await Appointment.countDocuments(),
      appointmentsToday: await Appointment.countDocuments({ date: today }),
      currentlyAdmitted: await Admission.countDocuments({ status: "Admitted" }),
      totalDischarged: await Admission.countDocuments({ status: "Discharged" }),
      totalBeds,
      occupiedBeds,
      availableBeds,
      occupancyRate: totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
      totalRevenue,
      pendingAmount: unpaid.reduce((s, b) => s + b.amount, 0),
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      expensesByCategory,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
