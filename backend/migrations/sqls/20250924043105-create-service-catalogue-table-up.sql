CREATE TABLE `service_catalogue` (
  `service_id` CHAR(36) NOT NULL DEFAULT (uuid()),
  `service_name` VARCHAR(100),
  `category` VARCHAR(50),
  `unit_price` DECIMAL(10,2),
  `is_active` TINYINT(1) DEFAULT '1',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;