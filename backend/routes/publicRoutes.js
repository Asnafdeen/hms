const express = require("express");
const Doctor = require("../models/Doctor");
const Bed = require("../models/Bed");

const router = express.Router();

// GET /api/public/doctors  -> only safe fields for the website
router.get("/doctors", async (req, res) => {
  const doctors = await Doctor.find()
    .select("name specialization availableDays photo")
    .sort({ createdAt: -1 });
  res.json(doctors);
});

// GET /api/public/beds  -> live bed availability (no patient details)
router.get("/beds", async (req, res) => {
  const beds = await Bed.find().populate("room", "type").lean();
  const byType = {};
  beds.forEach((b) => {
    const type = b.room ? b.room.type : "Other";
    byType[type] = byType[type] || { type, total: 0, available: 0 };
    byType[type].total++;
    if (b.status === "Available") byType[type].available++;
  });
  res.json(Object.values(byType));
});

module.exports = router;
