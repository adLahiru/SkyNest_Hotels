# Bill Calculation at Checkout - Implementation Guide

## Overview
This document describes the implementation of accurate bill calculation at checkout, including room charges based on duration of stay and the sum of all service charges.

## Problem Statement
Calculate the final bill correctly by:
1. Computing room charges based on daily rate and number of nights
2. Summing all service charges from service usage
3. Applying tax policies
4. Applying discounts (if any)
5. Calculating the final total

## Solution: Stored Procedure and Functions

### Database Schema Reference

**Relevant Tables:**
- `booking` - Check-in/checkout dates
- `room_types` - Daily rate for room
- `service_usage` - Services consumed during stay
- `tax_policies` - Tax rates
- `discount` - Discount information
- `payments` - Final bill storage

## SQL Implementation

### 1. Function to Calculate Room Charges

```sql
-- Function to calculate room charges based on duration
DELIMITER $$

CREATE FUNCTION calculate_room_charges(
    p_booking_id CHAR(36)
) 
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_room_charges DECIMAL(10,2);
    DECLARE v_daily_rate DECIMAL(10,2);
    DECLARE v_nights INT;
    DECLARE v_checkin DATETIME;
    DECLARE v_checkout DATETIME;
    
    -- Get booking details
    SELECT 
        b.checking_datetime,
        b.checkout_datetime,
        rt.daily_rate
    INTO 
        v_checkin,
        v_checkout,
        v_daily_rate
    FROM booking b
    JOIN rooms r ON b.room_id = r.room_id
    JOIN room_types rt ON r.room_type_id = rt.room_type_id
    WHERE b.booking_id = p_booking_id;
    
    -- Calculate number of nights
    -- DATEDIFF returns days, CEIL ensures partial days count as full days
    SET v_nights = GREATEST(1, DATEDIFF(v_checkout, v_checkin));
    
    -- Calculate total room charges
    SET v_room_charges = v_daily_rate * v_nights;
    
    RETURN v_room_charges;
END$$

DELIMITER ;
```

### 2. Function to Calculate Total Service Charges

```sql
-- Function to calculate total service charges
DELIMITER $$

CREATE FUNCTION calculate_service_charges(
    p_booking_id CHAR(36)
)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_service_total DECIMAL(10,2);
    
    -- Sum all service charges for this booking
    SELECT COALESCE(SUM(total), 0.00)
    INTO v_service_total
    FROM service_usage
    WHERE booking_id = p_booking_id;
    
    RETURN v_service_total;
END$$

DELIMITER ;
```

### 3. Comprehensive Bill Calculation Stored Procedure

```sql
-- Stored procedure to calculate complete bill
DELIMITER $$

CREATE PROCEDURE calculate_booking_bill(
    IN p_booking_id CHAR(36),
    IN p_tax_id CHAR(36),
    IN p_discount_id CHAR(36),
    OUT p_subtotal DECIMAL(10,2),
    OUT p_tax_amount DECIMAL(10,2),
    OUT p_discount_amount DECIMAL(10,2),
    OUT p_total_charges DECIMAL(10,2)
)
BEGIN
    DECLARE v_room_charges DECIMAL(10,2);
    DECLARE v_service_charges DECIMAL(10,2);
    DECLARE v_tax_rate DECIMAL(5,2);
    DECLARE v_discount_type ENUM('percentage', 'fixed');
    DECLARE v_discount_value DECIMAL(10,2);
    
    -- Calculate room charges
    SET v_room_charges = calculate_room_charges(p_booking_id);
    
    -- Calculate service charges
    SET v_service_charges = calculate_service_charges(p_booking_id);
    
    -- Calculate subtotal
    SET p_subtotal = v_room_charges + v_service_charges;
    
    -- Apply tax if tax_id provided
    IF p_tax_id IS NOT NULL THEN
        SELECT tax_rate INTO v_tax_rate
        FROM tax_policies
        WHERE tax_id = p_tax_id
        LIMIT 1;
        
        SET p_tax_amount = (p_subtotal * v_tax_rate / 100);
    ELSE
        SET p_tax_amount = 0.00;
    END IF;
    
    -- Apply discount if discount_id provided
    IF p_discount_id IS NOT NULL THEN
        SELECT discount_type, discount_value
        INTO v_discount_type, v_discount_value
        FROM discount
        WHERE discount_id = p_discount_id
        LIMIT 1;
        
        IF v_discount_type = 'percentage' THEN
            SET p_discount_amount = (p_subtotal * v_discount_value / 100);
        ELSE
            SET p_discount_amount = v_discount_value;
        END IF;
    ELSE
        SET p_discount_amount = 0.00;
    END IF;
    
    -- Calculate final total
    SET p_total_charges = p_subtotal + p_tax_amount - p_discount_amount;
    
    -- Ensure total is not negative
    IF p_total_charges < 0 THEN
        SET p_total_charges = 0.00;
    END IF;
END$$

DELIMITER ;
```

