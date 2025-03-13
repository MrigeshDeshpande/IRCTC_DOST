// Purpose: Create bookings table in the database.
// id: UUID primary key.
// user_id: UUID foreign key referencing users table.
// train_id: UUID foreign key referencing trains table.

exports.up = function (knex) {
  return knex.schema.createTable("bookings", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
    table
      .uuid("train_id")
      .references("id")
      .inTable("trains")
      .onDelete("CASCADE");
    table.string("seat_number").notNullable();
    table
      .enum("status", ["booked", "cancelled", "waiting"])
      .defaultTo("booked");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("bookings");
};
