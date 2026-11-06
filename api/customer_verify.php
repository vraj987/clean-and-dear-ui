<?php
include 'dbconnect.php';
$customer_mobile = mysqli_real_escape_string($sql, $_POST['customer_mobile']);
$customer_otp = mysqli_real_escape_string($sql, $_POST['customer_otp']);
date_default_timezone_set('Asia/Kolkata');
$c_date = date('Y-m-d H:i:s');
$today_date = date('d-m-Y');
if (!empty($customer_mobile)  && !empty($customer_otp) && !empty($customer_mobile)) {
    if (strlen($customer_mobile) == 10 && preg_match('/^[0-9]{10}+$/', $customer_mobile)) {
         $select = mysqli_query($sql, "SELECT `customer_id` FROM `tbl_customer` WHERE `customer_mobile` = '$customer_mobile'   AND `is_deleted` = 1");
        if (mysqli_num_rows($select) > 0) {
            $check_user = "true";
        } else {
            $check_user =  "false";
        }
        if ($check_user == 'true') {
            $str = "SELECT * FROM `tbl_customer` WHERE  `customer_mobile` = '$customer_mobile'  AND `is_deleted` = 1 AND customer_otp = '$customer_otp'";
            $select = mysqli_query($sql, $str);
            if (mysqli_num_rows($select) > 0) {
                $row = mysqli_fetch_assoc($select);
                $customer_id = !empty($row['customer_id']) ? $row['customer_id'] : '';
                $row['customer_email'] = !empty($rowrow['customer_email']) ? $row['customer_email'] : '';
                $row['customer_address'] = !empty($row['customer_address']) ? $row['customer_address'] : '';
                $row['customer_pincode'] = !empty($row['customer_pincode']) ? $row['customer_pincode'] : '';
                $row['customer_city'] = !empty($row['customer_city']) ? $row['customer_city'] : '';
                $str_result = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                $customer_auth_token = substr(str_shuffle($str_result),0, 10);
                $row['customer_auth_token'] = $customer_auth_token;
                $update_otp = mysqli_query($sql, "UPDATE `tbl_customer` SET customer_is_verify=1,customer_auth_token='$customer_auth_token',`customer_otp` = NULL WHERE customer_mobile = '$customer_mobile' AND customer_otp = '$customer_otp' ");
                $result['status'] = '1';
                $result['error'] = 'Mobile number verify successfully.';
                $result['result'][] = $row;
            } else {
                $result['status'] = '0';
                $result['error'] = 'Wrong or expired OTP. Please re-enter.';
                $result['result'] = array();
            }
        } else {
            $result['status'] = '0';
            $result['error'] = 'Customer detail not found.';
            $result['result'] = array();
        }
    } else {
        $result['status'] = '0';
        $result['error'] = 'Please enter valid mobile no.';
        $result['result'] = array();
    }
} else {
    $result['status'] = '0';
    $result['error'] = 'Required data missing.';
    $result['result'] = array();
}
echo json_encode($result);
?>