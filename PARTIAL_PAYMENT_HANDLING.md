# Partial Payment Handling - Implementation Guide

## Overview
System to handle partial payments and flag bookings with outstanding balances.

## Problem Statement
Handle partial payments, track balances, prevent checkout until fully paid.

## Database Design

**Payments Table:**
- `total_charges`: Total bill
- `amount_paid`: Payments received
- `due_amount`: Outstanding balance
- `payment_status`: ENUM('pending', 'partial', 'paid')

**Payment Transactions Table:**
```sql
CREATE TABLE `payment_transactions` (
  `transaction_id` CHAR(36) NOT NULL DEFAULT (uuid()),
  `payment_id` CHAR(36) DEFAULT NULL,
  `booking_id` CHAR(36) DEFAULT NULL,
  `transaction_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `amount` DECIMAL(10,2) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `transaction_reference` VARCHAR(100),
  `notes` TEXT,
  `processed_by_staff_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  CONSTRAINT `payment_trans_fk_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`),
  CONSTRAINT `payment_trans_fk_booking` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`),
  CONSTRAINT `payment_trans_fk_staff` FOREIGN KEY (`processed_by_staff_id`) REFERENCES `staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## SQL Implementation

### 1. Triggers for Automatic Status Update

```sql
DELIMITER $$

CREATE TRIGGER update_payment_status_insert
BEFORE INSERT ON payments
FOR EACH ROW
BEGIN
    SET NEW.due_amount = NEW.total_charges - COALESCE(NEW.amount_paid, 0);
    
    IF NEW.due_amount < 0 THEN
        SET NEW.due_amount = 0;
        SET NEW.amount_paid = NEW.total_charges;
    END IF;
    
    IF NEW.amount_paid = 0 OR NEW.amount_paid IS NULL THEN
        SET NEW.payment_status = 'pending';
    ELSEIF NEW.amount_paid >= NEW.total_charges THEN
        SET NEW.payment_status = 'paid';
        SET NEW.due_amount = 0;
    ELSE
        SET NEW.payment_status = 'partial';
    END IF;
END$$

CREATE TRIGGER update_payment_status
BEFORE UPDATE ON payments
FOR EACH ROW
BEGIN
    SET NEW.due_amount = NEW.total_charges - NEW.amount_paid;
    
    IF NEW.due_amount < 0 THEN
        SET NEW.due_amount = 0;
        SET NEW.amount_paid = NEW.total_charges;
    END IF;
    
    IF NEW.amount_paid = 0 THEN
        SET NEW.payment_status = 'pending';
    ELSEIF NEW.amount_paid >= NEW.total_charges THEN
        SET NEW.payment_status = 'paid';
        SET NEW.due_amount = 0;
    ELSE
        SET NEW.payment_status = 'partial';
    END IF;
END$$

CREATE TRIGGER update_payment_after_transaction
AFTER INSERT ON payment_transactions
FOR EACH ROW
BEGIN
    DECLARE v_total_paid DECIMAL(10,2);
    
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_paid
    FROM payment_transactions
    WHERE payment_id = NEW.payment_id;
    
    UPDATE payments
    SET amount_paid = v_total_paid,
        payment_date = CURDATE()
    WHERE payment_id = NEW.payment_id;
END$$

DELIMITER ;
```

### 2. Stored Procedure for Processing Payments

```sql
DELIMITER $$

CREATE PROCEDURE process_partial_payment(
    IN p_booking_id CHAR(36),
    IN p_amount DECIMAL(10,2),
    IN p_payment_method VARCHAR(50),
    IN p_transaction_reference VARCHAR(100),
    IN p_staff_id CHAR(36),
    IN p_notes TEXT,
    OUT p_remaining_balance DECIMAL(10,2),
    OUT p_payment_status VARCHAR(20),
    OUT p_transaction_id CHAR(36)
)
BEGIN
    DECLARE v_payment_id CHAR(36);
    DECLARE v_total_charges DECIMAL(10,2);
    DECLARE v_current_paid DECIMAL(10,2);
    
    IF p_amount <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Payment amount must be greater than zero';
    END IF;
    
    SELECT payment_id, total_charges, amount_paid
    INTO v_payment_id, v_total_charges, v_current_paid
    FROM payments WHERE booking_id = p_booking_id LIMIT 1;
    
    IF v_payment_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No payment record found. Generate bill first.';
    END IF;
    
    IF v_current_paid + p_amount > v_total_charges THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Payment exceeds remaining balance';
    END IF;
    
    SET p_transaction_id = UUID();
    INSERT INTO payment_transactions (
        transaction_id, payment_id, booking_id, transaction_date,
        amount, payment_method, transaction_reference, notes, processed_by_staff_id
    ) VALUES (
        p_transaction_id, v_payment_id, p_booking_id, NOW(),
        p_amount, p_payment_method, p_transaction_reference, p_notes, p_staff_id
    );
    
    SELECT due_amount, payment_status
    INTO p_remaining_balance, p_payment_status
    FROM payments WHERE payment_id = v_payment_id;
