<?php
// my_wishlist.php (api example) - list all wishlist products for a logged-in person
include 'dbconnect.php';

header('Content-Type: application/json; charset=utf-8');

$user_id = isset($_REQUEST['user_id']) ? intval($_REQUEST['user_id']) : 0;

// ===== Validate user_id =====
if ($user_id < 1) {
    $result['status'] = '0';
    $result['error']  = 'A valid user_id is required.';
    $result['result'] = array();
    echo json_encode($result);
    exit;
}

// ===== Filters =====
$where = "w.is_deleted = 1 AND w.wishlist_customer_id = '$user_id'";

$query = mysqli_query($sql, "SELECT w.wishlist_id, w.wishlist_pro_id, w.wishlist_customer_id, w.c_date AS wishlist_date, p.brand_id, p.model_id, p.product_id, p.product_variant, p.launch_date, p.original_price, p.product_image, p.product_images, p.mrp, p.retailer_price, c.category_name, b.brand_name, m.model_name, m.model_image FROM tbl_wishlist w LEFT JOIN tbl_product  p ON p.product_id  = w.wishlist_pro_id LEFT JOIN tbl_category c ON c.category_id = p.category_id LEFT JOIN tbl_brand    b ON b.brand_id    = p.brand_id LEFT JOIN tbl_model    m ON m.model_id    = p.model_id WHERE $where ORDER BY w.wishlist_id DESC");

if (mysqli_num_rows($query) > 0) {

    $result['status'] = '1';
    $result['error']  = '';
    $result['result'] = array();

    while ($row = mysqli_fetch_assoc($query)) {

        $row['wishlist_id'] = (string)$row['wishlist_id'];
        $row['product_id']  = (string)$row['product_id'];

        $row['retailer_price_monthly'] = $row['retailer_price']
            ? strval(round($row['retailer_price'] / 20, 2))
            : '';

        $row['pro_name'] = trim($row['brand_name'] . ' ' . $row['model_name'] . ' ' . $row['product_variant']);

        $row['model_image_url'] = !empty($row['model_image'])
            ? $server_model_url . $row['model_image']
            : '';

        $row['product_image_url'] = !empty($row['product_image'])
            ? $server_product_url . $row['product_image']
            : $row['model_image_url'];

        $row['product_images_url'] = !empty($row['product_images'])
            ? $server_product_url . $row['product_images']
            : $row['model_image_url'];

        $result['result'][] = $row;
    }
} else {
    $result['status'] = '0';
    $result['error']  = '';
    $result['result'] = array();
}

echo json_encode($result);