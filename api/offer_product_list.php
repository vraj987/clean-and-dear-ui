<?php
// offer_product_list.php (api example)
include 'dbconnect.php';

$offer_id   = isset($_REQUEST['offer_id'])   ? intval($_REQUEST['offer_id'])   : 0;
$product_id = isset($_REQUEST['product_id']) ? intval($_REQUEST['product_id']) : 0;
$user_id    = isset($_REQUEST['user_id'])    ? intval($_REQUEST['user_id'])    : 0;

/* ================= Filter : Offers ================= */
$where = "is_deleted = 1";
if ($offer_id > 0) $where .= " AND offer_id = '$offer_id'";

$offer_query = mysqli_query($sql, "SELECT offer_id, offer_name, offer_start_date, offer_end_date, offer_product_ids, offer_priority, is_deleted, c_date FROM tbl_offer WHERE $where ORDER BY offer_priority ASC, offer_id DESC");

if (mysqli_num_rows($offer_query) > 0) {

    $result['status'] = '1';
    $result['error']  = '';
    $result['result'] = array();

    while ($offer = mysqli_fetch_assoc($offer_query)) {

        /* ===== Parse product ids ===== */
        $product_ids_arr = [];
        if (!empty($offer['offer_product_ids'])) {
            $product_ids_arr = array_filter(array_map('intval', explode(',', $offer['offer_product_ids'])));
        }

        /* ===== If product_id filter is given, only keep offers that contain it ===== */
        if ($product_id > 0) {
            if (!in_array($product_id, $product_ids_arr)) {
                continue;
            }
        }

        $products = [];
        if (count($product_ids_arr) > 0) {
            $ids_str = implode(',', $product_ids_arr);

            $pwhere = "p.is_deleted = 1 AND p.product_id IN ($ids_str)";
            if ($product_id > 0) $pwhere .= " AND p.product_id = '$product_id'";

            $pq = mysqli_query($sql, "SELECT p.product_id, p.category_id, p.brand_id, p.model_id, p.product_variant, p.launch_date, p.original_price, p.product_images, p.product_image, p.mrp, p.retailer_price, c.category_name, b.brand_name, m.model_name, m.model_image FROM tbl_product p LEFT JOIN tbl_category c ON c.category_id = p.category_id LEFT JOIN tbl_brand b ON b.brand_id = p.brand_id LEFT JOIN tbl_model m ON m.model_id = p.model_id WHERE $pwhere ORDER BY p.product_id DESC");

            while ($row = mysqli_fetch_assoc($pq)) {
                $pid = $row['product_id'];
                /* ===== Wishlist check ===== */
                $row['wishlist_id'] = '';
                if ($user_id > 0) {
                    $dq = mysqli_query($sql, "SELECT `wishlist_id` FROM `tbl_wishlist` WHERE wishlist_pro_id = '$pid' AND wishlist_customer_id = '$user_id' AND is_deleted='1'");
                    if ($d_row = mysqli_fetch_assoc($dq)) {
                        $row['wishlist_id'] = $d_row['wishlist_id'];
                    }
                }

                /* ===== Common product fields (same as product API) ===== */
                $row['retailer_price_monthly'] = $row['retailer_price'] ? strval(round($row['retailer_price'] / 20, 2)) : '';
                $row['pro_name'] = trim(($row['brand_name'] ?? '') . ' ' . ($row['model_name'] ?? '') . ' ' . $row['product_variant']);
                $row['model_image_url'] = !empty($row['model_image']) ? $server_model_url . $row['model_image'] : '';
                $row['product_images'] = !empty($row['product_images']) ? $server_product_url . $row['product_images'] : '';
                $products[] = $row;
            }
        }

        /* ===== Skip offers with no matching products (when product_id filter applied) ===== */
        if ($product_id > 0 && count($products) == 0) {
            continue;
        }

        /* ===== Build offer response ===== */
        $offer['offer_product_ids']    = $offer['offer_product_ids'];
        $offer['offer_product_id_arr'] = array_values($product_ids_arr);
        $offer['offer_priority']       = strval($offer['offer_priority']);
        $offer['products']             = $products;
        $result['result'][] = $offer;
    }

    /* If nothing matched after filtering, mark empty */
    if (count($result['result']) == 0) {
        $result['status'] = '0';
        $result['error']  = '';
        $result['result'] = array();
    }
} else {
    $result['status'] = '0';
    $result['error']  = '';
    $result['result'] = array();
}
echo json_encode($result);
