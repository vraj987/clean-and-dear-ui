ALTER TABLE `tbl_order_detail`
  ADD COLUMN `product_details_json` LONGTEXT DEFAULT NULL AFTER `depreciation_json`;
