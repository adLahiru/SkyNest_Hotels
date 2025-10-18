# Prevent Double-Booking Implementation

## Overview
This document describes the implementation of logic to prevent double-booking the same room for overlapping check-in/check-out periods.

## Problem Statement
Multiple guests should not be able to book the same room for overlapping dates. The system must validate that a room is available before confirming a booking.

## Solution: Trigger-Based Prevention

### Database Trigger
A `BEFORE INSERT` and `BEFORE UPDATE` trigger validates bookings before they are created or modified.

### SQL Implementation

```sql
-- Create trigger to prevent double-booking
DELIMITER $$

CREATE TRIGGER prevent_double_booking_insert
BEFORE INSERT ON booking
FOR EACH ROW
BEGIN
    DECLARE overlap_count INT;
    
    -- Check for overlapping bookings for the same room
    SELECT COUNT(*) INTO overlap_count
    FROM booking
    WHERE room_id = NEW.room_id
      AND booking_status IN ('confirmed', 'checked_in')
      AND (
          -- New booking starts during existing booking
          (NEW.checking_datetime >= checking_datetime 
           AND NEW.checking_datetime < checkout_datetime)
          OR
          -- New booking ends during existing booking
          (NEW.checkout_datetime > checking_datetime 
           AND NEW.checkout_datetime <= checkout_datetime)
          OR
          -- New booking completely encompasses existing booking
          (NEW.checking_datetime <= checking_datetime 
           AND NEW.checkout_datetime >= checkout_datetime)
      );
    
    IF overlap_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'This room is already booked for the selected dates. Please choose different dates or another room.';
    END IF;
END$$

CREATE TRIGGER prevent_double_booking_update
BEFORE UPDATE ON booking
FOR EACH ROW
BEGIN
    DECLARE overlap_count INT;
    
    -- Only check if booking is being confirmed or dates are being changed
    IF NEW.booking_status IN ('confirmed', 'checked_in') THEN
        -- Check for overlapping bookings for the same room (excluding current booking)
        SELECT COUNT(*) INTO overlap_count
        FROM booking
        WHERE room_id = NEW.room_id
          AND booking_id != NEW.booking_id
          AND booking_status IN ('confirmed', 'checked_in')
          AND (
              (NEW.checking_datetime >= checking_datetime 
               AND NEW.checking_datetime < checkout_datetime)
              OR
              (NEW.checkout_datetime > checking_datetime 
               AND NEW.checkout_datetime <= checkout_datetime)
              OR
              (NEW.checking_datetime <= checking_datetime 
               AND NEW.checkout_datetime >= checkout_datetime)
          );
        
        IF overlap_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'This room is already booked for the selected dates. Please choose different dates or another room.';
        END IF;
    END IF;
END$$

DELIMITER ;
```

## How It Works

### Overlap Detection Logic
The trigger checks for four types of date overlaps:

1. **New booking starts during existing booking**
   ```
   Existing: |-----------|
   New:           |--------|
   ```

2. **New booking ends during existing booking**
   ```
   Existing:      |-----------|
   New:      |--------|
   ```

3. **New booking encompasses existing booking**
   ```
   Existing:    |-----|
   New:      |-----------|
   ```

4. **New booking is within existing booking**
   ```
   Existing: |-----------|
   New:        |-----|
   ```

### Conditions
- Only applies to bookings with status `confirmed` or `checked_in`
- Cancelled and checked-out bookings are ignored
- For updates, the current booking is excluded from the check

## Usage Examples

### Valid Booking Scenarios

```sql
-- Room 101 booking from Jan 1-5
INSERT INTO booking (room_id, checking_datetime, checkout_datetime, booking_status)
VALUES (101, '2025-01-01 14:00:00', '2025-01-05 11:00:00', 'confirmed');

-- Different room, same dates - OK
INSERT INTO booking (room_id, checking_datetime, checkout_datetime, booking_status)
VALUES (102, '2025-01-01 14:00:00', '2025-01-05 11:00:00', 'confirmed');

-- Same room, non-overlapping dates - OK
INSERT INTO booking (room_id, checking_datetime, checkout_datetime, booking_status)
VALUES (101, '2025-01-06 14:00:00', '2025-01-10 11:00:00', 'confirmed');
```

### Invalid Booking Scenarios

```sql
-- Room 101 already booked Jan 1-5
-- Attempting to book Jan 3-7 - REJECTED
INSERT INTO booking (room_id, checking_datetime, checkout_datetime, booking_status)
VALUES (101, '2025-01-03 14:00:00', '2025-01-07 11:00:00', 'confirmed');
-- Error: This room is already booked for the selected dates

-- Attempting to book Jan 1-3 - REJECTED
INSERT INTO booking (room_id, checking_datetime, checkout_datetime, booking_status)
VALUES (101, '2025-01-01 14:00:00', '2025-01-03 11:00:00', 'confirmed');
-- Error: This room is already booked for the selected dates
```

## Application Layer Implementation

### Backend Validation Function (Node.js)

