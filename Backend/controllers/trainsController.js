const Train = require("../models/Train");

/**
 * `getTrains` Function: Fetches all train records from the database.
 *
 * Flow:
 * 1. Calls the `getAll` method from the `Train` model to retrieve all train records.
 * 2. Returns the list of trains as a JSON response.
 * 3. Handles any errors that occur during the operation and returns an error response.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} List of all train records.
 *
 */
const getTrains = async (req, res) => {
  try {
    const trains = await Train.getAll();
    res.json(trains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * `getTrainById` Function: Retrieves a specific train record based on the provided `id`.
 *
 * Flow:
 * 1. Calls the `findById` method from the `Train` model to fetch the train record.
 * 2. Checks if the train record exists and returns it if found.
 * 3. Returns the train record as a JSON response.
 * 4. Handles any errors that occur during the operation and returns an error response.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} The train record if found.
 *
 */
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

/**
 * `createTrain` Function: Adds a new train record to the database after performing necessary validation checks.
 *
 * Flow:
 * 1. Extracts train details (`train_number`, `train_name`, `source`, `destination`, `departure_time`, `arrival_time`) from the input `req.body`.
 * 2. Validates the input:
 *    - Ensures all required fields (`train_number`, `train_name`, `source`, `destination`, `departure_time`, `arrival_time`) are provided.
 *    - Converts the `departure_time` and `arrival_time` strings to Date objects for comparison.
 *    - Checks if the `departure_time` is in the future and the `arrival_time` is after the `departure_time`.
 * 3. Fetches existing trains with the same route (`source` and `destination`).
 * 4. Checks for time overlap with existing trains to prevent scheduling conflicts.
 * 5. If all checks pass, creates the new train record in the database.
 * 6. Returns the newly created train record as the result.
 * 7. Handles any errors that occur during the process and returns an error response.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} The newly created train record.
 *
 */
const createTrain = async (req, res) => {
  try {
    const {
      train_number,
      train_name,
      source,
      destination,
      departure_time,
      arrival_time,
    } = req.body;

    console.log(req.body);
    if (
      !train_number ||
      !train_name ||
      !source ||
      !destination ||
      !departure_time ||
      !arrival_time
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const departure = new Date(departure_time);
    const arrival = new Date(arrival_time);
    const now = new Date();

    if (departure < now) {
      return res
        .status(400)
        .json({ error: "Departure time must be in the future" });
    }
    if (arrival <= departure) {
      return res
        .status(400)
        .json({ error: "Arrival time must be after departure time" });
    }

    const existingTrain = await Train.findByRoute(source, destination);

    const isOverlap = existingTrain.some((train) => {
      return (
        (departure >= train.departure_time &&
          departure <= train.arrival_time) ||
        (arrival >= train.departure_time && arrival <= train.arrival_time) ||
        (departure_time <= train.departure_time &&
          arrival_time >= train.arrival_time)
      );
    });

    if (isOverlap) {
      return res
        .status(400)
        .json({ error: "Train times overlap with an existing train" });
    }

    const newTrain = await Train.create({
      train_number,
      train_name,
      source,
      destination,
      departure_time,
      arrival_time,
    });
    res.status(201).json(newTrain);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * `updateTrain` Function: Updates an existing train record in the database after performing necessary validation checks.
 *
 * Flow:
 * 1. Extracts train details (`departure_time`, `arrival_time`) from the input `req.body`.
 * 2. Fetches the train to be updated using the provided `id`.
 * 3. Checks if the train exists and returns an error if not found.
 * 4. Fetch
 * 5. Checks for time overlap with existing trains to prevent scheduling conflicts.
 * 6. Validates the updated `departure_time` and `arrival_time`:
 *    - Ensures the `departure_time` is in the future.
 *    - Verifies that the `arrival_time` is after the `departure_time`.
 * 7. Updates the train record with the new details.
 * 8. Returns the updated train record as the result.
 * 9. Handles any errors that occur during the process and returns an error response.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} The updated train record.
 *
 */
const updateTrain = async (req, res) => {
  try {
    const { departure_time, arrival_time } = req.body;
    const now = new Date();

    const trainToUpdate = await Train.findById(req.params.id);
    if (!trainToUpdate) {
      return res.status(404).json({ error: "Train not found" });
    }

    //fetch existing trains with same route
    const existingTrain = await Train.findById({
      source: trainToUpdate.source,
      destination: trainToUpdate.destination,
      _id: { $ne: req.params.id },
    });

    //check for time overlap
    const isOverlap = existingTrain.some((train) => {
      return (
        (departure_time >= train.departure_time &&
          departure_time <= train.arrival_time) ||
        (arrival_time >= train.departure_time &&
          arrival_time <= train.arrival_time) ||
        (departure_time <= train.departure_time &&
          arrival_time >= train.arrival_time)
      );
    });

    if (isOverlap) {
      return res
        .status(400)
        .json({ error: "Train times overlap with an existing train" });
    }

    if (departure_time || arrival_time) {
      const departure = departure_time ? new Date(departure_time) : null;
      const arrival = arrival_time ? new Date(arrival_time) : null;

      if (departure && departure < now) {
        return res
          .status(400)
          .json({ error: "Departure time must be in the future" });
      }
      if (departure && arrival && arrival <= departure) {
        return res
          .status(400)
          .json({ error: "Arrival time must be after departure time" });
      }
    }

    const updatedTrain = await Train.update(req.params.id, req.body);
    res.json(updatedTrain);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * `deleteTrain` Function: Removes a train record from the database.
 *
 * Flow:
 * 1. Calls the `delete` method from the `Train` model to remove the train record.
 * 2. Handles any errors that occur during the process and returns an error response.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 *
 */
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
