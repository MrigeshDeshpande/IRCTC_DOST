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
    const { train_number, train_name, source, destination, departure_time, arrival_time } = req.body;

    console.log(req.body);
    if (!train_number || !train_name || !source || !destination || !departure_time || !arrival_time) {
      return res.status(400).json({ error: "All fields are required" });
    }
    // Convert times to Date objects
    const departure = new Date(departure_time);
    const arrival = new Date(arrival_time);
    const now = new Date();

    // Validation checks
    if (departure < now) {
      return res.status(400).json({ error: "Departure time must be in the future" });
    }
    if (arrival <= departure) {
      return res.status(400).json({ error: "Arrival time must be after departure time" });
    }

    //fetch existing trains with same route
    const existingTrain = await Train.findByRoute(source, destination);

    //check for time overlap
    const isOverlap = existingTrain.some(train => {
      return (
        (departure >= train.departure_time && departure <= train.arrival_time) ||
        (arrival >= train.departure_time && arrival <= train.arrival_time) ||
        (departure_time <= train.departure_time && arrival_time >= train.arrival_time)
      );
    }
    );

    if (isOverlap) {
      return res.status(400).json({ error: "Train times overlap with an existing train" });
    }

    const newTrain = await Train.create({
      train_number,
      train_name,
      source,
      destination,
      departure_time,
      arrival_time
    });
    res.status(201).json(newTrain);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTrain = async (req, res) => {
  try {
    const { departure_time, arrival_time } = req.body;
    const now = new Date();

    //fetch the trains to be updated
    const trainToUpdate = await Train.findById(req.params.id);
    if (!trainToUpdate) {
      return res.status(404).json({ error: "Train not found" });
    }

    //fetch existing trains with same route
    const existingTrain = await Train.findById({
      source: trainToUpdate.source,
      destination: trainToUpdate.destination,
      _id: { $ne: req.params.id }
    })

    //check for time overlap
    const isOverlap = existingTrain.some(train => {
      return (
        (departure_time >= train.departure_time && departure_time <= train.arrival_time) ||
        (arrival_time >= train.departure_time && arrival_time <= train.arrival_time) ||
        (departure_time <= train.departure_time && arrival_time >= train.arrival_time)
      );
    });

    if (isOverlap) {
      return res.status(400).json({ error: "Train times overlap with an existing train" });
    }

    if (departure_time || arrival_time) {
      const departure = departure_time ? new Date(departure_time) : null;
      const arrival = arrival_time ? new Date(arrival_time) : null;

      if (departure && departure < now) {
        return res.status(400).json({ error: "Departure time must be in the future" });
      }
      if (departure && arrival && arrival <= departure) {
        return res.status(400).json({ error: "Arrival time must be after departure time" });
      }
    }

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
