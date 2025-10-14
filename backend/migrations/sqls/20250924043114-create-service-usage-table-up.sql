CREATE TABLE `service_usage` (
  `usage_id` CHAR(36) NOT NULL DEFAULT (uuid()),
  `service_id` CHAR(36) DEFAULT NULL,
  `booking_id` CHAR(36) DEFAULT NULL,
  `usage_date` DATE DEFAULT NULL,
  `usage_time` TIME DEFAULT NULL,
  `quantity` INT DEFAULT NULL,
  `total` DECIMAL(10,2) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`usage_id`),
  CONSTRAINT `usage_fk_service` FOREIGN KEY (`service_id`) REFERENCES `service_catalogue` (`service_id`),
  CONSTRAINT `usage_fk_booking` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;