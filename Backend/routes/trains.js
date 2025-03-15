const express = require("express");
const router = express.Router();
const {
  getTrains,
  getTrainById,
  createTrain,
  updateTrain,
  deleteTrain,
} = require("../controllers/trainsController");

router.get("/", getTrains);
router.get("/:id", getTrainById);
router.post("/", createTrain);
router.patch("/:id", updateTrain);
router.delete("/:id", deleteTrain);

module.exports = router;
