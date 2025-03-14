const pool = require('../config/db');

class Train {
  static async getAll() {
    try {
      const { rows } = await pool.query(`SELECT * FROM trains`);
      return rows;
    } catch (error) {
        throw new Error(error.message);
    }
  }

  static async findById(id) {
    try {
      const { rows } = await pool.query(`SELECT * FROM trains WHERE id = $1`, [id]);
      return rows[0];
    } catch (error) {
        throw new Error(error.message);
    }
  }

  static async create(trainData) {
    try {
      const { train_number, train_name, source, destination, departure_time, arrival_time } = trainData;
      const { rows } = await pool.query(
        `INSERT INTO 
        trains (train_number, train_name, source, destination, departure_time, arrival_time)
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`,
        [train_number, train_name, source, destination, departure_time, arrival_time]
      );
      return rows[0];
    } catch (error) {
        throw new Error(error.message);
    }
  }

  static async update(id, trainData) {
    try {
      const { train_number, train_name, source, destination, departure_time, arrival_time } = trainData;
      const { rows } = await pool.query(
        `UPDATE trains
         SET
             train_number = $1, 
             train_name = $2,
              source = $3, 
              destination = $4, 
              departure_time = $5, 
              arrival_time = $6 
        WHERE 
        id = $7 
        RETURNING *`,
        [train_number, train_name, source, destination, departure_time, arrival_time, id]
      );
      return rows[0];
    } catch (error) {
        throw new Error(error.message);
    }
  }

  static async delete(id) {
    try {
      await pool.query(`DELETE FROM trains WHERE id = $1`, [id]);
    } catch (error) {
        throw new Error(error.message);
    }
  }
}

module.exports = Train;
