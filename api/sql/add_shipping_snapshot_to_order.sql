ALTER TABLE `tbl_order`
  ADD COLUMN `shipping_name` varchar(150) DEFAULT NULL AFTER `kavach_customer_id`,
  ADD COLUMN `shipping_mobile` varchar(20) DEFAULT NULL AFTER `shipping_name`,
  ADD COLUMN `shipping_email` varchar(190) DEFAULT NULL AFTER `shipping_mobile`,
  ADD COLUMN `shipping_address` text DEFAULT NULL AFTER `shipping_email`,
  ADD COLUMN `shipping_state_id` int(11) DEFAULT NULL AFTER `shipping_address`,
  ADD COLUMN `shipping_city_id` int(11) DEFAULT NULL AFTER `shipping_state_id`,
  ADD COLUMN `shipping_pincode` varchar(20) DEFAULT NULL AFTER `shipping_city_id`,
  ADD COLUMN `delivery_instructions` text DEFAULT NULL AFTER `shipping_pincode`;
