<?php
include 'dbconnect.php';

$query = mysqli_query($sql, "SELECT 
                                tbl_brand.brand_id,
                                tbl_brand.brand_name,
                                tbl_brand.brand_image
                             FROM `tbl_brand` 
                             WHERE tbl_brand.`is_deleted` = 1 
                             ORDER BY tbl_brand.`brand_name` ASC");

if (mysqli_num_rows($query) > 0) {
    $result['status'] = '1';
    $result['error'] = '';
    while ($c_rows = mysqli_fetch_assoc($query)) {

        // Add full image URL
        $c_rows['brand_image_url'] = $server_brand_url . $c_rows['brand_image'];

        $result['result'][] = $c_rows;
    }
} else {
    $result['status'] = '0';
    $result['error'] = '';
    $result['result'] = array();
}

echo json_encode($result);
?>