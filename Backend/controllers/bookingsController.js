const Booking = require("../models/Booking");

const pool = require("../config/db");

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

    //check if the user is the owner of the booking or an admin
    if (req.user.role !== "admin" && req.user.id !== booking.user_id) {
      return res.status(403).json({ error: "Unauthorized: Access denied" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createBooking = async (req, res) => {
  const { user_id, train_id, seat_number } = req.body;

  try {
    // Step 1: Check if the train exists and get total seats
    const trainQuery = `SELECT available_seats FROM trains WHERE id = $1`;
    const trainResult = await pool.query(trainQuery, [train_id]);

    if (trainResult.rows.length === 0) {
      return res.status(404).json({ error: "Train not found." });
    }

  const totalSeats = trainResult.rows[0].available_seats; 

    // Step 2: Validate seat number (1 to total_seats)
    if (seat_number < 1 || seat_number > totalSeats) {
      return res.status(400).json({ error: "Invalid seat number." });
    }

    // Step 3: Check if the seat is already booked
    const seatCheckQuery = `SELECT id FROM bookings WHERE train_id = $1 AND seat_number = $2 AND status = 'booked'`;
    const seatCheckResult = await pool.query(seatCheckQuery, [train_id, seat_number]);

    if (seatCheckResult.rows.length > 0) {
      return res.status(400).json({ error: "Seat already booked. Choose another seat." });
    }

    // Step 4: Check total booked seats
    const bookedSeatsQuery = `SELECT COUNT(*) FROM bookings WHERE train_id = $1 AND status = 'booked'`;
    const bookedSeatsResult = await pool.query(bookedSeatsQuery, [train_id]);

    const bookedSeats = parseInt(bookedSeatsResult.rows[0].count, 10);

    if (bookedSeats >= totalSeats) {
      return res.status(400).json({ error: "Train is fully booked." });
    }

    // Step 5: Insert new booking
    const bookingQuery = `INSERT INTO bookings (id, user_id, train_id, seat_number, status) 
                          VALUES (gen_random_uuid(), $1, $2, $3, 'booked') RETURNING *`;
    const bookingResult = await pool.query(bookingQuery, [user_id, train_id, seat_number]);

    //Step 6: Decrement available seats
    const updateSeatsQuery = `UPDATE trains SET available_seats = available_seats - 1 WHERE id = $1`;
    await pool.query(updateSeatsQuery, [train_id]);


    res.status(201).json({ message: "Booking successful!", booking: bookingResult.rows[0] });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    //prevent updating cancelled bookings
    if (booking.status === "cancelled") {
      return res.status(400).json({ error: "Cannot update a cancelled booking" });
    }

    //ensure only the owner of the booking or an admin can update the booking
    if (booking.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized: Access denied" });
    }

    //check if update actually changes anything
    if (req.body.status === booking.status) {
      return res.status(400).json({ error: "No changes detected" });
    }

    //update the booking
    const updatedBooking = await Booking.update(req.params.id, req.body);
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    if (booking.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized: Access denied" });
    }

     // Step 1 : Instead of deleting, update status to 'cancelled'
     await pool.query(`UPDATE bookings SET status = 'cancelled' WHERE id = $1`, [req.params.id]);

     // Step 2: Increment available seats
     const updateSeatsQuery = `UPDATE trains SET available_seats = available_seats + 1 WHERE id = $1`;
      await pool.query(updateSeatsQuery, [booking.train_id]);
      
      res.json({ message: "Booking cancelled" });

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
