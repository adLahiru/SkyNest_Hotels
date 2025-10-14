-- Add image_url column to room_types table
ALTER TABLE `room_types` ADD COLUMN `image_url` VARCHAR(500) AFTER `description`;