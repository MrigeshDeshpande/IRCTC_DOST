/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("trains", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("train_number").notNullable().unique();
    table.string("train_name").notNullable();
    table.string("source").notNullable();
    table.string("destination").notNullable();
    table.time("departure_time").notNullable();
    table.time("arrival_time").notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("trains");
};
