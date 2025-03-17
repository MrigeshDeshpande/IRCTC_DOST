const express = require("express");
const router = express.Router();
const  authMiddleware  = require("../middleware/authMiddleware");

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
router.post("/", authMiddleware, createTrain);
router.patch("/:id", authMiddleware, updateTrain);
router.delete("/:id", authMiddleware, deleteTrain);

module.exports = router;
