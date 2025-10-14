CREATE TABLE `hotel_branches` (
  `branch_id` CHAR(36) NOT NULL DEFAULT (uuid()),
  `branch_name` VARCHAR(100) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) UNIQUE,
  `phone` VARCHAR(20),
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `manager_id` CHAR(36) DEFAULT NULL,
  PRIMARY KEY (`branch_id`),
  CONSTRAINT `fk_hotel_manager` FOREIGN KEY (`manager_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;