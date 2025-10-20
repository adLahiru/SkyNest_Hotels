-- Manual migration script for discount associations
-- Run this script to create the discount_room_type and discount_service tables

USE SkyNest_Hotels;

-- Create table to link discounts to specific room types
CREATE TABLE IF NOT EXISTS `discount_room_type` (
  `discount_room_type_id` CHAR(36) NOT NULL DEFAULT (uuid()),
  `discount_id` CHAR(36) NOT NULL,
  `room_type_id` CHAR(36) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`discount_room_type_id`),
  FOREIGN KEY (`discount_id`) REFERENCES `discount`(`discount_id`) ON DELETE CASCADE,
  FOREIGN KEY (`room_type_id`) REFERENCES `room_types`(`room_type_id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_discount_room_type` (`discount_id`, `room_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create table to link discounts to specific services
CREATE TABLE IF NOT EXISTS `discount_service` (
  `discount_service_id` CHAR(36) NOT NULL DEFAULT (uuid()),
  `discount_id` CHAR(36) NOT NULL,
  `service_id` CHAR(36) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`discount_service_id`),
  FOREIGN KEY (`discount_id`) REFERENCES `discount`(`discount_id`) ON DELETE CASCADE,
  FOREIGN KEY (`service_id`) REFERENCES `service_catalogue`(`service_id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_discount_service` (`discount_id`, `service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT 'Migration completed successfully!' AS status;
