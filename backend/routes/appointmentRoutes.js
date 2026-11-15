const express = require("express");
const Appointment = require("../models/Appointment");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(verifyToken);

// GET /api/appointments?status=Scheduled&date=2026-10-25
router.get("/", async (req, res) => {
  const filter = {};
  if (["Scheduled", "Completed", "Cancelled"].includes(req.query.status)) filter.status = req.query.status;
  if (/^\d{4}-\d{2}-\d{2}$/.test(req.query.date || "")) filter.date = req.query.date;

  const appointments = await Appointment.find(filter)
    .populate("patient", "name phone")
    .populate("doctor", "name specialization")
    .sort({ date: -1, time: -1 });
  res.json(appointments);
});

router.post("/", requireRole("admin", "receptionist"), async (req, res) => {
  try {
    const { patient, doctor, date, time, reason } = req.body;
    if (!patient || !doctor || !date || !time) {
      return res.status(400).json({ message: "Patient, doctor, date and time are required" });
    }

    // stop two appointments for the same doctor at the same time
    const clash = await Appointment.findOne({ doctor, date, time, status: "Scheduled" });
    if (clash) {
      return res.status(400).json({ message: "This doctor already has an appointment at that date and time" });
    }

    res.status(201).json(await Appointment.create({ patient, doctor, date, time, reason }));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update status or reschedule (date / time)
router.put("/:id", requireRole("admin", "receptionist", "doctor"), async (req, res) => {
  try {
    const { status, date, time, reason } = req.body;
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if ((date && date !== appt.date) || (time && time !== appt.time)) {
      const clash = await Appointment.findOne({
        _id: { $ne: appt._id },
        doctor: appt.doctor,
        date: date || appt.date,
        time: time || appt.time,
        status: "Scheduled",
      });
      if (clash) {
        return res.status(400).json({ message: "This doctor already has an appointment at that date and time" });
      }
    }

    if (status) appt.status = status;
    if (date) appt.date = date;
    if (time) appt.time = time;
    if (reason !== undefined) appt.reason = reason;
    await appt.save();
    res.json(appt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", requireRole("admin", "receptionist"), async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ message: "Appointment deleted" });
});

module.exports = router;
