# Payment Validation Before Checkout - Trigger Implementation

## Overview
This document describes the trigger-based mechanism to ensure the total bill is paid in full before a booking can be marked as 'checked_out'.

## Problem Statement
Guests must settle their entire bill before checking out. The system must prevent checkout if there is any outstanding balance.

## Solution: Database Trigger

### Trigger Design
A `BEFORE UPDATE` trigger on the `booking` table validates that payment is complete before allowing status change to 'checked_out'.

### SQL Implementation

```sql
-- Create trigger to validate payment before checkout
DELIMITER $$

CREATE TRIGGER validate_payment_before_checkout
BEFORE UPDATE ON booking
FOR EACH ROW
BEGIN
    DECLARE v_payment_status ENUM('pending','paid','partial');
    DECLARE v_due_amount DECIMAL(10,2);
    DECLARE v_total_charges DECIMAL(10,2);
    
    -- Check if booking status is being changed to 'checked_out'
    IF NEW.booking_status = 'checked_out' AND OLD.booking_status != 'checked_out' THEN
        
        -- Get payment details for this booking
        SELECT payment_status, due_amount, total_charges
        INTO v_payment_status, v_due_amount, v_total_charges
        FROM payments
        WHERE booking_id = NEW.booking_id
        LIMIT 1;
        
        -- Check if payment record exists
        IF v_payment_status IS NULL THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot check out: No payment record found. Please generate the bill first.';
        END IF;
        
        -- Check if payment is complete
        IF v_payment_status != 'paid' OR v_due_amount > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = CONCAT(
                'Cannot check out: Outstanding balance of $', 
                CAST(v_due_amount AS CHAR),
                '. Total bill: $',
                CAST(v_total_charges AS CHAR),
                '. Please complete payment before checkout.'
            );
        END IF;
        
    END IF;
END$$

DELIMITER ;
```

## How It Works

### Trigger Flow

```
1. Checkout attempt (booking status → 'checked_out')
        ↓
2. Trigger intercepts the update
        ↓
3. Check if payment record exists
        ↓
4. Check payment status and due amount
        ↓
5a. Payment complete (status='paid', due=0)
    → Allow checkout
        ↓
5b. Payment incomplete
    → Block checkout with detailed error message
```

### Validation Rules

1. **Payment record must exist**: Bill must be generated before checkout
2. **Payment status must be 'paid'**: No 'pending' or 'partial' status allowed
3. **Due amount must be zero**: Even if status is 'paid', due amount must be 0.00

## Database Schema Reference

### Booking Table
```sql
booking_status ENUM('confirmed','cancelled','checked_in','checked_out')
```

### Payments Table
```sql
payment_status ENUM('pending','paid','partial')
due_amount DECIMAL(10,2)
total_charges DECIMAL(10,2)
amount_paid DECIMAL(10,2)
```

## Usage Examples

### Successful Checkout (Payment Complete)

```sql
-- Setup: Booking with complete payment
INSERT INTO booking (booking_id, room_id, booking_status)
VALUES ('booking-001', 101, 'checked_in');

INSERT INTO payments (payment_id, booking_id, total_charges, amount_paid, due_amount, payment_status)
VALUES (UUID(), 'booking-001', 500.00, 500.00, 0.00, 'paid');

-- Attempt checkout - SUCCESS
UPDATE booking 
SET booking_status = 'checked_out'
WHERE booking_id = 'booking-001';
-- Checkout allowed, room status updated to 'available'
```

### Failed Checkout Scenarios

```sql
-- Scenario 1: No payment record
INSERT INTO booking (booking_id, room_id, booking_status)
VALUES ('booking-002', 102, 'checked_in');

UPDATE booking 
SET booking_status = 'checked_out'
WHERE booking_id = 'booking-002';
-- Error: Cannot check out: No payment record found. Please generate the bill first.

-- Scenario 2: Partial payment
INSERT INTO payments (payment_id, booking_id, total_charges, amount_paid, due_amount, payment_status)
VALUES (UUID(), 'booking-003', 500.00, 300.00, 200.00, 'partial');

UPDATE booking 
SET booking_status = 'checked_out'
WHERE booking_id = 'booking-003';
-- Error: Cannot check out: Outstanding balance of $200.00. Total bill: $500.00. 
--        Please complete payment before checkout.

-- Scenario 3: No payment made
INSERT INTO payments (payment_id, booking_id, total_charges, amount_paid, due_amount, payment_status)
VALUES (UUID(), 'booking-004', 500.00, 0.00, 500.00, 'pending');

UPDATE booking 
SET booking_status = 'checked_out'
WHERE booking_id = 'booking-004';
-- Error: Cannot check out: Outstanding balance of $500.00. Total bill: $500.00. 
--        Please complete payment before checkout.
```

