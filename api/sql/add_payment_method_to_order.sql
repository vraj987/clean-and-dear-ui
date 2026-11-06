ALTER TABLE `tbl_order`
  ADD COLUMN `payment_method` varchar(30) DEFAULT NULL AFTER `delivery_instructions`;
