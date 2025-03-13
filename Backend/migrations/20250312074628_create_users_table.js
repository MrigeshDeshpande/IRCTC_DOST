// Purpose: Create users table in the database.
// id: UUID primary key.

exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("name").notNullable();
    table.string("email").notNullable().unique();
    table.string("password").notNullable();
    table.string("phone").unique();
    table.timestamps(true, true);
  });
};

// Purpose: Drop users table from the database.
exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
