<?php
// purchase_kavach.php
include 'dbconnect.php';

// ============================================================
// ===== KAVACH ORDER PURCHASE - SAVE API (SINGLE POST) =======
// ============================================================
header('Content-Type: application/json');
// ===== Required fields list =====
$required_fields = array(
    'kavach_customer_id',
    'product_id',
    'invoice_date',
    'duration',
    'purchase_price',
    'package_id',
    'package_name',
    'package_percentage',
    'buyback_amount',
    'package_price'
);

$missing = array();
foreach ($required_fields as $field) {
    if (!isset($_POST[$field]) || trim($_POST[$field]) === '') {
        $missing[] = $field;
    }
}

if (!empty($missing)) {
    $result['status'] = '0';
    $result['error']  = 'Missing required fields: ' . implode(', ', $missing);
    $result['result'] = array();
    echo json_encode($result);
    exit;
}

// ===== Read POST fields =====
$kavach_customer_id = intval($_POST['kavach_customer_id']);
$created_by_user_id = isset($_POST['created_by_user_id']) ? intval($_POST['created_by_user_id']) : 0;
if ($created_by_user_id < 1) $created_by_user_id = 0;
$product_id         = intval($_POST['product_id']);
$invoice_date       = trim($_POST['invoice_date']);
$duration           = intval($_POST['duration']);
$purchase_price     = floatval($_POST['purchase_price']);

$package_id         = intval($_POST['package_id']);
$package_name       = trim($_POST['package_name']);
$package_percentage = floatval($_POST['package_percentage']);
$buyback_amount     = floatval($_POST['buyback_amount']);
$package_price      = floatval($_POST['package_price']);

if ($product_id < 1 || $package_id < 1 || $duration < 1 || $duration > 24 || $purchase_price <= 0) {
    $result['status'] = '0';
    $result['error']  = 'Invalid product, package, duration, or purchase price.';
    $result['result'] = array();
    echo json_encode($result);
    exit;
}

// ===== NEW FIELDS (only for tbl_order_detail) =====
$imei_number    = isset($_POST['imei_number'])    ? trim($_POST['imei_number'])    : '';
$serial_number  = isset($_POST['serial_number'])  ? trim($_POST['serial_number'])  : '';
$invoice_number = isset($_POST['invoice_number']) ? trim($_POST['invoice_number']) : '';
$remarks        = isset($_POST['remarks'])        ? trim($_POST['remarks'])        : '';

// ===== Validate invoice_date format =====
$d = DateTime::createFromFormat('Y-m-d', $invoice_date);
if (!$d || $d->format('Y-m-d') !== $invoice_date) {
    $result['status'] = '0';
    $result['error']  = 'Invalid invoice_date format. Use YYYY-MM-DD';
    $result['result'] = array();
    echo json_encode($result);
    exit;
}

// ============================================================
// ===== HANDLE INVOICE FILE UPLOAD ===========================
// ============================================================
$invoice_file_name = '';

if (isset($_FILES['invoice_file']) && $_FILES['invoice_file']['error'] == 0) {

    $upload_dir = '../uploads/invoice/';

    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    $original_name = $_FILES['invoice_file']['name'];
    $tmp_name      = $_FILES['invoice_file']['tmp_name'];
    $file_size     = $_FILES['invoice_file']['size'];
    $ext           = strtolower(pathinfo($original_name, PATHINFO_EXTENSION));

    $allowed_ext = array('jpg', 'jpeg', 'png', 'pdf', 'webp');

    if (!in_array($ext, $allowed_ext)) {
        $result['status'] = '0';
        $result['error']  = 'Invalid invoice file type. Allowed: jpg, jpeg, png, pdf, webp';
        $result['result'] = array();
        echo json_encode($result);
        exit;
    }

    if ($file_size > 5 * 1024 * 1024) {
        $result['status'] = '0';
        $result['error']  = 'Invoice file too large. Max 5MB allowed.';
        $result['result'] = array();
        echo json_encode($result);
        exit;
    }

    $invoice_file_name = 'INV_' . time() . '_' . rand(1000, 9999) . '.' . $ext;
    $target_path       = $upload_dir . $invoice_file_name;

    if (!move_uploaded_file($tmp_name, $target_path)) {
        $result['status'] = '0';
        $result['error']  = 'Failed to upload invoice file.';
        $result['result'] = array();
        echo json_encode($result);
        exit;
    }
}

