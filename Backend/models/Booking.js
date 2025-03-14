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
      const { user_id, train_id, seat_number, status } = bookingData;
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
