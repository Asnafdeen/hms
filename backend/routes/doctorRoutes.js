const express = require("express");
const Doctor = require("../models/Doctor");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(verifyToken);

router.get("/", async (req, res) => {
  res.json(await Doctor.find().sort({ createdAt: -1 }));
});

router.post("/", requireRole("admin"), async (req, res) => {
  try {
    res.status(201).json(await Doctor.create(req.body));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", requireRole("admin"), async (req, res) => {
  try {
    res.json(await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", requireRole("admin"), async (req, res) => {
  await Doctor.findByIdAndDelete(req.params.id);
  res.json({ message: "Doctor deleted" });
});

module.exports = router;