### 4. Function to Get Complete Bill Details

```sql
-- Function to get detailed bill breakdown
DELIMITER $$

CREATE FUNCTION get_bill_breakdown(
    p_booking_id CHAR(36)
)
RETURNS JSON
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_result JSON;
    DECLARE v_room_charges DECIMAL(10,2);
    DECLARE v_service_charges DECIMAL(10,2);
    DECLARE v_room_no VARCHAR(20);
    DECLARE v_room_type VARCHAR(100);
    DECLARE v_daily_rate DECIMAL(10,2);
    DECLARE v_nights INT;
    DECLARE v_checkin DATETIME;
    DECLARE v_checkout DATETIME;
    
    -- Get booking and room details
    SELECT 
        r.room_no,
        rt.type,
        rt.daily_rate,
        b.checking_datetime,
        b.checkout_datetime,
        GREATEST(1, DATEDIFF(b.checkout_datetime, b.checking_datetime))
    INTO 
        v_room_no,
        v_room_type,
        v_daily_rate,
        v_checkin,
        v_checkout,
        v_nights
    FROM booking b
    JOIN rooms r ON b.room_id = r.room_id
    JOIN room_types rt ON r.room_type_id = rt.room_type_id
    WHERE b.booking_id = p_booking_id;
    
    -- Calculate charges
    SET v_room_charges = v_daily_rate * v_nights;
    SET v_service_charges = calculate_service_charges(p_booking_id);
    
    -- Build JSON result
    SET v_result = JSON_OBJECT(
        'bookingId', p_booking_id,
        'roomNo', v_room_no,
        'roomType', v_room_type,
        'dailyRate', v_daily_rate,
        'nights', v_nights,
        'checkIn', v_checkin,
        'checkOut', v_checkout,
        'roomCharges', v_room_charges,
        'serviceCharges', v_service_charges,
        'subtotal', v_room_charges + v_service_charges
    );
    
    RETURN v_result;
END$$

DELIMITER ;
```

## Application Layer Implementation

### Backend Bill Calculation Endpoint (Node.js/Express)

