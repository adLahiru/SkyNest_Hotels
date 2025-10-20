-- Add image field to service_catalogue table
ALTER TABLE `service_catalogue` 
ADD COLUMN `image` LONGBLOB AFTER `unit_price`,
ADD COLUMN `image_url` VARCHAR(500) AFTER `image`;