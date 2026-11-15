const express = require("express");
const Patient = require("../models/Patient");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(verifyToken);

router.get("/", async (req, res) => {
  res.json(await Patient.find().sort({ createdAt: -1 }));
});

router.post("/", requireRole("admin", "receptionist"), async (req, res) => {
  try {
    const { name, age, gender, phone, address, bloodGroup, disease } = req.body;
    // "admitted" is NOT taken from the form - the Admissions module controls it
    res.status(201).json(await Patient.create({ name, age, gender, phone, address, bloodGroup, disease }));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", requireRole("admin", "receptionist"), async (req, res) => {
  try {
    const { name, age, gender, phone, address, bloodGroup, disease } = req.body;
    res.json(
      await Patient.findByIdAndUpdate(
        req.params.id,
        { name, age, gender, phone, address, bloodGroup, disease },
        { new: true }
      )
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", requireRole("admin"), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    if (patient.admitted) {
      return res.status(400).json({ message: "Patient is admitted. Discharge the patient first." });
    }
    await patient.deleteOne();
    res.json({ message: "Patient deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
