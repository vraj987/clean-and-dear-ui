<?php
include 'dbconnect.php';

$query = mysqli_query($sql, "SELECT 
                                tbl_product_category.product_category_id,
                                tbl_product_category.product_category_id AS category_id,
                                tbl_product_category.category_name,
                                tbl_product_category.category_image,
                                tbl_product_category.priority
                             FROM `tbl_product_category`
                             WHERE tbl_product_category.`is_deleted` = 1
                             ORDER BY tbl_product_category.`priority` ASC,
                                      tbl_product_category.`category_name` ASC");

if (mysqli_num_rows($query) > 0) {
    $result['status'] = '1';
    $result['error'] = '';
    while ($c_rows = mysqli_fetch_assoc($query)) {

        // Add full image URL
        $c_rows['category_image_url'] = !empty($c_rows['category_image'])
            ? $server_category_url . $c_rows['category_image']
            : '';

        $result['result'][] = $c_rows;
    }
} else {
    $result['status'] = '0';
    $result['error'] = '';
    $result['result'] = array();
}

echo json_encode($result);
?>
