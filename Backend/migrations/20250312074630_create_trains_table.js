// Purpose: Create a table named trains with the following columns.
// id: UUID primary key.

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

// Purpose: Drop the trains table from the database.
exports.down = function (knex) {
  return knex.schema.dropTable("trains");
};
