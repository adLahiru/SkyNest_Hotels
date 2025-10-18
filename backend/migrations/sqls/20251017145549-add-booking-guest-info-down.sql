-- Remove number_of_guests and special_requests columns from booking table
ALTER TABLE `booking` 
DROP COLUMN `number_of_guests`,
DROP COLUMN `special_requests`;