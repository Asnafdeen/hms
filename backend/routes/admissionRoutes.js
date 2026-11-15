const express = require("express");
const Admission = require("../models/Admission");
const Bed = require("../models/Bed");
const Bill = require("../models/Bill");
const Patient = require("../models/Patient");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(verifyToken);

// GET /api/admissions?status=Admitted
router.get("/", async (req, res) => {
  const filter = {};
  if (["Admitted", "Discharged"].includes(req.query.status)) filter.status = req.query.status;

  const admissions = await Admission.find(filter)
    .populate("patient", "name phone")
    .populate("doctor", "name specialization")
    .populate("bed", "bedNumber")
    .populate("room", "roomNumber type pricePerDay")
    .sort({ admitDate: -1 });
  res.json(admissions);
});

// POST /api/admissions  -> admit a patient to a free bed
router.post("/", requireRole("admin", "receptionist"), async (req, res) => {
  try {
    const { patient, bed, doctor, reason } = req.body;
    if (!patient || !bed) {
      return res.status(400).json({ message: "Select a patient and a bed" });
    }

    const pat = await Patient.findById(patient);
    if (!pat) return res.status(404).json({ message: "Patient not found" });

    const already = await Admission.findOne({ patient, status: "Admitted" });
    if (already) return res.status(400).json({ message: "This patient is already admitted" });

    // take the bed only if it is still free (stops two people taking the same bed)
    const taken = await Bed.findOneAndUpdate(
      { _id: bed, status: "Available" },
      { status: "Occupied", patient, occupiedSince: new Date() },
      { new: true }
    );
    if (!taken) return res.status(400).json({ message: "That bed is not available any more" });

    try {
      const admission = await Admission.create({
        patient,
        bed: taken._id,
        room: taken.room,
        doctor: doctor || undefined,
        reason,
      });
      pat.admitted = true;
      await pat.save();
      res.status(201).json(admission);
    } catch (err) {
      // give the bed back if something failed
      await Bed.findByIdAndUpdate(taken._id, { status: "Available", patient: null, occupiedSince: null });
      res.status(400).json({ message: err.message });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/admissions/:id/discharge
// Frees the bed (sent for cleaning) and creates the room-charge bill automatically.
router.put("/:id/discharge", requireRole("admin", "receptionist", "doctor"), async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id).populate("room");
    if (!admission) return res.status(404).json({ message: "Admission not found" });
    if (admission.status !== "Admitted") {
      return res.status(400).json({ message: "Patient is already discharged" });
    }

    const now = new Date();
    // every started day counts as one day
    const days = Math.max(1, Math.ceil((now - admission.admitDate) / (24 * 60 * 60 * 1000)));
    const price = admission.room ? admission.room.pricePerDay : 0;
    const roomCharge = days * price;

    let bill = null;
    if (roomCharge > 0) {
      bill = await Bill.create({
        patient: admission.patient,
        description: `Room charges - ${admission.room.roomNumber} (${days} day${days > 1 ? "s" : ""})`,
        amount: roomCharge,
        admission: admission._id,
      });
    }

    admission.status = "Discharged";
    admission.dischargeDate = now;
    admission.dischargeNote = req.body.dischargeNote || "";
    admission.daysStayed = days;
    admission.roomCharge = roomCharge;
    if (bill) admission.bill = bill._id;
    await admission.save();

    await Bed.findByIdAndUpdate(admission.bed, { status: "Cleaning", patient: null, occupiedSince: null });
    await Patient.findByIdAndUpdate(admission.patient, { admitted: false });

    res.json({ admission, bill });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
