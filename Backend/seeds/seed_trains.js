/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("trains").del();
  await knex("trains").insert([
    {
      train_number: "12345",
      train_name: "Rajdhani Express",
      source: "Delhi",
      destination: "Mumbai",
      departure_time: "2025-03-13 06:00:00",
      arrival_time: "2025-03-13 18:00:00",
    },
    {
      train_number: "67890",
      train_name: "Shatabdi Express",
      source: "Bangalore",
      destination: "Chennai",
      departure_time: "2025-03-13 07:00:00",
      arrival_time: "2025-03-13 12:00:00",
    },
  ]);
};
