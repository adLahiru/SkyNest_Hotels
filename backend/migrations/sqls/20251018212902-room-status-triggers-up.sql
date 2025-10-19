-- Trigger to update room status on check-in
DELIMITER $$

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
END$$

-- Trigger to update room status on check-out
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
END$$

DELIMITER ;
