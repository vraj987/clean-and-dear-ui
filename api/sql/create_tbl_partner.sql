CREATE TABLE IF NOT EXISTS `tbl_partner` (
  `partner_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `partner_name` VARCHAR(150) NOT NULL,
  `partner_image` VARCHAR(255) DEFAULT NULL,
  `partner_url` VARCHAR(500) DEFAULT NULL,
  `partner_priority` INT NOT NULL DEFAULT 0,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = active, 0 = hidden',
  `c_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`partner_id`),
  KEY `idx_partner_visible_order` (`is_deleted`, `partner_priority`, `partner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
