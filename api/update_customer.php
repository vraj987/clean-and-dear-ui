<?php
include 'dbconnect.php';

$customer_id = mysqli_real_escape_string($sql, $_POST['customer_id']);
$customer_name = mysqli_real_escape_string($sql, $_POST['customer_name']);
$customer_email = mysqli_real_escape_string($sql, $_POST['customer_email']);
$customer_address = mysqli_real_escape_string($sql, $_POST['customer_address']);
$customer_pincode = mysqli_real_escape_string($sql, $_POST['customer_pincode']);
$state_id = mysqli_real_escape_string($sql, $_POST['state_id']);
$city_id = mysqli_real_escape_string($sql, $_POST['city_id']);

if (!empty($customer_id) && !empty($customer_name) && !empty($city_id) && !empty($state_id)) {
    $regex = '/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,3})$/';
    if (preg_match($regex, $customer_email) || empty($customer_email)) {
        $str_row = mysqli_fetch_assoc(mysqli_query($sql, "SELECT * FROM `tbl_customer` WHERE `customer_id`='$customer_id'  AND `is_deleted`=1 AND customer_id='$customer_id'"));
     
        $update_query = mysqli_query($sql, "UPDATE `tbl_customer` SET customer_pincode='$customer_pincode',   state_id='$state_id',`customer_name`='$customer_name',`customer_address`='$customer_address',`customer_email`='$customer_email',`city_id`='$city_id' WHERE  is_deleted = 1 AND customer_id = '$customer_id'");

        if ($update_query) {
            $result['status'] = '1';
            $result['error'] = 'Profile Updated successfully.';
            $result['result'] = array();
        } else {
            $result['status'] = '0';
            $result['error'] = 'Error while updating Profile.';
            $result['result'] = array();
        }
    } else {
        $result['status'] = '0';
        $result['error'] = 'Please enter valid email';
        $result['result'] = array();
    }
} else {
    $result['status'] = '0';
    $result['error'] = 'Required data missing.';
    $result['result'] = array();
}
echo json_encode($result);
?>