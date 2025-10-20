# Room Status Update on Check-out - Trigger Implementation

## Overview
This document describes the trigger-based mechanism to automatically update room status to 'available' when a booking status changes to 'checked_out'.

## Problem Statement
When a guest checks out, the corresponding room status must be updated from 'occupied' to 'available' to make the room available for new bookings.

## Solution: Database Trigger

### Trigger Design
An `AFTER UPDATE` trigger on the `booking` table automatically updates the room status when the booking status changes to 'checked_out'.

### SQL Implementation

```sql
-- Create trigger to update room status on check-out
DELIMITER $$

CREATE TRIGGER update_room_status_on_checkout
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
    -- Check if booking status changed to 'checked_out'
    IF NEW.booking_status = 'checked_out' AND OLD.booking_status != 'checked_out' THEN
        -- Update the room status to 'available'
        UPDATE rooms
        SET state = 'available',
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
            'occupied',
            'available',
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
1. Guest completes stay and payment
        ↓
2. Booking status updated to 'checked_out'
        ↓
3. Trigger detects status change
        ↓
4. Room status updated to 'available'
        ↓
5. Audit log entry created (optional)
        ↓
6. Room becomes available for new bookings
```

### Conditions
- Trigger fires only on `UPDATE` operations
- Checks if booking status changed **to** 'checked_out'
- Prevents duplicate updates if status was already 'checked_out'
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

### Check-out Process

```sql
-- Initial state: Booking checked in, Room occupied
SELECT b.booking_id, b.booking_status, r.state
FROM booking b
JOIN rooms r ON b.room_id = r.room_id
WHERE b.booking_id = 'booking-uuid-123';

-- Result:
-- booking_id: booking-uuid-123
-- booking_status: checked_in
-- room_state: occupied

-- Perform check-out
UPDATE booking
SET booking_status = 'checked_out',
    checkout_datetime = NOW()
WHERE booking_id = 'booking-uuid-123';

-- Verify room status changed automatically
SELECT b.booking_id, b.booking_status, r.state
FROM booking b
JOIN rooms r ON b.room_id = r.room_id
WHERE b.booking_id = 'booking-uuid-123';

-- Result:
-- booking_id: booking-uuid-123
-- booking_status: checked_out
-- room_state: available  ← Automatically updated by trigger
```

### Complete Check-out Workflow

```sql
-- Step 1: Verify payment is complete (see PAYMENT_VALIDATION_CHECKOUT.md)
SELECT payment_status 
FROM payments 
WHERE booking_id = 'booking-uuid-123';
-- Must be 'paid'

-- Step 2: Perform check-out
UPDATE booking
SET booking_status = 'checked_out',
    checkout_datetime = NOW()
WHERE booking_id = 'booking-uuid-123';
-- Trigger automatically updates room status to 'available'

-- Step 3: Verify room is available
SELECT room_no, state 
FROM rooms 
WHERE room_id = (
    SELECT room_id FROM booking WHERE booking_id = 'booking-uuid-123'
);
-- Result: state = 'available'
```

## Application Layer Integration

### Backend Check-out Endpoint (Node.js/Express)

```javascript
// Check-out endpoint
app.patch('/api/bookings/:bookingId/checkout', async (req, res) => {
    const { bookingId } = req.params;
    const { staffId } = req.body;
    
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Step 1: Verify payment is complete
        const [payment] = await connection.query(
            `SELECT payment_status, due_amount 
             FROM payments 
             WHERE booking_id = ?`,
            [bookingId]
        );
        
        if (!payment[0] || payment[0].payment_status !== 'paid') {
            await connection.rollback();
            return res.status(400).json({
                error: 'Payment must be completed before check-out',
                dueAmount: payment[0]?.due_amount || 0
            });
        }
        
        // Step 2: Update booking status to checked_out
        // The trigger will automatically update room status
        const result = await connection.query(
            `UPDATE booking 
             SET booking_status = 'checked_out',
                 checkout_datetime = NOW(),
                 staff_id = ?
             WHERE booking_id = ?
               AND booking_status = 'checked_in'`,
            [staffId, bookingId]
        );
        
        if (result[0].affectedRows === 0) {
            await connection.rollback();
            return res.status(400).json({
                error: 'Booking not found or already checked out'
            });
        }
        
        await connection.commit();
        
        // Step 3: Fetch updated booking with room details
        const [booking] = await connection.query(
            `SELECT b.*, r.room_no, r.state as room_state,
                    p.total_charges, p.amount_paid
             FROM booking b
             JOIN rooms r ON b.room_id = r.room_id
             LEFT JOIN payments p ON b.booking_id = p.booking_id
             WHERE b.booking_id = ?`,
            [bookingId]
        );
        
        res.json({
            message: 'Check-out successful',
            booking: booking[0],
            roomStatus: 'available', // Automatically set by trigger
            payment: {
                totalCharges: booking[0].total_charges,
                amountPaid: booking[0].amount_paid
            }
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Check-out error:', error);
        res.status(500).json({ error: 'Check-out failed' });
    } finally {
        connection.release();
    }
});
```

