require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" })); // 5mb so doctor photos fit

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/patients", require("./routes/patientRoutes"));
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/billing", require("./routes/billingRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/beds", require("./routes/bedRoutes"));
app.use("/api/admissions", require("./routes/admissionRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/public", require("./routes/publicRoutes"));

app.get("/", (req, res) => {
  res.send("Captain Medicare HMS API is running");
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