```javascript
// Calculate bill endpoint
app.get('/api/bookings/:bookingId/bill', async (req, res) => {
    const { bookingId } = req.params;
    const { taxId = null, discountId = null } = req.query;
    
    try {
        // Call stored procedure to calculate bill
        const [results] = await db.query(
            `CALL calculate_booking_bill(?, ?, ?, @subtotal, @tax_amount, @discount_amount, @total_charges)`,
            [bookingId, taxId, discountId]
        );
        
        // Get output parameters
        const [billTotals] = await db.query(
            `SELECT @subtotal as subtotal, 
                    @tax_amount as tax_amount, 
                    @discount_amount as discount_amount, 
                    @total_charges as total_charges`
        );
        
        // Get detailed breakdown
        const [roomDetails] = await db.query(
            `SELECT 
                b.booking_id,
                r.room_no,
                rt.type as room_type,
                rt.daily_rate,
                b.checking_datetime as check_in,
                b.checkout_datetime as check_out,
                DATEDIFF(b.checkout_datetime, b.checking_datetime) as nights
             FROM booking b
             JOIN rooms r ON b.room_id = r.room_id
             JOIN room_types rt ON r.room_type_id = rt.room_type_id
             WHERE b.booking_id = ?`,
            [bookingId]
        );
        
        // Get service usage details
        const [services] = await db.query(
            `SELECT 
                su.usage_id,
                sc.service_name,
                su.quantity,
                sc.unit_price,
                su.total,
                su.usage_date
             FROM service_usage su
             JOIN service_catalogue sc ON su.service_id = sc.service_id
             WHERE su.booking_id = ?
             ORDER BY su.usage_date`,
            [bookingId]
        );
        
        const roomCharges = roomDetails[0].daily_rate * roomDetails[0].nights;
        const serviceCharges = services.reduce((sum, s) => sum + parseFloat(s.total), 0);
        
        res.json({
            bookingId,
            roomDetails: roomDetails[0],
            roomCharges,
            services,
            serviceCharges,
            subtotal: parseFloat(billTotals[0].subtotal),
            taxAmount: parseFloat(billTotals[0].tax_amount),
            discountAmount: parseFloat(billTotals[0].discount_amount),
            totalCharges: parseFloat(billTotals[0].total_charges)
        });
        
    } catch (error) {
        console.error('Bill calculation error:', error);
        res.status(500).json({ error: 'Failed to calculate bill' });
    }
});

// Generate and save bill on checkout initiation
app.post('/api/bookings/:bookingId/generate-bill', async (req, res) => {
    const { bookingId } = req.params;
    const { taxId, discountId, staffId } = req.body;
    
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Calculate bill
        await connection.query(
            `CALL calculate_booking_bill(?, ?, ?, @subtotal, @tax_amount, @discount_amount, @total_charges)`,
            [bookingId, taxId, discountId]
        );
        
        const [billTotals] = await connection.query(
            `SELECT @subtotal as subtotal, 
                    @tax_amount as tax_amount, 
                    @discount_amount as discount_amount, 
                    @total_charges as total_charges`
        );
        
        const totalCharges = parseFloat(billTotals[0].total_charges);
        
        // Create or update payment record
        const [existingPayment] = await connection.query(
            `SELECT payment_id FROM payments WHERE booking_id = ?`,
            [bookingId]
        );
        
        if (existingPayment.length > 0) {
            // Update existing payment
            await connection.query(
                `UPDATE payments 
                 SET total_charges = ?,
                     tax_id = ?,
                     discount_id = ?,
                     due_amount = total_charges - COALESCE(amount_paid, 0),
                     payment_status = CASE 
                         WHEN amount_paid >= ? THEN 'paid'
                         WHEN amount_paid > 0 THEN 'partial'
                         ELSE 'pending'
                     END
                 WHERE payment_id = ?`,
                [totalCharges, taxId, discountId, totalCharges, existingPayment[0].payment_id]
            );
        } else {
            // Create new payment record
            await connection.query(
                `INSERT INTO payments (
                    payment_id, booking_id, tax_id, discount_id,
                    payment_date, total_charges, amount_paid, due_amount,
                    payment_status, staff_id
                )
                VALUES (UUID(), ?, ?, ?, CURDATE(), ?, 0.00, ?, 'pending', ?)`,
                [bookingId, taxId, discountId, totalCharges, totalCharges, staffId]
            );
        }
        
        await connection.commit();
        
        res.json({
            message: 'Bill generated successfully',
            totalCharges,
            subtotal: parseFloat(billTotals[0].subtotal),
            taxAmount: parseFloat(billTotals[0].tax_amount),
            discountAmount: parseFloat(billTotals[0].discount_amount)
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Bill generation error:', error);
        res.status(500).json({ error: 'Failed to generate bill' });
    } finally {
        connection.release();
    }
});
```

### Frontend Bill Display Component (React)

