const Booking = require("../models/Booking");

const pool = require("../config/db");

/**
 * `getBookings` Function: Fetches all booking records from the database.
 * 
 * Flow:
 * 1. Calls the `getAll` method from the `Booking` model to retrieve all booking records.
 * 2. Returns the list of bookings as a JSON response.
 * 3. Handles any errors that occur during the operation and returns an error response.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} List of all booking records.
 * 
 */
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.getAll();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * `getBookingById` Function: Retrieves a specific booking record based on the provided `id`.
 * 
 * Flow:
 * 1. Calls the `findById` method from the `Booking` model to fetch the booking record.
 * 2. Checks if the booking record exists and returns it if found.
 * 3. Validates the user's access rights to the booking record.
 * 4. Returns the booking record as a JSON response.
 * 5. Handles any errors that occur during the operation and returns an error response.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} The booking record if found.
 * 
 */
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

/**
 * `createBooking` Function: Adds a new booking record to the database.
 * 
 * Flow:
 * 1. Extracts `user_id`, `train_id`, and `seat_number` from the request body.
 * 2. Validates the provided `train_id` and `seat_number` against the database records.
 * 3. Checks if the seat is already booked or if the train is fully booked.
 * 4. Inserts the new booking record into the `bookings` table.
 * 5. Decrements the available seats for the booked train.
 * 6. Returns a success message along with the newly created booking record.
 * 7. Handles any errors that occur during the operation and returns an error response.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} The newly created booking record.
 * 
 */
const createBooking = async (req, res) => {
  const { user_id, train_id, seat_number } = req.body;

  try {
    const trainQuery = `SELECT available_seats FROM trains WHERE id = $1`;
    const trainResult = await pool.query(trainQuery, [train_id]);

    if (trainResult.rows.length === 0) {
      return res.status(404).json({ error: "Train not found." });
    }

  const totalSeats = trainResult.rows[0].available_seats; 

    if (seat_number < 1 || seat_number > totalSeats) {
      return res.status(400).json({ error: "Invalid seat number." });
    }

    const seatCheckQuery = `SELECT id FROM bookings WHERE train_id = $1 AND seat_number = $2 AND status = 'booked'`;
    const seatCheckResult = await pool.query(seatCheckQuery, [train_id, seat_number]);

    if (seatCheckResult.rows.length > 0) {
      return res.status(400).json({ error: "Seat already booked. Choose another seat." });
    }

    // Check total booked seats
    const bookedSeatsQuery = `SELECT COUNT(*) FROM bookings WHERE train_id = $1 AND status = 'booked'`;
    const bookedSeatsResult = await pool.query(bookedSeatsQuery, [train_id]);

    const bookedSeats = parseInt(bookedSeatsResult.rows[0].count, 10);

    if (bookedSeats >= totalSeats) {
      return res.status(400).json({ error: "Train is fully booked." });
    }

    // Insert new booking
    const bookingQuery = `INSERT INTO bookings (id, user_id, train_id, seat_number, status) 
                          VALUES (gen_random_uuid(), $1, $2, $3, 'booked') RETURNING *`;
    const bookingResult = await pool.query(bookingQuery, [user_id, train_id, seat_number]);

    //Decrement available seats
    const updateSeatsQuery = `UPDATE trains SET available_seats = available_seats - 1 WHERE id = $1`;
    await pool.query(updateSeatsQuery, [train_id]);


    res.status(201).json({ message: "Booking successful!", booking: bookingResult.rows[0] });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * `updateBooking` Function: Modifies an existing booking record in the database.
 * 
 * Flow:
 * 1. Fetches the booking record based on the provided `id`.
 * 2. Checks if the booking exists and is not already cancelled.
 * 3. Validates the user's access rights to update the booking record.
 * 4. Verifies if any changes are made to the booking status.
 * 5. Updates the booking record with the new status.
 * 6. Returns the updated booking record as a JSON response.
 * 7. Handles any errors that occur during the operation and returns an error response.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} The updated booking record.
 * 
 */
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ error: "Cannot update a cancelled booking" });
    }

    //ensure only the owner of the booking or an admin can update the booking
    if (booking.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized: Access denied" });
    }

    if (req.body.status === booking.status) {
      return res.status(400).json({ error: "No changes detected" });
    }

    const updatedBooking = await Booking.update(req.params.id, req.body);
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * `deleteBooking` Function: Removes a booking record from the database.
 * 
 * Flow:
 * 1. Fetches the booking record based on the provided `id`.
 * 2. Checks if the booking exists.
 * 3. Validates the user's access rights to delete the booking record.
 * 4. Updates the booking status to 'cancelled' instead of deleting the record.
 * 5. Increments the available seats for the booked train.
 * 6. Returns a success message indicating the booking was cancelled.
 * 7. Handles any errors that occur during the operation and returns an error response.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} Success message indicating the booking was cancelled.
 * 
 */
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    if (booking.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized: Access denied" });
    }

     await pool.query(`UPDATE bookings SET status = 'cancelled' WHERE id = $1`, [req.params.id]);

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
