require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Default Route
app.get("/", (req, res) => {
  res.send("IRCTC Dost Backend is Running!");
});

// Routes
app.use("/api/users", require("./routes/users"));
app.use("/api/trains", require("./routes/trains"));
app.use("/api/bookings", require("./routes/bookings"));

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//connect DB
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.log("this is the error bhai", err);
  } else {
    console.log("DB is connected", res.rows[0]);
  }
});
