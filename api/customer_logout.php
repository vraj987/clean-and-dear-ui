<?php
include 'dbconnect.php';
$customer_id = mysqli_real_escape_string($sql, $_POST['customer_id']);
date_default_timezone_set('Asia/Kolkata');
$c_date = date('d-m-Y');
if (!empty($customer_id)) {
    $update_otp = mysqli_query($sql, "UPDATE `tbl_customer` SET customer_android_token = '',customer_ios_token='' WHERE customer_id = '$customer_id'  AND is_deleted=1");
    $result['status'] = '1';
    $result['error'] = 'Logout';
    $result['result'] = array();
} else {
    $result['status'] = '0';
    $result['error'] = 'Required data missing.';
    $result['result'] = array();
}
echo json_encode($result);
?>