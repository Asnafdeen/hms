const express = require("express");
const Room = require("../models/Room");
const Bed = require("../models/Bed");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(verifyToken);

// GET /api/rooms  -> every room with its beds inside
router.get("/", async (req, res) => {
  const rooms = await Room.find().sort({ roomNumber: 1 }).lean();
  const beds = await Bed.find().populate("patient", "name").sort({ bedNumber: 1 }).lean();

  const byRoom = {};
  beds.forEach((b) => {
    const key = String(b.room);
    (byRoom[key] = byRoom[key] || []).push(b);
  });

  res.json(rooms.map((r) => ({ ...r, beds: byRoom[String(r._id)] || [] })));
});

// POST /api/rooms  -> creates the room and its beds
router.post("/", requireRole("admin"), async (req, res) => {
  try {
    const { roomNumber, type, floor, pricePerDay } = req.body;
    let bedCount = parseInt(req.body.bedCount, 10);
    if (!bedCount || bedCount < 1) bedCount = 1;
    if (bedCount > 20) bedCount = 20;

    const room = await Room.create({ roomNumber, type, floor, pricePerDay });
    for (let i = 1; i <= bedCount; i++) {
      await Bed.create({ bedNumber: `${room.roomNumber}-B${i}`, room: room._id });
    }
    res.status(201).json(room);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Room number already exists" });
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", requireRole("admin"), async (req, res) => {
  try {
    const { type, floor, pricePerDay } = req.body;
    res.json(
      await Room.findByIdAndUpdate(
        req.params.id,
        { type, floor, pricePerDay },
        { new: true, runValidators: true }
      )
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", requireRole("admin"), async (req, res) => {
  try {
    const busy = await Bed.countDocuments({ room: req.params.id, status: "Occupied" });
    if (busy > 0) {
      return res.status(400).json({ message: "A patient is in this room. Discharge first." });
    }
    await Bed.deleteMany({ room: req.params.id });
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/rooms/:id/beds  -> add one more bed to a room
router.post("/:id/beds", requireRole("admin"), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const existing = await Bed.find({ room: room._id }).select("bedNumber").lean();
    const used = new Set(existing.map((b) => b.bedNumber));
    let n = existing.length + 1;
    while (used.has(`${room.roomNumber}-B${n}`)) n++;

    res.status(201).json(await Bed.create({ bedNumber: `${room.roomNumber}-B${n}`, room: room._id }));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
