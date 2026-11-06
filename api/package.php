<?php
include 'dbconnect.php';

$query = mysqli_query($sql, "SELECT 
                                tbl_package.*
                             FROM `tbl_package` 
                             WHERE tbl_package.`is_deleted` = 1 
                             ORDER BY tbl_package.`package_name` ASC");

if (mysqli_num_rows($query) > 0) {
    $result['status'] = '1';
    $result['error'] = '';
    while ($c_rows = mysqli_fetch_assoc($query)) {

        // Add full image URL
        $c_rows['package_image_url'] = $server_package_url . $c_rows['package_image'];

        $result['result'][] = $c_rows;
    }
} else {
    $result['status'] = '0';
    $result['error'] = '';
    $result['result'] = array();
}

echo json_encode($result);
?>