```javascript
const BillDetails = ({ bookingId }) => {
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchBill();
    }, [bookingId]);
    
    const fetchBill = async () => {
        try {
            const response = await fetch(`/api/bookings/${bookingId}/bill`);
            const data = await response.json();
            setBill(data);
        } catch (error) {
            console.error('Failed to fetch bill:', error);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <div>Loading bill...</div>;
    if (!bill) return <div>Unable to load bill</div>;
    
    return (
        <div className="bill-container">
            <h2>Booking Bill</h2>
            
            {/* Room Charges Section */}
            <div className="bill-section">
                <h3>Room Charges</h3>
                <div className="bill-item">
                    <span>Room: {bill.roomDetails.room_no} ({bill.roomDetails.room_type})</span>
                </div>
                <div className="bill-item">
                    <span>Check-in: {new Date(bill.roomDetails.check_in).toLocaleString()}</span>
                </div>
                <div className="bill-item">
                    <span>Check-out: {new Date(bill.roomDetails.check_out).toLocaleString()}</span>
                </div>
                <div className="bill-item">
                    <span>Nights: {bill.roomDetails.nights}</span>
                </div>
                <div className="bill-item">
                    <span>Daily Rate: ${bill.roomDetails.daily_rate}</span>
                    <span className="amount">${bill.roomCharges.toFixed(2)}</span>
                </div>
            </div>
            
            {/* Service Charges Section */}
            <div className="bill-section">
                <h3>Service Charges</h3>
                {bill.services.length > 0 ? (
                    bill.services.map(service => (
                        <div key={service.usage_id} className="bill-item">
                            <span>
                                {service.service_name} 
                                (Qty: {service.quantity} × ${service.unit_price})
                                <br />
                                <small>{new Date(service.usage_date).toLocaleDateString()}</small>
                            </span>
                            <span className="amount">${service.total.toFixed(2)}</span>
                        </div>
                    ))
                ) : (
                    <div className="bill-item">
                        <span>No services used</span>
                        <span className="amount">$0.00</span>
                    </div>
                )}
                <div className="bill-item subtotal">
                    <span>Total Service Charges:</span>
                    <span className="amount">${bill.serviceCharges.toFixed(2)}</span>
                </div>
            </div>
            
            {/* Bill Summary */}
            <div className="bill-section bill-summary">
                <div className="bill-item">
                    <span>Subtotal:</span>
                    <span className="amount">${bill.subtotal.toFixed(2)}</span>
                </div>
                {bill.taxAmount > 0 && (
                    <div className="bill-item">
                        <span>Tax:</span>
                        <span className="amount">${bill.taxAmount.toFixed(2)}</span>
                    </div>
                )}
                {bill.discountAmount > 0 && (
                    <div className="bill-item discount">
                        <span>Discount:</span>
                        <span className="amount">-${bill.discountAmount.toFixed(2)}</span>
                    </div>
                )}
                <div className="bill-item total">
                    <strong>Total Charges:</strong>
                    <strong className="amount">${bill.totalCharges.toFixed(2)}</strong>
                </div>
            </div>
        </div>
    );
};
```

## Migration Files

