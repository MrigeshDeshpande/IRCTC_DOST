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
      // Fetch current train data to keep existing values if fields are not provided
      const existingTrain = await pool.query(`SELECT * FROM trains WHERE id = $1`, [id]);
      if (existingTrain.rows.length === 0) throw new Error("Train not found.");
  
      const train = existingTrain.rows[0];
  
      // Use existing values if fields are not provided in the request
      const train_number = trainData.train_number || train.train_number;
      const train_name = trainData.train_name || train.train_name;
      const source = trainData.source || train.source;
      const destination = trainData.destination || train.destination;
      const departure_time = trainData.departure_time || train.departure_time;
      const arrival_time = trainData.arrival_time || train.arrival_time;
  
      // Update the train record
      const { rows } = await pool.query(
        `UPDATE trains
         SET train_number = $1, train_name = $2, source = $3, destination = $4, 
             departure_time = $5, arrival_time = $6 
         WHERE id = $7 
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
