CREATE TABLE `room_types` (
  `room_type_id` CHAR(36) NOT NULL DEFAULT (uuid()),
  `type` VARCHAR(100) NOT NULL,
  `capacity` INT NOT NULL,
  `daily_rate` DECIMAL(10,2) NOT NULL,
  `amenities` TEXT,
  `description` TEXT,
  `photo` LONGBLOB,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`room_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;