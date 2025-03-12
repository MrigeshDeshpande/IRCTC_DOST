/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("users").del();
  await knex("users").insert([
    {
      name: "Amit Sharma",
      email: "amit@example.com",
      password: "hashed_password",
      phone: "9876543210",
    },
    {
      name: "Priya Verma",
      email: "priya@example.com",
      password: "hashed_password",
      phone: "8765432109",
    },
    {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "hashed_password",
      phone: "1234567890",
    },
  ]);
};
