const pool = require('../config/db');

class Booking {
  static async getAll() {
    try {
      const { rows } = await pool.query(`SELECT * FROM bookings`);
      return rows;
    } catch (error) {
        throw new Error(error.message);
    }
  }

  static async findById(id) {
    try {
      const { rows } = await pool.query(`SELECT * FROM bookings WHERE id = $1`, [id]);
      return rows[0];
    } catch (error) {
        throw new Error(error.message);
    }
  }

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
  

  static async delete(id) {
    try {
      await pool.query(`DELETE FROM bookings WHERE id = $1`, [id]);
    } catch (error) {
        throw new Error(error.message);
    }
  }
}

module.exports = Booking;
