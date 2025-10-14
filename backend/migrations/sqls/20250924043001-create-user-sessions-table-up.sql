CREATE TABLE `user_session` (
  `session_id` CHAR(36) NOT NULL DEFAULT (uuid()),
  `user_id` CHAR(36) NOT NULL,
  `device_info` VARCHAR(255),
  `ip_address` VARCHAR(50),
  `user_agent` VARCHAR(255),
  `location` VARCHAR(100),
  `is_active` TINYINT(1) DEFAULT '1',
  `expires_at` DATETIME DEFAULT NULL,
  `last_activity` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`),
  CONSTRAINT `user_session_fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;