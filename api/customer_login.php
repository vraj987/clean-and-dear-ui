<?php
include 'dbconnect.php';
include 'function.php';
$customer_mobile = mysqli_real_escape_string($sql, $_POST['customer_mobile']);
date_default_timezone_set('Asia/Kolkata');
$c_date = date('d-m-Y');
if (!empty($customer_mobile)) {
    if (strlen($customer_mobile) == 10 && preg_match('/^[0-9]{10}+$/', $customer_mobile)) {
        $str_row = "SELECT * FROM `tbl_customer` WHERE `customer_mobile`='$customer_mobile' AND `customer_is_verify`= 1  AND `is_deleted`=1 ";
        $query_str_row = mysqli_query($sql, $str_row);
        if (mysqli_num_rows($query_str_row) > 0) {
            $result['status'] = '1';
            $result['error'] = '';
            while ($rows = mysqli_fetch_assoc($query_str_row)) {
                $customer_otp = mt_rand(1000, 9999);
                // if($customer_mobile==8320099260 || $customer_mobile==7016248207) {
                    $customer_otp = "1234";
                // }
                $sms_text = "Welcome to " . $company_name . ". Your One time password(OTP) for registration is " . $customer_otp . ". Team " . $company_name . ". Bits";
                $type = 1;
                $update_otp = mysqli_query($sql, "UPDATE `tbl_customer` SET customer_otp = '$customer_otp',customer_logout=1 WHERE customer_mobile = '$customer_mobile'  AND is_deleted=1");
                if ($update_otp) {
                    send_message($company_id, $type, $sms_text, $customer_mobile);
                    $result['status'] = '1';
                    $result['error'] = 'OTP has been sent to your mobile number.';
                    $result['result'] = array();
                }
            }
        } else {
            $result['status'] = '0';
            $result['error'] = 'Invalid mobile number.';
            $result['result'] = array();
        }
    } else {
        $result['status'] = '0';
        $result['error'] = 'Please enter a valid mobile number.';
        $result['result'] = array();
    }
} else {
    $result['status'] = '0';
    $result['error'] = 'Required data missing.';
    $result['result'] = array();
}
echo json_encode($result);
?>