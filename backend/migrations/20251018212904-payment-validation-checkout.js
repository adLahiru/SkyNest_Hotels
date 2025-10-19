'use strict';

var dbm;
var type;
var seed;
var fs = require('fs');
var path = require('path');
var Promise;

exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
  Promise = options.Promise;
};

exports.up = function(db) {
  return db.runSql(`
    CREATE TRIGGER validate_payment_before_checkout
    BEFORE UPDATE ON booking
    FOR EACH ROW
    BEGIN
        DECLARE v_payment_status ENUM('pending','paid','partial');
        DECLARE v_due_amount DECIMAL(10,2);
        DECLARE v_total_charges DECIMAL(10,2);
        DECLARE v_error_message VARCHAR(500);
        
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
                SET v_error_message = CONCAT(
                    'Cannot check out: Outstanding balance of $', 
                    CAST(v_due_amount AS CHAR),
                    '. Total bill: $',
                    CAST(v_total_charges AS CHAR),
                    '. Please complete payment before checkout.'
                );
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = v_error_message;
            END IF;
            
        END IF;
    END;
  `);
};

exports.down = function(db) {
  return db.runSql('DROP TRIGGER IF EXISTS validate_payment_before_checkout;');
};

exports._meta = {
  "version": 1
};
