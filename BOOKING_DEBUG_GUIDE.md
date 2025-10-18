# Booking Debug Guide

## Check Backend Logs

When you try to create a booking, the backend will now log:

```
=== CREATE BOOKING REQUEST ===
Request body: { room_id: 9, checking_datetime: '...', ... }
User from JWT: { user_id: '...', role: '...', ... }
Creating booking with data: { booking_id: '...', ... }
```

## Common Issues to Look For:

### 1. **Authentication Issue**
If you see: `ERROR: No user_id found in JWT token`
- **Fix:** Make sure you're logged in
- **Fix:** Check if JWT token is being sent in Authorization header

### 2. **Database Connection Issue**
If you see database connection errors
- **Fix:** Check if MySQL is running
- **Fix:** Verify database credentials in `.env.development`

### 3. **Foreign Key Constraint**
If you see: `Cannot add or update a child row: a foreign key constraint fails`
- **Cause:** `room_id` doesn't exist in `rooms` table
- **Cause:** `user_id` doesn't exist in `users` table
- **Fix:** Verify the room_id and user_id exist in database

### 4. **Date Format Issue**
If dates are causing issues:
- Frontend sends: `2025-10-22T00:00:00.000Z`
- Backend expects: ISO 8601 string
- MySQL expects: DATETIME format

### 5. **Column Not Found**
If you see: `Unknown column 'number_of_guests'`
- **Cause:** Migration not run
- **Fix:** Run: `npx ts-node src/scripts/addBookingColumns.ts`

## Manual Test Query

To test if the INSERT would work, run this in MySQL:

```sql
-- Check if columns exist
DESCRIBE booking;

-- Try manual insert (replace with your actual values)
INSERT INTO booking 
(booking_id, user_id, room_id, checking_datetime, checkout_datetime, 
 booking_status, booking_date, branch_id, number_of_guests, special_requests) 
VALUES 
('test-uuid-123', 'your-user-id', 9, '2025-10-22 00:00:00', '2025-10-31 00:00:00',
 'confirmed', CURDATE(), 'your-branch-id', 2, 'test request');
```

## Check Database State

```sql
-- Verify room exists
SELECT * FROM rooms WHERE room_id = 9;

-- Verify user exists  
SELECT user_id, fname, email FROM users WHERE user_id = 'your-user-id';

-- Check recent bookings
SELECT * FROM booking ORDER BY created_at DESC LIMIT 5;
```

## After Trying Booking

1. **Look at backend console** - You should see detailed logs
2. **Copy the error message** - Share the full error
3. **Check which part failed** - Is it before or after the INSERT?

---

**Next Step:** Try creating a booking and check the backend logs!
