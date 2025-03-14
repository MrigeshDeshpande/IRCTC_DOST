const Train = require("../models/Train");

const getTrains = async (req, res) => {
  try {
    const trains = await Train.getAll();
    res.json(trains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTrainById = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train) {
      return res.status(404).json({ error: "Train not found" });
    }
    res.json(train);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTrain = async (req, res) => {
  try {
    const train = await Train.create(req.body);
    res.status(201).json(train);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTrain = async (req, res) => {
  try {
    const updatedTrain = await Train.update(req.params.id, req.body);
    res.json(updatedTrain);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTrain = async (req, res) => {
  try {
    await Train.delete(req.params.id);
    res.json({ message: "Train deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTrains,
  getTrainById,
  createTrain,
  updateTrain,
  deleteTrain,
};
