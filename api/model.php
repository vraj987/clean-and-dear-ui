<?php
include 'dbconnect.php';

$brand_id = isset($_POST['brand_id']) ? mysqli_real_escape_string($sql, $_POST['brand_id']) : '';

$str_query = "";
if (!empty($brand_id)) {
    $str_query .= " AND tbl_model.brand_id = '$brand_id' ";
}

$query = mysqli_query($sql, "SELECT 
                                tbl_model.model_id,
                                tbl_model.brand_id,
                                tbl_model.model_name,
                                tbl_model.model_image
                             FROM `tbl_model` 
                             WHERE tbl_model.`is_deleted` = 1 $str_query
                             ORDER BY tbl_model.`model_name` ASC");

if (mysqli_num_rows($query) > 0) {
    $result['status'] = '1';
    $result['error'] = '';
    $result['result'] = array();

    while ($c_rows = mysqli_fetch_assoc($query)) {

        $c_rows['model_image_url'] = $server_model_url . $c_rows['model_image'];

        $result['result'][] = $c_rows;
    }
} else {
    $result['status'] = '0';
    $result['error'] = '';
    $result['result'] = array();
}

echo json_encode($result);
?>