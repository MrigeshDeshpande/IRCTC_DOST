# Solving Foreign Key Constraint Errors While Seeding Data

## Overview

I faced a challenge while trying to populate my PostgreSQL database with dummy data using Knex.js seed files. I wanted to fill some dummy data inside the tables before making actual API hits, but I encountered foreign key constraint errors. Here's how I identified the issue and resolved it.

## The Challenge

While running the bookings seed file, I encountered the following error:

Despite logs indicating that data was being inserted, the bookings table remained empty.

## Root Cause

The issue was that the users table did not have the expected number of entries when the bookings seed file was executed. This led to foreign key constraint violations because the `user_id` referenced in the bookings table did not exist in the users table.

## Initial Approach

Initially, I used the `gen_random_uuid()` function to generate UUIDs for the bookings table. However, this caused issues with the foreign key constraints because the UUIDs generated might not have matched those in the users and trains tables.

## Solution

To resolve this issue, I followed these steps:

1. **Update the Users Seed File**: I ensured that the users table was populated with the necessary entries, including a new user "John Doe."

2. **Ensure Seed Execution Order**: I ran the users seed file first to ensure that the users table was correctly populated before running the bookings seed file.

3. **Seed Execution Commands**: To ensure the correct execution order, I ran the following commands:

   ```bash
   npx knex seed:run --specific=seed_users.js
   npx knex seed:run --specific=seed_trains.js
   npx knex seed:run --specific=seed_bookings.js
   ```

4. **Switch to uuidv4**: I switched from using `gen_random_uuid()` to `uuidv4` from the `uuid` package to generate UUIDs consistently across the users, trains, and bookings tables.

5. **Update the Bookings Seed File**: I modified the bookings seed file to:

   - Check for at least 3 users in the users table.
   - Use `uuidv4` to generate UUIDs.
   - Add logging to verify that the users and trains data were correctly fetched before proceeding with the insertions.

6. **Run the Bookings Seed File**: After ensuring the users table was correctly populated, I ran the bookings seed file to insert the bookings.

## Conclusion

By ensuring the correct order of seed file execution, switching to `uuidv4` for consistent UUID generation, and verifying the data before insertions, I successfully resolved the foreign key constraint errors and ensured the data was correctly populated in the bookings table.
