const { v4: uuidv4 } = require("uuid");

// Purpose: Seed the bookings table with sample data.
exports.seed = async function (knex) {
  await knex.transaction(async (trx) => {
    // Deletes ALL existing entries
    await trx("bookings").del();

    // Fetch user ids
    const users = await trx("users").select("*");
    if (users.length < 3) {
      // Updated check for at least 3 users
      console.error("Not enough users found in the database.");
      return;
    }

    console.log("Fetched users:");
    console.table(users);

    // Fetch train ids
    const trains = await trx("trains").select("*");
    if (trains.length < 2) {
      console.error("Not enough trains found in the database.");
      return;
    }

    console.log("Fetched trains:");
    console.table(trains);

    // Define bookings with correct IDs
    const bookings = [
      {
        id: uuidv4(),
        user_id: users[0]?.id,
        train_id: trains[0]?.id,
        seat_number: "A1-23",
        status: "waiting",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        user_id: users[1]?.id,
        train_id: trains[1]?.id,
        seat_number: "B2-45",
        status: "booked",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        user_id: users[2]?.id,
        train_id: trains[0]?.id,
        seat_number: "C3-18",
        status: "booked",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    console.log("Inserting bookings:");
    console.table(bookings);

    const insertedBookings = await trx("bookings")
      .insert(bookings)
      .returning("*");

    console.log("Inserted bookings:");
    console.table(insertedBookings);

    // Query inserted data
    const allBookings = await trx("bookings").select("*");
    console.log("All bookings after insert:");
    console.table(allBookings);
  });
};