## Application Layer Integration

### Backend Checkout Endpoint with Payment Validation (Node.js/Express)

```javascript
// Pre-checkout validation endpoint
app.get('/api/bookings/:bookingId/checkout-validation', async (req, res) => {
    const { bookingId } = req.params;
    
    try {
        // Get booking and payment details
        const [result] = await db.query(
            `SELECT 
                b.booking_id,
                b.booking_status,
                p.payment_status,
                p.total_charges,
                p.amount_paid,
                p.due_amount
             FROM booking b
             LEFT JOIN payments p ON b.booking_id = p.booking_id
             WHERE b.booking_id = ?`,
            [bookingId]
        );
        
        if (result.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        const booking = result[0];
        
        // Validation checks
        const validations = {
            bookingExists: true,
            isCheckedIn: booking.booking_status === 'checked_in',
            paymentRecordExists: booking.payment_status !== null,
            paymentComplete: booking.payment_status === 'paid' && booking.due_amount === 0,
            canCheckout: false
        };
        
        validations.canCheckout = validations.isCheckedIn 
                                && validations.paymentRecordExists 
                                && validations.paymentComplete;
        
        res.json({
            validations,
            bookingStatus: booking.booking_status,
            paymentDetails: {
                status: booking.payment_status,
                totalCharges: booking.total_charges,
                amountPaid: booking.amount_paid,
                dueAmount: booking.due_amount
            }
        });
        
    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({ error: 'Validation failed' });
    }
});

// Checkout endpoint with integrated validation
app.patch('/api/bookings/:bookingId/checkout', async (req, res) => {
    const { bookingId } = req.params;
    const { staffId } = req.body;
    
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Pre-validate payment (for better error messages)
        const [payment] = await connection.query(
            `SELECT payment_status, due_amount, total_charges 
             FROM payments 
             WHERE booking_id = ?`,
            [bookingId]
        );
        
        if (payment.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                error: 'No payment record found',
                message: 'Please generate the bill first'
            });
        }
        
        if (payment[0].payment_status !== 'paid' || payment[0].due_amount > 0) {
            await connection.rollback();
            return res.status(400).json({
                error: 'Payment incomplete',
                message: `Outstanding balance: $${payment[0].due_amount}`,
                totalCharges: payment[0].total_charges,
                dueAmount: payment[0].due_amount
            });
        }
        
        // Attempt checkout (trigger will validate again at DB level)
        const [result] = await connection.query(
            `UPDATE booking 
             SET booking_status = 'checked_out',
                 checkout_datetime = NOW(),
                 staff_id = ?
             WHERE booking_id = ?
               AND booking_status = 'checked_in'`,
            [staffId, bookingId]
        );
        
        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(400).json({
                error: 'Checkout failed',
                message: 'Booking not found or not in checked-in state'
            });
        }
        
        await connection.commit();
        
        // Fetch updated booking
        const [booking] = await connection.query(
            `SELECT b.*, r.room_no, r.state as room_state
             FROM booking b
             JOIN rooms r ON b.room_id = r.room_id
             WHERE b.booking_id = ?`,
            [bookingId]
        );
        
        res.json({
            message: 'Checkout successful',
            booking: booking[0],
            payment: {
                totalCharges: payment[0].total_charges,
                status: 'paid'
            }
        });
        
    } catch (error) {
        await connection.rollback();
        
        // Handle trigger errors
        if (error.sqlState === '45000') {
            return res.status(400).json({
                error: 'Checkout validation failed',
                message: error.sqlMessage
            });
        }
        
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Checkout failed' });
    } finally {
        connection.release();
    }
});
```

### Frontend Checkout Component with Payment Validation (React)