### Frontend Check-out Component (React)

```javascript
const CheckOutButton = ({ booking, payment }) => {
    const [loading, setLoading] = useState(false);
    
    const handleCheckOut = async () => {
        // Verify payment is complete
        if (payment.payment_status !== 'paid') {
            alert(`Payment incomplete! Due amount: $${payment.due_amount}`);
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await fetch(
                `/api/bookings/${booking.booking_id}/checkout`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ staffId: currentStaff.id })
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                alert(`Check-out successful! Room ${data.booking.room_no} is now available.`);
                // Refresh booking list
                refreshBookings();
            } else {
                const error = await response.json();
                alert(`Check-out failed: ${error.error}`);
            }
        } catch (error) {
            console.error('Check-out failed:', error);
            alert('Check-out failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const canCheckOut = booking.booking_status === 'checked_in' 
                        && payment.payment_status === 'paid';
    
    return (
        <div>
            <button 
                onClick={handleCheckOut}
                disabled={!canCheckOut || loading}
                className={canCheckOut ? 'btn-primary' : 'btn-disabled'}
            >
                {loading ? 'Processing...' : 'Check Out'}
            </button>
            {!canCheckOut && payment.payment_status !== 'paid' && (
                <p className="error">
                    Payment incomplete. Due: ${payment.due_amount}
                </p>
            )}
        </div>
    );
};
```

## Migration Files

### Up Migration
```sql
-- File: backend/migrations/sqls/[timestamp]-room-status-checkout-trigger-up.sql

-- Create trigger to update room status on check-out
DELIMITER $$

CREATE TRIGGER update_room_status_on_checkout
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
    IF NEW.booking_status = 'checked_out' AND OLD.booking_status != 'checked_out' THEN
        UPDATE rooms
        SET state = 'available',
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
            'occupied',
            'available',
            NEW.staff_id,
            CURRENT_TIMESTAMP
        );
    END IF;
END$$

DELIMITER ;
```

### Down Migration
```sql
-- File: backend/migrations/sqls/[timestamp]-room-status-checkout-trigger-down.sql

DROP TRIGGER IF EXISTS update_room_status_on_checkout;
```

## Testing

### Test Scenarios

```sql
-- Setup: Create test data
INSERT INTO rooms (room_id, room_no, state) 
VALUES (101, '101A', 'occupied');

INSERT INTO booking (booking_id, room_id, booking_status)
VALUES ('test-booking-1', 101, 'checked_in');

INSERT INTO payments (payment_id, booking_id, payment_status, due_amount)
VALUES (UUID(), 'test-booking-1', 'paid', 0.00);

-- Test 1: Check-out updates room status
UPDATE booking 
SET booking_status = 'checked_out',
    checkout_datetime = NOW()
WHERE booking_id = 'test-booking-1';

SELECT state FROM rooms WHERE room_id = 101;
-- Expected: 'available'

-- Test 2: Verify audit log entry
SELECT * FROM audit_log 
WHERE table_name = 'rooms' 
  AND record_id = 101 
  AND field_name = 'state'
  AND new_value = 'available'
ORDER BY changed_at DESC 
LIMIT 1;
-- Expected: Entry showing state change from 'occupied' to 'available'

-- Test 3: Room becomes available for new bookings
INSERT INTO booking (booking_id, room_id, checking_datetime, checkout_datetime, booking_status)
VALUES (UUID(), 101, '2025-03-01 14:00:00', '2025-03-05 11:00:00', 'confirmed');
-- Should succeed (room is now available)
```

### Edge Cases

```sql
-- Edge Case 1: Check-out without check-in
INSERT INTO booking (booking_id, room_id, booking_status)
VALUES ('test-booking-2', 102, 'confirmed');

UPDATE booking 
SET booking_status = 'checked_out' 
WHERE booking_id = 'test-booking-2';
-- Trigger fires, room becomes 'available'
-- Consider adding validation if this shouldn't be allowed

-- Edge Case 2: Multiple check-outs (idempotency)
UPDATE booking 
SET booking_status = 'checked_out' 
WHERE booking_id = 'test-booking-1';
-- Trigger doesn't fire (OLD.booking_status == NEW.booking_status)

-- Edge Case 3: Cancelled booking
UPDATE booking 
SET booking_status = 'cancelled' 
WHERE booking_id = 'test-booking-3';
-- Trigger doesn't fire (status not 'checked_out')
-- Room status unchanged
```

## Integration with Payment Validation

### Combined Trigger Approach
The check-out trigger works in conjunction with the payment validation trigger (see `PAYMENT_VALIDATION_CHECKOUT.md`):

