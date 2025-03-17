const express = require("express");
const router = express.Router();
const  authMiddleware  = require("../middleware/authMiddleware");

const {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookingsController");

//Public routes
router.get("/", getBookings);

//Protected routes
router.get("/:id", authMiddleware, getBookingById);
router.post("/", authMiddleware, createBooking);
router.patch("/:id", authMiddleware, updateBooking);
router.delete("/:id", authMiddleware, deleteBooking);

module.exports = router;
