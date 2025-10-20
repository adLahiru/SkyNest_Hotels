-- Drop function
DROP FUNCTION IF EXISTS get_outstanding_balance;

-- Drop procedure
DROP PROCEDURE IF EXISTS process_partial_payment;

-- Drop triggers
DROP TRIGGER IF EXISTS update_payment_after_transaction;
DROP TRIGGER IF EXISTS update_payment_status;
DROP TRIGGER IF EXISTS update_payment_status_insert;

-- Drop table
DROP TABLE IF EXISTS payment_transactions;
