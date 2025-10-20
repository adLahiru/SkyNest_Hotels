-- ============================================
-- SkyNest Hotels - Complete Migration Script
-- Run this to apply all new features
-- ============================================

USE SkyNest_Hotels;

-- ============================================
-- 1. ADD DISCOUNT ASSOCIATIONS TABLES
-- ============================================

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

SELECT 'Discount association tables created successfully!' AS status;

-- ============================================
-- 2. ADD IMAGE SUPPORT TO SERVICES
-- ============================================

-- Add image and image_url columns to service_catalogue
ALTER TABLE `service_catalogue` 
ADD COLUMN IF NOT EXISTS `image` LONGBLOB AFTER `unit_price`,
ADD COLUMN IF NOT EXISTS `image_url` VARCHAR(500) AFTER `image`;

SELECT 'Service image columns added successfully!' AS status;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check discount_room_type table
SELECT 'discount_room_type table' AS table_name, COUNT(*) AS row_count 
FROM discount_room_type;

-- Check discount_service table
SELECT 'discount_service table' AS table_name, COUNT(*) AS row_count 
FROM discount_service;

-- Check service_catalogue columns
DESCRIBE service_catalogue;

SELECT '✅ All migrations completed successfully!' AS final_status;
