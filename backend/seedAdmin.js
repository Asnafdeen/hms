require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const ADMIN_EMAIL = "admin@medicare.com";
const ADMIN_PASSWORD = "Admin@123";   // change this before running if you want
const ADMIN_NAME = "Hospital Admin";

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log("Admin already exists:", ADMIN_EMAIL);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: hashedPassword, role: "admin" });

  console.log("Default admin created:");
  console.log("Email:", ADMIN_EMAIL);
  console.log("Password:", ADMIN_PASSWORD);
  process.exit(0);
}

seed();