END$$

DELIMITER ;
```

## Backend Implementation (Node.js)

```javascript
// Process partial payment
app.post('/api/bookings/:bookingId/payments', async (req, res) => {
    const { bookingId } = req.params;
    const { amount, paymentMethod, transactionReference, notes } = req.body;
    const staffId = req.user.staff_id;
    
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        await connection.query(
            `CALL process_partial_payment(?, ?, ?, ?, ?, ?, @remaining, @status, @trans_id)`,
            [bookingId, amount, paymentMethod, transactionReference, staffId, notes]
        );
        
        const [result] = await connection.query(
            `SELECT @remaining as remaining_balance, 
                    @status as payment_status, 
                    @trans_id as transaction_id`
        );
        
        await connection.commit();
        
        res.json({
            success: true,
            transactionId: result[0].transaction_id,
            remainingBalance: parseFloat(result[0].remaining_balance),
            paymentStatus: result[0].payment_status
        });
    } catch (error) {
        await connection.rollback();
        if (error.sqlState === '45000') {
            return res.status(400).json({ error: error.sqlMessage });
        }
        res.status(500).json({ error: 'Payment processing failed' });
    } finally {
        connection.release();
    }
});

// Get outstanding balances
app.get('/api/bookings/outstanding-balances', async (req, res) => {
    try {
        const [bookings] = await db.query(`
            SELECT 
                b.booking_id, b.booking_status,
                u.fname, u.lname, r.room_no,
                p.total_charges, p.amount_paid, p.due_amount, p.payment_status
            FROM booking b
            JOIN users u ON b.user_id = u.user_id
            JOIN rooms r ON b.room_id = r.room_id
            JOIN payments p ON b.booking_id = p.booking_id
            WHERE p.payment_status IN ('pending', 'partial')
              AND b.booking_status IN ('confirmed', 'checked_in')
            ORDER BY p.due_amount DESC
        `);
        
        res.json({ bookings, count: bookings.length });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch outstanding balances' });
    }
});
```

## Migration Files

### Up Migration
```sql
-- File: backend/migrations/sqls/[timestamp]-partial-payment-handling-up.sql

CREATE TABLE `payment_transactions` (
  `transaction_id` CHAR(36) NOT NULL DEFAULT (uuid()),
  `payment_id` CHAR(36) DEFAULT NULL,
  `booking_id` CHAR(36) DEFAULT NULL,
  `transaction_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `amount` DECIMAL(10,2) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `transaction_reference` VARCHAR(100),
  `notes` TEXT,
  `processed_by_staff_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  CONSTRAINT `payment_trans_fk_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`),
  CONSTRAINT `payment_trans_fk_booking` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`),
  CONSTRAINT `payment_trans_fk_staff` FOREIGN KEY (`processed_by_staff_id`) REFERENCES `staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- [Include all triggers and procedures from above]
```

### Down Migration
```sql
-- File: backend/migrations/sqls/[timestamp]-partial-payment-handling-down.sql

DROP TRIGGER IF EXISTS update_payment_after_transaction;
DROP TRIGGER IF EXISTS update_payment_status;
DROP TRIGGER IF EXISTS update_payment_status_insert;
DROP PROCEDURE IF EXISTS process_partial_payment;
DROP TABLE IF EXISTS payment_transactions;
```

## Testing

```sql
-- Test partial payment
INSERT INTO booking (booking_id, room_id, booking_status)
VALUES ('test-001', 101, 'checked_in');

INSERT INTO payments (payment_id, booking_id, total_charges, amount_paid, due_amount, payment_status)
VALUES (UUID(), 'test-001', 500.00, 0.00, 500.00, 'pending');

-- Make first partial payment
CALL process_partial_payment('test-001', 200.00, 'cash', NULL, 'staff-001', NULL, @bal, @stat, @txn);
SELECT @bal as balance, @stat as status;
-- Expected: balance=300.00, status='partial'

-- Make second payment
CALL process_partial_payment('test-001', 300.00, 'credit_card', 'XXXX-1234', 'staff-001', NULL, @bal, @stat, @txn);
SELECT @bal as balance, @stat as status;
-- Expected: balance=0.00, status='paid'
```

## Benefits

1. **Flexible Payments**: Accept multiple payment methods and amounts
2. **Automatic Tracking**: Status updates automatically
3. **Payment History**: Complete audit trail of all transactions
4. **Outstanding Balance Reporting**: Easy identification of unpaid bills
5. **Validation**: Prevents overpayment and invalid amounts

## Related Documentation

- See `PAYMENT_VALIDATION_CHECKOUT.md` for checkout validation
- See `BILL_CALCULATION_CHECKOUT.md` for bill calculation
- See `ROOM_STATUS_UPDATE_CHECKOUT.md` for checkout process