// ============================================================
// ===== FETCH BRAND / MODEL / CATEGORY =======================
// ============================================================
$brand_id    = 0;
$model_id    = 0;
$category_id = 0;

$product_id_esc = intval($product_id);

$prod_sql = "SELECT category_id, brand_id, model_id 
             FROM tbl_product 
             WHERE product_id = '$product_id_esc' 
             LIMIT 1";
$prod_res = mysqli_query($sql, $prod_sql);

if ($prod_res && mysqli_num_rows($prod_res) > 0) {
    $prod_row    = mysqli_fetch_assoc($prod_res);
    $category_id = isset($prod_row['category_id']) ? intval($prod_row['category_id']) : 0;
    $brand_id    = isset($prod_row['brand_id'])    ? intval($prod_row['brand_id'])    : 0;
    $model_id    = isset($prod_row['model_id'])    ? intval($prod_row['model_id'])    : 0;
}

// ============================================================
// ===== CALCULATE MONTHS ELAPSED =============================
// ============================================================
$inv_dt = new DateTime($invoice_date);
$today  = new DateTime(date('Y-m-d'));
$diff   = $inv_dt->diff($today);

$months_elapsed = ($diff->y * 12) + $diff->m;
if ($months_elapsed < 0) $months_elapsed = 0;

