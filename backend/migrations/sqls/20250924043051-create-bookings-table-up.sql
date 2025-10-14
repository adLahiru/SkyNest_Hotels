CREATE TABLE `booking` (
  `booking_id` CHAR(36) NOT NULL DEFAULT (uuid()),
  `user_id` CHAR(36) DEFAULT NULL,
  `room_id` INT DEFAULT NULL,
  `staff_id` CHAR(36) DEFAULT NULL,
  `checking_datetime` DATETIME DEFAULT NULL,
  `checkout_datetime` DATETIME DEFAULT NULL,
  `booking_status` ENUM('confirmed','cancelled','checked_in','checked_out') DEFAULT NULL,
  `booking_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `branch_id` CHAR(36) DEFAULT NULL,
  PRIMARY KEY (`booking_id`),
  CONSTRAINT `booking_fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `booking_fk_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`),
  CONSTRAINT `booking_fk_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`),
  CONSTRAINT `booking_fk_branch` FOREIGN KEY (`branch_id`) REFERENCES `hotel_branches` (`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;