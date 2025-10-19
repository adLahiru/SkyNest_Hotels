# Room Status Update on Check-in - Trigger Implementation

## Overview
This document describes the trigger-based mechanism to automatically update room status to 'occupied' when a booking status changes to 'checked_in'.

## Problem Statement
When a guest checks in, the corresponding room status must be updated from 'available' to 'occupied' to prevent the room from being assigned to other guests.

## Solution: Database Trigger

### Trigger Design
An `AFTER UPDATE` trigger on the `booking` table automatically updates the room status when the booking status changes to 'checked_in'.

### SQL Implementation

```sql
-- Create trigger to update room status on check-in
DELIMITER $$

CREATE TRIGGER update_room_status_on_checkin
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
    -- Check if booking status changed to 'checked_in'
    IF NEW.booking_status = 'checked_in' AND OLD.booking_status != 'checked_in' THEN
        -- Update the room status to 'occupied'
        UPDATE rooms
        SET state = 'occupied',
            updated_at = CURRENT_TIMESTAMP
        WHERE room_id = NEW.room_id;
        
        -- Log the room status change in audit log (optional)
        INSERT INTO audit_log (
            table_name, 
            record_id, 
            action, 
            field_name, 
            old_value, 
            new_value,
            changed_by,
            changed_at
        )
        VALUES (
            'rooms',
            NEW.room_id,
            'UPDATE',
            'state',
            'available',
            'occupied',
            NEW.staff_id,
            CURRENT_TIMESTAMP
        );
    END IF;
END$$

DELIMITER ;
```

## How It Works

### Trigger Flow

```
1. Booking status updated to 'checked_in'
        ↓
2. Trigger detects status change
        ↓
3. Room status updated to 'occupied'
        ↓
4. Audit log entry created (optional)
        ↓
5. Room becomes unavailable for new bookings
```

### Conditions
- Trigger fires only on `UPDATE` operations
- Checks if booking status changed **to** 'checked_in'
- Prevents duplicate updates if status was already 'checked_in'
- Updates `updated_at` timestamp for tracking

## Database Schema Reference

### Booking Table
```sql
booking_status ENUM('confirmed','cancelled','checked_in','checked_out')
```

### Rooms Table
```sql
state ENUM('available','occupied','maintenance')
```

## Usage Examples

### Check-in Process

```sql
-- Initial state: Booking confirmed, Room available
SELECT b.booking_id, b.booking_status, r.state
FROM booking b
JOIN rooms r ON b.room_id = r.room_id
WHERE b.booking_id = 'booking-uuid-123';

-- Result:
-- booking_id: booking-uuid-123
-- booking_status: confirmed
-- room_state: available

-- Perform check-in
UPDATE booking
SET booking_status = 'checked_in'
WHERE booking_id = 'booking-uuid-123';

-- Verify room status changed automatically
SELECT b.booking_id, b.booking_status, r.state
FROM booking b
JOIN rooms r ON b.room_id = r.room_id
WHERE b.booking_id = 'booking-uuid-123';

-- Result:
-- booking_id: booking-uuid-123
-- booking_status: checked_in
-- room_state: occupied  ← Automatically updated by trigger
```

### Multiple Updates Handling

```sql
-- First update: confirmed → checked_in
UPDATE booking SET booking_status = 'checked_in' WHERE booking_id = 'abc-123';
-- Trigger fires, room becomes 'occupied'

-- Subsequent update: checked_in → checked_in (no status change)
UPDATE booking SET staff_id = 'staff-456' WHERE booking_id = 'abc-123';
-- Trigger doesn't fire (OLD and NEW status are the same)

-- Update from other status: cancelled → checked_in
UPDATE booking SET booking_status = 'checked_in' WHERE booking_id = 'def-456';
-- Trigger fires, room becomes 'occupied'
```

## Application Layer Integration

### Backend Check-in Endpoint (Node.js/Express)

```javascript
// Check-in endpoint
app.patch('/api/bookings/:bookingId/checkin', async (req, res) => {
    const { bookingId } = req.params;
    const { staffId } = req.body;
    
    try {
        // Update booking status to checked_in
        // The trigger will automatically update room status
        const result = await db.query(
            `UPDATE booking 
             SET booking_status = 'checked_in',
                 staff_id = ?,
                 checking_datetime = NOW()
             WHERE booking_id = ?
               AND booking_status = 'confirmed'`,
            [staffId, bookingId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(400).json({
                error: 'Booking not found or already checked in'
            });
        }
        
        // Fetch updated booking with room details
        const [booking] = await db.query(
            `SELECT b.*, r.room_no, r.state as room_state
             FROM booking b
             JOIN rooms r ON b.room_id = r.room_id
             WHERE b.booking_id = ?`,
            [bookingId]
        );
        
        res.json({
            message: 'Check-in successful',
            booking: booking[0],
            roomStatus: 'occupied' // Automatically set by trigger
        });
        
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ error: 'Check-in failed' });
    }
});
```

### Frontend Check-in Component (React)

```javascript
const CheckInButton = ({ booking }) => {
    const handleCheckIn = async () => {
        try {
            const response = await fetch(
                `/api/bookings/${booking.booking_id}/checkin`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ staffId: currentStaff.id })
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                alert('Check-in successful! Room is now occupied.');
                // Refresh booking list
                refreshBookings();
            }
        } catch (error) {
            console.error('Check-in failed:', error);
            alert('Check-in failed. Please try again.');
        }
    };
    
    return (
        <button 
            onClick={handleCheckIn}
            disabled={booking.booking_status !== 'confirmed'}
        >
            Check In
        </button>
    );
};
```

