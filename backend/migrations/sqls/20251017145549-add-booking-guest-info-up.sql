-- Add number_of_guests and special_requests columns to booking table
ALTER TABLE `booking` 
ADD COLUMN `number_of_guests` INT DEFAULT 1 AFTER `booking_date`,
ADD COLUMN `special_requests` TEXT DEFAULT NULL AFTER `number_of_guests`;