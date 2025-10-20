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
    CREATE TRIGGER update_room_status_on_checkin
    AFTER UPDATE ON booking
    FOR EACH ROW
    BEGIN
        IF NEW.booking_status = 'checked_in' AND OLD.booking_status != 'checked_in' THEN
            UPDATE rooms
            SET state = 'occupied',
                updated_at = CURRENT_TIMESTAMP
            WHERE room_id = NEW.room_id;
        END IF;
    END;
  `)
  .then(() => db.runSql(`
    CREATE TRIGGER update_room_status_on_checkout
    AFTER UPDATE ON booking
    FOR EACH ROW
    BEGIN
        IF NEW.booking_status = 'checked_out' AND OLD.booking_status != 'checked_out' THEN
            UPDATE rooms
            SET state = 'available',
                updated_at = CURRENT_TIMESTAMP
            WHERE room_id = NEW.room_id;
        END IF;
    END;
  `));
};

exports.down = function(db) {
  return db.runSql('DROP TRIGGER IF EXISTS update_room_status_on_checkout;')
    .then(() => db.runSql('DROP TRIGGER IF EXISTS update_room_status_on_checkin;'));
};

exports._meta = {
  "version": 1
};