// ============================================================
// ===== LOAD THE PURCHASED PRODUCT'S DEPRECIATION RATES ======
// Use the same package_product_id lookup as product.php. Some
// installations store rates directly against product_id, so use
// that as a fallback only when no mapped rows exist at all.
// ============================================================
$rate_rows = array();
$rate_query = mysqli_query($sql, "SELECT tpd.month_number, tpd.monthly_depreciation,
                                        tpd.post_new_model_depreciation
                                 FROM tbl_product_depreciation AS tpd
                                 INNER JOIN tbl_product AS mapped_product
                                   ON mapped_product.product_id = tpd.product_id
                                 WHERE FIND_IN_SET('$product_id_esc',
                                       REPLACE(COALESCE(mapped_product.package_product_id, ''), ' ', ''))
                                   AND tpd.package_id = '$package_id'
                                 ORDER BY tpd.depreciation_id DESC");

if (!$rate_query) {
    if (!empty($invoice_file_name) && file_exists('../uploads/invoice/' . $invoice_file_name)) {
        unlink('../uploads/invoice/' . $invoice_file_name);
    }
    $result['status'] = '0';
    $result['error']  = 'Could not load package depreciation rates: ' . mysqli_error($sql);
    $result['result'] = array();
    echo json_encode($result);
    exit;
}

while ($rate_row = mysqli_fetch_assoc($rate_query)) {
    $month_key = intval($rate_row['month_number']);
    if ($month_key >= 1 && $month_key <= 24 && !isset($rate_rows[$month_key])) {
        $rate_rows[$month_key] = $rate_row;
    }
}

// Fallback for databases where depreciation rows are keyed directly
// to the purchased product instead of its package-product mapping.
if (count($rate_rows) === 0) {
    $rate_query = mysqli_query($sql, "SELECT month_number, monthly_depreciation,
                                            post_new_model_depreciation
                                     FROM tbl_product_depreciation
                                     WHERE product_id = '$product_id_esc'
                                       AND package_id = '$package_id'
                                     ORDER BY depreciation_id DESC");
    if (!$rate_query) {
        if (!empty($invoice_file_name) && file_exists('../uploads/invoice/' . $invoice_file_name)) {
            unlink('../uploads/invoice/' . $invoice_file_name);
        }
        $result['status'] = '0';
        $result['error']  = 'Could not load package depreciation rates: ' . mysqli_error($sql);
        $result['result'] = array();
        echo json_encode($result);
        exit;
    }
    while ($rate_row = mysqli_fetch_assoc($rate_query)) {
        $month_key = intval($rate_row['month_number']);
        if ($month_key >= 1 && $month_key <= 24 && !isset($rate_rows[$month_key])) {
            $rate_rows[$month_key] = $rate_row;
        }
    }
}

$missing_rate_months = array();
for ($m = 1; $m <= 24; $m++) {
    if (!isset($rate_rows[$m])) $missing_rate_months[] = $m;
}
if (!empty($missing_rate_months)) {
    if (!empty($invoice_file_name) && file_exists('../uploads/invoice/' . $invoice_file_name)) {
        unlink('../uploads/invoice/' . $invoice_file_name);
    }
    $result['status'] = '0';
    $result['error']  = 'Depreciation schedule is incomplete for this product and package. Missing month(s): ' . implode(', ', $missing_rate_months);
    $result['result'] = array();
    echo json_encode($result);
    exit;
}

// ============================================================
// ===== BUILD MONTH 1-24 DEPRECIATION SCHEDULE ===============
// ============================================================
$depreciation_breakdown = array();
$current_total_pct = 0;
$current_dep_amt   = 0;
$current_buy_amt   = 0;
$current_pkg_price = 0;

for ($m = 1; $m <= 24; $m++) {
    $d_row = $rate_rows[$m];
    $monthly_pct = floatval($d_row['monthly_depreciation']);
    $post_pct    = floatval($d_row['post_new_model_depreciation']);
    $total_pct = $monthly_pct + $post_pct;

    // Keep the same calculation and display rounding as product.php:
    // calculate with the raw percentage, then ceil the final displayed rupee.
    $dep_amt_raw = round($purchase_price * $total_pct / 100, 2);
    $buy_amt_raw = max(0, round($purchase_price - $dep_amt_raw, 2));

    // Match product.php: package price uses the invoice purchase amount, so
    // it remains constant across months while the buyback value depreciates.
    $pkg_price_raw = round($purchase_price * $package_percentage / 100, 2);
    $dep_amt = (int)ceil($dep_amt_raw);
    $buy_amt = (int)ceil($buy_amt_raw);
    $pkg_price = (int)ceil($pkg_price_raw);

    $depreciation_breakdown[] = array(
        'month_number'                => (string)$m,
        'monthly_depreciation'        => (string)$monthly_pct,
        'post_new_model_depreciation' => (string)$post_pct,
        'total_depreciation_pct'      => (string)ceil($total_pct),
        'depreciation_amount'         => (string)$dep_amt,
        'buyback_amount'              => (string)$buy_amt,
        'package_price'               => (string)$pkg_price
    );

    if ($m === $duration) {
        $current_total_pct = ceil($total_pct);
        $current_dep_amt   = $dep_amt;
        $current_buy_amt   = $buy_amt;
        $current_pkg_price = $pkg_price;
    }
}

// Persist the server-calculated values for the selected duration, so the
// master row, detail row and Razorpay amount all match the monthly schedule.
$buyback_amount = $current_buy_amt;
$package_price  = $current_pkg_price;
$depreciation_json = json_encode($depreciation_breakdown, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

// ============================================================
// ===== CALCULATE EXPIRY DATE ================================
// ============================================================
$expiry_dt = new DateTime($invoice_date);
$expiry_dt->modify("+{$duration} months");
$expiry_date = $expiry_dt->format('Y-m-d');

$start_date = date('Y-m-d');

// ===== Escape strings =====
$package_name_esc      = mysqli_real_escape_string($sql, $package_name);
$invoice_date_esc      = mysqli_real_escape_string($sql, $invoice_date);
$expiry_date_esc       = mysqli_real_escape_string($sql, $expiry_date);
$depreciation_json_esc = mysqli_real_escape_string($sql, $depreciation_json);
$imei_number_esc       = mysqli_real_escape_string($sql, $imei_number);
$serial_number_esc     = mysqli_real_escape_string($sql, $serial_number);
$invoice_number_esc    = mysqli_real_escape_string($sql, $invoice_number);
$invoice_file_esc      = mysqli_real_escape_string($sql, $invoice_file_name);
$remarks_esc           = mysqli_real_escape_string($sql, $remarks);

// ============================================================
// ===== INSERT INTO tbl_order (MASTER) =======================
// ============================================================
$order_date   = date('Y-m-d H:i:s');
$order_status = 1;
$is_deleted   = 1;

$created_by_user_id_sql = $created_by_user_id > 0 ? "'$created_by_user_id'" : 'NULL';
$insert_order_sql = "INSERT INTO tbl_order ( kavach_customer_id, created_by_user_id, product_id, category_id, brand_id, model_id, package_id, package_name, invoice_date, duration, purchase_price, buyback_amount, package_percentage, package_price, depreciation_json, order_status, is_deleted, c_date, order_type, start_date ) VALUES ( '$kavach_customer_id', $created_by_user_id_sql, '$product_id', '$category_id', '$brand_id', '$model_id', '$package_id', '$package_name_esc', '$invoice_date_esc', '$duration', '$purchase_price', '$buyback_amount', '$package_percentage', '$package_price', '$depreciation_json_esc', '$order_status', '$is_deleted', '$order_date', 3, '$start_date' )";

if (!mysqli_query($sql, $insert_order_sql)) {
    if (!empty($invoice_file_name) && file_exists('../uploads/invoice/' . $invoice_file_name)) {
        unlink('../uploads/invoice/' . $invoice_file_name);
    }

    $result['status'] = '0';
    $result['error']  = 'Order insert failed: ' . mysqli_error($sql);
    $result['result'] = array();
    echo json_encode($result);
    exit;
}

$kavach_order_id = mysqli_insert_id($sql);

// ============================================================
// ===== INSERT INTO tbl_order_detail (WITH NEW FIELDS) =======
// ============================================================
$insert_detail_sql = "INSERT INTO tbl_order_detail ( kavach_order_id, kavach_customer_id, created_by_user_id, product_id, category_id, brand_id, model_id, package_id, package_name, invoice_date, duration, expiry_date, purchase_price, imei_number, invoice_number, invoice_file, serial_number, remarks, buyback_amount, package_percentage, package_price, depreciation_json, order_status, is_deleted, c_date, start_date ) VALUES ( '$kavach_order_id', '$kavach_customer_id', $created_by_user_id_sql, '$product_id', '$category_id', '$brand_id', '$model_id', '$package_id', '$package_name_esc', '$invoice_date_esc', '$duration', '$expiry_date_esc', '$purchase_price', '$imei_number_esc', '$invoice_number_esc', '$invoice_file_esc', '$serial_number_esc', '$remarks_esc', '$buyback_amount', '$package_percentage', '$package_price', '$depreciation_json_esc', '$order_status', '$is_deleted', '$order_date', '$start_date' )";

if (!mysqli_query($sql, $insert_detail_sql)) {
    mysqli_query($sql, "DELETE FROM tbl_order WHERE kavach_order_id = '$kavach_order_id'");

    if (!empty($invoice_file_name) && file_exists('../uploads/invoice/' . $invoice_file_name)) {
        unlink('../uploads/invoice/' . $invoice_file_name);
    }

    $result['status'] = '0';
    $result['error']  = 'Order detail insert failed: ' . mysqli_error($sql);
    $result['result'] = array();
    echo json_encode($result);
    exit;
}

$kavach_order_detail_id = mysqli_insert_id($sql);

// ============================================================
// ===== CREATE RAZORPAY ORDER ================================
// ============================================================
$razorpay_order_id = '';
$razorpay_amount   = (int) round($package_price * 100);
$razorpay_currency = 'INR';
$razorpay_receipt  = 'KAVACH_' . $kavach_order_id;

$payload = array(
    'amount'   => $razorpay_amount,
    'currency' => $razorpay_currency,
    'receipt'  => $razorpay_receipt,
    'notes'    => array(
        'kavach_order_id'    => (string)$kavach_order_id,
        'kavach_customer_id' => (string)$kavach_customer_id,
        'product_id'         => (string)$product_id,
        'package_id'         => (string)$package_id
    )
);

$ch = curl_init('https://api.razorpay.com/v1/orders');
curl_setopt_array($ch, array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_USERPWD        => $RAZORPAY_KEY_ID . ':' . $RAZORPAY_KEY_SECRET,
    CURLOPT_HTTPHEADER     => array('Content-Type: application/json'),
    CURLOPT_POSTFIELDS     => json_encode($payload),
    CURLOPT_TIMEOUT        => 30
));

$response  = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_err  = curl_error($ch);
curl_close($ch);

if ($curl_err) {
    $result['status'] = '0';
    $result['error']  = 'Razorpay cURL error: ' . $curl_err;
    $result['result'] = array();
    echo json_encode($result);
    exit;
}

$rzp = json_decode($response, true);

if ($http_code != 200 || empty($rzp['id'])) {
    $err_msg = isset($rzp['error']['description']) ? $rzp['error']['description'] : 'Failed to create Razorpay order';
    $result['status'] = '0';
    $result['error']  = $err_msg;
    $result['result'] = array();
    echo json_encode($result);
    exit;
}

$razorpay_order_id     = $rzp['id'];
$razorpay_order_id_esc = mysqli_real_escape_string($sql, $razorpay_order_id);

mysqli_query($sql, "UPDATE tbl_order 
                    SET kavach_razorpayOrderId = '$razorpay_order_id_esc' 
                    WHERE kavach_order_id = '$kavach_order_id'");

mysqli_query($sql, "UPDATE tbl_order_detail 
                    SET kavach_razorpayOrderId = '$razorpay_order_id_esc' 
                    WHERE kavach_order_detail_id = '$kavach_order_detail_id'");

// ============================================================
// ===== FINAL RESPONSE =======================================
// ============================================================
$invoice_file_url = !empty($invoice_file_name) ? $server_upload_url . 'invoice/' . $invoice_file_name : '';

$result['status'] = '1';
$result['error']  = '';
$result['result'] = array(
    array(
        'kavach_order_id'        => "".$kavach_order_id."",
        'kavach_order_detail_id' => "".$kavach_order_detail_id."",
        'kavach_customer_id'     => "".$kavach_customer_id."",
        'created_by_user_id'     => $created_by_user_id > 0 ? (string)$created_by_user_id : '',
        'product_id'             => "".$product_id."",
        'brand_id'               => "".$brand_id."",
        'model_id'               => "".$model_id."",
        'category_id'            => "".$category_id."",
        'package_id'             => "".$package_id."",
        'package_name'           => $package_name,
        'package_percentage'     => "".$package_percentage."",
        'purchase_price'         => "".$purchase_price."",
        'buyback_amount'         => "".$buyback_amount."",
        'package_price'          => "".$package_price."",
        'invoice_date'           => $invoice_date,
        'duration'               => "".$duration."",
        'expiry_date'            => $expiry_date,
        'start_date'             => $start_date,
        'months_elapsed'         => "".$months_elapsed."",
        'imei_number'            => $imei_number,
        'serial_number'          => $serial_number,
        'invoice_number'         => $invoice_number,
        'invoice_file'           => $invoice_file_name,
        'invoice_file_url'       => $invoice_file_url,
        'remarks'                => $remarks,
        'current_depreciation'   => array(array(
            'total_depreciation_pct' => "".$current_total_pct."",
            'depreciation_amount'    => "".$current_dep_amt."",
            'buyback_amount'         => "".$current_buy_amt."",
            'package_price'          => "".$current_pkg_price.""
        )),
        'depreciation_json'      => $depreciation_breakdown,
        'order_status'           => '1',
        'razorpay_order_id'      => $razorpay_order_id,
        'razorpay_key_id'        => $RAZORPAY_KEY_ID,
        'razorpay_amount'        => "".$razorpay_amount."",
        'razorpay_currency'      => $razorpay_currency
    )
);

echo json_encode($result);
?>
