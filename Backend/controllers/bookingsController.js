const Booking = require("../models/Booking");

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.getAll();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const updatedBooking = await Booking.update(req.params.id, req.body);
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    await Booking.delete(req.params.id);
    res.json({ message: "Booking deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
};
