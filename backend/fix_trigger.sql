-- Drop the problematic trigger
DROP TRIGGER IF EXISTS update_payment_after_transaction;

-- Recreate trigger without payment_date column
DELIMITER $$
CREATE TRIGGER update_payment_after_transaction
AFTER INSERT ON payment_transactions
FOR EACH ROW
BEGIN
    DECLARE v_total_paid DECIMAL(10,2);
    
    -- Calculate total amount paid from all transactions
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_paid
    FROM payment_transactions
    WHERE payment_id = NEW.payment_id;
    
    -- Update payment record with new total (removed payment_date)
    UPDATE payments
    SET amount_paid = v_total_paid,
        due_amount = total_charges - v_total_paid,
        payment_status = CASE
            WHEN v_total_paid = 0 THEN 'pending'
            WHEN v_total_paid >= total_charges THEN 'paid'
            ELSE 'partial'
        END
    WHERE payment_id = NEW.payment_id;
END$$
DELIMITER ;
