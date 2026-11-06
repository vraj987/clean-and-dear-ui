-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 15, 2026 at 01:47 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bits_kimaat_lock`
--

-- --------------------------------------------------------

--
-- Table structure for table `tbl_banner`
--

CREATE TABLE `tbl_banner` (
  `banner_id` int(11) NOT NULL,
  `banner_name` varchar(255) NOT NULL,
  `banner_image` varchar(255) NOT NULL,
  `banner_priority` int(11) NOT NULL DEFAULT 0,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 1,
  `c_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_banner`
--

INSERT INTO `tbl_banner` (`banner_id`, `banner_name`, `banner_image`, `banner_priority`, `is_deleted`, `c_date`) VALUES
(1, 'asas', 'banner-1790596827324.jpg', 2223, 2, '2026-09-28 17:29:19'),
(2, 'banner\'ss', 'banner-1791264922743.JPG', 123, 1, '2026-09-28 17:34:55'),
(3, 'b2', 'banner-1791265426658.jpg', 222, 1, '2026-10-06 11:12:02'),
(4, 'b3', 'banner-1791265331225.png', 1, 2, '2026-10-06 11:12:11');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_brand`
--

CREATE TABLE `tbl_brand` (
  `brand_id` int(11) NOT NULL,
  `brand_name` varchar(255) NOT NULL,
  `brand_image` varchar(255) NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 1,
  `c_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_brand`
--

INSERT INTO `tbl_brand` (`brand_id`, `brand_name`, `brand_image`, `is_deleted`, `c_date`) VALUES
(1, 'VBnnee', 'brand-1790598084771.png', 2, '2026-09-28 17:51:24'),
(2, 'Samsung', 'brand-1790598256336.jpg', 1, '2026-09-28 17:52:04'),
(3, 'Apple', 'brand-1790598263946.png', 1, '2026-09-28 17:53:00'),
(4, 'Google', 'brand-1790598084771.png', 1, '2026-09-30 18:00:00'),
(5, 'OnePlus', 'brand-1790598084771.png', 1, '2026-09-30 18:00:01'),
(6, 'Xiaomi', 'brand-1790598084771.png', 1, '2026-09-30 18:00:02'),
(7, 'Nothing', 'brand-1790598084771.png', 1, '2026-09-30 18:00:03'),
(8, 'Motorola', 'brand-1790598084771.png', 1, '2026-09-30 18:00:04'),
(9, 'Oppo', 'brand-1790598084771.png', 1, '2026-09-30 18:00:05'),
(10, 'Vivo', 'brand-1790598084771.png', 1, '2026-09-30 18:00:06');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_cart`
--

CREATE TABLE `tbl_cart` (
  `cart_id` int(11) NOT NULL,
  `cart_customer_id` int(11) DEFAULT NULL,
  `cart_product_id` int(11) DEFAULT NULL,
  `cart_qty` int(11) DEFAULT NULL,
  `cart_package_id` int(11) NOT NULL,
  `cart_duration` int(11) NOT NULL,
  `is_deleted` int(11) NOT NULL DEFAULT 1,
  `c_date` varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_cart`
--

INSERT INTO `tbl_cart` (`cart_id`, `cart_customer_id`, `cart_product_id`, `cart_qty`, `cart_package_id`, `cart_duration`, `is_deleted`, `c_date`) VALUES
(1, 4, 58, 1, 0, 0, 2, '2026-10-10 15:30:19'),
(2, 4, 58, 1, 3, 3, 2, '2026-10-10 15:31:06'),
(3, 4, 58, 1, 2, 3, 2, '2026-10-10 15:31:22'),
(4, 4, 58, 1, 3, 3, 2, '2026-10-10 15:54:50'),
(5, 4, 57, 1, 0, 0, 2, '2026-10-10 16:01:48'),
(6, 4, 57, 1, 1, 11, 2, '2026-10-10 16:55:50'),
(7, 4, 57, 1, 0, 0, 2, '2026-10-10 17:00:51'),
(8, 4, 57, 1, 2, 4, 2, '2026-10-10 17:11:46'),
(9, 4, 57, 1, 0, 0, 2, '2026-10-10 17:11:56'),
(10, 4, 58, 1, 0, 0, 2, '2026-10-10 17:12:07'),
(11, 4, 58, 1, 2, 8, 2, '2026-10-10 17:14:36'),
(12, 4, 58, 1, 1, 8, 2, '2026-10-10 17:14:46'),
(13, 4, 58, 1, 0, 0, 2, '2026-10-12 12:26:00'),
(14, 4, 5, 1, 2, 8, 2, '2026-10-12 12:27:07'),
(15, 4, 5, 1, 2, 9, 2, '2026-10-12 12:27:19'),
(16, 4, 5, 1, 2, 13, 2, '2026-10-12 12:27:26'),
(17, 4, 60, 1, 0, 0, 2, '2026-10-12 17:35:14'),
(18, 4, 58, 1, 2, 5, 2, '2026-10-12 17:46:23'),
(19, 4, 58, 1, 2, 13, 2, '2026-10-12 17:49:01'),
(20, 4, 58, 1, 1, 13, 2, '2026-10-12 17:49:58'),
(21, 4, 58, 1, 0, 0, 2, '2026-10-15 16:04:01'),
(22, 4, 58, 1, 1, 14, 1, '2026-10-15 16:38:28');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_category`
--

CREATE TABLE `tbl_category` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `category_image` varchar(255) NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 1,
  `c_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_category`
--

INSERT INTO `tbl_category` (`category_id`, `category_name`, `category_image`, `is_deleted`, `c_date`) VALUES
(1, 'Premium', 'category-1790661744478.jpg', 1, '2026-09-29 11:23:33'),
(2, 'Regular', 'category-1790661471237.jpg', 1, '2026-09-29 11:27:51'),
(3, 'Standard', 'category-1790661488159.jpg', 1, '2026-09-29 11:28:08');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_city`
--

CREATE TABLE `tbl_city` (
  `city_id` int(11) NOT NULL,
  `city_name` varchar(100) NOT NULL,
  `state_id` varchar(11) DEFAULT NULL,
  `is_deleted` int(11) DEFAULT 1,
  `c_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_city`
--

INSERT INTO `tbl_city` (`city_id`, `city_name`, `state_id`, `is_deleted`, `c_date`) VALUES
(1, 'Ahmedabad', '11', 1, '2025-12-11 06:54:29'),
(2, 'Surat', '11', 1, '2025-12-11 06:54:29'),
(3, 'Vadodara', '11', 1, '2025-12-11 06:54:29'),
(4, 'Rajkot', '11', 1, '2025-12-11 06:54:29'),
(5, 'Bhavnagar', '11', 1, '2025-12-11 06:54:29'),
(6, 'Jamnagar', '11', 1, '2025-12-11 06:54:29'),
(7, 'Junagadh', '11', 1, '2025-12-11 06:54:29'),
(8, 'Gandhinagar', '11', 1, '2025-12-11 06:54:29'),
(9, 'Anand', '11', 1, '2025-12-11 06:54:29'),
(10, 'Navsari', '11', 1, '2025-12-11 06:54:29'),
(11, 'Surendranagar', '11', 1, '2025-12-11 06:54:29'),
(12, 'Morbi', '11', 1, '2025-12-11 06:54:29'),
(13, 'Gandhidham', '11', 1, '2025-12-11 06:54:29'),
(14, 'Nadiad', '11', 1, '2025-12-11 06:54:29'),
(15, 'Bharuch', '11', 1, '2025-12-11 06:54:29'),
(16, 'Patan', '11', 1, '2025-12-11 06:54:29'),
(17, 'Porbandar', '11', 1, '2025-12-11 06:54:29'),
(18, 'Mehsana', '11', 1, '2025-12-11 06:54:29'),
(19, 'Bhuj', '11', 1, '2025-12-11 06:54:29'),
(20, 'Veraval', '11', 1, '2025-12-11 06:54:29'),
(21, 'Vapi', '11', 1, '2025-12-11 06:54:29'),
(22, 'Valsad', '11', 1, '2025-12-11 06:54:29'),
(23, 'Godhra', '11', 1, '2025-12-11 06:54:29'),
(24, 'Palanpur', '11', 1, '2025-12-11 06:54:29'),
(25, 'Himmatnagar', '11', 1, '2025-12-11 06:54:29'),
(26, 'Kalol', '11', 1, '2025-12-11 06:54:29'),
(27, 'Botad', '11', 1, '2025-12-11 06:54:29'),
(28, 'Amreli', '11', 1, '2025-12-11 06:54:29'),
(29, 'Gondal', '11', 1, '2025-12-11 06:54:29'),
(30, 'Jetpur', '11', 1, '2025-12-11 06:54:29'),
(31, 'Deesa', '11', 1, '2025-12-11 06:54:29'),
(32, 'BBASsas;s', '11', 2, '2025-12-27 05:35:06'),
(33, 'astt', '1', 2, '2025-12-27 05:57:53'),
(34, '233', '2', 2, '2025-12-27 05:58:02'),
(35, 'DELHI WEST', '9', 1, '2025-12-27 06:04:34'),
(36, 'Kheda', '11', 1, '2025-12-27 06:31:39'),
(37, 'asas\'\'\'ttt', '1', 2, '2026-01-09 11:19:05');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_company_setting`
--

CREATE TABLE `tbl_company_setting` (
  `company_id` int(11) NOT NULL,
  `company_setting_id` int(11) NOT NULL,
  `company_name` varchar(100) NOT NULL DEFAULT 'Store Name',
  `company_favicon` varchar(50) DEFAULT NULL COMMENT '38 X 38',
  `company_header_logo` varchar(50) DEFAULT NULL COMMENT '127x38',
  `company_login_logo` varchar(50) DEFAULT NULL COMMENT '127x38',
  `company_email` varchar(50) DEFAULT NULL,
  `company_website` varchar(40) DEFAULT NULL,
  `company_mobile` varchar(15) DEFAULT NULL,
  `company_landline` varchar(15) DEFAULT NULL,
  `company_address` varchar(100) DEFAULT NULL,
  `company_terms_and_condition` longtext DEFAULT NULL,
  `company_privacy_policy` longtext DEFAULT NULL,
  `company_about_us` longtext DEFAULT NULL,
  `company_financial_year` varchar(25) DEFAULT NULL,
  `is_deleted` int(11) NOT NULL DEFAULT 1,
  `c_date` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `tbl_company_setting`
--

INSERT INTO `tbl_company_setting` (`company_id`, `company_setting_id`, `company_name`, `company_favicon`, `company_header_logo`, `company_login_logo`, `company_email`, `company_website`, `company_mobile`, `company_landline`, `company_address`, `company_terms_and_condition`, `company_privacy_policy`, `company_about_us`, `company_financial_year`, `is_deleted`, `c_date`) VALUES
(2, 2, 'Kimaat Lock', 'favicon.png', 'kimaatlock.png', 'kimaatlocklogin.png', '', '', NULL, '', NULL, NULL, NULL, NULL, '2526', 1, '2025-11-20 18:16:34');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_customer`
--

CREATE TABLE `tbl_customer` (
  `customer_id` int(11) NOT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_mobile` varchar(20) DEFAULT NULL,
  `customer_email` varchar(100) DEFAULT NULL,
  `customer_address` text DEFAULT NULL,
  `state_id` varchar(11) DEFAULT NULL,
  `city_id` varchar(11) DEFAULT NULL,
  `customer_is_verify` int(11) NOT NULL DEFAULT 1 COMMENT '1=yes,2=no',
  `customer_otp` varchar(10) DEFAULT NULL,
  `customer_is_active` varchar(11) DEFAULT '1' COMMENT '1=active,2=inactive',
  `is_deleted` varchar(11) DEFAULT NULL,
  `c_date` varchar(25) DEFAULT NULL,
  `customer_logout` varchar(11) DEFAULT NULL,
  `customer_auth_token` varchar(255) DEFAULT NULL,
  `customer_pincode` varchar(15) DEFAULT NULL,
  `customer_android_token` varchar(255) DEFAULT NULL,
  `customer_ios_token` varchar(255) DEFAULT NULL,
  `customer_app_version` varchar(25) DEFAULT NULL,
  `customer_type` varchar(11) DEFAULT NULL COMMENT '1=employee,2=customer,3=vendor',
  `customer_password` varchar(255) DEFAULT NULL,
  `customer_profile` varchar(255) DEFAULT NULL,
  `gst_no` varchar(25) DEFAULT NULL,
  `pan_no` varchar(25) DEFAULT NULL,
  `tan_no` varchar(25) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `bank_acc_no` varchar(50) DEFAULT NULL,
  `ifsc_code` varchar(25) DEFAULT NULL,
  `bank_branch` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_customer`
--

INSERT INTO `tbl_customer` (`customer_id`, `customer_name`, `customer_mobile`, `customer_email`, `customer_address`, `state_id`, `city_id`, `customer_is_verify`, `customer_otp`, `customer_is_active`, `is_deleted`, `c_date`, `customer_logout`, `customer_auth_token`, `customer_pincode`, `customer_android_token`, `customer_ios_token`, `customer_app_version`, `customer_type`, `customer_password`, `customer_profile`, `gst_no`, `pan_no`, `tan_no`, `bank_name`, `bank_acc_no`, `ifsc_code`, `bank_branch`) VALUES
(1, 'kimaat_lock', 'kimaat_lock', 'kimaat_lock@gmail.com', 'address', '1', '1', 1, NULL, '1', '1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1', '351d9b9fb9fa56b9460f46d9601b6a00', 'default.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'Rakesh', '7016248207', '', '', '11', '3', 1, '1234', '1', '1', '2026-09-30 14:05:02', '1', NULL, '', '', '', NULL, '2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'Shubham', '8320099260', 'rakesrajpar1@gmail.com', 'A - 605, Shiddhivinayak Business Towers, Kataria Automobiles Rd, Makarba', '11', '1', 1, NULL, '1', '1', '2026-09-30 14:06:48', '1', 'Z5LNWUI8FB', '380051', '', '', '1.0.0.1', '2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'Vendor', '9727327273', 'shubhambhatt85@gmail.com', 'A - 605, Shiddhivinayak Business Towers, Kataria Automobiles Rd, Makarba', '11', '1', 1, NULL, '1', '1', '2026-09-30 14:07:19', '1', 'M064IBW17A', '380051', '', '', '1.0.0.1', '3', NULL, NULL, '', '', '', '', '', '', ''),
(5, 'kimaat_lock', '7859931713', 'kimaat_lock@gmail.com', 'address', '1', '1', 1, NULL, '1', '1', NULL, '1', 'MUTD7JAKCL', NULL, '', '', NULL, '1', '21232f297a57a5a743894a0e4a801fc3', 'default.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_faq`
--

CREATE TABLE `tbl_faq` (
  `faq_id` int(11) NOT NULL,
  `faq_title` varchar(255) DEFAULT NULL,
  `faq_description` varchar(255) DEFAULT NULL,
  `is_deleted` int(11) NOT NULL DEFAULT 1,
  `c_date` varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_faq`
--

INSERT INTO `tbl_faq` (`faq_id`, `faq_title`, `faq_description`, `is_deleted`, `c_date`) VALUES
(1, 'How do I place an order?', 'Simply browse the product list, add items to your cart, and proceed to checkout. You will receive a confirmation via email once your order is placed.', 1, '2026-10-10 18:05:07'),
(2, 'What payment methods are accepted?', 'We accept UPI, credit/debit cards, net banking, and cash on delivery (COD) for eligible pincodes.', 1, '2026-10-10 18:05:07'),
(3, 'How long does delivery take?', 'Standard delivery takes 3–5 business days depending on your location. Express delivery is available in select cities within 1–2 days.', 1, '2026-10-10 18:05:07'),
(4, 'What is the return and refund policy?', 'You can request a return within 7 days of delivery. Refunds are processed back to the original payment method within 5–7 business days.', 1, '2026-10-10 18:05:07'),
(5, 'How do I contact customer support?', 'You can reach our support team via email at support@example.com or call us at 1800-123-4567 between 9:00 AM and 7:00 PM (Mon–Sat).', 1, '2026-10-10 18:05:07');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_model`
--

CREATE TABLE `tbl_model` (
  `model_id` int(11) NOT NULL,
  `brand_id` varchar(11) DEFAULT NULL,
  `model_name` varchar(255) NOT NULL,
  `model_image` text NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 1,
  `c_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_model`
--

INSERT INTO `tbl_model` (`model_id`, `brand_id`, `model_name`, `model_image`, `is_deleted`, `c_date`) VALUES
(1, '2', 'S25 Ultra', 'model-1790659763436.jpg', 1, '2026-09-29 10:58:03'),
(2, '2', 'S26 Ultra', 'model-1790660266895.jpg', 1, '2026-09-29 11:07:46'),
(3, '3', 'Iphone 17', 'model-1790747249455.jpg', 1, '2026-09-29 11:08:57'),
(5, '3', 'asas', 'model-1790747287682.jpg', 2, '2026-09-30 11:18:07'),
(6, '4', 'Pixel 10', 'model-1790747287682.jpg', 1, '2026-09-30 18:01:00'),
(7, '4', 'Pixel 10 Pro', 'model-1790747287682.jpg', 1, '2026-09-30 18:01:01'),
(8, '4', 'Pixel 10 Pro XL', 'model-1790747287682.jpg', 1, '2026-09-30 18:01:02'),
(9, '5', 'OnePlus 13', 'model-1790747287682.jpg', 1, '2026-09-30 18:01:03'),
(10, '5', 'OnePlus 13R', 'model-1790747287682.jpg', 1, '2026-09-30 18:01:04'),
(11, '5', 'OnePlus Open 2', 'model-1790747287682.jpg', 1, '2026-09-30 18:01:05'),
(12, '6', 'Xiaomi 15 Ultra', 'model-1790747287682.jpg', 1, '2026-09-30 18:01:06'),
(13, '6', 'Xiaomi 15', 'model-1790747287682.jpg', 1, '2026-09-30 18:01:07'),
(14, '6', 'Redmi Note 14 Pro+', 'model-1790747287682.jpg', 1, '2026-09-30 18:01:08'),
(15, '7', 'Nothing Phone (3)', 'model-1790747287682.jpg', 1, '2026-09-30 18:01:09'),
(16, '7', 'Nothing Phone (3a) Pro', 'model-1790747287682.jpg', 1, '2026-09-30 18:01:10'),
(17, '8', 'Motorola Edge 60 Pro', 'model-1790747287682.jpg', 1, '2026-09-30 18:01:11'),
(18, '8', 'Motorola Razr 60 Ultra', 'model-1790747287682.jpg', 1, '2026-09-30 18:01:12'),
(19, '9', 'Oppo Find X8 Pro', 'model-1790747287682.jpg', 1, '2026-09-30 18:01:13'),
(20, '9', 'Oppo Reno 14 Pro', 'model-1790747287682.jpg', 1, '2026-09-30 18:01:14'),
(21, '10', 'Vivo X200 Pro', 'model-1790747287682.jpg', 1, '2026-09-30 18:01:15'),
(22, '10', 'Vivo V40 Pro', 'model-1790747287682.jpg', 1, '2026-09-30 18:01:16');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_notification`
--

CREATE TABLE `tbl_notification` (
  `notification_id` int(11) NOT NULL,
  `employee_id` longtext NOT NULL,
  `notification_title` longtext NOT NULL,
  `notification_description` longtext DEFAULT NULL,
  `notification_type` varchar(11) DEFAULT NULL COMMENT '1=visitor,2=breakdown',
  `is_deleted` int(11) NOT NULL,
  `c_date` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_notification`
--

INSERT INTO `tbl_notification` (`notification_id`, `employee_id`, `notification_title`, `notification_description`, `notification_type`, `is_deleted`, `c_date`) VALUES
(1, '8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-02 17:25:02'),
(2, '8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-02 17:30:32'),
(3, '8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-02 17:33:18'),
(4, '8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-02 17:52:12'),
(5, '8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-02 18:06:39'),
(6, '8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-02 18:08:01'),
(7, '8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-02 18:08:02'),
(8, '8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-02 18:08:06'),
(9, '8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-03 12:06:56'),
(10, '8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-03 12:07:16'),
(11, '8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-03 12:10:20'),
(12, '4', 'New Visitor Added - Approval Required', 'Rakesh Rajpara has arrived for a visit. Please review and approve the entry.', '1', 1, '2026-02-03 12:22:31'),
(13, '8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-03 12:24:13'),
(14, '4', 'New Visitor Added - Approval Required', 'Rakesh Rajpara has arrived for a visit. Please review and approve the entry.', '1', 1, '2026-02-03 12:24:42'),
(15, '4', 'New Visitor Added - Approval Required', 'Rakesh Rajpara has arrived for a visit. Please review and approve the entry.', '1', 1, '2026-02-03 12:26:00'),
(16, '4', 'New Visitor Added - Approval Required', 'Rakesh Rajpara has arrived for a visit. Please review and approve the entry.', '1', 1, '2026-02-03 12:26:13'),
(17, '4', 'New Visitor Added - Approval Required', 'Rakesh Rajpara has arrived for a visit. Please review and approve the entry.', '1', 1, '2026-02-03 12:26:31'),
(18, '4', 'New Visitor Added - Approval Required', 'Rakesh Rajpara has arrived for a visit. Please review and approve the entry.', '1', 1, '2026-02-03 12:26:55'),
(19, '4', 'New Visitor Added - Approval Required', 'Rakesh Rajpara has arrived for a visit. Please review and approve the entry.', '1', 1, '2026-02-03 12:27:18'),
(20, '4', 'New Visitor Added - Approval Required', 'Rakesh Rajpara has arrived for a visit. Please review and approve the entry.', '1', 1, '2026-02-03 12:28:01'),
(21, '4', 'New Visitor Added - Approval Required', 'Rakesh Rajpara has arrived for a visit. Please review and approve the entry.', '1', 1, '2026-02-03 12:28:08'),
(22, '8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-03 12:31:15'),
(23, '4,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-03 12:31:26'),
(24, '4,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-03 12:31:57'),
(25, '4,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-03 12:32:03'),
(26, '8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-03 15:01:23'),
(27, '8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-03 15:01:43'),
(28, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:44:21'),
(29, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:44:23'),
(30, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:44:34'),
(31, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:44:52'),
(32, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:44:55'),
(33, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:45:00'),
(34, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:45:01'),
(35, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:45:01'),
(36, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:45:19'),
(37, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:45:24'),
(38, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:45:24'),
(39, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:45:39'),
(40, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:45:40'),
(41, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:45:40'),
(42, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:45:40'),
(43, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:45:40'),
(44, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:45:41'),
(45, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:45:42'),
(46, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:45:43'),
(47, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:45:43'),
(48, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:45:52'),
(49, '8,9', '🛠️ Preventive Maintenance Due Today!', 'Preventive maintenance is due today for Core Stacking Table in the 22 Please review and complete the task.', '2', 1, '2026-02-03 17:46:03'),
(50, '8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-04 09:47:10'),
(51, '8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 10:36:14'),
(52, '8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 10:37:53'),
(53, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 10:47:38'),
(54, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 10:49:59'),
(55, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 10:50:07'),
(56, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 10:50:17'),
(57, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 10:50:28'),
(58, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 10:50:38'),
(59, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 10:53:14'),
(60, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 10:55:01'),
(61, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 10:57:52'),
(62, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 11:02:17'),
(63, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 11:27:02'),
(64, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 11:27:10'),
(65, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 11:39:44'),
(66, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 11:39:58'),
(67, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 11:45:55'),
(68, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 11:46:48'),
(69, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 11:47:23'),
(70, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 11:50:45'),
(71, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 11:52:40'),
(72, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 11:57:26'),
(73, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 11:57:48'),
(74, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 12:00:58'),
(75, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 12:01:17'),
(76, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 12:01:26'),
(77, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 12:01:32'),
(78, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 12:01:36'),
(79, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 12:01:48'),
(80, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 12:02:07'),
(81, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 12:09:49'),
(82, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 12:23:55'),
(83, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '2', 1, '2026-02-06 12:24:10'),
(84, '5,8,9', '🔧 New Breakdown Reported!', 'A new machine breakdown has been reported. Please review and accept it for resolution.', '1', 1, '2026-02-06 12:33:57');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_offer`
--

CREATE TABLE `tbl_offer` (
  `offer_id` int(11) NOT NULL,
  `offer_name` varchar(255) DEFAULT NULL,
  `offer_start_date` varchar(15) DEFAULT NULL,
  `offer_end_date` varchar(15) DEFAULT NULL,
  `offer_product_ids` longtext DEFAULT NULL,
  `offer_priority` int(11) DEFAULT NULL,
  `is_deleted` int(11) NOT NULL DEFAULT 1,
  `c_date` varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_offer`
--

INSERT INTO `tbl_offer` (`offer_id`, `offer_name`, `offer_start_date`, `offer_end_date`, `offer_product_ids`, `offer_priority`, `is_deleted`, `c_date`) VALUES
(1, 'Steal Deals', '2026-10-01', '2026-11-30', '28,27,26,25,24,23,22,21,20,19', 99, 1, '2026-10-10 12:14:57'),
(2, 'New Launches', '2026-10-01', '2026-12-31', '24,12,11,8,7,5,4,3', 80, 1, '2026-10-10 12:18:58'),
(3, 'Stylish ', '2026-09-30', '2026-10-09', '60,58,57,55,48,47,46,45,44,43,42', 50, 1, '2026-10-10 12:26:41');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_order`
--

CREATE TABLE `tbl_order` (
  `kavach_order_id` int(11) NOT NULL,
  `kavach_customer_id` varchar(11) DEFAULT NULL,
  `shipping_name` varchar(150) DEFAULT NULL,
  `shipping_mobile` varchar(20) DEFAULT NULL,
  `shipping_email` varchar(190) DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `shipping_state_id` int(11) DEFAULT NULL,
  `shipping_city_id` int(11) DEFAULT NULL,
  `shipping_pincode` varchar(20) DEFAULT NULL,
  `delivery_instructions` text DEFAULT NULL,
  `payment_method` varchar(30) DEFAULT NULL,
  `created_by_user_id` int(11) DEFAULT NULL,
  `product_id` varchar(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT 0,
  `brand_id` int(11) DEFAULT 0,
  `model_id` int(11) DEFAULT 0,
  `package_id` varchar(11) DEFAULT NULL,
  `package_name` varchar(255) DEFAULT NULL,
  `invoice_date` date DEFAULT NULL,
  `duration` int(11) DEFAULT 0,
  `start_date` date DEFAULT NULL,
  `purchase_price` decimal(10,2) DEFAULT 0.00,
  `buyback_amount` decimal(10,2) DEFAULT 0.00,
  `package_percentage` decimal(10,2) DEFAULT 0.00,
  `package_price` decimal(10,2) DEFAULT 0.00,
  `depreciation_json` longtext DEFAULT NULL,
  `kavach_razorpayOrderId` varchar(255) DEFAULT NULL,
  `order_status` tinyint(1) DEFAULT 1,
  `delivery_date` date DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `c_date` datetime DEFAULT current_timestamp(),
  `u_date` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `order_type` varchar(11) DEFAULT '' COMMENT '1=order,2=order+plan,3=plan',
  `kavach_prefix` varchar(20) DEFAULT NULL,
  `kavach_num` int(11) DEFAULT 0,
  `kavach_mobile` varchar(15) DEFAULT NULL,
  `kavach_payable` decimal(12,2) NOT NULL DEFAULT 0.00,
  `kavach_discount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `kavach_delivery_charges` decimal(12,2) NOT NULL DEFAULT 0.00,
  `kavach_received_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `kavach_remaining_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `kavach_razorpay_payment_id` varchar(100) DEFAULT NULL,
  `kavach_razorpay_signature` varchar(255) DEFAULT NULL,
  `kavach_razorpay_status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=Not Initiated, 1=Pending, 2=Success, 3=Fail',
  `kavach_order_status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 2=Paid, 3=Cancelled'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_order`
--

INSERT INTO `tbl_order` (`kavach_order_id`, `kavach_customer_id`, `product_id`, `category_id`, `brand_id`, `model_id`, `package_id`, `package_name`, `invoice_date`, `duration`, `start_date`, `purchase_price`, `buyback_amount`, `package_percentage`, `package_price`, `depreciation_json`, `kavach_razorpayOrderId`, `order_status`, `is_deleted`, `c_date`, `u_date`, `order_type`, `kavach_prefix`, `kavach_num`, `kavach_mobile`, `kavach_payable`, `kavach_discount`, `kavach_delivery_charges`, `kavach_received_amount`, `kavach_remaining_amount`, `kavach_razorpay_payment_id`, `kavach_razorpay_signature`, `kavach_razorpay_status`, `kavach_order_status`) VALUES
(1, '1', '1', 0, 0, 0, '1', 'test', '2026-09-06', 1, '2026-10-07', 50000.00, 23000.00, 11.00, 1459.00, '[{\"month_number\":\"2\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"3\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"4\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"5\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"6\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"7\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"8\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"9\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"10\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"11\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"12\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"13\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"}]', NULL, 1, 1, '2026-10-07 12:35:58', NULL, '3', NULL, 0, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1),
(2, '1', '1', 0, 0, 0, '1', 'test', '2026-09-06', 1, '2026-10-07', 50000.00, 23000.00, 11.00, 1459.00, '[{\"month_number\":\"2\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"3\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"4\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"5\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"6\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"7\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"8\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"9\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"10\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"11\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"12\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"13\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"}]', NULL, 1, 1, '2026-10-07 12:36:16', NULL, '3', NULL, 0, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1),
(3, '1', '1', 0, 0, 0, '1', 'test', '2026-09-06', 1, '2026-10-07', 50000.00, 23000.00, 11.00, 1459.00, '[{\"month_number\":\"2\",\"monthly_depreciation\":\"1\",\"post_new_model_depreciation\":\"1\",\"total_depreciation_pct\":\"2\",\"depreciation_amount\":\"1000\",\"buyback_amount\":\"49000\",\"package_price\":\"5390\"},{\"month_number\":\"3\",\"monthly_depreciation\":\"2\",\"post_new_model_depreciation\":\"2\",\"total_depreciation_pct\":\"4\",\"depreciation_amount\":\"2000\",\"buyback_amount\":\"48000\",\"package_price\":\"5280\"},{\"month_number\":\"4\",\"monthly_depreciation\":\"3\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"6\",\"depreciation_amount\":\"3000\",\"buyback_amount\":\"47000\",\"package_price\":\"5170\"},{\"month_number\":\"5\",\"monthly_depreciation\":\"4\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"8\",\"depreciation_amount\":\"4000\",\"buyback_amount\":\"46000\",\"package_price\":\"5060\"},{\"month_number\":\"6\",\"monthly_depreciation\":\"5\",\"post_new_model_depreciation\":\"5\",\"total_depreciation_pct\":\"10\",\"depreciation_amount\":\"5000\",\"buyback_amount\":\"45000\",\"package_price\":\"4950\"},{\"month_number\":\"7\",\"monthly_depreciation\":\"6\",\"post_new_model_depreciation\":\"6\",\"total_depreciation_pct\":\"12\",\"depreciation_amount\":\"6000\",\"buyback_amount\":\"44000\",\"package_price\":\"4840\"},{\"month_number\":\"8\",\"monthly_depreciation\":\"7\",\"post_new_model_depreciation\":\"7\",\"total_depreciation_pct\":\"14\",\"depreciation_amount\":\"7000\",\"buyback_amount\":\"43000\",\"package_price\":\"4730\"},{\"month_number\":\"9\",\"monthly_depreciation\":\"8\",\"post_new_model_depreciation\":\"8\",\"total_depreciation_pct\":\"16\",\"depreciation_amount\":\"8000\",\"buyback_amount\":\"42000\",\"package_price\":\"4620\"},{\"month_number\":\"10\",\"monthly_depreciation\":\"9\",\"post_new_model_depreciation\":\"9\",\"total_depreciation_pct\":\"18\",\"depreciation_amount\":\"9000\",\"buyback_amount\":\"41000\",\"package_price\":\"4510\"},{\"month_number\":\"11\",\"monthly_depreciation\":\"10\",\"post_new_model_depreciation\":\"10\",\"total_depreciation_pct\":\"20\",\"depreciation_amount\":\"10000\",\"buyback_amount\":\"40000\",\"package_price\":\"4400\"},{\"month_number\":\"12\",\"monthly_depreciation\":\"11\",\"post_new_model_depreciation\":\"11\",\"total_depreciation_pct\":\"22\",\"depreciation_amount\":\"11000\",\"buyback_amount\":\"39000\",\"package_price\":\"4290\"},{\"month_number\":\"13\",\"monthly_depreciation\":\"12\",\"post_new_model_depreciation\":\"12\",\"total_depreciation_pct\":\"24\",\"depreciation_amount\":\"12000\",\"buyback_amount\":\"38000\",\"package_price\":\"4180\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"13\",\"post_new_model_depreciation\":\"13\",\"total_depreciation_pct\":\"26\",\"depreciation_amount\":\"13000\",\"buyback_amount\":\"37000\",\"package_price\":\"4070\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"14\",\"post_new_model_depreciation\":\"14.95\",\"total_depreciation_pct\":\"28.95\",\"depreciation_amount\":\"14475\",\"buyback_amount\":\"35525\",\"package_price\":\"3907.75\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"15\",\"post_new_model_depreciation\":\"15\",\"total_depreciation_pct\":\"30\",\"depreciation_amount\":\"15000\",\"buyback_amount\":\"35000\",\"package_price\":\"3850\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"16\",\"post_new_model_depreciation\":\"16\",\"total_depreciation_pct\":\"32\",\"depreciation_amount\":\"16000\",\"buyback_amount\":\"34000\",\"package_price\":\"3740\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"17\",\"post_new_model_depreciation\":\"17\",\"total_depreciation_pct\":\"34\",\"depreciation_amount\":\"17000\",\"buyback_amount\":\"33000\",\"package_price\":\"3630\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"18\",\"post_new_model_depreciation\":\"18\",\"total_depreciation_pct\":\"36\",\"depreciation_amount\":\"18000\",\"buyback_amount\":\"32000\",\"package_price\":\"3520\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"19\",\"post_new_model_depreciation\":\"19\",\"total_depreciation_pct\":\"38\",\"depreciation_amount\":\"19000\",\"buyback_amount\":\"31000\",\"package_price\":\"3410\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"20\",\"post_new_model_depreciation\":\"20\",\"total_depreciation_pct\":\"40\",\"depreciation_amount\":\"20000\",\"buyback_amount\":\"30000\",\"package_price\":\"3300\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"21\",\"post_new_model_depreciation\":\"21\",\"total_depreciation_pct\":\"42\",\"depreciation_amount\":\"21000\",\"buyback_amount\":\"29000\",\"package_price\":\"3190\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"22\",\"post_new_model_depreciation\":\"22\",\"total_depreciation_pct\":\"44\",\"depreciation_amount\":\"22000\",\"buyback_amount\":\"28000\",\"package_price\":\"3080\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"23\",\"post_new_model_depreciation\":\"23\",\"total_depreciation_pct\":\"46\",\"depreciation_amount\":\"23000\",\"buyback_amount\":\"27000\",\"package_price\":\"2970\"}]', 'order_TkvjEzJ8u0n2pz', 1, 1, '2026-10-07 12:37:35', '2026-10-07 14:21:23', '3', NULL, 0, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1),
(4, '1', '1', 0, 0, 0, '1', 'test', '2026-09-06', 1, '2026-10-07', 50000.00, 23000.00, 11.00, 1459.00, '[{\"month_number\":\"2\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"3\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"4\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"5\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"6\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"7\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"8\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"9\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"10\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"11\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"12\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"13\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"}]', 'order_Tl1isYiDIa26uf', 1, 1, '2026-10-07 18:29:24', '2026-10-07 18:29:25', '3', NULL, 0, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1),
(5, '1', '1', 0, 0, 0, '1', 'test', '2026-09-06', 1, '2026-10-08', 50000.00, 23000.00, 11.00, 1459.00, '[{\"month_number\":\"2\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"3\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"4\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"5\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"6\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"7\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"8\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"9\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"10\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"11\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"12\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"13\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"}]', 'order_TlMWoN0YmiobwX', 1, 1, '2026-10-08 14:50:32', '2026-10-08 14:50:34', '3', NULL, 0, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1),
(6, '4', '3', 1, 3, 3, '1', 'Platinum', '2025-10-03', 15, '2026-10-08', 121000.00, 99220.00, 12.00, 14520.00, '[{\"month_number\":\"13\",\"monthly_depreciation\":\"13\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"16\",\"depreciation_amount\":\"19360\",\"buyback_amount\":\"101640\",\"package_price\":\"12196.8\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"14\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"17\",\"depreciation_amount\":\"20570\",\"buyback_amount\":\"100430\",\"package_price\":\"12051.6\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"15\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"18\",\"depreciation_amount\":\"21780\",\"buyback_amount\":\"99220\",\"package_price\":\"11906.4\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"16\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"19\",\"depreciation_amount\":\"22990\",\"buyback_amount\":\"98010\",\"package_price\":\"11761.2\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"17\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"20\",\"depreciation_amount\":\"24200\",\"buyback_amount\":\"96800\",\"package_price\":\"11616\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"18\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"21\",\"depreciation_amount\":\"25410\",\"buyback_amount\":\"95590\",\"package_price\":\"11470.8\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"19\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"23\",\"depreciation_amount\":\"27830\",\"buyback_amount\":\"93170\",\"package_price\":\"11180.4\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"20\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"24\",\"depreciation_amount\":\"29040\",\"buyback_amount\":\"91960\",\"package_price\":\"11035.2\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"21\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"25\",\"depreciation_amount\":\"30250\",\"buyback_amount\":\"90750\",\"package_price\":\"10890\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"22\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"26\",\"depreciation_amount\":\"31460\",\"buyback_amount\":\"89540\",\"package_price\":\"10744.8\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"23\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"27\",\"depreciation_amount\":\"32670\",\"buyback_amount\":\"88330\",\"package_price\":\"10599.6\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"24\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"28\",\"depreciation_amount\":\"33880\",\"buyback_amount\":\"87120\",\"package_price\":\"10454.4\"}]', 'order_TlPIOLyIvaT63W', 1, 1, '2026-10-08 17:32:59', '2026-10-08 17:32:59', '3', NULL, 0, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1),
(7, '4', '3', 1, 3, 3, '1', 'Platinum', '2025-10-03', 15, '2026-10-08', 121000.00, 99220.00, 12.00, 14520.00, '[{\"month_number\":\"13\",\"monthly_depreciation\":\"13\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"16\",\"depreciation_amount\":\"19360\",\"buyback_amount\":\"101640\",\"package_price\":\"12196.8\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"14\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"17\",\"depreciation_amount\":\"20570\",\"buyback_amount\":\"100430\",\"package_price\":\"12051.6\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"15\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"18\",\"depreciation_amount\":\"21780\",\"buyback_amount\":\"99220\",\"package_price\":\"11906.4\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"16\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"19\",\"depreciation_amount\":\"22990\",\"buyback_amount\":\"98010\",\"package_price\":\"11761.2\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"17\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"20\",\"depreciation_amount\":\"24200\",\"buyback_amount\":\"96800\",\"package_price\":\"11616\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"18\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"21\",\"depreciation_amount\":\"25410\",\"buyback_amount\":\"95590\",\"package_price\":\"11470.8\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"19\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"23\",\"depreciation_amount\":\"27830\",\"buyback_amount\":\"93170\",\"package_price\":\"11180.4\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"20\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"24\",\"depreciation_amount\":\"29040\",\"buyback_amount\":\"91960\",\"package_price\":\"11035.2\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"21\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"25\",\"depreciation_amount\":\"30250\",\"buyback_amount\":\"90750\",\"package_price\":\"10890\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"22\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"26\",\"depreciation_amount\":\"31460\",\"buyback_amount\":\"89540\",\"package_price\":\"10744.8\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"23\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"27\",\"depreciation_amount\":\"32670\",\"buyback_amount\":\"88330\",\"package_price\":\"10599.6\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"24\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"28\",\"depreciation_amount\":\"33880\",\"buyback_amount\":\"87120\",\"package_price\":\"10454.4\"}]', 'order_TlPJwmSav0nFsl', 1, 1, '2026-10-08 17:34:27', '2026-10-08 17:34:28', '3', NULL, 0, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1),
(8, '4', '3', 1, 3, 3, '3', 'Silver', '2025-10-03', 15, '2026-10-08', 121000.00, 65340.00, 4.00, 4840.00, '[{\"month_number\":\"13\",\"monthly_depreciation\":\"37\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"40\",\"depreciation_amount\":\"48400\",\"buyback_amount\":\"72600\",\"package_price\":\"2904\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"40\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"43\",\"depreciation_amount\":\"52030\",\"buyback_amount\":\"68970\",\"package_price\":\"2758.8\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"43\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"46\",\"depreciation_amount\":\"55660\",\"buyback_amount\":\"65340\",\"package_price\":\"2613.6\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"46\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"49\",\"depreciation_amount\":\"59290\",\"buyback_amount\":\"61710\",\"package_price\":\"2468.4\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"49\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"52\",\"depreciation_amount\":\"62920\",\"buyback_amount\":\"58080\",\"package_price\":\"2323.2\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"52\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"55\",\"depreciation_amount\":\"66550\",\"buyback_amount\":\"54450\",\"package_price\":\"2178\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"55\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"59\",\"depreciation_amount\":\"71390\",\"buyback_amount\":\"49610\",\"package_price\":\"1984.4\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"58\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"62\",\"depreciation_amount\":\"75020\",\"buyback_amount\":\"45980\",\"package_price\":\"1839.2\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"61\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"65\",\"depreciation_amount\":\"78650\",\"buyback_amount\":\"42350\",\"package_price\":\"1694\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"64\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"68\",\"depreciation_amount\":\"82280\",\"buyback_amount\":\"38720\",\"package_price\":\"1548.8\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"67\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"71\",\"depreciation_amount\":\"85910\",\"buyback_amount\":\"35090\",\"package_price\":\"1403.6\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"70\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"74\",\"depreciation_amount\":\"89540\",\"buyback_amount\":\"31460\",\"package_price\":\"1258.4\"}]', 'order_TlPQpLMEraxcQF', 1, 1, '2026-10-08 17:40:58', '2026-10-08 17:40:58', '3', NULL, 0, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1),
(9, '4', '3', 1, 3, 3, '3', 'Silver', '2025-10-03', 15, '2026-10-08', 121000.00, 65340.00, 4.00, 4840.00, '[{\"month_number\":\"13\",\"monthly_depreciation\":\"37\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"40\",\"depreciation_amount\":\"48400\",\"buyback_amount\":\"72600\",\"package_price\":\"2904\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"40\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"43\",\"depreciation_amount\":\"52030\",\"buyback_amount\":\"68970\",\"package_price\":\"2758.8\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"43\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"46\",\"depreciation_amount\":\"55660\",\"buyback_amount\":\"65340\",\"package_price\":\"2613.6\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"46\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"49\",\"depreciation_amount\":\"59290\",\"buyback_amount\":\"61710\",\"package_price\":\"2468.4\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"49\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"52\",\"depreciation_amount\":\"62920\",\"buyback_amount\":\"58080\",\"package_price\":\"2323.2\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"52\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"55\",\"depreciation_amount\":\"66550\",\"buyback_amount\":\"54450\",\"package_price\":\"2178\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"55\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"59\",\"depreciation_amount\":\"71390\",\"buyback_amount\":\"49610\",\"package_price\":\"1984.4\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"58\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"62\",\"depreciation_amount\":\"75020\",\"buyback_amount\":\"45980\",\"package_price\":\"1839.2\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"61\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"65\",\"depreciation_amount\":\"78650\",\"buyback_amount\":\"42350\",\"package_price\":\"1694\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"64\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"68\",\"depreciation_amount\":\"82280\",\"buyback_amount\":\"38720\",\"package_price\":\"1548.8\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"67\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"71\",\"depreciation_amount\":\"85910\",\"buyback_amount\":\"35090\",\"package_price\":\"1403.6\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"70\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"74\",\"depreciation_amount\":\"89540\",\"buyback_amount\":\"31460\",\"package_price\":\"1258.4\"}]', 'order_TlPRMXskS1rufl', 1, 1, '2026-10-08 17:41:28', '2026-10-08 17:41:29', '3', NULL, 0, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1),
(10, '4', '3', 1, 3, 3, '3', 'Silver', '2025-10-03', 15, '2026-10-08', 121000.00, 65340.00, 4.00, 4840.00, '[{\"month_number\":\"13\",\"monthly_depreciation\":\"37\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"40\",\"depreciation_amount\":\"48400\",\"buyback_amount\":\"72600\",\"package_price\":\"2904\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"40\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"43\",\"depreciation_amount\":\"52030\",\"buyback_amount\":\"68970\",\"package_price\":\"2758.8\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"43\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"46\",\"depreciation_amount\":\"55660\",\"buyback_amount\":\"65340\",\"package_price\":\"2613.6\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"46\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"49\",\"depreciation_amount\":\"59290\",\"buyback_amount\":\"61710\",\"package_price\":\"2468.4\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"49\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"52\",\"depreciation_amount\":\"62920\",\"buyback_amount\":\"58080\",\"package_price\":\"2323.2\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"52\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"55\",\"depreciation_amount\":\"66550\",\"buyback_amount\":\"54450\",\"package_price\":\"2178\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"55\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"59\",\"depreciation_amount\":\"71390\",\"buyback_amount\":\"49610\",\"package_price\":\"1984.4\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"58\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"62\",\"depreciation_amount\":\"75020\",\"buyback_amount\":\"45980\",\"package_price\":\"1839.2\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"61\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"65\",\"depreciation_amount\":\"78650\",\"buyback_amount\":\"42350\",\"package_price\":\"1694\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"64\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"68\",\"depreciation_amount\":\"82280\",\"buyback_amount\":\"38720\",\"package_price\":\"1548.8\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"67\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"71\",\"depreciation_amount\":\"85910\",\"buyback_amount\":\"35090\",\"package_price\":\"1403.6\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"70\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"74\",\"depreciation_amount\":\"89540\",\"buyback_amount\":\"31460\",\"package_price\":\"1258.4\"}]', 'order_TlPUQrdilUTXFu', 1, 1, '2026-10-08 17:44:23', '2026-10-08 17:44:23', '3', NULL, 0, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1),
(11, '4', '3', 1, 3, 3, '3', 'Silver', '2025-10-03', 15, '2026-10-08', 121000.00, 65340.00, 4.00, 4840.00, '[{\"month_number\":\"13\",\"monthly_depreciation\":\"37\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"40\",\"depreciation_amount\":\"48400\",\"buyback_amount\":\"72600\",\"package_price\":\"2904\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"40\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"43\",\"depreciation_amount\":\"52030\",\"buyback_amount\":\"68970\",\"package_price\":\"2758.8\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"43\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"46\",\"depreciation_amount\":\"55660\",\"buyback_amount\":\"65340\",\"package_price\":\"2613.6\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"46\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"49\",\"depreciation_amount\":\"59290\",\"buyback_amount\":\"61710\",\"package_price\":\"2468.4\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"49\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"52\",\"depreciation_amount\":\"62920\",\"buyback_amount\":\"58080\",\"package_price\":\"2323.2\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"52\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"55\",\"depreciation_amount\":\"66550\",\"buyback_amount\":\"54450\",\"package_price\":\"2178\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"55\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"59\",\"depreciation_amount\":\"71390\",\"buyback_amount\":\"49610\",\"package_price\":\"1984.4\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"58\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"62\",\"depreciation_amount\":\"75020\",\"buyback_amount\":\"45980\",\"package_price\":\"1839.2\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"61\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"65\",\"depreciation_amount\":\"78650\",\"buyback_amount\":\"42350\",\"package_price\":\"1694\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"64\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"68\",\"depreciation_amount\":\"82280\",\"buyback_amount\":\"38720\",\"package_price\":\"1548.8\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"67\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"71\",\"depreciation_amount\":\"85910\",\"buyback_amount\":\"35090\",\"package_price\":\"1403.6\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"70\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"74\",\"depreciation_amount\":\"89540\",\"buyback_amount\":\"31460\",\"package_price\":\"1258.4\"}]', 'order_TlPbbFK0vPtzd8', 1, 1, '2026-10-08 17:51:10', '2026-10-08 17:51:20', '3', NULL, 0, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, '', '', 3, 3),
(12, '4', '3', 1, 3, 3, '2', 'Gold', '2025-10-03', 22, '2026-10-08', 121000.00, 64130.00, 8.00, 9680.00, '[{\"month_number\":\"13\",\"monthly_depreciation\":\"25\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"28\",\"depreciation_amount\":\"33880\",\"buyback_amount\":\"87120\",\"package_price\":\"6969.6\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"27\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"30\",\"depreciation_amount\":\"36300\",\"buyback_amount\":\"84700\",\"package_price\":\"6776\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"29\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"32\",\"depreciation_amount\":\"38720\",\"buyback_amount\":\"82280\",\"package_price\":\"6582.4\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"31\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"34\",\"depreciation_amount\":\"41140\",\"buyback_amount\":\"79860\",\"package_price\":\"6388.8\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"33\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"36\",\"depreciation_amount\":\"43560\",\"buyback_amount\":\"77440\",\"package_price\":\"6195.2\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"35\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"38\",\"depreciation_amount\":\"45980\",\"buyback_amount\":\"75020\",\"package_price\":\"6001.6\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"37\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"41\",\"depreciation_amount\":\"49610\",\"buyback_amount\":\"71390\",\"package_price\":\"5711.2\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"39\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"43\",\"depreciation_amount\":\"52030\",\"buyback_amount\":\"68970\",\"package_price\":\"5517.6\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"41\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"45\",\"depreciation_amount\":\"54450\",\"buyback_amount\":\"66550\",\"package_price\":\"5324\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"43\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"47\",\"depreciation_amount\":\"56870\",\"buyback_amount\":\"64130\",\"package_price\":\"5130.4\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"45\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"49\",\"depreciation_amount\":\"59290\",\"buyback_amount\":\"61710\",\"package_price\":\"4936.8\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"48\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"52\",\"depreciation_amount\":\"62920\",\"buyback_amount\":\"58080\",\"package_price\":\"4646.4\"}]', 'order_TlPc5xfUf5cP4n', 1, 1, '2026-10-08 17:51:38', '2026-10-08 17:52:12', '3', NULL, 0, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'pay_TlPcPu6uTyXxtU', 'cc5dec295486efc1a36abf537bd50a79f3ba86423066184004d7a45734349553', 2, 2);
INSERT INTO `tbl_order` (`kavach_order_id`, `kavach_customer_id`, `product_id`, `category_id`, `brand_id`, `model_id`, `package_id`, `package_name`, `invoice_date`, `duration`, `start_date`, `purchase_price`, `buyback_amount`, `package_percentage`, `package_price`, `depreciation_json`, `kavach_razorpayOrderId`, `order_status`, `is_deleted`, `c_date`, `u_date`, `order_type`, `kavach_prefix`, `kavach_num`, `kavach_mobile`, `kavach_payable`, `kavach_discount`, `kavach_delivery_charges`, `kavach_received_amount`, `kavach_remaining_amount`, `kavach_razorpay_payment_id`, `kavach_razorpay_signature`, `kavach_razorpay_status`, `kavach_order_status`) VALUES
(13, '4', '60', 0, 3, 0, '1', 'Platinum', '2026-10-12', 13, '2026-10-12', 337888.00, 329000.00, 12.00, 39480.00, '[{\"product_id\":\"60\",\"package_id\":\"0\",\"duration\":\"0\",\"depreciation_json\":[]},{\"product_id\":\"58\",\"package_id\":\"1\",\"duration\":\"13\",\"depreciation_json\":[{\"month_number\":\"1\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"2\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"3\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"4\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"5\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"6\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"7\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"8\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"9\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"10\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"11\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"12\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"13\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"}]}]', 'order_Tmzkj3nz3B0Pqu', 1, 1, '2026-10-12 17:51:46', '2026-10-12 17:51:46', '3', NULL, 0, NULL, 377368.00, 0.00, 0.00, 0.00, 377368.00, NULL, NULL, 0, 1),
(14, '4', '60', 0, 3, 0, '1', 'Platinum', '2026-10-12', 13, '2026-10-12', 337888.00, 329000.00, 12.00, 39480.00, '[{\"product_id\":\"60\",\"package_id\":\"0\",\"duration\":\"0\",\"depreciation_json\":[]},{\"product_id\":\"58\",\"package_id\":\"1\",\"duration\":\"13\",\"depreciation_json\":[{\"month_number\":\"1\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"2\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"3\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"4\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"5\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"6\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"7\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"8\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"9\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"10\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"11\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"12\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"13\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"}]}]', 'order_Tmzs6fWXNaPWHO', 2, 1, '2026-10-12 17:58:45', '2026-10-12 17:59:59', '3', NULL, 0, NULL, 377368.00, 0.00, 0.00, 377368.00, 0.00, 'pay_TmzsQM9GWRAMzF', 'd98e2ce9ea741093b5f6d556853331cf1cdc85485258588e9d14e7aefa4e6897', 2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_order_detail`
--

CREATE TABLE `tbl_order_detail` (
  `kavach_order_detail_id` int(11) NOT NULL,
  `kavach_order_id` int(11) NOT NULL,
  `kavach_customer_id` int(11) DEFAULT NULL,
  `created_by_user_id` int(11) DEFAULT NULL,
  `product_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT 0,
  `brand_id` int(11) DEFAULT 0,
  `model_id` int(11) DEFAULT 0,
  `package_id` int(11) NOT NULL,
  `package_name` varchar(255) DEFAULT NULL,
  `invoice_date` date DEFAULT NULL,
  `duration` int(11) DEFAULT 0,
  `expiry_date` date DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `purchase_price` decimal(10,2) DEFAULT 0.00,
  `imei_number` varchar(50) DEFAULT NULL,
  `invoice_number` varchar(100) DEFAULT NULL,
  `invoice_file` varchar(255) DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `buyback_amount` decimal(10,2) DEFAULT 0.00,
  `package_percentage` decimal(10,2) DEFAULT 0.00,
  `package_price` decimal(10,2) DEFAULT 0.00,
  `depreciation_json` longtext DEFAULT NULL,
  `kavach_razorpayOrderId` varchar(100) DEFAULT NULL,
  `order_status` tinyint(1) DEFAULT 1,
  `is_deleted` tinyint(1) DEFAULT 0,
  `c_date` datetime DEFAULT current_timestamp(),
  `u_date` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `mobile_purches` int(11) DEFAULT 2 COMMENT '1 yes 2 no'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_order_detail`
--

INSERT INTO `tbl_order_detail` (`kavach_order_detail_id`, `kavach_order_id`, `kavach_customer_id`, `product_id`, `category_id`, `brand_id`, `model_id`, `package_id`, `package_name`, `invoice_date`, `duration`, `expiry_date`, `start_date`, `purchase_price`, `imei_number`, `invoice_number`, `invoice_file`, `serial_number`, `remarks`, `buyback_amount`, `package_percentage`, `package_price`, `depreciation_json`, `kavach_razorpayOrderId`, `order_status`, `is_deleted`, `c_date`, `u_date`, `mobile_purches`) VALUES
(1, 3, 1, 1, 0, 0, 0, 1, 'test', '2026-09-06', 1, '2026-10-06', '2026-10-07', 50000.00, 'TESTT', 'INV/0102/56566', 'INV_1791356855_1979.jpg', 'SERIALNO', 'REMAKRS DONE', 23000.00, 11.00, 1459.00, '[{\"month_number\":\"2\",\"monthly_depreciation\":\"1\",\"post_new_model_depreciation\":\"1\",\"total_depreciation_pct\":\"2\",\"depreciation_amount\":\"1000\",\"buyback_amount\":\"49000\",\"package_price\":\"5390\"},{\"month_number\":\"3\",\"monthly_depreciation\":\"2\",\"post_new_model_depreciation\":\"2\",\"total_depreciation_pct\":\"4\",\"depreciation_amount\":\"2000\",\"buyback_amount\":\"48000\",\"package_price\":\"5280\"},{\"month_number\":\"4\",\"monthly_depreciation\":\"3\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"6\",\"depreciation_amount\":\"3000\",\"buyback_amount\":\"47000\",\"package_price\":\"5170\"},{\"month_number\":\"5\",\"monthly_depreciation\":\"4\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"8\",\"depreciation_amount\":\"4000\",\"buyback_amount\":\"46000\",\"package_price\":\"5060\"},{\"month_number\":\"6\",\"monthly_depreciation\":\"5\",\"post_new_model_depreciation\":\"5\",\"total_depreciation_pct\":\"10\",\"depreciation_amount\":\"5000\",\"buyback_amount\":\"45000\",\"package_price\":\"4950\"},{\"month_number\":\"7\",\"monthly_depreciation\":\"6\",\"post_new_model_depreciation\":\"6\",\"total_depreciation_pct\":\"12\",\"depreciation_amount\":\"6000\",\"buyback_amount\":\"44000\",\"package_price\":\"4840\"},{\"month_number\":\"8\",\"monthly_depreciation\":\"7\",\"post_new_model_depreciation\":\"7\",\"total_depreciation_pct\":\"14\",\"depreciation_amount\":\"7000\",\"buyback_amount\":\"43000\",\"package_price\":\"4730\"},{\"month_number\":\"9\",\"monthly_depreciation\":\"8\",\"post_new_model_depreciation\":\"8\",\"total_depreciation_pct\":\"16\",\"depreciation_amount\":\"8000\",\"buyback_amount\":\"42000\",\"package_price\":\"4620\"},{\"month_number\":\"10\",\"monthly_depreciation\":\"9\",\"post_new_model_depreciation\":\"9\",\"total_depreciation_pct\":\"18\",\"depreciation_amount\":\"9000\",\"buyback_amount\":\"41000\",\"package_price\":\"4510\"},{\"month_number\":\"11\",\"monthly_depreciation\":\"10\",\"post_new_model_depreciation\":\"10\",\"total_depreciation_pct\":\"20\",\"depreciation_amount\":\"10000\",\"buyback_amount\":\"40000\",\"package_price\":\"4400\"},{\"month_number\":\"12\",\"monthly_depreciation\":\"11\",\"post_new_model_depreciation\":\"11\",\"total_depreciation_pct\":\"22\",\"depreciation_amount\":\"11000\",\"buyback_amount\":\"39000\",\"package_price\":\"4290\"},{\"month_number\":\"13\",\"monthly_depreciation\":\"12\",\"post_new_model_depreciation\":\"12\",\"total_depreciation_pct\":\"24\",\"depreciation_amount\":\"12000\",\"buyback_amount\":\"38000\",\"package_price\":\"4180\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"13\",\"post_new_model_depreciation\":\"13\",\"total_depreciation_pct\":\"26\",\"depreciation_amount\":\"13000\",\"buyback_amount\":\"37000\",\"package_price\":\"4070\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"14\",\"post_new_model_depreciation\":\"14.95\",\"total_depreciation_pct\":\"28.95\",\"depreciation_amount\":\"14475\",\"buyback_amount\":\"35525\",\"package_price\":\"3907.75\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"15\",\"post_new_model_depreciation\":\"15\",\"total_depreciation_pct\":\"30\",\"depreciation_amount\":\"15000\",\"buyback_amount\":\"35000\",\"package_price\":\"3850\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"16\",\"post_new_model_depreciation\":\"16\",\"total_depreciation_pct\":\"32\",\"depreciation_amount\":\"16000\",\"buyback_amount\":\"34000\",\"package_price\":\"3740\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"17\",\"post_new_model_depreciation\":\"17\",\"total_depreciation_pct\":\"34\",\"depreciation_amount\":\"17000\",\"buyback_amount\":\"33000\",\"package_price\":\"3630\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"18\",\"post_new_model_depreciation\":\"18\",\"total_depreciation_pct\":\"36\",\"depreciation_amount\":\"18000\",\"buyback_amount\":\"32000\",\"package_price\":\"3520\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"19\",\"post_new_model_depreciation\":\"19\",\"total_depreciation_pct\":\"38\",\"depreciation_amount\":\"19000\",\"buyback_amount\":\"31000\",\"package_price\":\"3410\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"20\",\"post_new_model_depreciation\":\"20\",\"total_depreciation_pct\":\"40\",\"depreciation_amount\":\"20000\",\"buyback_amount\":\"30000\",\"package_price\":\"3300\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"21\",\"post_new_model_depreciation\":\"21\",\"total_depreciation_pct\":\"42\",\"depreciation_amount\":\"21000\",\"buyback_amount\":\"29000\",\"package_price\":\"3190\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"22\",\"post_new_model_depreciation\":\"22\",\"total_depreciation_pct\":\"44\",\"depreciation_amount\":\"22000\",\"buyback_amount\":\"28000\",\"package_price\":\"3080\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"23\",\"post_new_model_depreciation\":\"23\",\"total_depreciation_pct\":\"46\",\"depreciation_amount\":\"23000\",\"buyback_amount\":\"27000\",\"package_price\":\"2970\"}]', 'order_TkvjEzJ8u0n2pz', 1, 1, '2026-10-07 12:37:35', '2026-10-07 14:21:23', 2),
(2, 4, 1, 1, 0, 0, 0, 1, 'test', '2026-09-06', 1, '2026-10-06', '2026-10-07', 50000.00, 'TESTT', 'INV/0102/56566', 'INV_1791377964_9446.jpg', 'SERIALNO', 'REMAKRS DONE', 23000.00, 11.00, 1459.00, '[{\"month_number\":\"2\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"3\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"4\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"5\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"6\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"7\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"8\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"9\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"10\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"11\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"12\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"13\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"}]', 'order_Tl1isYiDIa26uf', 1, 1, '2026-10-07 18:29:24', '2026-10-07 18:29:25', 2),
(3, 5, 1, 1, 0, 0, 0, 1, 'test', '2026-09-06', 1, '2026-10-06', '2026-10-08', 50000.00, 'TESTT', 'INV/0102/56566', 'INV_1791451232_9345.jpg', 'SERIALNO', 'REMAKRS DONE', 23000.00, 11.00, 1459.00, '[{\"month_number\":\"2\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"3\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"4\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"5\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"6\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"7\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"8\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"9\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"10\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"11\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"12\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"13\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"50000\",\"package_price\":\"5500\"}]', 'order_TlMWoN0YmiobwX', 1, 1, '2026-10-08 14:50:32', '2026-10-08 14:50:34', 2),
(4, 6, 4, 3, 1, 3, 3, 1, 'Platinum', '2025-10-03', 15, '2027-01-03', '2026-10-08', 121000.00, '354416437522444', 'SIL/P/S64/2670', 'INV_1791460979_8006.jpg', '', '', 99220.00, 12.00, 14520.00, '[{\"month_number\":\"13\",\"monthly_depreciation\":\"13\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"16\",\"depreciation_amount\":\"19360\",\"buyback_amount\":\"101640\",\"package_price\":\"12196.8\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"14\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"17\",\"depreciation_amount\":\"20570\",\"buyback_amount\":\"100430\",\"package_price\":\"12051.6\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"15\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"18\",\"depreciation_amount\":\"21780\",\"buyback_amount\":\"99220\",\"package_price\":\"11906.4\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"16\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"19\",\"depreciation_amount\":\"22990\",\"buyback_amount\":\"98010\",\"package_price\":\"11761.2\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"17\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"20\",\"depreciation_amount\":\"24200\",\"buyback_amount\":\"96800\",\"package_price\":\"11616\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"18\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"21\",\"depreciation_amount\":\"25410\",\"buyback_amount\":\"95590\",\"package_price\":\"11470.8\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"19\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"23\",\"depreciation_amount\":\"27830\",\"buyback_amount\":\"93170\",\"package_price\":\"11180.4\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"20\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"24\",\"depreciation_amount\":\"29040\",\"buyback_amount\":\"91960\",\"package_price\":\"11035.2\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"21\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"25\",\"depreciation_amount\":\"30250\",\"buyback_amount\":\"90750\",\"package_price\":\"10890\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"22\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"26\",\"depreciation_amount\":\"31460\",\"buyback_amount\":\"89540\",\"package_price\":\"10744.8\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"23\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"27\",\"depreciation_amount\":\"32670\",\"buyback_amount\":\"88330\",\"package_price\":\"10599.6\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"24\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"28\",\"depreciation_amount\":\"33880\",\"buyback_amount\":\"87120\",\"package_price\":\"10454.4\"}]', 'order_TlPIOLyIvaT63W', 1, 1, '2026-10-08 17:32:59', '2026-10-08 17:32:59', 2),
(5, 7, 4, 3, 1, 3, 3, 1, 'Platinum', '2025-10-03', 15, '2027-01-03', '2026-10-08', 121000.00, '354416437522444', 'SIL/P/S64/2670', 'INV_1791461067_3059.jpg', '', '', 99220.00, 12.00, 14520.00, '[{\"month_number\":\"13\",\"monthly_depreciation\":\"13\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"16\",\"depreciation_amount\":\"19360\",\"buyback_amount\":\"101640\",\"package_price\":\"12196.8\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"14\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"17\",\"depreciation_amount\":\"20570\",\"buyback_amount\":\"100430\",\"package_price\":\"12051.6\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"15\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"18\",\"depreciation_amount\":\"21780\",\"buyback_amount\":\"99220\",\"package_price\":\"11906.4\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"16\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"19\",\"depreciation_amount\":\"22990\",\"buyback_amount\":\"98010\",\"package_price\":\"11761.2\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"17\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"20\",\"depreciation_amount\":\"24200\",\"buyback_amount\":\"96800\",\"package_price\":\"11616\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"18\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"21\",\"depreciation_amount\":\"25410\",\"buyback_amount\":\"95590\",\"package_price\":\"11470.8\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"19\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"23\",\"depreciation_amount\":\"27830\",\"buyback_amount\":\"93170\",\"package_price\":\"11180.4\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"20\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"24\",\"depreciation_amount\":\"29040\",\"buyback_amount\":\"91960\",\"package_price\":\"11035.2\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"21\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"25\",\"depreciation_amount\":\"30250\",\"buyback_amount\":\"90750\",\"package_price\":\"10890\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"22\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"26\",\"depreciation_amount\":\"31460\",\"buyback_amount\":\"89540\",\"package_price\":\"10744.8\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"23\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"27\",\"depreciation_amount\":\"32670\",\"buyback_amount\":\"88330\",\"package_price\":\"10599.6\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"24\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"28\",\"depreciation_amount\":\"33880\",\"buyback_amount\":\"87120\",\"package_price\":\"10454.4\"}]', 'order_TlPJwmSav0nFsl', 1, 1, '2026-10-08 17:34:27', '2026-10-08 17:34:28', 2),
(6, 8, 4, 3, 1, 3, 3, 3, 'Silver', '2025-10-03', 15, '2027-01-03', '2026-10-08', 121000.00, '354416437522444', 'SIL/P/S64/2670', 'INV_1791461458_8655.jpg', '', '', 65340.00, 4.00, 4840.00, '[{\"month_number\":\"13\",\"monthly_depreciation\":\"37\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"40\",\"depreciation_amount\":\"48400\",\"buyback_amount\":\"72600\",\"package_price\":\"2904\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"40\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"43\",\"depreciation_amount\":\"52030\",\"buyback_amount\":\"68970\",\"package_price\":\"2758.8\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"43\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"46\",\"depreciation_amount\":\"55660\",\"buyback_amount\":\"65340\",\"package_price\":\"2613.6\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"46\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"49\",\"depreciation_amount\":\"59290\",\"buyback_amount\":\"61710\",\"package_price\":\"2468.4\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"49\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"52\",\"depreciation_amount\":\"62920\",\"buyback_amount\":\"58080\",\"package_price\":\"2323.2\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"52\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"55\",\"depreciation_amount\":\"66550\",\"buyback_amount\":\"54450\",\"package_price\":\"2178\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"55\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"59\",\"depreciation_amount\":\"71390\",\"buyback_amount\":\"49610\",\"package_price\":\"1984.4\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"58\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"62\",\"depreciation_amount\":\"75020\",\"buyback_amount\":\"45980\",\"package_price\":\"1839.2\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"61\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"65\",\"depreciation_amount\":\"78650\",\"buyback_amount\":\"42350\",\"package_price\":\"1694\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"64\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"68\",\"depreciation_amount\":\"82280\",\"buyback_amount\":\"38720\",\"package_price\":\"1548.8\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"67\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"71\",\"depreciation_amount\":\"85910\",\"buyback_amount\":\"35090\",\"package_price\":\"1403.6\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"70\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"74\",\"depreciation_amount\":\"89540\",\"buyback_amount\":\"31460\",\"package_price\":\"1258.4\"}]', 'order_TlPQpLMEraxcQF', 1, 1, '2026-10-08 17:40:58', '2026-10-08 17:40:58', 2),
(7, 9, 4, 3, 1, 3, 3, 3, 'Silver', '2025-10-03', 15, '2027-01-03', '2026-10-08', 121000.00, '354416437522444', 'SIL/P/S64/2670', 'INV_1791461488_7371.jpg', '', '', 65340.00, 4.00, 4840.00, '[{\"month_number\":\"13\",\"monthly_depreciation\":\"37\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"40\",\"depreciation_amount\":\"48400\",\"buyback_amount\":\"72600\",\"package_price\":\"2904\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"40\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"43\",\"depreciation_amount\":\"52030\",\"buyback_amount\":\"68970\",\"package_price\":\"2758.8\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"43\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"46\",\"depreciation_amount\":\"55660\",\"buyback_amount\":\"65340\",\"package_price\":\"2613.6\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"46\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"49\",\"depreciation_amount\":\"59290\",\"buyback_amount\":\"61710\",\"package_price\":\"2468.4\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"49\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"52\",\"depreciation_amount\":\"62920\",\"buyback_amount\":\"58080\",\"package_price\":\"2323.2\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"52\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"55\",\"depreciation_amount\":\"66550\",\"buyback_amount\":\"54450\",\"package_price\":\"2178\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"55\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"59\",\"depreciation_amount\":\"71390\",\"buyback_amount\":\"49610\",\"package_price\":\"1984.4\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"58\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"62\",\"depreciation_amount\":\"75020\",\"buyback_amount\":\"45980\",\"package_price\":\"1839.2\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"61\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"65\",\"depreciation_amount\":\"78650\",\"buyback_amount\":\"42350\",\"package_price\":\"1694\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"64\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"68\",\"depreciation_amount\":\"82280\",\"buyback_amount\":\"38720\",\"package_price\":\"1548.8\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"67\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"71\",\"depreciation_amount\":\"85910\",\"buyback_amount\":\"35090\",\"package_price\":\"1403.6\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"70\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"74\",\"depreciation_amount\":\"89540\",\"buyback_amount\":\"31460\",\"package_price\":\"1258.4\"}]', 'order_TlPRMXskS1rufl', 1, 1, '2026-10-08 17:41:28', '2026-10-08 17:41:29', 2),
(8, 10, 4, 3, 1, 3, 3, 3, 'Silver', '2025-10-03', 15, '2027-01-03', '2026-10-08', 121000.00, '354416437522444', 'SIL/P/S64/2670', 'INV_1791461663_9228.jpg', '', '', 65340.00, 4.00, 4840.00, '[{\"month_number\":\"13\",\"monthly_depreciation\":\"37\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"40\",\"depreciation_amount\":\"48400\",\"buyback_amount\":\"72600\",\"package_price\":\"2904\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"40\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"43\",\"depreciation_amount\":\"52030\",\"buyback_amount\":\"68970\",\"package_price\":\"2758.8\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"43\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"46\",\"depreciation_amount\":\"55660\",\"buyback_amount\":\"65340\",\"package_price\":\"2613.6\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"46\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"49\",\"depreciation_amount\":\"59290\",\"buyback_amount\":\"61710\",\"package_price\":\"2468.4\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"49\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"52\",\"depreciation_amount\":\"62920\",\"buyback_amount\":\"58080\",\"package_price\":\"2323.2\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"52\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"55\",\"depreciation_amount\":\"66550\",\"buyback_amount\":\"54450\",\"package_price\":\"2178\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"55\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"59\",\"depreciation_amount\":\"71390\",\"buyback_amount\":\"49610\",\"package_price\":\"1984.4\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"58\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"62\",\"depreciation_amount\":\"75020\",\"buyback_amount\":\"45980\",\"package_price\":\"1839.2\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"61\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"65\",\"depreciation_amount\":\"78650\",\"buyback_amount\":\"42350\",\"package_price\":\"1694\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"64\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"68\",\"depreciation_amount\":\"82280\",\"buyback_amount\":\"38720\",\"package_price\":\"1548.8\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"67\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"71\",\"depreciation_amount\":\"85910\",\"buyback_amount\":\"35090\",\"package_price\":\"1403.6\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"70\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"74\",\"depreciation_amount\":\"89540\",\"buyback_amount\":\"31460\",\"package_price\":\"1258.4\"}]', 'order_TlPUQrdilUTXFu', 1, 1, '2026-10-08 17:44:23', '2026-10-08 17:44:23', 2),
(9, 11, 4, 3, 1, 3, 3, 3, 'Silver', '2025-10-03', 15, '2027-01-03', '2026-10-08', 121000.00, '354416437522444', 'SIL/P/S64/2670', 'INV_1791462070_4505.jpg', '', '', 65340.00, 4.00, 4840.00, '[{\"month_number\":\"13\",\"monthly_depreciation\":\"37\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"40\",\"depreciation_amount\":\"48400\",\"buyback_amount\":\"72600\",\"package_price\":\"2904\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"40\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"43\",\"depreciation_amount\":\"52030\",\"buyback_amount\":\"68970\",\"package_price\":\"2758.8\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"43\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"46\",\"depreciation_amount\":\"55660\",\"buyback_amount\":\"65340\",\"package_price\":\"2613.6\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"46\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"49\",\"depreciation_amount\":\"59290\",\"buyback_amount\":\"61710\",\"package_price\":\"2468.4\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"49\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"52\",\"depreciation_amount\":\"62920\",\"buyback_amount\":\"58080\",\"package_price\":\"2323.2\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"52\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"55\",\"depreciation_amount\":\"66550\",\"buyback_amount\":\"54450\",\"package_price\":\"2178\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"55\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"59\",\"depreciation_amount\":\"71390\",\"buyback_amount\":\"49610\",\"package_price\":\"1984.4\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"58\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"62\",\"depreciation_amount\":\"75020\",\"buyback_amount\":\"45980\",\"package_price\":\"1839.2\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"61\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"65\",\"depreciation_amount\":\"78650\",\"buyback_amount\":\"42350\",\"package_price\":\"1694\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"64\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"68\",\"depreciation_amount\":\"82280\",\"buyback_amount\":\"38720\",\"package_price\":\"1548.8\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"67\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"71\",\"depreciation_amount\":\"85910\",\"buyback_amount\":\"35090\",\"package_price\":\"1403.6\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"70\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"74\",\"depreciation_amount\":\"89540\",\"buyback_amount\":\"31460\",\"package_price\":\"1258.4\"}]', 'order_TlPbbFK0vPtzd8', 1, 1, '2026-10-08 17:51:10', '2026-10-08 17:51:10', 2),
(10, 12, 4, 3, 1, 3, 3, 2, 'Gold', '2025-10-03', 22, '2027-08-03', '2026-10-08', 121000.00, '354416437522444', 'SIL/P/S64/2670', 'INV_1791462098_8019.jpg', '', '', 64130.00, 8.00, 9680.00, '[{\"month_number\":\"13\",\"monthly_depreciation\":\"25\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"28\",\"depreciation_amount\":\"33880\",\"buyback_amount\":\"87120\",\"package_price\":\"6969.6\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"27\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"30\",\"depreciation_amount\":\"36300\",\"buyback_amount\":\"84700\",\"package_price\":\"6776\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"29\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"32\",\"depreciation_amount\":\"38720\",\"buyback_amount\":\"82280\",\"package_price\":\"6582.4\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"31\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"34\",\"depreciation_amount\":\"41140\",\"buyback_amount\":\"79860\",\"package_price\":\"6388.8\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"33\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"36\",\"depreciation_amount\":\"43560\",\"buyback_amount\":\"77440\",\"package_price\":\"6195.2\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"35\",\"post_new_model_depreciation\":\"3\",\"total_depreciation_pct\":\"38\",\"depreciation_amount\":\"45980\",\"buyback_amount\":\"75020\",\"package_price\":\"6001.6\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"37\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"41\",\"depreciation_amount\":\"49610\",\"buyback_amount\":\"71390\",\"package_price\":\"5711.2\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"39\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"43\",\"depreciation_amount\":\"52030\",\"buyback_amount\":\"68970\",\"package_price\":\"5517.6\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"41\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"45\",\"depreciation_amount\":\"54450\",\"buyback_amount\":\"66550\",\"package_price\":\"5324\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"43\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"47\",\"depreciation_amount\":\"56870\",\"buyback_amount\":\"64130\",\"package_price\":\"5130.4\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"45\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"49\",\"depreciation_amount\":\"59290\",\"buyback_amount\":\"61710\",\"package_price\":\"4936.8\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"48\",\"post_new_model_depreciation\":\"4\",\"total_depreciation_pct\":\"52\",\"depreciation_amount\":\"62920\",\"buyback_amount\":\"58080\",\"package_price\":\"4646.4\"}]', 'order_TlPc5xfUf5cP4n', 1, 1, '2026-10-08 17:51:38', '2026-10-08 17:51:38', 2),
(11, 13, 4, 60, 0, 3, 0, 0, '', '2026-10-12', 0, '2026-10-12', '2026-10-12', 8888.00, '', '', '', '', '', 0.00, 0.00, 0.00, '[]', 'order_Tmzkj3nz3B0Pqu', 1, 1, '2026-10-12 17:51:46', '2026-10-12 17:51:46', 2),
(12, 13, 4, 58, 1, 3, 3, 1, 'Platinum', '2026-10-12', 13, '2027-11-12', '2026-10-12', 329000.00, '', '', '', '', '', 329000.00, 12.00, 39480.00, '[{\"month_number\":\"1\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"2\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"3\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"4\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"5\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"6\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"7\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"8\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"9\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"10\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"11\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"12\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"13\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"}]', 'order_Tmzkj3nz3B0Pqu', 1, 1, '2026-10-12 17:51:46', '2026-10-12 17:51:46', 2),
(13, 14, 4, 60, 0, 3, 0, 0, '', '2026-10-12', 0, '2026-10-12', '2026-10-12', 8888.00, '', '', '', '', '', 0.00, 0.00, 0.00, '[]', 'order_Tmzs6fWXNaPWHO', 2, 1, '2026-10-12 17:58:45', '2026-10-12 17:59:59', 2),
(14, 14, 4, 58, 1, 3, 3, 1, 'Platinum', '2026-10-12', 13, '2027-11-12', '2026-10-12', 329000.00, '', '', '', '', '', 329000.00, 12.00, 39480.00, '[{\"month_number\":\"1\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"2\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"3\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"4\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"5\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"6\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"7\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"8\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"9\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"10\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"11\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"12\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"13\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"14\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"15\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"16\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"17\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"18\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"19\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"20\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"21\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"22\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"23\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"},{\"month_number\":\"24\",\"monthly_depreciation\":\"0\",\"post_new_model_depreciation\":\"0\",\"total_depreciation_pct\":\"0\",\"depreciation_amount\":\"0\",\"buyback_amount\":\"329000\",\"package_price\":\"39480\"}]', 'order_Tmzs6fWXNaPWHO', 2, 1, '2026-10-12 17:58:45', '2026-10-12 17:59:59', 2);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_package`
--

CREATE TABLE `tbl_package` (
  `package_id` int(11) NOT NULL,
  `package_name` varchar(255) NOT NULL,
  `package_percentage` varchar(11) NOT NULL,
  `package_description` text NOT NULL,
  `package_image` varchar(255) NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 1,
  `c_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_package`
--

INSERT INTO `tbl_package` (`package_id`, `package_name`, `package_percentage`, `package_description`, `package_image`, `is_deleted`, `c_date`) VALUES
(1, 'Platinum', '12', '<p><br>Get the highest level of value protection with our Platinum Plan, featuring a premium assured buyback price for your mobile. Designed for customers looking for maximum resale assurance, the Platinum Plan offers enhanced buyback benefits and greater value retention, subject to the applicable terms and conditions.</p>', '1791190422_pl.jpg', 1, '2026-09-30 17:09:16'),
(2, 'Gold', '8', '<p>Enjoy a higher assured buyback value for your mobile with the Gold Plan. This plan is designed to provide greater value protection and enhanced resale benefits, ensuring that you receive an assured buyback price at the end of the applicable period, subject to the plan terms and conditions.</p>', '1791190428_gold.jpg', 1, '2026-09-30 17:09:36'),
(3, 'Silver', '4', '<p>Purchase your mobile with the assurance of a guaranteed buyback price. The Silver Plan provides a secure and convenient way to protect the future value of your mobile, giving you an assured resale value as per the applicable terms and conditions.</p>', '1791190432_sil.jpg', 1, '2026-09-30 17:09:52');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_partner`
--

CREATE TABLE `tbl_partner` (
  `partner_id` int(10) UNSIGNED NOT NULL,
  `partner_name` varchar(150) NOT NULL,
  `partner_image` varchar(255) DEFAULT NULL,
  `partner_url` varchar(500) DEFAULT NULL,
  `partner_priority` int(11) NOT NULL DEFAULT 0,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1 = active, 0 = hidden',
  `c_date` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_partner`
--

INSERT INTO `tbl_partner` (`partner_id`, `partner_name`, `partner_image`, `partner_url`, `partner_priority`, `is_deleted`, `c_date`) VALUES
(1, 'HDFC', 'partner-1792063531496.avif', NULL, 22, 1, '2026-10-15 16:55:31'),
(2, 'iphone', 'partner-1792063545145.svg', NULL, 33, 1, '2026-10-15 16:55:45'),
(3, 'paub', 'partner-1792063614225.avif', NULL, 899, 1, '2026-10-15 16:56:54'),
(4, 'insta', 'partner-1792063768898.avif', NULL, 3, 1, '2026-10-15 16:59:28'),
(5, 'lazpay', 'partner-1792063778766.avif', NULL, 323, 1, '2026-10-15 16:59:38'),
(6, 'kosh', 'partner-1792063787138.avif', NULL, 2, 1, '2026-10-15 16:59:47'),
(7, 'razorpay', 'partner-1792063798397.avif', NULL, 23, 1, '2026-10-15 16:59:58');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_product`
--

CREATE TABLE `tbl_product` (
  `product_id` int(11) NOT NULL,
  `is_duplicated` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1=Created via duplicate action',
  `product_variant` varchar(255) NOT NULL,
  `short_description` text DEFAULT NULL,
  `long_description` longtext DEFAULT NULL,
  `product_image` varchar(255) DEFAULT NULL,
  `product_images` text DEFAULT NULL,
  `cgst` decimal(10,2) NOT NULL DEFAULT 0.00,
  `sgst` decimal(10,2) NOT NULL DEFAULT 0.00,
  `is_exclusive_tax` tinyint(1) NOT NULL DEFAULT 0,
  `base_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `mrp` decimal(12,2) NOT NULL DEFAULT 0.00,
  `retailer_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `wholesaler_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `hsn_code` varchar(50) DEFAULT NULL,
  `product_sku` varchar(100) DEFAULT NULL,
  `priority` int(11) NOT NULL DEFAULT 0,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `launch_date` date NOT NULL,
  `original_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `category_id` varchar(11) DEFAULT NULL,
  `brand_id` varchar(11) DEFAULT NULL,
  `model_id` varchar(11) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 2=Deleted',
  `customer_id` varchar(11) DEFAULT NULL,
  `c_date` datetime NOT NULL,
  `reference_id` varchar(11) DEFAULT NULL,
  `product_type` varchar(11) NOT NULL DEFAULT '1' COMMENT '1=for kavach,2=mobile,3=other',
  `vendor_offer` text DEFAULT NULL,
  `package_product_id` varchar(255) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_product`
--

INSERT INTO `tbl_product` (`product_id`, `is_duplicated`, `product_variant`, `short_description`, `long_description`, `product_image`, `product_images`, `cgst`, `sgst`, `is_exclusive_tax`, `base_price`, `mrp`, `retailer_price`, `wholesaler_price`, `hsn_code`, `product_sku`, `priority`, `status`, `launch_date`, `original_price`, `category_id`, `brand_id`, `model_id`, `is_deleted`, `customer_id`, `c_date`, `reference_id`, `product_type`, `vendor_offer`, `package_product_id`) VALUES
(1, 0, '256GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2024-09-11', 79999.00, NULL, NULL, NULL, 2, NULL, '2026-09-29 12:02:55', NULL, '1', NULL, '0'),
(2, 0, '128GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2022-09-10', 49999.00, NULL, NULL, NULL, 2, NULL, '2026-09-29 12:09:16', NULL, '1', NULL, '0'),
(3, 1, '8 | 256GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2022-09-10', 99000.00, '1', '3', '3', 1, NULL, '2026-09-29 12:09:23', NULL, '1', NULL, '58'),
(4, 1, '12 | 512GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2022-09-10', 130000.00, '1', '3', '3', 1, NULL, '2026-09-29 12:36:12', NULL, '1', NULL, '0'),
(5, 1, '12 | 256GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2022-09-10', 99000.00, '1', '3', '3', 1, NULL, '2026-09-30 17:25:22', '3', '1', NULL, '0'),
(6, 0, '22', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2026-09-11', 1233.00, '1', '3', '3', 2, NULL, '2026-09-30 17:40:44', '0', '1', NULL, '0'),
(7, 0, '12 | 128GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2025-08-28', 79999.00, '1', '4', '6', 1, NULL, '2026-09-30 18:02:00', NULL, '1', NULL, '0'),
(8, 0, '12 | 256GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2025-08-28', 89999.00, '1', '4', '6', 1, NULL, '2026-09-30 18:02:01', NULL, '1', NULL, '0'),
(9, 0, '16 | 256GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2025-08-28', 109999.00, '1', '4', '7', 1, NULL, '2026-09-30 18:02:02', NULL, '1', NULL, '0'),
(10, 0, '16 | 512GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2025-08-28', 129999.00, '1', '4', '7', 1, NULL, '2026-09-30 18:02:03', NULL, '1', NULL, '0'),
(11, 0, '16 | 256GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2025-08-28', 124999.00, '1', '4', '8', 1, NULL, '2026-09-30 18:02:04', NULL, '1', NULL, '0'),
(12, 0, '16 | 512GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2025-08-28', 144999.00, '1', '4', '8', 1, NULL, '2026-09-30 18:02:05', NULL, '1', NULL, '0'),
(13, 0, '12 | 256GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2025-01-07', 69999.00, '1', '5', '9', 1, NULL, '2026-09-30 18:02:06', NULL, '1', NULL, '0'),
(14, 0, '16 | 512GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2025-01-07', 79999.00, '1', '5', '9', 1, NULL, '2026-09-30 18:02:07', NULL, '1', NULL, '0'),
(15, 0, '12 | 256GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2025-01-07', 42999.00, '1', '5', '10', 1, NULL, '2026-09-30 18:02:08', NULL, '1', NULL, '0'),
(16, 0, '16 | 512GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2025-02-20', 149999.00, '1', '5', '11', 1, NULL, '2026-09-30 18:02:09', NULL, '1', NULL, '0'),
(17, 0, '16 | 512GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2025-03-02', 109999.00, '1', '6', '12', 1, NULL, '2026-09-30 18:02:10', NULL, '1', NULL, '0'),
(18, 0, '12 | 256GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2025-03-02', 64999.00, '1', '6', '13', 1, NULL, '2026-09-30 18:02:11', NULL, '1', NULL, '0'),
(19, 0, '12 | 256GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2024-12-09', 30999.00, '1', '6', '14', 1, NULL, '2026-09-30 18:02:12', NULL, '1', NULL, '0'),
(20, 0, '12 | 512GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2024-12-09', 33999.00, '1', '6', '14', 1, NULL, '2026-09-30 18:02:13', NULL, '1', NULL, '0'),
(21, 0, '12 | 256GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2025-07-15', 79999.00, '1', '7', '15', 1, NULL, '2026-09-30 18:02:14', NULL, '1', NULL, '0'),
(22, 0, '12 | 256GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2025-03-11', 42999.00, '1', '7', '16', 1, NULL, '2026-09-30 18:02:15', NULL, '1', NULL, '0'),
(23, 0, '12 | 256GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2025-04-24', 49999.00, '1', '8', '17', 1, NULL, '2026-09-30 18:02:16', NULL, '1', NULL, '0'),
(24, 0, '16 | 512GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2025-04-24', 99999.00, '1', '8', '18', 1, NULL, '2026-09-30 18:02:17', NULL, '1', NULL, '0'),
(25, 0, '16 | 512GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2024-11-21', 99999.00, '1', '9', '19', 1, NULL, '2026-09-30 18:02:18', NULL, '1', NULL, '0'),
(26, 0, '12 | 256GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2025-06-26', 49999.00, '1', '9', '20', 1, NULL, '2026-09-30 18:02:19', NULL, '1', NULL, '0'),
(27, 0, '16 | 512GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2024-10-14', 94999.00, '1', '10', '21', 1, NULL, '2026-09-30 18:02:20', NULL, '1', NULL, '41,43'),
(28, 0, '12 | 256GB', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2024-08-07', 49999.00, '1', '10', '22', 1, NULL, '2026-09-30 18:02:21', NULL, '1', NULL, '0'),
(36, 0, '128GB', 'SD', 'LD', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 423.73, 500.00, 450.00, 0.00, 'HSB', 'PLTY', 0, 1, '0000-00-00', 0.00, '1', '8', '17', 2, NULL, '2026-10-07 16:58:45', '0', '2', NULL, '0'),
(37, 0, '26GB ', 'SDD', 'LDD', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 423.73, 500.00, 450.00, 0.00, 'HSN', 'PRDSK', 99, 0, '0000-00-00', 0.00, '2', '4', '7', 1, NULL, '2026-10-07 17:03:08', '0', '2', NULL, '0'),
(38, 1, 'TE', 'SDD', 'LDD', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 423.73, 500.00, 450.00, 0.00, 'HSN', '', 99, 0, '0000-00-00', 0.00, '2', '4', '7', 1, NULL, '2026-10-07 17:05:40', '37', '2', NULL, '0'),
(39, 1, 't', 'SDD', 'LDD', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 423.73, 500.00, 450.00, 0.00, 'HSN', '', 99, 0, '0000-00-00', 0.00, '2', '4', '7', 1, NULL, '2026-10-07 17:11:30', '38', '2', NULL, '0'),
(40, 1, 'r', NULL, NULL, 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2024-10-14', 0.00, '1', '10', '21', 2, NULL, '2026-10-07 17:13:22', '27', '1', NULL, '0'),
(41, 1, 'TTT', 'TT', 'as', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 317.80, 375.00, 300.00, 0.00, 'HSN', 'SKY', 99, 1, '0000-00-00', 0.00, '1', '10', '21', 1, '1', '2026-10-07 17:46:26', '1', '2', NULL, '0'),
(42, 1, 'TTT', 'TT', 'as', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 317.80, 375.00, 300.00, 0.00, 'HSN', 'SKY', 99, 1, '0000-00-00', 0.00, '1', '10', '21', 1, '1', '2026-10-07 17:47:43', '1', '2', NULL, '0'),
(43, 1, 'TTT', 'TT', 'as', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 317.80, 375.00, 300.00, 0.00, 'HSN', 'SKY', 99, 1, '0000-00-00', 0.00, '1', '10', '21', 1, '1', '2026-10-07 17:48:12', '1', '2', NULL, '0'),
(44, 1, 'TTT', 'TT', 'as', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 317.80, 375.00, 300.00, 0.00, 'HSN', 'SKY', 99, 1, '0000-00-00', 0.00, '1', '10', '21', 1, '1', '2026-10-07 17:48:23', '1', '2', NULL, '0'),
(45, 1, 'TTT', 'TT', 'as', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 317.80, 375.00, 300.00, 0.00, 'HSN', 'SKY', 99, 1, '0000-00-00', 0.00, '1', '10', '21', 1, '1', '2026-10-07 17:48:37', '1', '2', NULL, '0'),
(46, 1, 'TTT', 'TT', 'as', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 317.80, 375.00, 300.00, 0.00, 'HSN', 'SKY', 99, 1, '0000-00-00', 0.00, '1', '10', '21', 1, '1', '2026-10-07 17:51:12', '1', '2', NULL, '0'),
(47, 1, 'TTT', 'TT', 'as', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 317.80, 375.00, 300.00, 0.00, 'HSN', 'SKY', 99, 1, '0000-00-00', 0.00, '1', '10', '21', 1, '1', '2026-10-07 17:51:14', '1', '2', NULL, '0'),
(48, 1, 'TTT', 'TT', 'as', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 317.80, 375.00, 300.00, 0.00, 'HSN', 'SKY', 99, 1, '0000-00-00', 0.00, '1', '10', '21', 1, '1', '2026-10-07 17:53:00', '1', '2', NULL, '0'),
(49, 1, 'TTT', 'TT', 'as', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 317.80, 375.00, 300.00, 0.00, 'HSN', 'SKY', 99, 1, '0000-00-00', 0.00, '1', '10', '21', 2, '1', '2026-10-07 18:09:31', '1', '2', 'sasass', '0'),
(50, 1, 'TTT', 'TT', 'as', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 317.80, 375.00, 300.00, 0.00, 'HSN', 'SKY', 99, 1, '0000-00-00', 0.00, '1', '10', '21', 2, '1', '2026-10-07 18:12:14', '1', '2', 'sasass', '0'),
(51, 1, 'TTT', 'TT', 'as', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 317.80, 375.00, 300.00, 0.00, 'HSN', 'SKY', 99, 1, '0000-00-00', 0.00, '1', '10', '21', 2, '1', '2026-10-07 18:12:42', '1', '2', 'sasass', '0'),
(52, 1, 'TTT', 'TT', 'as', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 317.80, 375.00, 300.00, 0.00, 'HSN', 'SKY', 99, 1, '0000-00-00', 0.00, '1', '10', '21', 2, '1', '2026-10-07 18:13:39', '1', '2', 'sasass', '0'),
(53, 1, 'TTT', 'TT', 'as', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 317.80, 375.00, 300.00, 0.00, 'HSN', 'SKY', 99, 1, '0000-00-00', 0.00, '1', '10', '21', 2, '1', '2026-10-07 18:22:06', '1', '2', 'sasass', '0'),
(54, 0, 'as', 'as', 'as', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 3.00, 1, 0.00, 0.00, 0.00, 0.00, '3', '3', 3, 1, '0000-00-00', 0.00, '1', '4', '6', 1, NULL, '2026-10-07 18:26:48', '0', '3', '<br />\r\n<b>Deprecated</b>:  htmlspecialchars(): Passing null to parameter #1 ($string) of type string is deprecated in <b>D:\\xampp\\htdocs\\kimaat_lock\\backend\\admin\\other_product_manage.php</b> on line <b>574</b><br />\r\n', '0'),
(55, 1, 'TTT', 'TT', 'as', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 317.80, 375.00, 300.00, 0.00, 'HSN', 'SKY', 99, 1, '0000-00-00', 0.00, '1', '10', '21', 1, '1', '2026-10-07 18:29:25', '1', '2', 'sasass', '0'),
(56, 1, 'TTT', 'TT', 'as', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 317.80, 375.00, 300.00, 0.00, 'HSN', 'SKY', 99, 1, '0000-00-00', 0.00, '1', '10', '21', 2, '1', '2026-10-07 18:30:02', '1', '3', 'sasass', '0'),
(57, 1, 'TTT', 'TT', 'as', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 317.80, 375.00, 300.00, 0.00, 'HSN', 'SKY', 99, 1, '0000-00-00', 0.00, '1', '10', '21', 1, '1', '2026-10-07 18:34:43', '1', '3', 'sasass', '0'),
(58, 0, '2 TB- BurgundyWith Apple Care', 'iPhone 18 Pro Max (2 TB) - BurgundyWith Apple Care', 'iPhone 18 Pro Max (2 TB) - BurgundyWith Apple Care', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 9.00, 9.00, 1, 296609.32, 349999.00, 329000.00, 0.00, '', '', 0, 1, '0000-00-00', 0.00, '1', '3', '3', 1, NULL, '2026-10-07 18:42:01', '0', '2', '', '0'),
(59, 0, 'aa', 'sasas', 'tttas', 'main_1791524963_1944.jpg', 'gal_1791524963_4715.jpg,gal_1791524963_1772.jpg,gal_1791524963_4962.jpg,gal_1791524963_5576.jpg,gal_1791524963_1777.jpg,gal_1791524963_5577.jpg,gal_1791524963_6841.jpg,gal_1791524963_8689.jpg,gal_1791524963_3668.jpg,gal_1791524963_5289.jpg', 0.00, 0.00, 1, 0.00, 0.00, 0.00, 0.00, '', '', 0, 1, '0000-00-00', 0.00, '1', '3', '3', 2, NULL, '2026-10-07 18:44:06', '0', '3', '', '0'),
(60, 0, 'Marshall Minor Iv Wireless in Ear Earbuds with 30+ Hours of Playtime, Water-Resistant, Wireless Charging- Black — Marshall', 'MARSHALL SIGNATURE SOUND - Marshall signature sound always takes centre stage in our products and Minor IV is no different. Hit play and you\'ll unleash an expertly balanced sound that commands attention.', '30+ HOURS OF WIRELESS PLAYTIME - Don’t get stranded without music when you need it most. Minor IV packs 30+ hours of wireless playtime. It’s got everything you need to keep the music playing and keep you moving, all day long.\r\nRE-DESIGNED FOR SUPERIOR COMFORT - When you’re listening to music, one track is never enough, so the Minor IV earbuds are built to handle your longest playlist in total comfort.\r\nCONTROL AND CUSTOMISE YOUR SOUND - Minor IV makes your life easy. Use the touch-sensitive earbuds to navigate playback and manage calls. Connect to multiple devices simultaneously with Bluetooth multipoint connectivity. Personalise music to your taste by downloading Marshall’s dedicated app.\r\nMAKE YOUR EARBUDS LAST LONGER - Extend the lifetime of your Minor IV earbuds by switching on our in-app battery preservation feature, downloading Over-the-Air (OTA) updates and, when needed, replacing spare parts.', 'vendor_20261009_165229_de4e0663f5e9.jpg', '1.jpg,2.jpg,3.jpg,4.jpg,vendor_20261009_165229_07b10f290b22.jpg,vendor_20261009_165229_80800a51d4c1.jpg,vendor_20261009_165230_af647dea0042.jpg', 0.00, 0.00, 1, 9999.00, 9999.00, 8888.00, 0.00, '', '', 0, 1, '0000-00-00', 0.00, '0', '3', '0', 1, '4', '2026-10-09 16:52:30', '0', '3', '', '0'),
(61, 0, 'asas', NULL, NULL, NULL, NULL, 0.00, 0.00, 0, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0, 1, '2026-10-03', 0.00, '1', '3', '3', 1, NULL, '2026-10-12 17:14:02', '0', '1', NULL, '58');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_product_depreciation`
--

CREATE TABLE `tbl_product_depreciation` (
  `depreciation_id` int(11) NOT NULL,
  `product_id` varchar(11) DEFAULT NULL,
  `package_id` int(11) NOT NULL,
  `month_number` varchar(11) DEFAULT NULL,
  `monthly_depreciation` decimal(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Monthly depreciation %',
  `post_new_model_depreciation` decimal(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Post new model depreciation %'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_product_depreciation`
--

INSERT INTO `tbl_product_depreciation` (`depreciation_id`, `product_id`, `package_id`, `month_number`, `monthly_depreciation`, `post_new_model_depreciation`) VALUES
(505, '4', 2, '1', 0.00, 0.00),
(506, '4', 2, '2', 0.00, 0.00),
(507, '4', 2, '3', 0.00, 0.00),
(508, '4', 2, '4', 0.00, 0.00),
(509, '4', 2, '5', 0.00, 0.00),
(510, '4', 2, '6', 0.00, 0.00),
(511, '4', 2, '7', 0.00, 0.00),
(512, '4', 2, '8', 0.00, 0.00),
(513, '4', 2, '9', 0.00, 0.00),
(514, '4', 2, '10', 0.00, 0.00),
(515, '4', 2, '11', 0.00, 0.00),
(516, '4', 2, '12', 0.00, 0.00),
(517, '4', 2, '13', 0.00, 0.00),
(518, '4', 2, '14', 0.00, 0.00),
(519, '4', 2, '15', 0.00, 0.00),
(520, '4', 2, '16', 0.00, 0.00),
(521, '4', 2, '17', 0.00, 0.00),
(522, '4', 2, '18', 0.00, 0.00),
(523, '4', 2, '19', 0.00, 0.00),
(524, '4', 2, '20', 0.00, 0.00),
(525, '4', 2, '21', 0.00, 0.00),
(526, '4', 2, '22', 0.00, 0.00),
(527, '4', 2, '23', 0.00, 0.00),
(528, '4', 2, '24', 0.00, 0.00),
(529, '4', 1, '1', 0.00, 0.00),
(530, '4', 1, '2', 0.00, 0.00),
(531, '4', 1, '3', 0.00, 0.00),
(532, '4', 1, '4', 0.00, 0.00),
(533, '4', 1, '5', 0.00, 0.00),
(534, '4', 1, '6', 0.00, 0.00),
(535, '4', 1, '7', 0.00, 0.00),
(536, '4', 1, '8', 0.00, 0.00),
(537, '4', 1, '9', 0.00, 0.00),
(538, '4', 1, '10', 0.00, 0.00),
(539, '4', 1, '11', 0.00, 0.00),
(540, '4', 1, '12', 0.00, 0.00),
(541, '4', 1, '13', 0.00, 0.00),
(542, '4', 1, '14', 0.00, 0.00),
(543, '4', 1, '15', 0.00, 0.00),
(544, '4', 1, '16', 0.00, 0.00),
(545, '4', 1, '17', 0.00, 0.00),
(546, '4', 1, '18', 0.00, 0.00),
(547, '4', 1, '19', 0.00, 0.00),
(548, '4', 1, '20', 0.00, 0.00),
(549, '4', 1, '21', 0.00, 0.00),
(550, '4', 1, '22', 0.00, 0.00),
(551, '4', 1, '23', 0.00, 0.00),
(552, '4', 1, '24', 0.00, 0.00),
(553, '4', 3, '1', 0.00, 0.00),
(554, '4', 3, '2', 0.00, 0.00),
(555, '4', 3, '3', 0.00, 0.00),
(556, '4', 3, '4', 0.00, 0.00),
(557, '4', 3, '5', 0.00, 0.00),
(558, '4', 3, '6', 0.00, 0.00),
(559, '4', 3, '7', 0.00, 0.00),
(560, '4', 3, '8', 0.00, 0.00),
(561, '4', 3, '9', 0.00, 0.00),
(562, '4', 3, '10', 0.00, 0.00),
(563, '4', 3, '11', 0.00, 0.00),
(564, '4', 3, '12', 0.00, 0.00),
(565, '4', 3, '13', 0.00, 0.00),
(566, '4', 3, '14', 0.00, 0.00),
(567, '4', 3, '15', 0.00, 0.00),
(568, '4', 3, '16', 0.00, 0.00),
(569, '4', 3, '17', 0.00, 0.00),
(570, '4', 3, '18', 0.00, 0.00),
(571, '4', 3, '19', 0.00, 0.00),
(572, '4', 3, '20', 0.00, 0.00),
(573, '4', 3, '21', 0.00, 0.00),
(574, '4', 3, '22', 0.00, 0.00),
(575, '4', 3, '23', 0.00, 0.00),
(576, '4', 3, '24', 0.00, 0.00),
(937, '6', 1, '1', 0.00, 0.00),
(938, '6', 1, '2', 0.00, 0.00),
(939, '6', 1, '3', 0.00, 0.00),
(940, '6', 1, '4', 0.00, 0.00),
(941, '6', 1, '5', 0.00, 0.00),
(942, '6', 1, '6', 0.00, 0.00),
(943, '6', 1, '7', 0.00, 0.00),
(944, '6', 1, '8', 0.00, 0.00),
(945, '6', 1, '9', 0.00, 0.00),
(946, '6', 1, '10', 0.00, 0.00),
(947, '6', 1, '11', 0.00, 0.00),
(948, '6', 1, '12', 0.00, 0.00),
(949, '6', 1, '13', 0.00, 0.00),
(950, '6', 1, '14', 0.00, 0.00),
(951, '6', 1, '15', 0.00, 0.00),
(952, '6', 1, '16', 0.00, 0.00),
(953, '6', 1, '17', 0.00, 0.00),
(954, '6', 1, '18', 0.00, 0.00),
(955, '6', 1, '19', 0.00, 0.00),
(956, '6', 1, '20', 0.00, 0.00),
(957, '6', 1, '21', 0.00, 0.00),
(958, '6', 1, '22', 0.00, 0.00),
(959, '6', 1, '23', 0.00, 0.00),
(960, '6', 1, '24', 0.00, 0.00),
(961, '6', 2, '1', 0.00, 0.00),
(962, '6', 2, '2', 0.00, 0.00),
(963, '6', 2, '3', 0.00, 0.00),
(964, '6', 2, '4', 0.00, 0.00),
(965, '6', 2, '5', 0.00, 0.00),
(966, '6', 2, '6', 0.00, 0.00),
(967, '6', 2, '7', 0.00, 0.00),
(968, '6', 2, '8', 0.00, 0.00),
(969, '6', 2, '9', 0.00, 0.00),
(970, '6', 2, '10', 0.00, 0.00),
(971, '6', 2, '11', 0.00, 0.00),
(972, '6', 2, '12', 0.00, 0.00),
(973, '6', 2, '13', 0.00, 0.00),
(974, '6', 2, '14', 0.00, 0.00),
(975, '6', 2, '15', 0.00, 0.00),
(976, '6', 2, '16', 0.00, 0.00),
(977, '6', 2, '17', 0.00, 0.00),
(978, '6', 2, '18', 0.00, 0.00),
(979, '6', 2, '19', 0.00, 0.00),
(980, '6', 2, '20', 0.00, 0.00),
(981, '6', 2, '21', 0.00, 0.00),
(982, '6', 2, '22', 0.00, 0.00),
(983, '6', 2, '23', 0.00, 0.00),
(984, '6', 2, '24', 0.00, 0.00),
(985, '6', 3, '1', 0.00, 0.00),
(986, '6', 3, '2', 0.00, 0.00),
(987, '6', 3, '3', 0.00, 0.00),
(988, '6', 3, '4', 0.00, 0.00),
(989, '6', 3, '5', 0.00, 0.00),
(990, '6', 3, '6', 0.00, 0.00),
(991, '6', 3, '7', 0.00, 0.00),
(992, '6', 3, '8', 0.00, 0.00),
(993, '6', 3, '9', 0.00, 0.00),
(994, '6', 3, '10', 0.00, 0.00),
(995, '6', 3, '11', 0.00, 0.00),
(996, '6', 3, '12', 0.00, 0.00),
(997, '6', 3, '13', 0.00, 0.00),
(998, '6', 3, '14', 0.00, 0.00),
(999, '6', 3, '15', 0.00, 0.00),
(1000, '6', 3, '16', 0.00, 0.00),
(1001, '6', 3, '17', 0.00, 0.00),
(1002, '6', 3, '18', 0.00, 0.00),
(1003, '6', 3, '19', 0.00, 0.00),
(1004, '6', 3, '20', 0.00, 0.00),
(1005, '6', 3, '21', 0.00, 0.00),
(1006, '6', 3, '22', 0.00, 0.00),
(1007, '6', 3, '23', 0.00, 0.00),
(1008, '6', 3, '24', 0.00, 0.00),
(1153, '5', 1, '1', 2.00, 3.00),
(1154, '5', 1, '2', 4.00, 5.00),
(1155, '5', 1, '3', 6.00, 7.00),
(1156, '5', 1, '4', 8.00, 9.00),
(1157, '5', 1, '5', 10.00, 11.00),
(1158, '5', 1, '6', 12.00, 13.00),
(1159, '5', 1, '7', 14.00, 15.00),
(1160, '5', 1, '8', 16.00, 17.00),
(1161, '5', 1, '9', 18.00, 19.00),
(1162, '5', 1, '10', 20.00, 21.00),
(1163, '5', 1, '11', 22.00, 23.00),
(1164, '5', 1, '12', 24.00, 25.00),
(1165, '5', 1, '13', 0.00, 0.00),
(1166, '5', 1, '14', 0.00, 0.00),
(1167, '5', 1, '15', 0.00, 0.00),
(1168, '5', 1, '16', 0.00, 0.00),
(1169, '5', 1, '17', 0.00, 0.00),
(1170, '5', 1, '18', 0.00, 0.00),
(1171, '5', 1, '19', 0.00, 0.00),
(1172, '5', 1, '20', 0.00, 0.00),
(1173, '5', 1, '21', 0.00, 0.00),
(1174, '5', 1, '22', 0.00, 0.00),
(1175, '5', 1, '23', 0.00, 0.00),
(1176, '5', 1, '24', 0.00, 0.00),
(1177, '5', 2, '1', 1.00, 2.00),
(1178, '5', 2, '2', 3.00, 4.00),
(1179, '5', 2, '3', 5.00, 6.00),
(1180, '5', 2, '4', 7.00, 8.00),
(1181, '5', 2, '5', 9.00, 10.00),
(1182, '5', 2, '6', 11.00, 12.00),
(1183, '5', 2, '7', 13.00, 14.00),
(1184, '5', 2, '8', 15.00, 16.00),
(1185, '5', 2, '9', 17.00, 18.00),
(1186, '5', 2, '10', 19.00, 20.00),
(1187, '5', 2, '11', 21.00, 22.00),
(1188, '5', 2, '12', 23.00, 24.00),
(1189, '5', 2, '13', 0.00, 0.00),
(1190, '5', 2, '14', 0.00, 0.00),
(1191, '5', 2, '15', 0.00, 0.00),
(1192, '5', 2, '16', 0.00, 0.00),
(1193, '5', 2, '17', 0.00, 0.00),
(1194, '5', 2, '18', 0.00, 0.00),
(1195, '5', 2, '19', 0.00, 0.00),
(1196, '5', 2, '20', 0.00, 0.00),
(1197, '5', 2, '21', 0.00, 0.00),
(1198, '5', 2, '22', 0.00, 0.00),
(1199, '5', 2, '23', 0.00, 0.00),
(1200, '5', 2, '24', 0.00, 0.00),
(1201, '5', 3, '1', 1.00, 2.00),
(1202, '5', 3, '2', 3.00, 4.00),
(1203, '5', 3, '3', 5.00, 6.00),
(1204, '5', 3, '4', 7.00, 8.00),
(1205, '5', 3, '5', 9.00, 10.00),
(1206, '5', 3, '6', 11.00, 12.00),
(1207, '5', 3, '7', 13.00, 14.00),
(1208, '5', 3, '8', 15.00, 16.00),
(1209, '5', 3, '9', 17.00, 18.00),
(1210, '5', 3, '10', 19.00, 20.00),
(1211, '5', 3, '11', 21.00, 21.00),
(1212, '5', 3, '12', 22.00, 23.00),
(1213, '5', 3, '13', 0.00, 0.00),
(1214, '5', 3, '14', 0.00, 0.00),
(1215, '5', 3, '15', 0.00, 0.00),
(1216, '5', 3, '16', 0.00, 0.00),
(1217, '5', 3, '17', 0.00, 0.00),
(1218, '5', 3, '18', 0.00, 0.00),
(1219, '5', 3, '19', 0.00, 0.00),
(1220, '5', 3, '20', 0.00, 0.00),
(1221, '5', 3, '21', 0.00, 0.00),
(1222, '5', 3, '22', 0.00, 0.00),
(1223, '5', 3, '23', 0.00, 0.00),
(1224, '5', 3, '24', 0.00, 0.00),
(1873, '29', 1, '1', 0.00, 0.00),
(1874, '29', 1, '2', 0.00, 0.00),
(1875, '29', 1, '3', 0.00, 0.00),
(1876, '29', 1, '4', 0.00, 0.00),
(1877, '29', 1, '5', 0.00, 0.00),
(1878, '29', 1, '6', 0.00, 0.00),
(1879, '29', 1, '7', 0.00, 0.00),
(1880, '29', 1, '8', 0.00, 0.00),
(1881, '29', 1, '9', 0.00, 0.00),
(1882, '29', 1, '10', 0.00, 0.00),
(1883, '29', 1, '11', 0.00, 0.00),
(1884, '29', 1, '12', 0.00, 0.00),
(1885, '29', 1, '13', 0.00, 0.00),
(1886, '29', 1, '14', 0.00, 0.00),
(1887, '29', 1, '15', 0.00, 0.00),
(1888, '29', 1, '16', 0.00, 0.00),
(1889, '29', 1, '17', 0.00, 0.00),
(1890, '29', 1, '18', 0.00, 0.00),
(1891, '29', 1, '19', 0.00, 0.00),
(1892, '29', 1, '20', 0.00, 0.00),
(1893, '29', 1, '21', 0.00, 0.00),
(1894, '29', 1, '22', 0.00, 0.00),
(1895, '29', 1, '23', 0.00, 0.00),
(1896, '29', 1, '24', 0.00, 0.00),
(1897, '29', 2, '1', 0.00, 0.00),
(1898, '29', 2, '2', 0.00, 0.00),
(1899, '29', 2, '3', 0.00, 0.00),
(1900, '29', 2, '4', 0.00, 0.00),
(1901, '29', 2, '5', 0.00, 0.00),
(1902, '29', 2, '6', 0.00, 0.00),
(1903, '29', 2, '7', 0.00, 0.00),
(1904, '29', 2, '8', 0.00, 0.00),
(1905, '29', 2, '9', 0.00, 0.00),
(1906, '29', 2, '10', 0.00, 0.00),
(1907, '29', 2, '11', 0.00, 0.00),
(1908, '29', 2, '12', 0.00, 0.00),
(1909, '29', 2, '13', 0.00, 0.00),
(1910, '29', 2, '14', 0.00, 0.00),
(1911, '29', 2, '15', 0.00, 0.00),
(1912, '29', 2, '16', 0.00, 0.00),
(1913, '29', 2, '17', 0.00, 0.00),
(1914, '29', 2, '18', 0.00, 0.00),
(1915, '29', 2, '19', 0.00, 0.00),
(1916, '29', 2, '20', 0.00, 0.00),
(1917, '29', 2, '21', 0.00, 0.00),
(1918, '29', 2, '22', 0.00, 0.00),
(1919, '29', 2, '23', 0.00, 0.00),
(1920, '29', 2, '24', 0.00, 0.00),
(1921, '29', 3, '1', 0.00, 0.00),
(1922, '29', 3, '2', 0.00, 0.00),
(1923, '29', 3, '3', 0.00, 0.00),
(1924, '29', 3, '4', 0.00, 0.00),
(1925, '29', 3, '5', 0.00, 0.00),
(1926, '29', 3, '6', 0.00, 0.00),
(1927, '29', 3, '7', 0.00, 0.00),
(1928, '29', 3, '8', 0.00, 0.00),
(1929, '29', 3, '9', 0.00, 0.00),
(1930, '29', 3, '10', 0.00, 0.00),
(1931, '29', 3, '11', 0.00, 0.00),
(1932, '29', 3, '12', 0.00, 0.00),
(1933, '29', 3, '13', 0.00, 0.00),
(1934, '29', 3, '14', 0.00, 0.00),
(1935, '29', 3, '15', 0.00, 0.00),
(1936, '29', 3, '16', 0.00, 0.00),
(1937, '29', 3, '17', 0.00, 0.00),
(1938, '29', 3, '18', 0.00, 0.00),
(1939, '29', 3, '19', 0.00, 0.00),
(1940, '29', 3, '20', 0.00, 0.00),
(1941, '29', 3, '21', 0.00, 0.00),
(1942, '29', 3, '22', 0.00, 0.00),
(1943, '29', 3, '23', 0.00, 0.00),
(1944, '29', 3, '24', 0.00, 0.00),
(1945, '40', 1, '1', 0.00, 0.00),
(1946, '40', 1, '2', 0.00, 0.00),
(1947, '40', 1, '3', 0.00, 0.00),
(1948, '40', 1, '4', 0.00, 0.00),
(1949, '40', 1, '5', 0.00, 0.00),
(1950, '40', 1, '6', 0.00, 0.00),
(1951, '40', 1, '7', 0.00, 0.00),
(1952, '40', 1, '8', 0.00, 0.00),
(1953, '40', 1, '9', 0.00, 0.00),
(1954, '40', 1, '10', 0.00, 0.00),
(1955, '40', 1, '11', 0.00, 0.00),
(1956, '40', 1, '12', 0.00, 0.00),
(1957, '40', 1, '13', 0.00, 0.00),
(1958, '40', 1, '14', 0.00, 0.00),
(1959, '40', 1, '15', 0.00, 0.00),
(1960, '40', 1, '16', 0.00, 0.00),
(1961, '40', 1, '17', 0.00, 0.00),
(1962, '40', 1, '18', 0.00, 0.00),
(1963, '40', 1, '19', 0.00, 0.00),
(1964, '40', 1, '20', 0.00, 0.00),
(1965, '40', 1, '21', 0.00, 0.00),
(1966, '40', 1, '22', 0.00, 0.00),
(1967, '40', 1, '23', 0.00, 0.00),
(1968, '40', 1, '24', 0.00, 0.00),
(1969, '40', 2, '1', 0.00, 0.00),
(1970, '40', 2, '2', 0.00, 0.00),
(1971, '40', 2, '3', 0.00, 0.00),
(1972, '40', 2, '4', 0.00, 0.00),
(1973, '40', 2, '5', 0.00, 0.00),
(1974, '40', 2, '6', 0.00, 0.00),
(1975, '40', 2, '7', 0.00, 0.00),
(1976, '40', 2, '8', 0.00, 0.00),
(1977, '40', 2, '9', 0.00, 0.00),
(1978, '40', 2, '10', 0.00, 0.00),
(1979, '40', 2, '11', 0.00, 0.00),
(1980, '40', 2, '12', 0.00, 0.00),
(1981, '40', 2, '13', 0.00, 0.00),
(1982, '40', 2, '14', 0.00, 0.00),
(1983, '40', 2, '15', 0.00, 0.00),
(1984, '40', 2, '16', 0.00, 0.00),
(1985, '40', 2, '17', 0.00, 0.00),
(1986, '40', 2, '18', 0.00, 0.00),
(1987, '40', 2, '19', 0.00, 0.00),
(1988, '40', 2, '20', 0.00, 0.00),
(1989, '40', 2, '21', 0.00, 0.00),
(1990, '40', 2, '22', 0.00, 0.00),
(1991, '40', 2, '23', 0.00, 0.00),
(1992, '40', 2, '24', 0.00, 0.00),
(1993, '40', 3, '1', 0.00, 0.00),
(1994, '40', 3, '2', 0.00, 0.00),
(1995, '40', 3, '3', 0.00, 0.00),
(1996, '40', 3, '4', 0.00, 0.00),
(1997, '40', 3, '5', 0.00, 0.00),
(1998, '40', 3, '6', 0.00, 0.00),
(1999, '40', 3, '7', 0.00, 0.00),
(2000, '40', 3, '8', 0.00, 0.00),
(2001, '40', 3, '9', 0.00, 0.00),
(2002, '40', 3, '10', 0.00, 0.00),
(2003, '40', 3, '11', 0.00, 0.00),
(2004, '40', 3, '12', 0.00, 0.00),
(2005, '40', 3, '13', 0.00, 0.00),
(2006, '40', 3, '14', 0.00, 0.00),
(2007, '40', 3, '15', 0.00, 0.00),
(2008, '40', 3, '16', 0.00, 0.00),
(2009, '40', 3, '17', 0.00, 0.00),
(2010, '40', 3, '18', 0.00, 0.00),
(2011, '40', 3, '19', 0.00, 0.00),
(2012, '40', 3, '20', 0.00, 0.00),
(2013, '40', 3, '21', 0.00, 0.00),
(2014, '40', 3, '22', 0.00, 0.00),
(2015, '40', 3, '23', 0.00, 0.00),
(2016, '40', 3, '24', 0.00, 0.00),
(2017, '28', 1, '1', 0.00, 0.00),
(2018, '28', 1, '2', 0.00, 0.00),
(2019, '28', 1, '3', 0.00, 0.00),
(2020, '28', 1, '4', 0.00, 0.00),
(2021, '28', 1, '5', 0.00, 0.00),
(2022, '28', 1, '6', 0.00, 0.00),
(2023, '28', 1, '7', 0.00, 0.00),
(2024, '28', 1, '8', 0.00, 0.00),
(2025, '28', 1, '9', 0.00, 0.00),
(2026, '28', 1, '10', 0.00, 0.00),
(2027, '28', 1, '11', 0.00, 0.00),
(2028, '28', 1, '12', 0.00, 0.00),
(2029, '28', 1, '13', 0.00, 0.00),
(2030, '28', 1, '14', 0.00, 0.00),
(2031, '28', 1, '15', 0.00, 0.00),
(2032, '28', 1, '16', 0.00, 0.00),
(2033, '28', 1, '17', 0.00, 0.00),
(2034, '28', 1, '18', 0.00, 0.00),
(2035, '28', 1, '19', 0.00, 0.00),
(2036, '28', 1, '20', 0.00, 0.00),
(2037, '28', 1, '21', 0.00, 0.00),
(2038, '28', 1, '22', 0.00, 0.00),
(2039, '28', 1, '23', 0.00, 0.00),
(2040, '28', 1, '24', 0.00, 0.00),
(2041, '28', 2, '1', 0.00, 0.00),
(2042, '28', 2, '2', 0.00, 0.00),
(2043, '28', 2, '3', 0.00, 0.00),
(2044, '28', 2, '4', 0.00, 0.00),
(2045, '28', 2, '5', 0.00, 0.00),
(2046, '28', 2, '6', 0.00, 0.00),
(2047, '28', 2, '7', 0.00, 0.00),
(2048, '28', 2, '8', 0.00, 0.00),
(2049, '28', 2, '9', 0.00, 0.00),
(2050, '28', 2, '10', 0.00, 0.00),
(2051, '28', 2, '11', 0.00, 0.00),
(2052, '28', 2, '12', 0.00, 0.00),
(2053, '28', 2, '13', 0.00, 0.00),
(2054, '28', 2, '14', 0.00, 0.00),
(2055, '28', 2, '15', 0.00, 0.00),
(2056, '28', 2, '16', 0.00, 0.00),
(2057, '28', 2, '17', 0.00, 0.00),
(2058, '28', 2, '18', 0.00, 0.00),
(2059, '28', 2, '19', 0.00, 0.00),
(2060, '28', 2, '20', 0.00, 0.00),
(2061, '28', 2, '21', 0.00, 0.00),
(2062, '28', 2, '22', 0.00, 0.00),
(2063, '28', 2, '23', 0.00, 0.00),
(2064, '28', 2, '24', 0.00, 0.00),
(2065, '28', 3, '1', 0.00, 0.00),
(2066, '28', 3, '2', 0.00, 0.00),
(2067, '28', 3, '3', 0.00, 0.00),
(2068, '28', 3, '4', 0.00, 0.00),
(2069, '28', 3, '5', 0.00, 0.00),
(2070, '28', 3, '6', 0.00, 0.00),
(2071, '28', 3, '7', 0.00, 0.00),
(2072, '28', 3, '8', 0.00, 0.00),
(2073, '28', 3, '9', 0.00, 0.00),
(2074, '28', 3, '10', 0.00, 0.00),
(2075, '28', 3, '11', 0.00, 0.00),
(2076, '28', 3, '12', 0.00, 0.00),
(2077, '28', 3, '13', 0.00, 0.00),
(2078, '28', 3, '14', 0.00, 0.00),
(2079, '28', 3, '15', 0.00, 0.00),
(2080, '28', 3, '16', 0.00, 0.00),
(2081, '28', 3, '17', 0.00, 0.00),
(2082, '28', 3, '18', 0.00, 0.00),
(2083, '28', 3, '19', 0.00, 0.00),
(2084, '28', 3, '20', 0.00, 0.00),
(2085, '28', 3, '21', 0.00, 0.00),
(2086, '28', 3, '22', 0.00, 0.00),
(2087, '28', 3, '23', 0.00, 0.00),
(2088, '28', 3, '24', 0.00, 0.00),
(2521, '27', 1, '1', 0.00, 0.00),
(2522, '27', 1, '2', 0.00, 0.00),
(2523, '27', 1, '3', 0.00, 0.00),
(2524, '27', 1, '4', 0.00, 0.00),
(2525, '27', 1, '5', 0.00, 0.00),
(2526, '27', 1, '6', 0.00, 0.00),
(2527, '27', 1, '7', 0.00, 0.00),
(2528, '27', 1, '8', 0.00, 0.00),
(2529, '27', 1, '9', 0.00, 0.00),
(2530, '27', 1, '10', 0.00, 0.00),
(2531, '27', 1, '11', 0.00, 0.00),
(2532, '27', 1, '12', 0.00, 0.00),
(2533, '27', 1, '13', 0.00, 0.00),
(2534, '27', 1, '14', 0.00, 0.00),
(2535, '27', 1, '15', 0.00, 0.00),
(2536, '27', 1, '16', 0.00, 0.00),
(2537, '27', 1, '17', 0.00, 0.00),
(2538, '27', 1, '18', 0.00, 0.00),
(2539, '27', 1, '19', 0.00, 0.00),
(2540, '27', 1, '20', 0.00, 0.00),
(2541, '27', 1, '21', 0.00, 0.00),
(2542, '27', 1, '22', 0.00, 0.00),
(2543, '27', 1, '23', 0.00, 0.00),
(2544, '27', 1, '24', 0.00, 0.00),
(2545, '27', 2, '1', 0.00, 0.00),
(2546, '27', 2, '2', 0.00, 0.00),
(2547, '27', 2, '3', 0.00, 0.00),
(2548, '27', 2, '4', 0.00, 0.00),
(2549, '27', 2, '5', 0.00, 0.00),
(2550, '27', 2, '6', 0.00, 0.00),
(2551, '27', 2, '7', 0.00, 0.00),
(2552, '27', 2, '8', 0.00, 0.00),
(2553, '27', 2, '9', 0.00, 0.00),
(2554, '27', 2, '10', 0.00, 0.00),
(2555, '27', 2, '11', 0.00, 0.00),
(2556, '27', 2, '12', 0.00, 0.00),
(2557, '27', 2, '13', 0.00, 0.00),
(2558, '27', 2, '14', 0.00, 0.00),
(2559, '27', 2, '15', 0.00, 0.00),
(2560, '27', 2, '16', 0.00, 0.00),
(2561, '27', 2, '17', 0.00, 0.00),
(2562, '27', 2, '18', 0.00, 0.00),
(2563, '27', 2, '19', 0.00, 0.00),
(2564, '27', 2, '20', 0.00, 0.00),
(2565, '27', 2, '21', 0.00, 0.00),
(2566, '27', 2, '22', 0.00, 0.00),
(2567, '27', 2, '23', 0.00, 0.00),
(2568, '27', 2, '24', 0.00, 0.00),
(2569, '27', 3, '1', 0.00, 0.00),
(2570, '27', 3, '2', 0.00, 0.00),
(2571, '27', 3, '3', 0.00, 0.00),
(2572, '27', 3, '4', 0.00, 0.00),
(2573, '27', 3, '5', 0.00, 0.00),
(2574, '27', 3, '6', 0.00, 0.00),
(2575, '27', 3, '7', 0.00, 0.00),
(2576, '27', 3, '8', 0.00, 0.00),
(2577, '27', 3, '9', 0.00, 0.00),
(2578, '27', 3, '10', 0.00, 0.00),
(2579, '27', 3, '11', 0.00, 0.00),
(2580, '27', 3, '12', 0.00, 0.00),
(2581, '27', 3, '13', 0.00, 0.00),
(2582, '27', 3, '14', 0.00, 0.00),
(2583, '27', 3, '15', 0.00, 0.00),
(2584, '27', 3, '16', 0.00, 0.00),
(2585, '27', 3, '17', 0.00, 0.00),
(2586, '27', 3, '18', 0.00, 0.00),
(2587, '27', 3, '19', 0.00, 0.00),
(2588, '27', 3, '20', 0.00, 0.00),
(2589, '27', 3, '21', 0.00, 0.00),
(2590, '27', 3, '22', 0.00, 0.00),
(2591, '27', 3, '23', 0.00, 0.00),
(2592, '27', 3, '24', 0.00, 0.00),
(2593, '61', 1, '1', 2.00, 1.00),
(2594, '61', 1, '2', 3.00, 2.00),
(2595, '61', 1, '3', 4.00, 3.00),
(2596, '61', 1, '4', 5.00, 4.00),
(2597, '61', 1, '5', 6.00, 5.00),
(2598, '61', 1, '6', 7.00, 6.00),
(2599, '61', 1, '7', 8.00, 7.00),
(2600, '61', 1, '8', 9.00, 8.00),
(2601, '61', 1, '9', 10.00, 9.00),
(2602, '61', 1, '10', 11.00, 10.00),
(2603, '61', 1, '11', 12.00, 11.00),
(2604, '61', 1, '12', 13.00, 12.00),
(2605, '61', 1, '13', 14.00, 13.00),
(2606, '61', 1, '14', 15.00, 14.00),
(2607, '61', 1, '15', 16.00, 15.00),
(2608, '61', 1, '16', 17.00, 16.00),
(2609, '61', 1, '17', 18.00, 17.00),
(2610, '61', 1, '18', 19.00, 18.00),
(2611, '61', 1, '19', 20.00, 19.00),
(2612, '61', 1, '20', 21.00, 20.00),
(2613, '61', 1, '21', 22.00, 21.00),
(2614, '61', 1, '22', 23.00, 22.00),
(2615, '61', 1, '23', 24.00, 23.00),
(2616, '61', 1, '24', 25.00, 24.00),
(2617, '61', 2, '1', 0.00, 0.00),
(2618, '61', 2, '2', 0.00, 0.00),
(2619, '61', 2, '3', 0.00, 0.00),
(2620, '61', 2, '4', 0.00, 0.00),
(2621, '61', 2, '5', 0.00, 0.00),
(2622, '61', 2, '6', 0.00, 0.00),
(2623, '61', 2, '7', 0.00, 0.00),
(2624, '61', 2, '8', 0.00, 0.00),
(2625, '61', 2, '9', 0.00, 0.00),
(2626, '61', 2, '10', 0.00, 0.00),
(2627, '61', 2, '11', 0.00, 0.00),
(2628, '61', 2, '12', 0.00, 0.00),
(2629, '61', 2, '13', 0.00, 0.00),
(2630, '61', 2, '14', 0.00, 0.00),
(2631, '61', 2, '15', 0.00, 0.00),
(2632, '61', 2, '16', 0.00, 0.00),
(2633, '61', 2, '17', 0.00, 0.00),
(2634, '61', 2, '18', 0.00, 0.00),
(2635, '61', 2, '19', 0.00, 0.00),
(2636, '61', 2, '20', 0.00, 0.00),
(2637, '61', 2, '21', 0.00, 0.00),
(2638, '61', 2, '22', 0.00, 0.00),
(2639, '61', 2, '23', 0.00, 0.00),
(2640, '61', 2, '24', 0.00, 0.00),
(2641, '61', 3, '1', 0.00, 0.00),
(2642, '61', 3, '2', 0.00, 0.00),
(2643, '61', 3, '3', 0.00, 0.00),
(2644, '61', 3, '4', 0.00, 0.00),
(2645, '61', 3, '5', 0.00, 0.00),
(2646, '61', 3, '6', 0.00, 0.00),
(2647, '61', 3, '7', 0.00, 0.00),
(2648, '61', 3, '8', 0.00, 0.00),
(2649, '61', 3, '9', 0.00, 0.00),
(2650, '61', 3, '10', 0.00, 0.00),
(2651, '61', 3, '11', 0.00, 0.00),
(2652, '61', 3, '12', 0.00, 0.00),
(2653, '61', 3, '13', 0.00, 0.00),
(2654, '61', 3, '14', 0.00, 0.00),
(2655, '61', 3, '15', 0.00, 0.00),
(2656, '61', 3, '16', 0.00, 0.00),
(2657, '61', 3, '17', 0.00, 0.00),
(2658, '61', 3, '18', 0.00, 0.00),
(2659, '61', 3, '19', 0.00, 0.00),
(2660, '61', 3, '20', 0.00, 0.00),
(2661, '61', 3, '21', 0.00, 0.00),
(2662, '61', 3, '22', 0.00, 0.00),
(2663, '61', 3, '23', 0.00, 0.00),
(2664, '61', 3, '24', 0.00, 0.00),
(2665, '3', 1, '1', 1.00, 1.00),
(2666, '3', 1, '2', 2.00, 1.00),
(2667, '3', 1, '3', 3.00, 1.00),
(2668, '3', 1, '4', 4.00, 1.00),
(2669, '3', 1, '5', 5.00, 1.00),
(2670, '3', 1, '6', 6.00, 1.00),
(2671, '3', 1, '7', 7.00, 2.00),
(2672, '3', 1, '8', 8.00, 2.00),
(2673, '3', 1, '9', 9.00, 2.00),
(2674, '3', 1, '10', 10.00, 2.00),
(2675, '3', 1, '11', 11.00, 2.00),
(2676, '3', 1, '12', 12.00, 2.00),
(2677, '3', 1, '13', 13.00, 3.00),
(2678, '3', 1, '14', 14.00, 3.00),
(2679, '3', 1, '15', 15.00, 3.00),
(2680, '3', 1, '16', 16.00, 3.00),
(2681, '3', 1, '17', 17.00, 3.00),
(2682, '3', 1, '18', 18.00, 3.00),
(2683, '3', 1, '19', 19.00, 4.00),
(2684, '3', 1, '20', 20.00, 4.00),
(2685, '3', 1, '21', 21.00, 4.00),
(2686, '3', 1, '22', 22.00, 4.00),
(2687, '3', 1, '23', 23.00, 4.00),
(2688, '3', 1, '24', 24.00, 4.00),
(2689, '3', 2, '1', 1.00, 1.00),
(2690, '3', 2, '2', 3.00, 1.00),
(2691, '3', 2, '3', 5.00, 1.00),
(2692, '3', 2, '4', 7.00, 1.00),
(2693, '3', 2, '5', 9.00, 1.00),
(2694, '3', 2, '6', 11.00, 1.00),
(2695, '3', 2, '7', 13.00, 2.00),
(2696, '3', 2, '8', 15.00, 2.00),
(2697, '3', 2, '9', 17.00, 2.00),
(2698, '3', 2, '10', 19.00, 2.00),
(2699, '3', 2, '11', 21.00, 2.00),
(2700, '3', 2, '12', 23.00, 2.00),
(2701, '3', 2, '13', 25.00, 3.00),
(2702, '3', 2, '14', 27.00, 3.00),
(2703, '3', 2, '15', 29.00, 3.00),
(2704, '3', 2, '16', 31.00, 3.00),
(2705, '3', 2, '17', 33.00, 3.00),
(2706, '3', 2, '18', 35.00, 3.00),
(2707, '3', 2, '19', 37.00, 4.00),
(2708, '3', 2, '20', 39.00, 4.00),
(2709, '3', 2, '21', 41.00, 4.00),
(2710, '3', 2, '22', 43.00, 4.00),
(2711, '3', 2, '23', 45.00, 4.00),
(2712, '3', 2, '24', 48.00, 4.00),
(2713, '3', 3, '1', 1.00, 1.00),
(2714, '3', 3, '2', 4.00, 1.00),
(2715, '3', 3, '3', 7.00, 1.00),
(2716, '3', 3, '4', 10.00, 1.00),
(2717, '3', 3, '5', 13.00, 1.00),
(2718, '3', 3, '6', 16.00, 1.00),
(2719, '3', 3, '7', 19.00, 2.00),
(2720, '3', 3, '8', 22.00, 2.00),
(2721, '3', 3, '9', 25.00, 2.00),
(2722, '3', 3, '10', 28.00, 2.00),
(2723, '3', 3, '11', 31.00, 2.00),
(2724, '3', 3, '12', 34.00, 2.00),
(2725, '3', 3, '13', 37.00, 3.00),
(2726, '3', 3, '14', 40.00, 3.00),
(2727, '3', 3, '15', 43.00, 3.00),
(2728, '3', 3, '16', 46.00, 3.00),
(2729, '3', 3, '17', 49.00, 3.00),
(2730, '3', 3, '18', 52.00, 3.00),
(2731, '3', 3, '19', 55.00, 4.00),
(2732, '3', 3, '20', 58.00, 4.00),
(2733, '3', 3, '21', 61.00, 4.00),
(2734, '3', 3, '22', 64.00, 4.00),
(2735, '3', 3, '23', 67.00, 4.00),
(2736, '3', 3, '24', 70.00, 4.00);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_sms`
--

CREATE TABLE `tbl_sms` (
  `sms_id` int(11) NOT NULL,
  `sms_text` longtext NOT NULL,
  `sms_response` longtext NOT NULL,
  `sms_mobile_no` varchar(25) NOT NULL,
  `sms_type` varchar(11) DEFAULT NULL,
  `sms_temp_id` varchar(100) DEFAULT NULL,
  `is_deleted` int(11) NOT NULL,
  `c_date` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `tbl_sms`
--

INSERT INTO `tbl_sms` (`sms_id`, `sms_text`, `sms_response`, `sms_mobile_no`, `sms_type`, `sms_temp_id`, `is_deleted`, `c_date`) VALUES
(1, 'Welcome to Kimaat Lock. Your One time password(OTP) for registration is 1234. Team Kimaat Lock. Bits', '', '8320099260', '1', '1507166235571890060', 1, '2026-09-28 12:46:34'),
(2, 'Welcome to Kimaat Lock. Your One time password(OTP) for registration is 1234. Team Kimaat Lock. Bits', '', '8320099260', '1', '1507166235571890060', 1, '2026-09-28 12:46:47'),
(3, 'Welcome to Kimaat Lock. Your One time password(OTP) for registration is 1234. Team Kimaat Lock. Bits', '', '8320099260', '1', '1507166235571890060', 1, '2026-09-28 13:45:14'),
(4, 'Welcome to Kimaat Lock. Your One time password(OTP) for registration is 1234. Team Kimaat Lock. Bits', '', '8320099260', '1', '1507166235571890060', 1, '2026-09-28 13:45:16'),
(5, 'Welcome to Kimaat Lock. Your One time password(OTP) for registration is 1234. Team Kimaat Lock. Bits', '', '8320099260', '1', '1507166235571890060', 1, '2026-09-28 13:45:33'),
(6, '2', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-09-28 13:47:20'),
(7, '2', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-09-28 13:47:30'),
(8, '2', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-09-28 13:47:32'),
(9, '2', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-09-28 13:47:33'),
(10, '2', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-09-28 13:47:50'),
(11, '2', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-09-28 16:41:48'),
(12, '2', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-09-28 16:48:04'),
(13, '2', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-09-28 16:48:06'),
(14, '2', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-09-28 16:48:08'),
(15, '2', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-09-28 16:54:35'),
(16, 'Welcome to Kimaat Lock. Your One time password(OTP) for registration is 1234. Team Kimaat Lock. Bits', '', '8320099260', NULL, NULL, 1, '2026-09-28 17:05:52'),
(17, 'Welcome to Kimaat Lock. Your One time password(OTP) for registration is 1234. Team Kimaat Lock. Bits', '', '8320099260', NULL, NULL, 1, '2026-09-28 17:05:54'),
(18, 'Welcome to Kimaat Lock. Your One time password(OTP) for registration is 1234. Team Kimaat Lock. Bits', '', '8320099260', NULL, NULL, 1, '2026-09-28 17:05:54'),
(19, '1', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-09-29 16:17:23'),
(20, 'Welcome to Kimaat Lock. Your One time password(OTP) for registration is 1234. Team Kimaat Lock. Bits', '', '8320099260', NULL, NULL, 1, '2026-09-29 16:22:54'),
(21, '1', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-09-29 16:50:49'),
(22, '1', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-09-29 16:50:54'),
(23, '1', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-09-29 16:54:42'),
(24, '1', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-09-30 14:24:50'),
(25, '1', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-09-30 14:33:33'),
(26, '1', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-09-30 14:46:28'),
(27, '1', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-09-30 15:10:37'),
(28, '1', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-10-02 16:52:45'),
(29, '1', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-10-02 17:16:44'),
(30, '1', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-10-02 17:38:34'),
(31, '1', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-10-05 11:32:28'),
(32, '1', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-10-05 12:41:59'),
(33, '1', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-10-09 17:09:46'),
(34, '1', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-10-09 17:10:54'),
(35, '1', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-10-09 17:17:09'),
(36, '1', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-10-09 17:19:46'),
(37, '1', '', 'Welcome to Kimaat Lock. Y', '2', '', 1, '2026-10-09 17:20:55');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_state`
--

CREATE TABLE `tbl_state` (
  `state_id` int(11) NOT NULL,
  `state_name` varchar(100) NOT NULL,
  `state_code` varchar(10) DEFAULT NULL,
  `is_deleted` int(11) DEFAULT 1,
  `c_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_state`
--

INSERT INTO `tbl_state` (`state_id`, `state_name`, `state_code`, `is_deleted`, `c_date`) VALUES
(1, 'Andaman and Nicobar Islands', 'AN', 1, '2025-12-11 06:54:12'),
(2, 'Andhra Pradesh', 'AP', 1, '2025-12-11 06:54:12'),
(3, 'Arunachal Pradesh', 'AR', 1, '2025-12-11 06:54:12'),
(4, 'Assam', 'AS', 1, '2025-12-11 06:54:12'),
(5, 'Bihar', 'BR', 1, '2025-12-11 06:54:12'),
(6, 'Chandigarh', 'CH', 1, '2025-12-11 06:54:12'),
(7, 'Chhattisgarh', 'CT', 1, '2025-12-11 06:54:12'),
(8, 'Dadra and Nagar Haveli and Daman and Diu', 'DH', 1, '2025-12-11 06:54:12'),
(9, 'Delhi', 'DL', 1, '2025-12-11 06:54:12'),
(10, 'Goa', 'GA', 1, '2025-12-11 06:54:12'),
(11, 'Gujarat', 'GJ', 1, '2025-12-11 06:54:12'),
(12, 'Haryana', 'HR', 1, '2025-12-11 06:54:12'),
(13, 'Himachal Pradesh', 'HP', 1, '2025-12-11 06:54:12'),
(14, 'Jammu and Kashmir', 'JK', 1, '2025-12-11 06:54:12'),
(15, 'Jharkhand', 'JH', 1, '2025-12-11 06:54:12'),
(16, 'Karnataka', 'KA', 1, '2025-12-11 06:54:12'),
(17, 'Kerala', 'KL', 1, '2025-12-11 06:54:12'),
(18, 'Ladakh', 'LA', 1, '2025-12-11 06:54:12'),
(19, 'Lakshadweep', 'LD', 1, '2025-12-11 06:54:12'),
(20, 'Madhya Pradesh', 'MP', 1, '2025-12-11 06:54:12'),
(21, 'Maharashtra', 'MH', 1, '2025-12-11 06:54:12'),
(22, 'Manipur', 'MN', 1, '2025-12-11 06:54:12'),
(23, 'Meghalaya', 'ML', 1, '2025-12-11 06:54:12'),
(24, 'Mizoram', 'MZ', 1, '2025-12-11 06:54:12'),
(25, 'Nagaland', 'NL', 1, '2025-12-11 06:54:12'),
(26, 'Odisha', 'OR', 1, '2025-12-11 06:54:12'),
(27, 'Puducherry', 'PY', 1, '2025-12-11 06:54:12'),
(28, 'Punjab', 'PB', 1, '2025-12-11 06:54:12'),
(29, 'Rajasthan', 'RJ', 1, '2025-12-11 06:54:12'),
(30, 'Sikkim', 'SK', 1, '2025-12-11 06:54:12'),
(31, 'Tamil Nadu', 'TN', 1, '2025-12-11 06:54:12'),
(32, 'Telangana', 'TG', 1, '2025-12-11 06:54:12'),
(33, 'Tripura', 'TR', 1, '2025-12-11 06:54:12'),
(34, 'Uttarakhand', 'UT', 1, '2025-12-11 06:54:12'),
(35, 'Uttar Pradesh', 'UP', 1, '2025-12-11 06:54:12'),
(36, 'West Bengal', 'WB', 1, '2025-12-11 06:54:12'),
(37, 'asastt', 'asasastt', 2, '2025-12-27 05:28:39'),
(38, 'asa', '333', 2, '2026-01-09 11:17:48'),
(39, 'tt', 'as', 2, '2026-01-09 11:18:12');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_wishlist`
--

CREATE TABLE `tbl_wishlist` (
  `wishlist_id` int(11) NOT NULL,
  `wishlist_pro_id` int(11) NOT NULL,
  `wishlist_customer_id` int(11) NOT NULL,
  `is_deleted` int(11) NOT NULL DEFAULT 1,
  `c_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_wishlist`
--

INSERT INTO `tbl_wishlist` (`wishlist_id`, `wishlist_pro_id`, `wishlist_customer_id`, `is_deleted`, `c_date`) VALUES
(1, 58, 4, 2, '2026-10-09 18:10:02'),
(2, 57, 4, 2, '2026-10-09 18:10:03'),
(3, 55, 4, 2, '2026-10-09 18:10:04'),
(4, 45, 4, 2, '2026-10-09 18:05:51'),
(5, 60, 4, 1, '2026-10-09 18:05:52'),
(6, 48, 4, 2, '2026-10-09 18:05:53'),
(7, 47, 4, 2, '2026-10-09 18:10:07'),
(8, 42, 4, 2, '2026-10-09 18:05:55'),
(9, 43, 4, 2, '2026-10-09 18:05:56'),
(10, 41, 4, 2, '2026-10-09 18:05:57'),
(11, 39, 4, 2, '2026-10-09 18:05:58'),
(12, 54, 4, 1, '2026-10-09 18:10:06'),
(13, 46, 4, 1, '2026-10-09 18:10:07');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_banner`
--
ALTER TABLE `tbl_banner`
  ADD PRIMARY KEY (`banner_id`);

--
-- Indexes for table `tbl_brand`
--
ALTER TABLE `tbl_brand`
  ADD PRIMARY KEY (`brand_id`);

--
-- Indexes for table `tbl_cart`
--
ALTER TABLE `tbl_cart`
  ADD PRIMARY KEY (`cart_id`);

--
-- Indexes for table `tbl_category`
--
ALTER TABLE `tbl_category`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `tbl_city`
--
ALTER TABLE `tbl_city`
  ADD PRIMARY KEY (`city_id`);

--
-- Indexes for table `tbl_company_setting`
--
ALTER TABLE `tbl_company_setting`
  ADD PRIMARY KEY (`company_setting_id`);

--
-- Indexes for table `tbl_customer`
--
ALTER TABLE `tbl_customer`
  ADD PRIMARY KEY (`customer_id`);

--
-- Indexes for table `tbl_faq`
--
ALTER TABLE `tbl_faq`
  ADD PRIMARY KEY (`faq_id`);

--
-- Indexes for table `tbl_model`
--
ALTER TABLE `tbl_model`
  ADD PRIMARY KEY (`model_id`);

--
-- Indexes for table `tbl_notification`
--
ALTER TABLE `tbl_notification`
  ADD PRIMARY KEY (`notification_id`);

--
-- Indexes for table `tbl_offer`
--
ALTER TABLE `tbl_offer`
  ADD PRIMARY KEY (`offer_id`);

--
-- Indexes for table `tbl_order`
--
ALTER TABLE `tbl_order`
  ADD PRIMARY KEY (`kavach_order_id`);

--
-- Indexes for table `tbl_order_detail`
--
ALTER TABLE `tbl_order_detail`
  ADD PRIMARY KEY (`kavach_order_detail_id`);

--
-- Indexes for table `tbl_package`
--
ALTER TABLE `tbl_package`
  ADD PRIMARY KEY (`package_id`);

--
-- Indexes for table `tbl_partner`
--
ALTER TABLE `tbl_partner`
  ADD PRIMARY KEY (`partner_id`),
  ADD KEY `idx_partner_visible_order` (`is_deleted`,`partner_priority`,`partner_id`);

--
-- Indexes for table `tbl_product`
--
ALTER TABLE `tbl_product`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `tbl_product_depreciation`
--
ALTER TABLE `tbl_product_depreciation`
  ADD PRIMARY KEY (`depreciation_id`),
  ADD KEY `idx_product_package_month` (`product_id`,`package_id`,`month_number`);

--
-- Indexes for table `tbl_sms`
--
ALTER TABLE `tbl_sms`
  ADD PRIMARY KEY (`sms_id`);

--
-- Indexes for table `tbl_state`
--
ALTER TABLE `tbl_state`
  ADD PRIMARY KEY (`state_id`);

--
-- Indexes for table `tbl_wishlist`
--
ALTER TABLE `tbl_wishlist`
  ADD PRIMARY KEY (`wishlist_id`),
  ADD KEY `wishlist_pro_id` (`wishlist_pro_id`),
  ADD KEY `wishlist_customer_id` (`wishlist_customer_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_banner`
--
ALTER TABLE `tbl_banner`
  MODIFY `banner_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tbl_brand`
--
ALTER TABLE `tbl_brand`
  MODIFY `brand_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tbl_cart`
--
ALTER TABLE `tbl_cart`
  MODIFY `cart_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `tbl_category`
--
ALTER TABLE `tbl_category`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tbl_city`
--
ALTER TABLE `tbl_city`
  MODIFY `city_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `tbl_company_setting`
--
ALTER TABLE `tbl_company_setting`
  MODIFY `company_setting_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbl_customer`
--
ALTER TABLE `tbl_customer`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tbl_faq`
--
ALTER TABLE `tbl_faq`
  MODIFY `faq_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tbl_model`
--
ALTER TABLE `tbl_model`
  MODIFY `model_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `tbl_notification`
--
ALTER TABLE `tbl_notification`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `tbl_offer`
--
ALTER TABLE `tbl_offer`
  MODIFY `offer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tbl_order`
--
ALTER TABLE `tbl_order`
  MODIFY `kavach_order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `tbl_order_detail`
--
ALTER TABLE `tbl_order_detail`
  MODIFY `kavach_order_detail_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `tbl_package`
--
ALTER TABLE `tbl_package`
  MODIFY `package_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tbl_partner`
--
ALTER TABLE `tbl_partner`
  MODIFY `partner_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tbl_product`
--
ALTER TABLE `tbl_product`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `tbl_product_depreciation`
--
ALTER TABLE `tbl_product_depreciation`
  MODIFY `depreciation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2737;

--
-- AUTO_INCREMENT for table `tbl_sms`
--
ALTER TABLE `tbl_sms`
  MODIFY `sms_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `tbl_state`
--
ALTER TABLE `tbl_state`
  MODIFY `state_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `tbl_wishlist`
--
ALTER TABLE `tbl_wishlist`
  MODIFY `wishlist_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
