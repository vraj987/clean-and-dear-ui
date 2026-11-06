<?php
include 'dbconnect.php';

$customer_id = mysqli_real_escape_string($sql, $_POST['customer_id']);
$add_query = '';
    // Set $sel from POST, but sanitize it
$customer_auth_token = isset($_POST['customer_auth_token']) ? mysqli_real_escape_string($sql, $_POST['customer_auth_token']) : '';

$customer_android_token = isset($_POST['customer_android_token']) ? mysqli_real_escape_string($sql, $_POST['customer_android_token']) : '';
$customer_ios_token = isset($_POST['customer_ios_token']) ? mysqli_real_escape_string($sql, $_POST['customer_ios_token']) : '';
$customer_app_version = isset($_POST['customer_app_version']) ? mysqli_real_escape_string($sql, $_POST['customer_app_version']) : '';


$rows = array();
if (!empty($customer_id)) {

    if(!empty($customer_auth_token)) {
        $add_query .= " AND tbl_customer.customer_auth_token='$customer_auth_token' ";
    }

    $str_row = "SELECT tbl_state.state_name,tbl_city.city_name,tbl_customer.* FROM `tbl_customer` LEFT JOIN tbl_city ON tbl_city.city_id = tbl_customer.city_id LEFT JOIN tbl_state ON tbl_state.state_id = tbl_customer.state_id  WHERE tbl_customer.`customer_id`='$customer_id' AND tbl_customer.`is_deleted`=1 AND tbl_customer.customer_is_verify=1 and customer_logout = 1 $add_query";

    $query_str_row = mysqli_query($sql, $str_row);
    if (mysqli_num_rows($query_str_row) > 0) {
        $result['status'] = '1';
        $result['error'] = '';

        while ($rows = mysqli_fetch_assoc($query_str_row)) {

          $customer_id = $rows['customer_id'];

          $update_query = mysqli_query($sql, "UPDATE `tbl_customer` SET customer_android_token='$customer_android_token',customer_ios_token='$customer_ios_token',customer_app_version='$customer_app_version' WHERE is_deleted = 1 AND customer_id = '$customer_id'");
            
            foreach ($rows as $index => $value) {
                if ($value === null) {
                    $rows[$index] = '';
                } else {
                    $rows[$index] = $value;
                }
            }
           
            
            $result['result'][] = $rows;


        }
    } 
    else 
    {

        $result['status'] = '3';
        $result['error'] = '';
        $result['result'] = array();
    }
} else {
    $result['status'] = '3';
    $result['error'] = '';
    $result['result'] = array();
}
echo json_encode($result);
?>
