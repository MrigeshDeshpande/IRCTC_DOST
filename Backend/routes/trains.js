const express = require("express");
const router = express.Router();
const  authMiddleware  = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getTrains,
  getTrainById,
  createTrain,
  updateTrain,
  deleteTrain,
} = require("../controllers/trainsController");

//Public routes
router.get("/", getTrains);
router.get("/:id", getTrainById);

//Protected routes
router.post("/", authMiddleware, adminMiddleware, createTrain);
router.patch("/:id", authMiddleware,adminMiddleware, updateTrain);
router.delete("/:id", authMiddleware, adminMiddleware, deleteTrain);

module.exports = router;
