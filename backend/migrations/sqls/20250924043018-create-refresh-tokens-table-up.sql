CREATE TABLE `refresh_token` (
  `jti` CHAR(36) NOT NULL DEFAULT (uuid()),
  `user_id` CHAR(36) NOT NULL,
  `session_id` CHAR(36) NOT NULL,
  `token_hash` VARCHAR(255),
  `is_active` TINYINT(1) DEFAULT '1',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`jti`),
  CONSTRAINT `refresh_token_fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `refresh_token_fk_session` FOREIGN KEY (`session_id`) REFERENCES `user_session` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;