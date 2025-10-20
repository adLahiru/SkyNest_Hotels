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
