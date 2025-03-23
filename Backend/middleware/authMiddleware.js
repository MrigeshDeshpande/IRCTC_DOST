const jwt = require("jsonwebtoken");
require("dotenv").config();
console.log("JWT Module:", jwt);
console.log("JWT Secret Key:", process.env.JWT_SECRET);

/**
 * Middleware for authenticating users via JWT tokens in the "Authorization" header.
 * 
 * Flow:
 * 1. Retrieves the `Authorization` header from the request.
 *    - Logs the received header for debugging purposes.
 * 2. Checks if the `Authorization` header is present and starts with "Bearer ".
 *    - If not, responds with a 401 status code and an error message: "Unauthorized: No token provided".
 * 3. Extracts the token from the `Authorization` header by removing the "Bearer " prefix and trimming whitespace.
 *    - Logs the extracted token for debugging purposes.
 * 4. Attempts to verify the extracted token using the `jwt.verify` function and the secret key from `process.env.JWT_SECRET`.
 *    - If verification succeeds:
 *        - Logs the verified user data for debugging purposes.
 *        - Attaches the verified user data (`req.user`) to the request object for downstream access.
 *        - Calls the `next()` function to proceed to the next middleware or route handler.
 *    - If verification fails:
 *        - Logs the error message for debugging purposes.
 *        - Responds with a 403 status code and an error message: "Invalid or Expired Token".
 *
 * Error Handling:
 * - Catches and handles unexpected errors during token verification, ensuring appropriate HTTP responses.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Function} Express next middleware function.
 *
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Verified User Data:", verified);
        req.user = verified;
        next();
    } catch (error) {
        res.status(403).json({ error: "Invalid or Expired Token" });
    }
};


module.exports = authMiddleware;