```javascript
const CheckoutManager = ({ booking }) => {
    const [validation, setValidation] = useState(null);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        validateCheckout();
    }, [booking.booking_id]);
    
    const validateCheckout = async () => {
        try {
            const response = await fetch(
                `/api/bookings/${booking.booking_id}/checkout-validation`
            );
            const data = await response.json();
            setValidation(data);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };
    
    const handleCheckout = async () => {
        if (!validation?.validations.canCheckout) {
            alert('Cannot checkout: Payment not complete');
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
                alert('Checkout successful!');
                onCheckoutComplete(data);
            } else {
                const error = await response.json();
                alert(`Checkout failed: ${error.message}`);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Checkout failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    if (!validation) return <div>Loading...</div>;
    
    const { validations, paymentDetails } = validation;
    
    return (
        <div className="checkout-container">
            <h3>Checkout Status</h3>
            
            {/* Validation Status */}
            <div className="validation-checks">
                <div className={validations.isCheckedIn ? 'check-pass' : 'check-fail'}>
                    {validations.isCheckedIn ? '✓' : '✗'} Guest is checked in
                </div>
                <div className={validations.paymentRecordExists ? 'check-pass' : 'check-fail'}>
                    {validations.paymentRecordExists ? '✓' : '✗'} Bill generated
                </div>
                <div className={validations.paymentComplete ? 'check-pass' : 'check-fail'}>
                    {validations.paymentComplete ? '✓' : '✗'} Payment complete
                </div>
            </div>
            
            {/* Payment Details */}
            <div className="payment-summary">
                <h4>Payment Details</h4>
                <div className="payment-item">
                    <span>Total Bill:</span>
                    <span>${paymentDetails.totalCharges?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="payment-item">
                    <span>Amount Paid:</span>
                    <span>${paymentDetails.amountPaid?.toFixed(2) || '0.00'}</span>
                </div>
                <div className={`payment-item ${paymentDetails.dueAmount > 0 ? 'due' : 'paid'}`}>
                    <strong>Due Amount:</strong>
                    <strong>${paymentDetails.dueAmount?.toFixed(2) || '0.00'}</strong>
                </div>
            </div>
            
            {/* Checkout Button */}
            <button
                onClick={handleCheckout}
                disabled={!validations.canCheckout || loading}
                className={validations.canCheckout ? 'btn-primary' : 'btn-disabled'}
            >
                {loading ? 'Processing...' : 'Complete Checkout'}
            </button>
            
            {/* Warning Messages */}
            {!validations.paymentRecordExists && (
                <div className="warning">
                    Please generate the bill before checkout.
                </div>
            )}
            {validations.paymentRecordExists && !validations.paymentComplete && (
                <div className="error">
                    Outstanding balance: ${paymentDetails.dueAmount?.toFixed(2)}
                    <br />
                    Payment must be completed before checkout.
                </div>
            )}
        </div>
    );
};
```

## Migration Files

### Up Migration
```sql
-- File: backend/migrations/sqls/[timestamp]-payment-validation-checkout-trigger-up.sql

-- Create trigger to validate payment before checkout
DELIMITER $$

CREATE TRIGGER validate_payment_before_checkout
BEFORE UPDATE ON booking
FOR EACH ROW
BEGIN
    DECLARE v_payment_status ENUM('pending','paid','partial');
    DECLARE v_due_amount DECIMAL(10,2);
    DECLARE v_total_charges DECIMAL(10,2);
    
    IF NEW.booking_status = 'checked_out' AND OLD.booking_status != 'checked_out' THEN
        
        SELECT payment_status, due_amount, total_charges
        INTO v_payment_status, v_due_amount, v_total_charges
        FROM payments
        WHERE booking_id = NEW.booking_id
        LIMIT 1;
        
        IF v_payment_status IS NULL THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot check out: No payment record found. Please generate the bill first.';
        END IF;
        
        IF v_payment_status != 'paid' OR v_due_amount > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = CONCAT(
                'Cannot check out: Outstanding balance of $', 
                CAST(v_due_amount AS CHAR),
                '. Total bill: $',
                CAST(v_total_charges AS CHAR),
                '. Please complete payment before checkout.'
            );
        END IF;
        
    END IF;
END$$

DELIMITER ;
```

### Down Migration
```sql
-- File: backend/migrations/sqls/[timestamp]-payment-validation-checkout-trigger-down.sql

DROP TRIGGER IF EXISTS validate_payment_before_checkout;
```

## Testing

### Test Scenarios

```sql
-- Setup test data
INSERT INTO rooms (room_id, room_no, state) VALUES (101, '101A', 'occupied');
INSERT INTO booking (booking_id, room_id, booking_status)
VALUES ('test-001', 101, 'checked_in');

-- Test 1: Checkout without payment record (should fail)
UPDATE booking SET booking_status = 'checked_out' WHERE booking_id = 'test-001';
-- Expected Error: No payment record found

-- Test 2: Checkout with pending payment (should fail)
INSERT INTO payments (payment_id, booking_id, total_charges, amount_paid, due_amount, payment_status)
VALUES (UUID(), 'test-001', 500.00, 0.00, 500.00, 'pending');

UPDATE booking SET booking_status = 'checked_out' WHERE booking_id = 'test-001';
-- Expected Error: Outstanding balance of $500.00

-- Test 3: Checkout with partial payment (should fail)
UPDATE payments 
SET amount_paid = 300.00, due_amount = 200.00, payment_status = 'partial'
WHERE booking_id = 'test-001';

UPDATE booking SET booking_status = 'checked_out' WHERE booking_id = 'test-001';
-- Expected Error: Outstanding balance of $200.00

-- Test 4: Checkout with complete payment (should succeed)
UPDATE payments 
SET amount_paid = 500.00, due_amount = 0.00, payment_status = 'paid'
WHERE booking_id = 'test-001';

UPDATE booking SET booking_status = 'checked_out' WHERE booking_id = 'test-001';
-- Expected: Success, room status becomes 'available'

SELECT booking_status FROM booking WHERE booking_id = 'test-001';
-- Expected: 'checked_out'

SELECT state FROM rooms WHERE room_id = 101;
-- Expected: 'available'
```