### Up Migration
```sql
-- File: backend/migrations/sqls/[timestamp]-bill-calculation-functions-up.sql

-- Function to calculate room charges
DELIMITER $$

CREATE FUNCTION calculate_room_charges(
    p_booking_id CHAR(36)
) 
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_room_charges DECIMAL(10,2);
    DECLARE v_daily_rate DECIMAL(10,2);
    DECLARE v_nights INT;
    
    SELECT 
        rt.daily_rate,
        GREATEST(1, DATEDIFF(b.checkout_datetime, b.checking_datetime))
    INTO 
        v_daily_rate,
        v_nights
    FROM booking b
    JOIN rooms r ON b.room_id = r.room_id
    JOIN room_types rt ON r.room_type_id = rt.room_type_id
    WHERE b.booking_id = p_booking_id;
    
    SET v_room_charges = v_daily_rate * v_nights;
    
    RETURN v_room_charges;
END$$

-- Function to calculate service charges
CREATE FUNCTION calculate_service_charges(
    p_booking_id CHAR(36)
)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_service_total DECIMAL(10,2);
    
    SELECT COALESCE(SUM(total), 0.00)
    INTO v_service_total
    FROM service_usage
    WHERE booking_id = p_booking_id;
    
    RETURN v_service_total;
END$$

-- Stored procedure for complete bill calculation
CREATE PROCEDURE calculate_booking_bill(
    IN p_booking_id CHAR(36),
    IN p_tax_id CHAR(36),
    IN p_discount_id CHAR(36),
    OUT p_subtotal DECIMAL(10,2),
    OUT p_tax_amount DECIMAL(10,2),
    OUT p_discount_amount DECIMAL(10,2),
    OUT p_total_charges DECIMAL(10,2)
)
BEGIN
    DECLARE v_room_charges DECIMAL(10,2);
    DECLARE v_service_charges DECIMAL(10,2);
    DECLARE v_tax_rate DECIMAL(5,2);
    DECLARE v_discount_type ENUM('percentage', 'fixed');
    DECLARE v_discount_value DECIMAL(10,2);
    
    SET v_room_charges = calculate_room_charges(p_booking_id);
    SET v_service_charges = calculate_service_charges(p_booking_id);
    SET p_subtotal = v_room_charges + v_service_charges;
    
    IF p_tax_id IS NOT NULL THEN
        SELECT tax_rate INTO v_tax_rate
        FROM tax_policies
        WHERE tax_id = p_tax_id
        LIMIT 1;
        SET p_tax_amount = (p_subtotal * v_tax_rate / 100);
    ELSE
        SET p_tax_amount = 0.00;
    END IF;
    
    IF p_discount_id IS NOT NULL THEN
        SELECT discount_type, discount_value
        INTO v_discount_type, v_discount_value
        FROM discount
        WHERE discount_id = p_discount_id
        LIMIT 1;
        
        IF v_discount_type = 'percentage' THEN
            SET p_discount_amount = (p_subtotal * v_discount_value / 100);
        ELSE
            SET p_discount_amount = v_discount_value;
        END IF;
    ELSE
        SET p_discount_amount = 0.00;
    END IF;
    
    SET p_total_charges = p_subtotal + p_tax_amount - p_discount_amount;
    
    IF p_total_charges < 0 THEN
        SET p_total_charges = 0.00;
    END IF;
END$$

DELIMITER ;
```

### Down Migration
```sql
-- File: backend/migrations/sqls/[timestamp]-bill-calculation-functions-down.sql

DROP PROCEDURE IF EXISTS calculate_booking_bill;
DROP FUNCTION IF EXISTS calculate_service_charges;
DROP FUNCTION IF EXISTS calculate_room_charges;
```

## Testing

### Test Cases

```sql
-- Test 1: Calculate room charges only
INSERT INTO booking (booking_id, room_id, checking_datetime, checkout_datetime)
VALUES ('test-001', 101, '2025-02-01 14:00:00', '2025-02-05 11:00:00');

SELECT calculate_room_charges('test-001') as room_charges;
-- Expected: daily_rate * 4 nights

-- Test 2: Calculate service charges
INSERT INTO service_usage (usage_id, booking_id, service_id, quantity, total)
VALUES 
    (UUID(), 'test-001', 'service-1', 2, 50.00),
    (UUID(), 'test-001', 'service-2', 1, 25.00);

SELECT calculate_service_charges('test-001') as service_charges;
-- Expected: 75.00

-- Test 3: Complete bill calculation with tax
CALL calculate_booking_bill('test-001', 'tax-10-percent', NULL, @sub, @tax, @disc, @total);
SELECT @sub as subtotal, @tax as tax, @disc as discount, @total as total;
-- Expected: subtotal = room + services, tax = 10%, total = subtotal + tax

-- Test 4: Bill with discount
CALL calculate_booking_bill('test-001', 'tax-10-percent', 'discount-20-percent', @sub, @tax, @disc, @total);
SELECT @sub as subtotal, @tax as tax, @disc as discount, @total as total;
-- Expected: discount applied before final total
```

## Benefits

1. **Accuracy**: Automated calculation reduces manual errors
2. **Transparency**: Detailed breakdown of all charges
3. **Flexibility**: Supports various tax and discount schemes
4. **Consistency**: Same calculation logic used everywhere
5. **Auditability**: All calculations can be verified

## Related Documentation

- See `ROOM_STATUS_UPDATE_CHECKOUT.md` for check-out room status
- See `PAYMENT_VALIDATION_CHECKOUT.md` for payment validation
- See `PARTIAL_PAYMENT_HANDLING.md` for partial payment handling
