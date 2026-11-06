<?php
/** Verify a Razorpay payment for an order created by purchase_cart.php. */
require_once __DIR__ . '/dbconnect.php';
header('Content-Type: application/json; charset=utf-8');

function cart_payment_reply($status, $error, $rows = array())
{
    echo json_encode(array('status' => (string)$status, 'error' => (string)$error, 'result' => $rows), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    cart_payment_reply('0', 'Please use the POST method.');
}
if (!isset($sql) || !($sql instanceof mysqli) || empty($RAZORPAY_KEY_SECRET)) {
    http_response_code(500);
    cart_payment_reply('0', 'Payment verification is not configured on the server.');
}
mysqli_set_charset($sql, 'utf8mb4');

$customerId = isset($_POST['kavach_customer_id']) ? (int)$_POST['kavach_customer_id'] : 0;
$orderId = isset($_POST['current_kavach_order_id']) ? (int)$_POST['current_kavach_order_id'] : 0;
$razorpayOrderId = isset($_POST['kavach_razorpayOrderId']) ? trim((string)$_POST['kavach_razorpayOrderId']) : '';
$paymentId = isset($_POST['razorpay_payment_id']) ? trim((string)$_POST['razorpay_payment_id']) : '';
$signature = isset($_POST['razorpay_signature']) ? trim((string)$_POST['razorpay_signature']) : '';
$paymentStatus = isset($_POST['kavach_razorpay_status']) ? (int)$_POST['kavach_razorpay_status'] : 0; // 2=paid, 3=failed

if ($customerId < 1 || $orderId < 1 || $razorpayOrderId === '' || !in_array($paymentStatus, array(2, 3), true)) {
    cart_payment_reply('0', 'Required payment details are missing.');
}
$customerSql = (string)$customerId;
$orderSql = (string)$orderId;
$razorpayOrderSql = mysqli_real_escape_string($sql, $razorpayOrderId);
$paymentSql = mysqli_real_escape_string($sql, $paymentId);
$signatureSql = mysqli_real_escape_string($sql, $signature);

$orderQuery = mysqli_query($sql, "SELECT kavach_order_id, kavach_payable, kavach_razorpayOrderId, kavach_razorpay_status
    FROM tbl_order
    WHERE kavach_order_id = '$orderSql' AND kavach_customer_id = '$customerSql' AND is_deleted = 1
    LIMIT 1");
$order = $orderQuery ? mysqli_fetch_assoc($orderQuery) : null;
if (!$order || !hash_equals((string)$order['kavach_razorpayOrderId'], $razorpayOrderId)) {
    cart_payment_reply('0', 'The payment order could not be matched to this customer.');
}
if ((int)$order['kavach_razorpay_status'] === 2) {
    if ($paymentStatus === 2) {
        cart_payment_reply('1', 'Payment was already verified.', array(array('kavach_order_id' => (string)$orderId, 'payment_status' => '2', 'order_status' => '2')));
    }
    cart_payment_reply('0', 'This order has already been paid.');
}

if ($paymentStatus === 2) {
    if ($paymentId === '' || $signature === '') cart_payment_reply('0', 'Razorpay did not return complete payment verification details.');
    $expectedSignature = hash_hmac('sha256', $razorpayOrderId . '|' . $paymentId, $RAZORPAY_KEY_SECRET);
    if (!hash_equals($expectedSignature, $signature)) cart_payment_reply('0', 'The payment signature could not be verified.');
}

$payable = number_format((float)$order['kavach_payable'], 2, '.', '');
$signatureValue = "'$signatureSql'";
$paymentValue = $paymentId === '' ? "''" : "'$paymentSql'";
$statusSql = (string)$paymentStatus;

mysqli_begin_transaction($sql);
try {
    if ($paymentStatus === 2) {
        $updated = mysqli_query($sql, "UPDATE tbl_order SET
            kavach_razorpay_payment_id = $paymentValue,
            kavach_razorpay_signature = $signatureValue,
            kavach_razorpay_status = '2',
            kavach_received_amount = '$payable',
            kavach_remaining_amount = '0',
            order_status = '2', kavach_order_status = '2'
            WHERE kavach_order_id = '$orderSql' AND kavach_customer_id = '$customerSql'");
        if (!$updated) throw new RuntimeException('Could not update payment status.');

        if (!mysqli_query($sql, "UPDATE tbl_order_detail SET
            kavach_razorpayOrderId = '$razorpayOrderSql', order_status = '2'
            WHERE kavach_order_id = '$orderSql' AND kavach_customer_id = '$customerSql'")) {
            throw new RuntimeException('Could not update order item payment status.');
        }

        // Only remove cart rows represented by the now-paid order. Match package and duration too.
        if (!mysqli_query($sql, "UPDATE tbl_cart c
            INNER JOIN tbl_order_detail d ON d.kavach_order_id = '$orderSql'
                AND d.kavach_customer_id = '$customerSql'
                AND d.product_id = c.cart_product_id
                AND d.package_id = c.cart_package_id
                AND d.duration = c.cart_duration
            SET c.is_deleted = 2
            WHERE c.cart_customer_id = '$customerSql' AND c.is_deleted = 1")) {
            throw new RuntimeException('Payment succeeded, but the purchased cart items could not be cleared.');
        }

        mysqli_commit($sql);
        cart_payment_reply('1', 'Payment verified.', array(array('kavach_order_id' => (string)$orderId, 'payment_status' => '2', 'order_status' => '2')));
    }

    $updated = mysqli_query($sql, "UPDATE tbl_order SET
        kavach_razorpay_payment_id = $paymentValue,
        kavach_razorpay_signature = $signatureValue,
        kavach_razorpay_status = '$statusSql',
        order_status = '3', kavach_order_status = '3'
        WHERE kavach_order_id = '$orderSql' AND kavach_customer_id = '$customerSql'");
    if (!$updated) throw new RuntimeException('Could not record the failed payment.');
    if (!mysqli_query($sql, "UPDATE tbl_order_detail SET order_status = '3'
        WHERE kavach_order_id = '$orderSql' AND kavach_customer_id = '$customerSql'")) {
        throw new RuntimeException('Could not update the order item status.');
    }
    mysqli_commit($sql);
    cart_payment_reply('1', 'Payment failed.', array(array('kavach_order_id' => (string)$orderId, 'payment_status' => '3', 'order_status' => '3')));
} catch (Throwable $error) {
    mysqli_rollback($sql);
    error_log('cart_razorpay_verify.php: ' . $error->getMessage());
    cart_payment_reply('0', $error->getMessage());
}
?>
