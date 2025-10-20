-- Remove image fields from service_catalogue table
ALTER TABLE `service_catalogue` 
DROP COLUMN `image_url`,
DROP COLUMN `image`;