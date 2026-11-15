CAPTAIN MEDICARE HMS - how to run (Windows + VS Code)

Open the "hms" folder in VS Code, then use two terminals.

1) BACKEND  (terminal 1)
   cd backend
   copy .env.example .env      (open .env and put your MongoDB Atlas link in MONGO_URI)
   npm install
   node seedAdmin.js           (run ONCE - creates the only admin)
   node seedRooms.js           (run ONCE - adds sample rooms and beds, optional)
   npm run dev

2) FRONTEND  (terminal 2)
   cd frontend
   npm install
   npm run dev

3) Open http://localhost:3000
   Intro animation -> Patient Home Page -> "Staff Login"

Default admin:  admin@medicare.com   /   Admin@123
(Change the password inside seedAdmin.js before running it if you want.)
Signup can only create Doctor or Receptionist accounts.

MODULES
- Appointment Management : book, filter, reschedule, complete, cancel, delete
- Billing & Payment      : bills + Cash / Card / UPI / Insurance payments
- Rooms & Beds           : admin sets rooms, beds and price per day
- Admission & Discharge  : admit to a free bed; discharge makes the room-charge bill
- Hospital Expenses      : admin only, by category and month
- Smart Bed Management   : live bed board, low-bed alerts, Smart Assign suggestion
- Reports                : patients, beds, revenue, expenses, net profit
