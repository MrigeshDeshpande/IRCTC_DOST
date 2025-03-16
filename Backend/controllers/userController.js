const User = require("../models/User");

const getUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
 * 8. On successful authentication, responds with a success message and the user's data.
 * 9. Handles any unexpected errors by returning a 500 response with the error details.
 *
 */

const loginUser = async (req, res) => {
  try {
      const { email, password } = req.body;

      // Validate Input
      if (!email || !password) {
          return res.status(400).json({ error: "Email and password are required." });
      }

      const normalizedEmail = email.toLowerCase(); 

      // Fetch user from DB
      const user = await User.findByEmail(normalizedEmail);
      if (!user) {
          return res.status(401).json({ error: "User not found." });
      }

      // Compare Passwords
      const isMatch = password === user.password; 
      if (!isMatch) {
          return res.status(401).json({ error: "Incorrect password." });
      }

      res.json({ message: "Login successful", user });
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
  loginUser
};
