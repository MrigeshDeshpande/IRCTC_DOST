const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * `getUsers` Function: Fetches all user records from the database.
 *
 * Flow:
 * 1. Calls the `getAll` method from the `User` model to retrieve all user records.
 * 2. Returns the list of users as a JSON response.
 * 3. Handles any errors that occur during the operation and returns an error response.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} List of all user records.
 *
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * `getUserById` Function: Retrieves a specific user record based on the provided `id`.
 *
 * Flow:
 * 1. Calls the `findById` method from the `User` model to fetch the user record.
 * 2. Checks if the user record exists and returns it if found.
 * 3. Returns the user record as a JSON response.
 * 4. Handles any errors that occur during the operation and returns an error response.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} The user record if found.
 *
 */
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * `createUser` Function: Adds a new user record to the database after performing necessary validation checks.
 *
 * Flow:
 * 1. Extracts user details (`name`, `email`, `password`) from the input `req.body`.
 * 2. Validates the input:
 *    - Ensures all required fields (`name`, `email`, `password`) are provided.
 *    - Checks if the provided email is already registered in the database.
 * 3. Hashes the user's password using a secure hashing algorithm.
 * 4. Executes an SQL `INSERT` query to add the new user record to the `users` table.
 * 5. Returns the newly created user record as the result.
 * 6. Handles any errors during the operation and returns an error response.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} The newly created user record.
 *
 */
const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.update(req.params.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.delete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Handles user login by validating credentials and returning the user data on success.
 *
 * Flow:
 * 1. Extracts `email` and `password` from the request body.
 * 2. Validates the input to ensure both `email` and `password` are provided.
 * 3. Converts the `email` to lowercase for consistency and normalization.
 * 4. Retrieves the user details from the database using the normalized email.
 * 5. If the user is not found, returns a 401 response with an appropriate error message.
 * 6. Compares the provided `password` with the user's stored password.
 * 7. If the passwords do not match, returns a 401 response with an error message.
 * 8.  On successful authentication:
 *    - Generates a JWT token with the user's ID and an expiration time of 30 days.
 *    - Responds with the token and the user's details (ID, name, email).
 * 9. Handles any unexpected errors by returning a 500 response with the error details.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} Token and user details on successful login.
 *
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase();

    const user = await User.findByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    // Compare Passwords
    const isMatch = password.trim() === user.password.trim();
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    //generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
};
