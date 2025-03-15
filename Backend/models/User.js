const pool = require("../config/db");

class User {
  static async getAll() {
    try {
      const result = await pool.query(`SELECT * FROM users`);
      return result.rows;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async findById(id) {
    try {
      const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1`, [
        id,
      ]);
      return rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async create(userData) {
    try {
      const { name, email, password, phone } = userData;
      const { rows } = await pool.query(
        `INSERT INTO  users 
        (name, email, password, phone) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *`,
        [name, email, password, phone],
      );
      return rows[0];
    } catch(error) {
      throw new Error(error.message);
    }
  }

  static async update(id, userData) {
    try {
      // Fetch current user data to keep existing values if fields are not provided
      const existingUser = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
      if (existingUser.rows.length === 0) throw new Error("User not found.");
  
      const user = existingUser.rows[0];
  
      // Use existing values if fields are not provided in the request
      const name = userData.name || user.name;
      const email = userData.email || user.email;
      const password = userData.password || user.password;
      const phone = userData.phone || user.phone;
  
      const { rows } = await pool.query(
        `UPDATE users 
         SET name = $1, email = $2, password = $3, phone = $4 
         WHERE id = $5 RETURNING *`,
        [name, email, password, phone, id]
      );
  
      return rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  }
  

  static async delete(id) {
    try {
      await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = User;
