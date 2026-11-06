<?php

include 'dbconnect.php';
include 'function.php';

$customer_mobile = mysqli_real_escape_string($sql, $_POST['customer_mobile']);
$customer_email = mysqli_real_escape_string($sql, $_POST['customer_email']);
$customer_name = mysqli_real_escape_string($sql, $_POST['customer_name']);
$state_id = mysqli_real_escape_string($sql, $_POST['state_id']);
$city_id = mysqli_real_escape_string($sql, $_POST['city_id']);

$customer_address = "";
if(isset($_POST['customer_address']) && !empty($_POST['customer_address'])) {
    $customer_address = mysqli_real_escape_string($sql, $_POST['customer_address']);
}

date_default_timezone_set('Asia/Kolkata');
$c_date = date('Y-m-d H:i:s');
$check_user = check_user($customer_mobile);
$str_row = "SELECT * FROM `tbl_customer` WHERE `customer_mobile`='$customer_mobile'  AND `is_deleted`=1 and `customer_is_verify`=2";
$query_str_row = mysqli_query($sql, $str_row);
if (mysqli_num_rows($query_str_row) > 0) {
    $rows = mysqli_fetch_assoc($query_str_row);
    $customer_otp = mt_rand(1000, 9999);
    // if($customer_mobile==8320099260 || $customer_mobile==7016248207) {
    //     $customer_otp = 1234;
    // }
    $customer_otp = 1234;
    $sms_text = "Welcome to " . $company_name . ". Your One time password(OTP) for registration is ".$customer_otp.". Team " . $company_name . ". Bits";
    $type = 1;
    $regex = '/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,3})$/';
    if (preg_match($regex, $customer_email) || empty($customer_email)) {
        $update_otp = mysqli_query($sql, "UPDATE `tbl_customer` SET customer_otp = $customer_otp,customer_email='$customer_email',customer_name='$customer_name',state_id='$state_id',city_id='$city_id',customer_address='$customer_address' WHERE `customer_mobile`='$customer_mobile' AND `is_deleted`=1");
        send_message($type, $sms_text, $customer_mobile);
        $result['status'] = '1';
        $result['error'] = 'OTP has been sent to your mobile number.';
        $result['result'] = array();
    } else {
        $result['status'] = '0';
        $result['error'] = 'Please enter valid email';
        $result['result'] = array();
    }
} else {
    if ($check_user == "false") {
        if (!empty($customer_mobile) && !empty($customer_name) ) {
            if (strlen($customer_mobile) == 10 && preg_match('/^[0-9]{10}+$/', $customer_mobile)) {
                $regex = '/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,3})$/';
                if (preg_match($regex, $customer_email) || empty($customer_email)) {
                    $customer_otp = mt_rand(1000, 9999);
                    if($customer_mobile==8320099260 || $customer_mobile==7016248207) {
                        $customer_otp = 0000;
                    }
                    $insert_query = mysqli_query($sql, "INSERT INTO `tbl_customer`(customer_type,`customer_address`, `customer_name`,`customer_email`, `customer_mobile`,  `customer_is_verify`,`is_deleted`, `c_date`,`state_id`,`city_id`) VALUES (2,'$customer_address','$customer_name', '$customer_email' ,'$customer_mobile',2,1,'$c_date','$state_id', '$city_id')");
                    if ($insert_query) {
                        $sms_text = "Welcome to " . $company_name . ". Your One time password(OTP) for registration is ".$customer_otp.". Team " . $company_name . ". Bits";
                        $type = 1;
                        $update_otp = mysqli_query($sql, "UPDATE `tbl_customer` SET customer_otp = '$customer_otp',customer_logout=1 WHERE customer_mobile = '$customer_mobile'");
                        if ($update_otp) {
                            send_message($type, $sms_text, $customer_mobile);
                            $result['status'] = '1';
                            $result['error'] = 'OTP has been sent to your mobile number.';
                            $result['result'] = array();
                        }
                    } else {
                        $result['status'] = '0';
                        $result['error'] = 'Error! while inserting.';
                        $result['result'] = array();
                    }
                } else {
                    $result['status'] = '0';
                    $result['error'] = 'Please enter valid email';
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
    } else {
        $result['status'] = '0';
        $result['error'] = 'Your mobile number is already registered with us.';
        $result['result'] = array();
    }
}
echo json_encode($result);
?>