```javascript
async function checkRoomAvailability(roomId, checkIn, checkOut, excludeBookingId = null) {
    const query = `
        SELECT COUNT(*) as overlap_count
        FROM booking
        WHERE room_id = ?
            AND booking_id != COALESCE(?, UUID())
            AND booking_status IN ('confirmed', 'checked_in')
            AND (
                (? >= checking_datetime AND ? < checkout_datetime)
                OR (? > checking_datetime AND ? <= checkout_datetime)
                OR (? <= checking_datetime AND ? >= checkout_datetime)
            )
    `;
    
    const [result] = await db.query(query, [
        roomId, 
        excludeBookingId,
        checkIn, checkIn,
        checkOut, checkOut,
        checkIn, checkOut
    ]);
    
    return result[0].overlap_count === 0;
}

// Usage in booking endpoint
app.post('/api/bookings', async (req, res) => {
    const { roomId, checkIn, checkOut } = req.body;
    
    const isAvailable = await checkRoomAvailability(roomId, checkIn, checkOut);
    
    if (!isAvailable) {
        return res.status(409).json({
            error: 'Room is not available for the selected dates'
        });
    }
    
    // Proceed with booking creation
    // ...
});
```

## Migration File

### Up Migration
```sql
-- File: backend/migrations/sqls/[timestamp]-prevent-double-booking-up.sql
-- Create trigger to prevent double-booking
DELIMITER $$

CREATE TRIGGER prevent_double_booking_insert
BEFORE INSERT ON booking
FOR EACH ROW
BEGIN
    DECLARE overlap_count INT;
    
    SELECT COUNT(*) INTO overlap_count
    FROM booking
    WHERE room_id = NEW.room_id
      AND booking_status IN ('confirmed', 'checked_in')
      AND (
          (NEW.checking_datetime >= checking_datetime 
           AND NEW.checking_datetime < checkout_datetime)
          OR
          (NEW.checkout_datetime > checking_datetime 
           AND NEW.checkout_datetime <= checkout_datetime)
          OR
          (NEW.checking_datetime <= checking_datetime 
           AND NEW.checkout_datetime >= checkout_datetime)
      );
    
    IF overlap_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'This room is already booked for the selected dates. Please choose different dates or another room.';
    END IF;
END$$

CREATE TRIGGER prevent_double_booking_update
BEFORE UPDATE ON booking
FOR EACH ROW
BEGIN
    DECLARE overlap_count INT;
    
    IF NEW.booking_status IN ('confirmed', 'checked_in') THEN
        SELECT COUNT(*) INTO overlap_count
        FROM booking
        WHERE room_id = NEW.room_id
          AND booking_id != NEW.booking_id
          AND booking_status IN ('confirmed', 'checked_in')
          AND (
              (NEW.checking_datetime >= checking_datetime 
               AND NEW.checking_datetime < checkout_datetime)
              OR
              (NEW.checkout_datetime > checking_datetime 
               AND NEW.checkout_datetime <= checkout_datetime)
              OR
              (NEW.checking_datetime <= checking_datetime 
               AND NEW.checkout_datetime >= checkout_datetime)
          );
        
        IF overlap_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'This room is already booked for the selected dates. Please choose different dates or another room.';
        END IF;
    END IF;
END$$

DELIMITER ;
```

### Down Migration
```sql
-- File: backend/migrations/sqls/[timestamp]-prevent-double-booking-down.sql
DROP TRIGGER IF EXISTS prevent_double_booking_insert;
DROP TRIGGER IF EXISTS prevent_double_booking_update;
```

## Testing

### Test Cases

```sql
-- Test 1: Create initial booking
INSERT INTO booking (booking_id, room_id, checking_datetime, checkout_datetime, booking_status)
VALUES (UUID(), 101, '2025-02-01 14:00:00', '2025-02-05 11:00:00', 'confirmed');

-- Test 2: Attempt overlapping booking (should fail)
INSERT INTO booking (booking_id, room_id, checking_datetime, checkout_datetime, booking_status)
VALUES (UUID(), 101, '2025-02-03 14:00:00', '2025-02-07 11:00:00', 'confirmed');

-- Test 3: Non-overlapping booking (should succeed)
INSERT INTO booking (booking_id, room_id, checking_datetime, checkout_datetime, booking_status)
VALUES (UUID(), 101, '2025-02-06 14:00:00', '2025-02-10 11:00:00', 'confirmed');

-- Test 4: Different room, same dates (should succeed)
INSERT INTO booking (booking_id, room_id, checking_datetime, checkout_datetime, booking_status)
VALUES (UUID(), 102, '2025-02-01 14:00:00', '2025-02-05 11:00:00', 'confirmed');
```

## Benefits

1. **Data Integrity**: Prevents double-booking at the database level
2. **Automatic Enforcement**: No need to rely on application code
3. **Consistent Validation**: Works regardless of how data is inserted (API, admin panel, etc.)
4. **Clear Error Messages**: Provides meaningful feedback to users

## Considerations

- **Performance**: Index on `(room_id, checking_datetime, checkout_datetime, booking_status)` recommended
- **Cancelled Bookings**: Cancelled bookings don't block new bookings
- **Maintenance Mode**: Rooms in maintenance status can still be booked (consider adding additional checks if needed)
- **Timezone Handling**: Ensure all datetime values use consistent timezone

## Related Documentation

- See `ROOM_STATUS_UPDATE_CHECKIN.md` for check-in room status updates
- See `ROOM_STATUS_UPDATE_CHECKOUT.md` for check-out room status updates
- See `PAYMENT_VALIDATION_CHECKOUT.md` for payment requirements
