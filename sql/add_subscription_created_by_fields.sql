-- Run once on the live database before deploying the updated purchase API.
ALTER TABLE `tbl_order`
  ADD COLUMN `created_by_user_id` int(11) DEFAULT NULL AFTER `kavach_customer_id`;

ALTER TABLE `tbl_order_detail`
  ADD COLUMN `created_by_user_id` int(11) DEFAULT NULL AFTER `kavach_customer_id`;

-- Clean up the earlier type field if that version of the migration was run.
SET @drop_order_creator_type = IF(
  (SELECT COUNT(*) FROM `information_schema`.`COLUMNS`
   WHERE `TABLE_SCHEMA` = DATABASE() AND `TABLE_NAME` = 'tbl_order'
     AND `COLUMN_NAME` = 'created_by_user_type') > 0,
  'ALTER TABLE `tbl_order` DROP COLUMN `created_by_user_type`',
  'SELECT 1'
);
PREPARE drop_order_creator_type_stmt FROM @drop_order_creator_type;
EXECUTE drop_order_creator_type_stmt;
DEALLOCATE PREPARE drop_order_creator_type_stmt;

SET @drop_detail_creator_type = IF(
  (SELECT COUNT(*) FROM `information_schema`.`COLUMNS`
   WHERE `TABLE_SCHEMA` = DATABASE() AND `TABLE_NAME` = 'tbl_order_detail'
     AND `COLUMN_NAME` = 'created_by_user_type') > 0,
  'ALTER TABLE `tbl_order_detail` DROP COLUMN `created_by_user_type`',
  'SELECT 1'
);
PREPARE drop_detail_creator_type_stmt FROM @drop_detail_creator_type;
EXECUTE drop_detail_creator_type_stmt;
DEALLOCATE PREPARE drop_detail_creator_type_stmt;
