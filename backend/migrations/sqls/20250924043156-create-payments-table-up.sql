CREATE TABLE `payments` (
  `payment_id` CHAR(36) NOT NULL DEFAULT (uuid()),
  `booking_id` CHAR(36) DEFAULT NULL,
  `tax_id` CHAR(36) DEFAULT NULL,
  `discount_id` CHAR(36) DEFAULT NULL,
  `payment_date` DATE DEFAULT NULL,
  `payment_method` VARCHAR(50),
  `total_charges` DECIMAL(10,2),
  `amount_paid` DECIMAL(10,2),
  `due_amount` DECIMAL(10,2),
  `payment_status` ENUM('pending','paid','partial'),
  `staff_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  CONSTRAINT `payments_fk_booking` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`),
  CONSTRAINT `payments_fk_tax` FOREIGN KEY (`tax_id`) REFERENCES `tax_policies` (`tax_id`),
  CONSTRAINT `payments_fk_discount` FOREIGN KEY (`discount_id`) REFERENCES `discount` (`discount_id`),
  CONSTRAINT `payments_fk_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;