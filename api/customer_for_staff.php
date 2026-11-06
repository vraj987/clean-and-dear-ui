<?php
include 'dbconnect.php';

header('Content-Type: application/json; charset=utf-8');

function respond($status, $error = '', $result = array()) {
    echo json_encode(array('status' => (string)$status, 'error' => $error, 'result' => $result));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond('0', 'Use POST for this request.');
}

$staff_id = isset($_POST['staff_id']) ? intval($_POST['staff_id']) : 0;
$staff_auth_token = isset($_POST['staff_auth_token']) ? trim($_POST['staff_auth_token']) : '';
$action = isset($_POST['action']) ? trim($_POST['action']) : '';
$customer_mobile = isset($_POST['customer_mobile']) ? preg_replace('/\D+/', '', $_POST['customer_mobile']) : '';
$customer_name = isset($_POST['customer_name']) ? trim($_POST['customer_name']) : '';

if ($staff_id < 1 || $staff_auth_token === '') {
    respond('0', 'A valid staff session is required.');
}

$staff_stmt = mysqli_prepare($sql, "SELECT customer_id FROM tbl_customer WHERE customer_id = ? AND customer_auth_token = ? AND customer_type IN ('1','3') AND customer_is_verify = 1 AND customer_is_active = '1' AND is_deleted = '1' LIMIT 1");
if (!$staff_stmt) respond('0', 'Unable to validate the staff session.');
mysqli_stmt_bind_param($staff_stmt, 'is', $staff_id, $staff_auth_token);
mysqli_stmt_execute($staff_stmt);
$staff_result = mysqli_stmt_get_result($staff_stmt);
$staff = $staff_result ? mysqli_fetch_assoc($staff_result) : null;
mysqli_stmt_close($staff_stmt);
if (!$staff) respond('0', 'Your staff session is invalid. Please sign in again.');

if (!preg_match('/^[0-9]{10}$/', $customer_mobile)) {
    respond('0', 'Enter a valid 10-digit customer number.');
}

$find_stmt = mysqli_prepare($sql, "SELECT customer_id, customer_name, customer_mobile, customer_type FROM tbl_customer WHERE customer_mobile = ? AND is_deleted = '1' ORDER BY customer_id DESC LIMIT 1");
if (!$find_stmt) respond('0', 'Unable to find the customer.');
mysqli_stmt_bind_param($find_stmt, 's', $customer_mobile);
mysqli_stmt_execute($find_stmt);
$find_result = mysqli_stmt_get_result($find_stmt);
$existing = $find_result ? mysqli_fetch_assoc($find_result) : null;
mysqli_stmt_close($find_stmt);

if ($existing && (string)$existing['customer_type'] !== '2') {
    respond('0', 'This number belongs to a staff or vendor account. Enter the customer’s number.');
}

if ($action === 'lookup') {
    if (!$existing) respond('1', '', array());
    respond('1', '', array(array(
        'customer_id' => (string)$existing['customer_id'],
        'customer_name' => (string)($existing['customer_name'] ?? ''),
        'customer_mobile' => (string)$existing['customer_mobile'],
    )));
}

if ($action !== 'save') respond('0', 'Invalid action.');
if ($customer_name === '') respond('0', 'Enter the customer name.');
if (strlen($customer_name) > 255) respond('0', 'Customer name must be 255 characters or fewer.');

if ($existing) {
    $customer_id = (int)$existing['customer_id'];
    $update_stmt = mysqli_prepare($sql, "UPDATE tbl_customer SET customer_name = ? WHERE customer_id = ? AND customer_type = '2' AND is_deleted = '1'");
    if (!$update_stmt) respond('0', 'Unable to update the customer.');
    mysqli_stmt_bind_param($update_stmt, 'si', $customer_name, $customer_id);
    $saved = mysqli_stmt_execute($update_stmt);
    mysqli_stmt_close($update_stmt);
    if (!$saved) respond('0', 'Unable to update the customer name.');
} else {
    date_default_timezone_set('Asia/Kolkata');
    $created_at = date('Y-m-d H:i:s');
    $customer_type = '2';
    $verified = 1;
    $active = '1';
    $not_deleted = '1';
    $logged_out = '1';
    $insert_stmt = mysqli_prepare($sql, "INSERT INTO tbl_customer (customer_type, customer_name, customer_mobile, customer_email, customer_address, customer_is_verify, customer_is_active, is_deleted, c_date, customer_logout) VALUES (?, ?, ?, '', '', ?, ?, ?, ?, ?)");
    if (!$insert_stmt) respond('0', 'Unable to create the customer.');
    mysqli_stmt_bind_param($insert_stmt, 'sssissss', $customer_type, $customer_name, $customer_mobile, $verified, $active, $not_deleted, $created_at, $logged_out);
    $saved = mysqli_stmt_execute($insert_stmt);
    $customer_id = (int)mysqli_insert_id($sql);
    mysqli_stmt_close($insert_stmt);
    if (!$saved || $customer_id < 1) respond('0', 'Unable to create the customer.');
}

respond('1', '', array(array(
    'customer_id' => (string)$customer_id,
    'customer_name' => $customer_name,
    'customer_mobile' => $customer_mobile,
)));
?>
