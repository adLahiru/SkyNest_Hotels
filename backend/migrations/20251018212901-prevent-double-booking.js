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
    CREATE TRIGGER prevent_double_booking_insert
    BEFORE INSERT ON booking
    FOR EACH ROW
    BEGIN
        DECLARE overlap_count INT;
        
        SELECT COUNT(*) INTO overlap_count
        FROM booking
        WHERE room_id = NEW.room_id
          AND booking_status IN ('confirmed', 'checked_in')
          AND (
              (NEW.checking_datetime >= checking_datetime 
               AND NEW.checking_datetime < checkout_datetime)
              OR
              (NEW.checkout_datetime > checking_datetime 
               AND NEW.checkout_datetime <= checkout_datetime)
              OR
              (NEW.checking_datetime <= checking_datetime 
               AND NEW.checkout_datetime >= checkout_datetime)
          );
        
        IF overlap_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'This room is already booked for the selected dates. Please choose different dates or another room.';
        END IF;
    END;
  `)
  .then(() => db.runSql(`
    CREATE TRIGGER prevent_double_booking_update
    BEFORE UPDATE ON booking
    FOR EACH ROW
    BEGIN
        DECLARE overlap_count INT;
        
        IF NEW.booking_status IN ('confirmed', 'checked_in') THEN
            SELECT COUNT(*) INTO overlap_count
            FROM booking
            WHERE room_id = NEW.room_id
              AND booking_id != NEW.booking_id
              AND booking_status IN ('confirmed', 'checked_in')
              AND (
                  (NEW.checking_datetime >= checking_datetime 
                   AND NEW.checking_datetime < checkout_datetime)
                  OR
                  (NEW.checkout_datetime > checking_datetime 
                   AND NEW.checkout_datetime <= checkout_datetime)
                  OR
                  (NEW.checking_datetime <= checking_datetime 
                   AND NEW.checkout_datetime >= checkout_datetime)
              );
            
            IF overlap_count > 0 THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'This room is already booked for the selected dates. Please choose different dates or another room.';
            END IF;
        END IF;
    END;
  `));
};

exports.down = function(db) {
  return db.runSql('DROP TRIGGER IF EXISTS prevent_double_booking_update;')
    .then(() => db.runSql('DROP TRIGGER IF EXISTS prevent_double_booking_insert;'));
};

exports._meta = {
  "version": 1
};
