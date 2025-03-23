const pool = require('../config/db');

class Booking {
  static async getAll() {

  /**
 * `getAll` Method: Retrieves all booking records from the database.
 * 
 * Flow:
 * 1. Executes an SQL `SELECT` query to fetch all records from the `bookings` table.
 * 2. Returns an array containing all booking records.
 * 3. Handles any errors during the database operation and throws a descriptive error message.
 * 
 * @returns {Array} List of all bookings.
 * @throws {Error} If an error occurs during the database query.
 * 
 */
    try {
      const { rows } = await pool.query(`SELECT * FROM bookings`);
      return rows;
    } catch (error) {
        throw new Error(error.message);
    }
  }

  /**
 * `findById` Method: Retrieves a specific booking record based on the provided `id`.
 * 
 * Flow:
 * 1. Executes an SQL `SELECT` query using the provided `id` as a parameter to fetch the matching booking record.
 * 2. Returns the booking object if a matching record is found.
 * 3. Handles any errors during the database operation and throws a descriptive error message.
 *
 * @param {String} id - The unique identifier of the booking.
 * @returns {Object} The booking record if found.
 * @throws {Error} If an error occurs during the database query or if no record is found.
 * 
 */
  static async findById(id) {
    try {
      const { rows } = await pool.query(`SELECT * FROM bookings WHERE id = $1`, [id]);
      return rows[0];
    } catch (error) {
        throw new Error(error.message);
    }
  }

  /**
 * `create` Method: Adds a new booking record to the database after validating and processing the provided data.
 * 
 * Flow:
 * 1. Extracts booking details (`user_id`, `train_id`, `seat_number`, `status`) from the `bookingData` input.
 * 2. Executes an SQL `INSERT` query to add the new booking record to the `bookings` table.
 * 3. Returns the newly created booking record as the result.
 * 4. Handles any errors during the operation and throws a descriptive error message.
 * 
 * @param {Object} bookingData - Data object containing booking details.
 * @param {String} bookingData.user_id - ID of the user making the booking.
 * @param {String} bookingData.train_id - ID of the train being booked. 
 * @param {Number} bookingData.seat_number - Seat number being booked.
 * @param {String} bookingData.status - Status of the booking (e.g., "booked | cancelled | waiting ").
 * @returns {Object} The newly created booking record.
 * @throws {Error} If an error occurs during the database operation.
 * 
 */
  static async create(bookingData) {
    try {
      const { user_id, train_id, seat_number, status } = bookingData;
      const { rows } = await pool.query(
        `INSERT INTO 
        bookings (user_id, train_id, seat_number, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [user_id, train_id, seat_number, status]
      );
      return rows[0];
    } catch (error) {
        throw new Error(error.message);
    }
  }

  /**
 * `update` Method: Updates a booking record in the database, ensuring existing values are retained
 * for fields not provided in the `bookingData` input.
 * 
 * Flow:
 * 1. Fetches the current booking data from the database using the provided `id`.
 *    - If no booking is found, throws an error indicating the booking does not exist.
 * 2. Extracts the existing booking details and updates only the fields provided in the `bookingData` input.
 *    - Fields not provided retain their current values.
 * 3. Executes an SQL `UPDATE` query to modify the booking record in the database.
 * 4. Returns the updated booking record as the result.
 * 5. Handles any errors during the process and throws a descriptive error message.
 * 
 * @param {String} id - The unique identifier of the booking.
 * @param {Object} bookingData - Data object containing updated booking details.
 * @param {String} [bookingData.user_id] - Updated user ID.
 * @param {String} [bookingData.train_id] - Updated train ID.
 * @param {Number} [bookingData.seat_number] - Updated seat number.
 * @param {String} [bookingData.status] - Updated booking status.
 * @returns {Object} The updated booking record.
 * @throws {Error} If an error occurs during the database operation.
 *
 */
  static async update(id, bookingData) {
    try {
      // Fetch current booking data to keep existing values if fields are not provided
      const existingBooking = await pool.query(`SELECT * FROM bookings WHERE id = $1`, [id]);
      if (existingBooking.rows.length === 0) throw new Error("Booking not found.");
  
      const booking = existingBooking.rows[0];
  
      // Use existing values if fields are not provided in the request
      const user_id = bookingData.user_id || booking.user_id;
      const train_id = bookingData.train_id || booking.train_id;
      const seat_number = bookingData.seat_number || booking.seat_number;
      const status = bookingData.status || booking.status;
  
      // Update the booking record
      const { rows } = await pool.query(
        `UPDATE bookings
         SET 
            user_id = $1,
            train_id = $2, 
            seat_number = $3, 
            status = $4 
         WHERE id = $5 
         RETURNING *`,
        [user_id, train_id, seat_number, status, id]
      );
  
      return rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  }
  
/**
 *  `delete` Method: Deletes a booking record from the database.
 *
 * Flow:
 * 1. Executes an SQL `DELETE` query using the provided `id` to remove the booking record.
 * 2. Handles any errors during the database operation and throws a descriptive error message.
 *
 * @param {String} id - The unique identifier of the booking.
 * @returns {void}
 * @throws {Error} If an error occurs during the database operation.
 * 
 */

  static async delete(id) {
    try {
      await pool.query(`DELETE FROM bookings WHERE id = $1`, [id]);
    } catch (error) {
        throw new Error(error.message);
    }
  }
}

module.exports = Booking;
