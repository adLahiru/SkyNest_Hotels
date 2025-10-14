CREATE TABLE `audit_log` (
  `log_id` CHAR(36) NOT NULL DEFAULT (uuid()),
  `table_name` VARCHAR(100),
  `operation` VARCHAR(20),
  `record_id` CHAR(36),
  `old_value` TEXT,
  `new_value` TEXT,
  `changer_id` CHAR(36) DEFAULT NULL,
  `change_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  CONSTRAINT `audit_log_fk_staff` FOREIGN KEY (`changer_id`) REFERENCES `staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;