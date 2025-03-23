### 1. Overbooking Issue

#### Challenge

Multiple users could book the last available seat at the same time, resulting in overbooking.

#### Root Cause

Lack of concurrency control when multiple booking operations were executed simultaneously, causing conflicts in updating the available_seats count.

### Our Approach

- Used transactions to ensure booking operations are atomic.
- Added row-level locking (SELECT ... FOR UPDATE) to prevent simultaneous updates to the same row.

#### Solution

```sql
BEGIN;
SELECT available_seats FROM trains WHERE id = $1 FOR UPDATE;
UPDATE trains SET available_seats = available_seats - 1 WHERE id = $1 AND available_seats > 0;
COMMIT;
```

### 2. Cancelling a Booking Didn't Free Up Seats

#### Challenge

Cancelled bookings did not increment the available_seats count, leading to inaccurate seat availability.

#### Root Cause

The cancellation process updated the booking status but did not modify the available_seats field in the trains table.

#### Our Approach

- Increment available_seats when a booking is marked as "cancelled."

#### Solution

```sql
UPDATE trains SET available_seats = available_seats + 1 WHERE id = $1;
```

### 3. Seat Validation

#### Challenge

Bookings needed to ensure the requested seat was valid (within 1 to available_seats) and not already booked.

#### Root Cause

No checks were in place to validate whether the seat number requested by the user was within a valid range or had already been booked.

#### Our Approach

- Validate the seat number before proceeding.
- Query the database to ensure the seat is not already booked.

#### Solution

- Check seat validity:

```sql
SELECT available_seats FROM trains WHERE id = $1;
```

- Ensure the seat is not already booked:

```sql
SELECT id FROM bookings WHERE train_id = $1 AND seat_number = $2 AND status = 'booked';
```

### 4. Time Validation

#### Challenge

Departure and arrival times needed to be logically consistent (e.g., arrival_time > departure_time) to avoid scheduling issues.

#### Root Cause

Inconsistent time validations for train schedules, risking conflicts in departure and arrival timings.

#### Our Approach

- Compare departure_time and arrival_time for logical consistency.
- Check for scheduling conflicts with existing trains on the same route.

## Summary of Challenges and Fixes

| Challenge            | Root Cause                                          | Solution                                       |
| -------------------- | --------------------------------------------------- | ---------------------------------------------- |
| Overbooking          | Lack of concurrency control                         | Transactions with SELECT ... FOR UPDATE        |
| Cancelling a booking | No increment to available_seats during cancellation | Increment available_seats on cancellation      |
| Seat validation      | Missing seat range and booking checks               | Added seat validity and booking status queries |
| Time validation      | Missing time consistency checks                     | Ensured logical and route consistency          |
