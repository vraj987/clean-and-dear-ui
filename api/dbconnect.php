<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// ===== Razorpay Credentials =====
$RAZORPAY_KEY_ID = 'rzp_test_l99uVs9OtIIqFL';
$RAZORPAY_KEY_SECRET = 'jSfm5ENBwuQRwAqPNViQwHCm';

date_default_timezone_set('Asia/Kolkata');

$c_date = date('Y-m-d H:i:s');
$d_date = date('Y-m-d');
$t_date = date('H:i:s');
$from_date = date("2025-04-01");

$company_name = "Kimaat Lock";
$company_id = 2;
$currency_symbol = '₹';
$android_store_link = "";
$ios_store_link = "";
$folder = "kimaat_lock/uploads";

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];

$server_url = "$scheme://$host/kimaat_lock/";

$ocr_url = "http://192.168.1.124:8000/ocr/";
$server_logo_url = "$scheme://$host/$folder/logo/";
$server_banner_url = "$scheme://$host/$folder/banner/";
$server_brand_url = "$scheme://$host/$folder/brand/";
$server_model_url = "$scheme://$host/$folder/model/";
$server_category_url = "$scheme://$host/$folder/category/";
$server_package_url = "$scheme://$host/$folder/packages/";
$server_upload_url = "$scheme://$host/$folder/invoice/";
$server_product_url = "$scheme://$host/$folder/product/";

$product_image_upload = "../uploads/product/";


if ($host == "192.168.1.222") {
    $sql = mysqli_connect("localhost", "root", "", "bits_kimaat_lock");
} else {
    $sql = mysqli_connect("localhost", "u180491147_kimmat_lock", "HR8WZf482A34j", "u180491147_kimmat_lock");
}

if (mysqli_connect_errno()) {
    echo "Failed to connect to MySQL: " . mysqli_connect_error();
    exit;
}

?>
