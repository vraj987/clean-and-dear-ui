<?php
// kavach_razorpay_verify.php
include("dbconnect.php");

// ===== Request Parameters =====
$kavach_customer_id        = mysqli_real_escape_string($sql, $_REQUEST['kavach_customer_id']);
$kavach_razorpayOrderId    = mysqli_real_escape_string($sql, $_REQUEST['kavach_razorpayOrderId']);
$current_kavach_order_id   = mysqli_real_escape_string($sql, $_REQUEST['current_kavach_order_id']);
$razorpay_signature        = mysqli_real_escape_string($sql, $_REQUEST['razorpay_signature']);
$razorpay_payment_id       = mysqli_real_escape_string($sql, $_REQUEST['razorpay_payment_id']);
$kavach_razorpay_status    = mysqli_real_escape_string($sql, $_REQUEST['kavach_razorpay_status']); // 2=Success, 3=Fail

// ===== Verify Signature =====
$payload = $current_kavach_order_id . '|' . $razorpay_payment_id;
$generated_signature = hash_hmac('sha256', $payload, 'KQ4v5F9J4yu9sZwUVZQuY2hP');

date_default_timezone_set('Asia/Kolkata');
$c_date = date('Y-m-d H:i:s');
$result['result'] = array();

// ===== Fetch Kavach Order Amount =====

$query_kavach_amount = mysqli_query($sql, "SELECT 
                                                `kavach_payable`,
                                                `kavach_prefix`,
                                                `kavach_num`,
                                                `kavach_mobile`,
                                                `kavach_discount`,
                                                `kavach_delivery_charges`
                                           FROM `tbl_order` 
                                           WHERE
                                              `kavach_order_id` = '$current_kavach_order_id' and is_deleted=1 
                                            ");

$fetch_kavach_amount = mysqli_fetch_assoc($query_kavach_amount);
 $kavach_payable = $fetch_kavach_amount['kavach_payable'];
$kavach_prefix  = $fetch_kavach_amount['kavach_prefix'];
$kavach_mobile  = $fetch_kavach_amount['kavach_mobile'];

$kavach_num = $fetch_kavach_amount['kavach_prefix'] . $fetch_kavach_amount['kavach_num'];
$kavach_payable = $fetch_kavach_amount['kavach_payable'] + $fetch_kavach_amount['kavach_delivery_charges'];
$total_discount = $fetch_kavach_amount['kavach_discount'];
$kavach_payable = number_format($kavach_payable - $total_discount, 2);
$kavach_received_amount = str_replace(",", "", $kavach_payable);

// ===== Validate Required Data =====
if (!empty($current_kavach_order_id) && !empty($kavach_customer_id)) {


    $str_get = "SELECT `kavach_order_id`, `kavach_razorpay_signature` 
                FROM `tbl_order` 
                WHERE
                   `kavach_order_id` = '$current_kavach_order_id' and is_deleted=1";

    $query_get = mysqli_query($sql, $str_get);
  
    if (mysqli_num_rows($query_get) > 0) {
         


        // ===== Update Razorpay Payment Info =====
        mysqli_query($sql, "UPDATE tbl_order SET 
                                `kavach_razorpay_payment_id` = '$razorpay_payment_id',
                                `kavach_razorpay_signature`  = '$razorpay_signature',
                                `kavach_razorpay_status`     = '$kavach_razorpay_status'
                            WHERE `kavach_customer_id` = '$kavach_customer_id'  and `kavach_order_id` = '$current_kavach_order_id'
                        ");

        // ===== Handle Status =====
        if ($kavach_razorpay_status == 3) {

        mysqli_query($sql, "UPDATE tbl_order SET 
                                    `kavach_order_status`     = '3'
                                WHERE `kavach_customer_id` = '$kavach_customer_id' 
                                  AND `kavach_order_id` = '$current_kavach_order_id' 
                                ");


            // ===== FAILURE =====
            $result['result'] = array();
            $result['status'] = '1';
            $result['error']  = 'Failure.';

        } elseif ($kavach_razorpay_status == 2) {
            // ===== SUCCESS =====

            mysqli_query($sql, "UPDATE tbl_order SET 
                                    `kavach_received_amount`  = '$kavach_received_amount',
                                    `kavach_remaining_amount` = '0',
                                    `kavach_order_status`     = '2'
                                WHERE `kavach_customer_id` = '$kavach_customer_id' 
                                  AND `kavach_order_id` = '$current_kavach_order_id' 
                                ");

            $result['result'] = array();
            $result['status'] = '1';
            $result['error']  = 'Success.';

        } else {
            // ===== PENDING =====
            $result['result'] = array();
            $result['status'] = '1';
            $result['error']  = 'Pending.';
        }

    } else {
        $result['result'] = array();
        $result['status'] = '0';
        $result['error']  = 'Error.';
    }

} else {
    $result['result'] = array();
    $result['status'] = '0';
    $result['error']  = 'Required Data Missing.';
}

echo json_encode($result);
?>