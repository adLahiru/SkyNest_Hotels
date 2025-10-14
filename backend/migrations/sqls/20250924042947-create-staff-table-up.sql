CREATE TABLE `staff` (
  `staff_id` CHAR(36) NOT NULL DEFAULT (uuid()),
--   `user_id` CHAR(36) NOT NULL,
  `branch_id` CHAR(36) DEFAULT NULL,
  `role` ENUM('ADMIN','MANAGER','RECEPTIONIST','HOUSEKEEPING') NOT NULL,
  `hire_date` DATE DEFAULT NULL,
  `retired_date` DATE DEFAULT NULL,
  `salary` DECIMAL(10,2) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`staff_id`),
  CONSTRAINT `staff_fk_user` FOREIGN KEY (`staff_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `staff_fk_branch` FOREIGN KEY (`branch_id`) REFERENCES `hotel_branches` (`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;