### Edge Cases

```sql
-- Edge Case 1: Status change from checked_out back to checked_in
UPDATE booking SET booking_status = 'checked_in' WHERE booking_id = 'test-001';
-- Trigger doesn't fire (not changing TO 'checked_out')

-- Edge Case 2: Update other fields while checked_out
UPDATE booking SET staff_id = 'staff-999' WHERE booking_id = 'test-001';
-- Trigger doesn't fire (OLD and NEW status both 'checked_out')

-- Edge Case 3: Direct payment record deletion
DELETE FROM payments WHERE booking_id = 'test-001';
UPDATE booking SET booking_status = 'checked_out' WHERE booking_id = 'test-001';
-- Expected Error: No payment record found
```

## Benefits

1. **Data Integrity**: Prevents checkout without payment at database level
2. **Business Rule Enforcement**: Ensures no guest leaves without paying
3. **Clear Error Messages**: Provides detailed feedback on why checkout failed
4. **Automatic Validation**: No need to remember to check payment in application code
5. **Transaction Safety**: Checkout and payment validation are atomic

## Considerations

### Performance
- Trigger adds one SELECT query to checkout updates
- Minimal performance impact (single indexed lookup)
- Consider indexing `booking_id` in payments table

### Error Handling
```javascript
// Application layer should handle trigger errors gracefully
try {
    await db.query('UPDATE booking SET booking_status = ? ...', ['checked_out']);
} catch (error) {
    if (error.sqlState === '45000') {
        // Trigger validation error
        return { error: error.sqlMessage };
    }
    // Other error
    throw error;
}
```

### Trigger Order
If multiple triggers exist on the booking table:
1. `BEFORE UPDATE` triggers fire before data changes
2. Multiple `BEFORE UPDATE` triggers fire in alphabetical order
3. `AFTER UPDATE` triggers fire after data changes

Order in this system:
1. `validate_payment_before_checkout` (BEFORE UPDATE)
2. Update executes
3. `update_room_status_on_checkout` (AFTER UPDATE)

### Partial Payments
- See `PARTIAL_PAYMENT_HANDLING.md` for detailed partial payment workflow
- Trigger ensures final payment completion before checkout

## Related Documentation

- See `ROOM_STATUS_UPDATE_CHECKOUT.md` for room status updates on checkout
- See `BILL_CALCULATION_CHECKOUT.md` for bill calculation logic
- See `PARTIAL_PAYMENT_HANDLING.md` for handling partial payments
- See `PREVENT_DOUBLE_BOOKING.md` for booking validation

## Monitoring and Maintenance

### Verify Trigger is Active
```sql
SHOW TRIGGERS WHERE `Table` = 'booking' AND `Trigger` = 'validate_payment_before_checkout';
```

### Check for Checkout Attempts
```sql
-- Query audit log for failed checkout attempts
SELECT * FROM audit_log
WHERE table_name = 'booking'
  AND action = 'UPDATE_FAILED'
  AND field_name = 'booking_status'
  AND new_value = 'checked_out'
ORDER BY changed_at DESC;
```

### Payment Status Monitoring
```sql
-- Find bookings checked in but no payment record
SELECT b.booking_id, b.booking_status, p.payment_id
FROM booking b
LEFT JOIN payments p ON b.booking_id = p.booking_id
WHERE b.booking_status = 'checked_in'
  AND p.payment_id IS NULL;

-- Find bookings with outstanding balances
SELECT 
    b.booking_id,
    b.booking_status,
    p.payment_status,
    p.due_amount
FROM booking b
JOIN payments p ON b.booking_id = p.booking_id
WHERE b.booking_status = 'checked_in'
  AND (p.payment_status != 'paid' OR p.due_amount > 0)
ORDER BY p.due_amount DESC;
```
