require("dotenv").config();
const mongoose = require("mongoose");
const Room = require("./models/Room");
const Bed = require("./models/Bed");

// Sample data - the admin can change prices and rooms later from the Rooms & Beds page
const SAMPLE_ROOMS = [
  { roomNumber: "G-101", type: "General Ward", floor: "1", pricePerDay: 800, beds: 4 },
  { roomNumber: "G-102", type: "General Ward", floor: "1", pricePerDay: 800, beds: 4 },
  { roomNumber: "S-201", type: "Semi-Private", floor: "2", pricePerDay: 1500, beds: 2 },
  { roomNumber: "P-301", type: "Private Room", floor: "3", pricePerDay: 2500, beds: 1 },
  { roomNumber: "P-302", type: "Private Room", floor: "3", pricePerDay: 2500, beds: 1 },
  { roomNumber: "ICU-1", type: "ICU", floor: "1", pricePerDay: 6000, beds: 3 },
  { roomNumber: "ER-1", type: "Emergency", floor: "G", pricePerDay: 1200, beds: 3 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  if ((await Room.countDocuments()) > 0) {
    console.log("Rooms already exist - nothing added.");
    process.exit(0);
  }

  for (const r of SAMPLE_ROOMS) {
    const room = await Room.create({
      roomNumber: r.roomNumber, type: r.type, floor: r.floor, pricePerDay: r.pricePerDay,
    });
    for (let i = 1; i <= r.beds; i++) {
      await Bed.create({ bedNumber: `${r.roomNumber}-B${i}`, room: room._id });
    }
  }

  console.log("Sample rooms and beds added.");
  process.exit(0);
}

seed();
