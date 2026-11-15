const express = require("express");
const Bill = require("../models/Bill");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(verifyToken);

router.get("/", requireRole("admin", "receptionist"), async (req, res) => {
  res.json(await Bill.find().populate("patient", "name phone").sort({ createdAt: -1 }));
});

router.post("/", requireRole("admin", "receptionist"), async (req, res) => {
  try {
    const { patient, description, amount } = req.body;
    res.status(201).json(await Bill.create({ patient, description, amount }));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Take payment: POST /api/billing/:id/pay   body: { paymentMethod: "Cash" | "Card" | "UPI" | "Insurance" }
router.post("/:id/pay", requireRole("admin", "receptionist"), async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    if (!["Cash", "Card", "UPI", "Insurance"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Choose a payment method" });
    }
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    if (bill.status === "Paid") return res.status(400).json({ message: "Bill is already paid" });

    bill.status = "Paid";
    bill.paymentMethod = paymentMethod;
    bill.paidAt = new Date();
    await bill.save();
    res.json(bill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", requireRole("admin"), async (req, res) => {
  await Bill.findByIdAndDelete(req.params.id);
  res.json({ message: "Bill deleted" });
});

module.exports = router;
