'use strict';

var dbm;
var type;
var seed;
var fs = require('fs');
var path = require('path');
var Promise;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
  Promise = options.Promise;
};

exports.up = function(db) {
  // Create payment_transactions table first
  return db.runSql(`
    CREATE TABLE payment_transactions (
      transaction_id CHAR(36) NOT NULL DEFAULT (uuid()),
      payment_id CHAR(36) DEFAULT NULL,
      booking_id CHAR(36) DEFAULT NULL,
      transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      amount DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      transaction_reference VARCHAR(100),
      notes TEXT,
      processed_by_staff_id CHAR(36) DEFAULT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (transaction_id),
      CONSTRAINT payment_trans_fk_payment FOREIGN KEY (payment_id) REFERENCES payments (payment_id) ON DELETE CASCADE,
      CONSTRAINT payment_trans_fk_booking FOREIGN KEY (booking_id) REFERENCES booking (booking_id) ON DELETE CASCADE,
      CONSTRAINT payment_trans_fk_staff FOREIGN KEY (processed_by_staff_id) REFERENCES staff (staff_id) ON DELETE SET NULL,
      INDEX idx_payment_id (payment_id),
      INDEX idx_booking_id (booking_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)
  // Create trigger: update_payment_status_insert
  .then(() => db.runSql(`
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
    END;
  `))
  // Create trigger: update_payment_status
  .then(() => db.runSql(`
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
    END;
  `))
  // Create trigger: update_payment_after_transaction
  .then(() => db.runSql(`
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
    END;
  `))
  // Create stored procedure: process_partial_payment
  .then(() => db.runSql(`
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
    END;
  `))
  // Create function: get_outstanding_balance
  .then(() => db.runSql(`
    CREATE FUNCTION get_outstanding_balance(
        p_booking_id CHAR(36)
    )
    RETURNS DECIMAL(10,2)
    DETERMINISTIC
    READS SQL DATA
    BEGIN
        DECLARE v_due_amount DECIMAL(10,2);
        
        SELECT COALESCE(due_amount, 0)
        INTO v_due_amount
        FROM payments
        WHERE booking_id = p_booking_id
        LIMIT 1;
        
        RETURN v_due_amount;
    END;
  `));
};

exports.down = function(db) {
  return db.runSql('DROP FUNCTION IF EXISTS get_outstanding_balance;')
    .then(() => db.runSql('DROP PROCEDURE IF EXISTS process_partial_payment;'))
    .then(() => db.runSql('DROP TRIGGER IF EXISTS update_payment_after_transaction;'))
    .then(() => db.runSql('DROP TRIGGER IF EXISTS update_payment_status;'))
    .then(() => db.runSql('DROP TRIGGER IF EXISTS update_payment_status_insert;'))
    .then(() => db.dropTable('payment_transactions'));
};

exports._meta = {
  "version": 1
};
