<?php
include 'dbconnect.php';

$query = mysqli_query($sql, "SELECT b.*, p.product_variant FROM `tbl_banner` b LEFT JOIN `tbl_product` p ON p.product_id = b.banner_product_id WHERE b.`is_deleted` = 1 ORDER BY b.`banner_priority` ASC");

if (mysqli_num_rows($query) > 0) {
    $result['status'] = '1';
    $result['error']  = '';

    while ($c_rows = mysqli_fetch_assoc($query)) {

        // Image URL
        $c_rows['banner_image_url'] = $server_banner_url . $c_rows['banner_image'];

        // Clean types
        $c_rows['banner_type']       = $c_rows['banner_type'] ? $c_rows['banner_type'] : 'store';
        $c_rows['banner_product_id'] = $c_rows['banner_product_id'] ? (int)$c_rows['banner_product_id'] : null;
        $c_rows['product_variant']      = $c_rows['product_variant'] ? $c_rows['product_variant'] : '';

        $result['result'][] = $c_rows;
    }
} else {
    $result['status'] = '0';
    $result['error']  = '';
    $result['result'] = array();
}

echo json_encode($result);
