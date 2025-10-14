CREATE TABLE `discount` (
  `discount_id` CHAR(36) NOT NULL DEFAULT (uuid()),
  `discount_name` VARCHAR(100),
  `type` ENUM('rate','fixed'),
  `discount_value` DECIMAL(10,2),
  `applies_to` VARCHAR(100),
  `start_date` DATE,
  `end_date` DATE,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`discount_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;