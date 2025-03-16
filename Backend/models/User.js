const pool = require("../config/db");
const bcrypt = require("bcryptjs");

class User {

  /**
 * `getAll` Method: Retrieves all user records from the database.
 * 
 * Flow:
 * 1. Executes an SQL `SELECT` query to fetch all records from the `users` table.
 * 2. Returns an array of all user records.
 * 3. Handles any errors during the database operation and throws a descriptive error message.
 * 
 */
  static async getAll() {
    try {
      const result = await pool.query(`SELECT * FROM users`);
      return result.rows;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
 * `findById` Method: Retrieves a specific user record from the database based on the provided `id`.
 * 
 * Flow:
 * 1. Executes an SQL `SELECT` query using the provided `id` as a parameter to fetch a matching record.
 * 2. Returns the user object if a matching record is found.
 * 3. Handles any errors during the database operation and throws a descriptive error message.
 * 
 */
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

  /**
 * `create` Method: Adds a new user to the database after performing necessary validation checks.
 * 
 * Flow:
 * 1. Extracts `name`, `email`, `password`, and `phone` from the input `userData`.
 * 2. Validates the input:
 *    - Ensures all required fields (`name`, `email`, `password`, and `phone`) are provided.
 *    - Checks if the provided `email` matches a valid email format using a regex pattern.
 *    - Verifies that the `phone` number is a 10-digit numeric value using a regex pattern.
 * 3. Checks for duplicate email addresses by querying the database.
 *    - If a duplicate email is found, throws an error indicating that the email already exists.
 * 4. If all checks pass, inserts the new user into the database with the provided details.
 * 5. Returns the newly created user's details as the result.
 * 6. Handles any errors during the process and throws a descriptive error message.
 * 
 */
  static async create(userData) {
    try {
      const { name, email, password, phone } = userData;

      //checking for missing fields
      if(!name || !email || !password || !phone){
        throw new Error("All fields are required");
      }

      //checking if email is valid
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!emailPattern.test(email)){
        throw new Error("Invalid email");
      }

      //checking if phone is valid
      const phonePattern = /^[0-9]{10}$/;
      if(!phonePattern.test(phone)){
        throw new Error("Invalid phone number");
      }

      //checking for duplicate email
      const emailExists = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
      if(emailExists.rows.length > 0){
        throw new Error("Email already exists");
      }

      //only insert the user if all checks pass
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

/**
 * `login` Method: Handles user authentication and returns user details if authentication is successful.
 * 
 * Flow:
 * 1. Takes `email` and `password` as input parameters.
 * 2. Converts the `email` to lowercase for normalization and consistency.
 * 3. Queries the database to check if a user with the provided email exists.
 *    - If no matching user is found, throws an error indicating invalid credentials.
 * 4. If a user is found, retrieves the user data and verifies the provided password using bcrypt's compare function.
 *    - If the password is incorrect, throws an error indicating invalid credentials.
 * 5. If the credentials are valid, returns an object containing user details (excluding the password for security).
 * 6. Handles any errors during the process and throws a descriptive error message.
 *
 */
  static async login({email, password}){
    try{
      email = email.toLowerCase();

      //checks if user exists
      const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
      if(rows.length === 0)
      {
        throw new Error("Invalid email or password");
      }

      const user = rows[0];

      //checks if password is correct
      const validPassword = await bcrypt.compare(password, user.password);
      if(!validPassword){
        throw new Error("Invalid email or password");
      }

      //return user excluding password if all checks pass 
      return {id: user.id, name: user.name, email: user.email, phone: user.phone }    
    }
      catch(error){
        throw new Error(error.message);
      }
  }

  /**
 * `findByEmail` Method: Fetches user details from the database based on the provided email.
 * 
 * Flow:
 * 1. Takes `email` as an input parameter.
 * 2. Queries the database to find a user matching the provided email.
 * 3. Returns the user object if found.
 * 4. Handles any errors during the process and throws a descriptive error message.
 *
 */
  static async findByEmail(email) {
    try {
        const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        return rows[0]; 
    } catch (error) {
        throw new Error(error.message);
    }
}

/**
 * `update` Method: Updates a user's details in the database while preserving existing values for
 * fields that are not provided in the request.
 * 
 * Flow:
 * 1. Fetches the current user data from the database using the provided `id`.
 *    - If no user is found, throws an error indicating the user does not exist.
 * 2. Extracts existing user values and updates only the fields provided in the `userData` input.
 *    - Fields not provided in the request retain their existing values.
 * 3. Executes an SQL `UPDATE` query to update the user's details in the database, using the new or retained values.
 * 4. Returns the updated user object as the result of the operation.
 * 5. Handles any errors during the process and throws a descriptive error message.
 * 
 */
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
