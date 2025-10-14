-- Add image_url column to hotel_branches table
ALTER TABLE `hotel_branches` ADD COLUMN `image_url` VARCHAR(500) AFTER `phone`;