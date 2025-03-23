const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookingsController");

// Public routes (Only authenticated users can create and view their own bookings)
router.get("/:id", authMiddleware, getBookingById);
router.post("/", authMiddleware, createBooking);

// Admin routes (Only admins can view, update, or delete all bookings)
router.get("/", authMiddleware, adminMiddleware, getBookings);
router.patch("/:id", authMiddleware, updateBooking);
router.delete("/:id", authMiddleware, deleteBooking);

module.exports = router;