```sql
-- Payment validation trigger prevents check-out if payment incomplete
-- Check-out trigger updates room status after successful check-out

-- Flow:
-- 1. User attempts check-out
-- 2. Payment validation trigger checks if payment is complete
-- 3. If payment incomplete, check-out is blocked
-- 4. If payment complete, check-out proceeds
-- 5. Check-out trigger updates room status to 'available'
```

## Benefits

1. **Automatic Synchronization**: Room status updates automatically with booking status
2. **Immediate Availability**: Room becomes available for new bookings immediately after check-out
3. **Data Consistency**: No manual intervention required
4. **Audit Trail**: Optional logging of all status changes
5. **Transaction Safety**: Changes are atomic and consistent

## Considerations

### Performance
- Trigger adds minimal overhead (single UPDATE statement)
- Consider indexing `room_id` in rooms table for faster updates
- Audit log inserts are async and don't block the main update

### Room Cleaning and Maintenance
If rooms require cleaning before being available:

```sql
-- Modified trigger to set room to 'maintenance' instead of 'available'
DELIMITER $$

CREATE TRIGGER update_room_status_on_checkout_with_cleaning
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
    IF NEW.booking_status = 'checked_out' AND OLD.booking_status != 'checked_out' THEN
        -- Set room to maintenance for cleaning
        UPDATE rooms
        SET state = 'maintenance',
            updated_at = CURRENT_TIMESTAMP
        WHERE room_id = NEW.room_id;
        
        -- Create cleaning task (assuming a cleaning_tasks table exists)
        INSERT INTO cleaning_tasks (room_id, task_status, created_at)
        VALUES (NEW.room_id, 'pending', CURRENT_TIMESTAMP);
    END IF;
END$$

DELIMITER ;

-- Separate process updates room to 'available' after cleaning complete
```

### Error Handling
```sql
-- If room update fails, the entire transaction rolls back
-- This ensures booking and room states remain consistent

-- Example: Room in maintenance cannot be made available
-- Solution: Additional validation or conditional logic in trigger
```

### Concurrent Check-outs
- MySQL InnoDB ensures transactional consistency
- Multiple check-outs can happen simultaneously without conflicts
- Each trigger execution is isolated within its transaction

## Related Documentation

- See `PREVENT_DOUBLE_BOOKING.md` for double-booking prevention
- See `ROOM_STATUS_UPDATE_CHECKIN.md` for check-in process
- See `PAYMENT_VALIDATION_CHECKOUT.md` for payment validation before check-out
- See `BILL_CALCULATION_CHECKOUT.md` for billing calculation

## Monitoring and Maintenance

### Verify Trigger is Active
```sql
SHOW TRIGGERS WHERE `Table` = 'booking' AND `Trigger` = 'update_room_status_on_checkout';
```

### Check Trigger Execution
```sql
-- Query to find rooms that should be available but aren't
SELECT b.booking_id, b.room_id, b.booking_status, r.state
FROM booking b
JOIN rooms r ON b.room_id = r.room_id
WHERE b.booking_status = 'checked_out'
  AND r.state = 'occupied'
  AND b.checkout_datetime >= DATE_SUB(NOW(), INTERVAL 1 DAY);
-- Should return 0 rows

-- Query to find available rooms
SELECT COUNT(*) as available_rooms
FROM rooms
WHERE state = 'available';
```

### Performance Metrics
```sql
-- Count check-outs in the last 24 hours
SELECT COUNT(*) as checkout_count
FROM booking
WHERE booking_status = 'checked_out'
  AND checkout_datetime >= DATE_SUB(NOW(), INTERVAL 24 HOUR);

-- Average room turnover time
SELECT AVG(TIMESTAMPDIFF(MINUTE, checkout_datetime, next_checkin)) as avg_turnover_minutes
FROM (
    SELECT 
        b1.checkout_datetime,
        MIN(b2.checking_datetime) as next_checkin
    FROM booking b1
    JOIN booking b2 ON b1.room_id = b2.room_id
    WHERE b1.booking_status = 'checked_out'
      AND b2.checking_datetime > b1.checkout_datetime
    GROUP BY b1.booking_id, b1.checkout_datetime
) turnovers;
```

## Troubleshooting

### Problem: Room not becoming available after check-out
```sql
-- Check if trigger exists
SHOW TRIGGERS WHERE `Table` = 'booking';

-- Check trigger execution
SELECT * FROM audit_log 
WHERE table_name = 'rooms' 
  AND action = 'UPDATE' 
  AND field_name = 'state'
ORDER BY changed_at DESC 
LIMIT 10;

-- Manual fix if needed
UPDATE rooms r
JOIN booking b ON r.room_id = b.room_id
SET r.state = 'available'
WHERE b.booking_status = 'checked_out'
  AND r.state = 'occupied';
```

### Problem: Trigger not firing
```sql
-- Verify booking status is actually changing
SELECT booking_id, booking_status, checkout_datetime
FROM booking
WHERE booking_id = 'problematic-booking-id';

-- Ensure proper permissions
SHOW GRANTS FOR CURRENT_USER();
```