## Migration Files

### Up Migration
```sql
-- File: backend/migrations/sqls/[timestamp]-room-status-checkin-trigger-up.sql

-- Create trigger to update room status on check-in
DELIMITER $$

CREATE TRIGGER update_room_status_on_checkin
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
    IF NEW.booking_status = 'checked_in' AND OLD.booking_status != 'checked_in' THEN
        UPDATE rooms
        SET state = 'occupied',
            updated_at = CURRENT_TIMESTAMP
        WHERE room_id = NEW.room_id;
        
        -- Optional: Log the change
        INSERT INTO audit_log (
            table_name, 
            record_id, 
            action, 
            field_name, 
            old_value, 
            new_value,
            changed_by,
            changed_at
        )
        VALUES (
            'rooms',
            NEW.room_id,
            'UPDATE',
            'state',
            'available',
            'occupied',
            NEW.staff_id,
            CURRENT_TIMESTAMP
        );
    END IF;
END$$

DELIMITER ;
```

### Down Migration
```sql
-- File: backend/migrations/sqls/[timestamp]-room-status-checkin-trigger-down.sql

DROP TRIGGER IF EXISTS update_room_status_on_checkin;
```

## Testing

### Test Scenarios

```sql
-- Setup: Create test data
INSERT INTO rooms (room_id, room_no, state) 
VALUES (101, '101A', 'available');

INSERT INTO booking (booking_id, room_id, booking_status)
VALUES ('test-booking-1', 101, 'confirmed');

-- Test 1: Check-in updates room status
UPDATE booking 
SET booking_status = 'checked_in' 
WHERE booking_id = 'test-booking-1';

SELECT state FROM rooms WHERE room_id = 101;
-- Expected: 'occupied'

-- Test 2: Verify audit log entry
SELECT * FROM audit_log 
WHERE table_name = 'rooms' 
  AND record_id = 101 
ORDER BY changed_at DESC 
LIMIT 1;
-- Expected: Entry showing state change from 'available' to 'occupied'

-- Test 3: Multiple updates don't cause issues
UPDATE booking 
SET staff_id = 'staff-999' 
WHERE booking_id = 'test-booking-1';

-- Room state should remain 'occupied' (trigger doesn't fire again)
SELECT state FROM rooms WHERE room_id = 101;
-- Expected: 'occupied'
```

### Edge Cases

```sql
-- Edge Case 1: Check-in already checked-in booking
UPDATE booking 
SET booking_status = 'checked_in' 
WHERE booking_id = 'test-booking-1';
-- Trigger doesn't fire (OLD.booking_status == NEW.booking_status)

-- Edge Case 2: Room in maintenance
UPDATE rooms SET state = 'maintenance' WHERE room_id = 102;
INSERT INTO booking (booking_id, room_id, booking_status)
VALUES ('test-booking-2', 102, 'confirmed');

UPDATE booking 
SET booking_status = 'checked_in' 
WHERE booking_id = 'test-booking-2';
-- Room state changes from 'maintenance' to 'occupied'
-- Consider adding validation if this shouldn't be allowed
```

## Benefits

1. **Automatic Synchronization**: Room status updates automatically with booking status
2. **Data Consistency**: No manual intervention required
3. **Audit Trail**: Optional logging of all status changes
4. **Reduced Errors**: Eliminates possibility of forgetting to update room status
5. **Real-time Availability**: Room immediately unavailable after check-in

## Considerations

### Performance
- Trigger adds minimal overhead (single UPDATE statement)
- Consider indexing `room_id` in rooms table for faster updates
- Audit log inserts are async and don't block the main update

### Error Handling
```sql
-- If room update fails, the entire transaction rolls back
-- This ensures booking and room states remain consistent
```

### Concurrent Check-ins
- MySQL InnoDB ensures transactional consistency
- If two bookings try to check in to the same room simultaneously:
  1. First transaction succeeds
  2. Second transaction violates double-booking prevention trigger
  3. Second transaction rolls back with error

### Integration with Room Availability
```sql
-- Query to get available rooms excludes occupied rooms
SELECT r.*
FROM rooms r
LEFT JOIN booking b ON r.room_id = b.room_id 
    AND b.booking_status = 'checked_in'
WHERE r.state = 'available'
  AND b.booking_id IS NULL;
```

## Related Documentation

- See `PREVENT_DOUBLE_BOOKING.md` for double-booking prevention
- See `ROOM_STATUS_UPDATE_CHECKOUT.md` for check-out process
- See `PAYMENT_VALIDATION_CHECKOUT.md` for payment validation
- See `BILL_CALCULATION_CHECKOUT.md` for billing logic

## Monitoring and Maintenance

### Verify Trigger is Active
```sql
SHOW TRIGGERS WHERE `Table` = 'booking' AND `Trigger` = 'update_room_status_on_checkin';
```

### Check Trigger Execution
```sql
-- Query to find rooms that should be occupied but aren't
SELECT b.booking_id, b.room_id, b.booking_status, r.state
FROM booking b
JOIN rooms r ON b.room_id = r.room_id
WHERE b.booking_status = 'checked_in'
  AND r.state != 'occupied';
-- Should return 0 rows
```

### Performance Metrics
```sql
-- Count check-ins in the last 24 hours
SELECT COUNT(*) as checkin_count
FROM booking
WHERE booking_status = 'checked_in'
  AND updated_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR);
```
