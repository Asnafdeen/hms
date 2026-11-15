const express = require("express");
const Expense = require("../models/Expense");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(verifyToken, requireRole("admin")); // only the admin sees hospital expenses

function monthFilter(month) {
  // month looks like 2026-10
  return /^\d{4}-\d{2}$/.test(month || "") ? { date: { $regex: "^" + month } } : {};
}

// GET /api/expenses?month=2026-10
router.get("/", async (req, res) => {
  res.json(await Expense.find(monthFilter(req.query.month)).sort({ date: -1, createdAt: -1 }));
});

// GET /api/expenses/summary?month=2026-10
router.get("/summary", async (req, res) => {
  const list = await Expense.find(monthFilter(req.query.month)).lean();
  const byCategory = {};
  let total = 0;
  list.forEach((e) => {
    total += e.amount;
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });
  res.json({ total, byCategory, count: list.length });
});

router.post("/", async (req, res) => {
  try {
    const { title, category, amount, date, note } = req.body;
    res.status(201).json(await Expense.create({ title, category, amount, date, note }));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: "Expense deleted" });
});

module.exports = router;
