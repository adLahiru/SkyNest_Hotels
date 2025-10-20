-- Add image support to service_catalogue table
USE SkyNest_Hotels;

-- Add image and image_url columns
ALTER TABLE `service_catalogue` 
ADD COLUMN IF NOT EXISTS `image` LONGBLOB AFTER `unit_price`,
ADD COLUMN IF NOT EXISTS `image_url` VARCHAR(500) AFTER `image`;

SELECT 'Service image columns added successfully!' AS status;
