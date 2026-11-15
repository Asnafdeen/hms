const express = require("express");
const Room = require("../models/Room");
const Bed = require("../models/Bed");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(verifyToken);

// GET /api/beds  -> all beds with room + patient name
router.get("/", async (req, res) => {
  const filter = {};
  if (["Available", "Occupied", "Cleaning", "Maintenance"].includes(req.query.status)) {
    filter.status = req.query.status;
  }
  const beds = await Bed.find(filter)
    .populate("room", "roomNumber type floor pricePerDay")
    .populate("patient", "name")
    .sort({ bedNumber: 1 });
  res.json(beds);
});

// GET /api/beds/summary  -> counts, occupancy and smart alerts
router.get("/summary", async (req, res) => {
  const beds = await Bed.find().populate("room", "type").lean();

  const empty = () => ({ total: 0, Available: 0, Occupied: 0, Cleaning: 0, Maintenance: 0 });
  const overall = empty();
  const byType = {};

  beds.forEach((b) => {
    const type = b.room ? b.room.type : "Unknown";
    byType[type] = byType[type] || empty();
    [overall, byType[type]].forEach((o) => {
      o.total++;
      o[b.status]++;
    });
  });

  // Smart alerts: warn when a ward type is almost full
  const alerts = [];
  Object.keys(byType).forEach((type) => {
    const c = byType[type];
    if (c.total === 0) return;
    if (c.Available === 0) {
      alerts.push({ level: "danger", type, message: `No free ${type} beds` });
    } else if (c.Available / c.total <= 0.2) {
      alerts.push({ level: "warning", type, message: `Only ${c.Available} ${type} bed(s) free` });
    }
  });

  const occupancyRate = overall.total ? Math.round((overall.Occupied / overall.total) * 100) : 0;
  res.json({ overall, byType, alerts, occupancyRate });
});

// POST /api/beds/smart-assign   body: { type: "ICU" }
// Suggests the best free bed: prefers a room that already has patients,
// so nursing care stays together and empty rooms stay free.
router.post("/smart-assign", async (req, res) => {
  try {
    const { type } = req.body;
    const rooms = await Room.find(type ? { type } : {}).lean();
    const roomIds = rooms.map((r) => r._id);

    const free = await Bed.find({ room: { $in: roomIds }, status: "Available" }).lean();
    if (!free.length) {
      return res.status(404).json({ message: `No free bed available${type ? " in " + type : ""}` });
    }

    const counts = await Bed.aggregate([
      { $match: { room: { $in: roomIds }, status: "Occupied" } },
      { $group: { _id: "$room", n: { $sum: 1 } } },
    ]);
    const occupiedIn = {};
    counts.forEach((c) => (occupiedIn[String(c._id)] = c.n));

    free.sort((a, b) => {
      const diff = (occupiedIn[String(b.room)] || 0) - (occupiedIn[String(a.room)] || 0);
      if (diff !== 0) return diff;
      return a.bedNumber.localeCompare(b.bedNumber, undefined, { numeric: true });
    });

    const best = free[0];
    const bed = await Bed.findById(best._id).populate("room", "roomNumber type floor pricePerDay");
    const reason = (occupiedIn[String(best.room)] || 0) > 0
      ? "This room already has patients, so nursing care stays together."
      : "First free bed in this ward type.";

    res.json({ bed, reason });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/beds/:id/status  -> Available / Cleaning / Maintenance
router.put("/:id/status", requireRole("admin", "receptionist"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Available", "Cleaning", "Maintenance"].includes(status)) {
      return res.status(400).json({ message: "Status must be Available, Cleaning or Maintenance" });
    }
    const bed = await Bed.findById(req.params.id);
    if (!bed) return res.status(404).json({ message: "Bed not found" });
    if (bed.status === "Occupied") {
      return res.status(400).json({ message: "Bed is occupied. Discharge the patient first." });
    }
    bed.status = status;
    await bed.save();
    res.json(bed);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", requireRole("admin"), async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id);
    if (!bed) return res.status(404).json({ message: "Bed not found" });
    if (bed.status === "Occupied") {
      return res.status(400).json({ message: "Bed is occupied. Discharge the patient first." });
    }
    await bed.deleteOne();
    res.json({ message: "Bed deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
