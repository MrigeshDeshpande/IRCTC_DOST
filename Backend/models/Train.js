const pool = require('../config/db');

class Train {
  
  /**
   * `getAll` Method: Retrieves all train records from the database.
   * 
   * Flow:
   * 1. Executes an SQL `SELECT` query to fetch all records from the `trains` table.
   * 2. Returns an array containing all train records.
   * 3. Handles any errors during the database operation and throws a descriptive error message.
   * 
  */
static async getAll() {
    try {
      const { rows } = await pool.query(`SELECT * FROM trains`);
      return rows;
    } catch (error) {
        throw new Error(error.message);
    }
  }

  /**
 * `findById` Method: Retrieves a specific train record from the database based on the provided `id`.
 * 
 * Flow:
 * 1. Executes an SQL `SELECT` query using the provided `id` as a parameter to fetch the matching train record.
 * 2. Returns the train object if a matching record is found.
 * 3. Handles any errors during the database operation and throws a descriptive error message.
 * 
 */
  static async findById(id) {
    try {
      const { rows } = await pool.query(`SELECT * FROM trains WHERE id = $1`, [id]);
      return rows[0];
    } catch (error) {
        throw new Error(error.message);
    }
  }

  /**
 * `create` Method: Adds a new train record to the database after validating and processing the provided data.
 * 
 * Flow:
 * 1. Extracts train details (`train_number`, `train_name`, `source`, `destination`, `departure_time`, `arrival_time`) 
 *    from the `trainData` input.
 * 2. Executes an SQL `INSERT` query to add the new train record to the `trains` table.
 * 3. Returns the newly created train record as the result.
 * 4. Handles any errors during the operation and throws a descriptive error message.
 * 
 */
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

  /**
 * `update` Method: Updates a train's details in the database, ensuring that existing values are retained
 * for fields not provided in the `trainData` input.
 * 
 * Flow:
 * 1. Fetches the current train data from the database using the provided `id`.
 *    - If no train is found with the given `id`, throws an error indicating the train does not exist.
 * 2. Extracts the existing train details and updates only the fields provided in the `trainData` input.
 *    - Fields not provided in the input retain their existing values.
 * 3. Executes an SQL `UPDATE` query to modify the train's record in the database, using the new or retained values.
 * 4. Returns the updated train record as the result of the operation.
 * 5. Handles any errors during the process and throws a descriptive error message.
 * 
 */
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
