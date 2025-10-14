CREATE TABLE `rooms` (
  `room_id` INT NOT NULL AUTO_INCREMENT,
  `room_type_id` CHAR(36) DEFAULT NULL,
  `branch_id` CHAR(36) DEFAULT NULL,
  `room_no` VARCHAR(20) DEFAULT NULL,
  `floor_no` INT DEFAULT NULL,
  `state` ENUM('available','occupied','maintenance') DEFAULT 'available',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`room_id`),
  CONSTRAINT `rooms_fk_type` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`room_type_id`),
  CONSTRAINT `rooms_fk_branch` FOREIGN KEY (`branch_id`) REFERENCES `hotel_branches` (`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;