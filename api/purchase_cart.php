<?php
// purchase_cart.php

/**
 * Create one store order from the signed-in customer's cart and create its
 * Razorpay order. Install beside dbconnect.php on the PHP API server.
 *
 * Required POST: user_id (or kavach_customer_id)
 * Cart products, quantities and protection selections are read from tbl_cart.
 * Prices are recalculated from tbl_product / tbl_package / depreciation data
 * using the SAME formula as product.php.
 *
 * Qty rule: one cart item = ONE row in tbl_order_detail (qty stored in `qty`).
 *   e.g. unit price 5000, qty 2 -> product_total 10000, line_total 10000 (+ package x qty)
 */
require_once __DIR__ . '/dbconnect.php';
header('Content-Type: application/json; charset=utf-8');

function purchase_cart_reply($status, $error, $rows = array())
{
    echo json_encode(array('status' => (string)$status, 'error' => (string)$error, 'result' => $rows), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Depreciation product resolve (same as product.php):
 * product with package_product_id containing purchased product + same brand/model,
 * latest product_id first. Falls back to the purchased product itself.
 */
function purchase_cart_dep_product($sql, $productId, $brandId, $modelId)
{
    $productId = (int)$productId;
    $brandId   = (int)$brandId;
    $modelId   = (int)$modelId;
    $q = mysqli_query($sql, "SELECT product_id FROM tbl_product
        WHERE FIND_IN_SET('$productId', package_product_id)
          AND brand_id = '$brandId' AND model_id = '$modelId'
        ORDER BY product_id DESC LIMIT 1");
    if ($q && ($r = mysqli_fetch_assoc($q))) {
        return (int)$r['product_id'];
    }
    return $productId;
}

/**
 * Month-wise rates (1..24) for depreciation product + package.
 * Latest depreciation_id wins (same as product.php ORDER BY depreciation_id DESC LIMIT 1).
 */
function purchase_cart_load_rates($sql, $depProductId, $packageId)
{
    $rows = array();
    $depProductId = (int)$depProductId;
    $packageId    = (int)$packageId;
    $q = mysqli_query($sql, "SELECT month_number, monthly_depreciation, post_new_model_depreciation
        FROM tbl_product_depreciation
        WHERE product_id = '$depProductId' AND package_id = '$packageId'
          AND month_number BETWEEN 1 AND 24
        ORDER BY depreciation_id DESC");
    if (!$q) return $rows;
    while ($r = mysqli_fetch_assoc($q)) {
        $m = (int)$r['month_number'];
        if (!isset($rows[$m])) $rows[$m] = $r;
    }
    return $rows;
}

/**
 * Launch date se invoice (aaj) tak ke months - product.php jaisa.
 * Returns -1 agar launch date missing hai (product.php mein tab months_from_launch = 0).
 */
function purchase_cart_launch_months($launchDate, $invoiceDate)
{
    if (empty($launchDate) || $launchDate === '0000-00-00') return -1;

    $launchRaw = trim($launchDate);
    $launchDt  = null;
    foreach (array('Y-m-d', 'd/m/Y', 'd-m-Y') as $fmt) {
        $tmp = DateTime::createFromFormat($fmt, $launchRaw);
        if ($tmp && $tmp->format($fmt) === $launchRaw) {
            $launchDt = $tmp;
            break;
        }
    }

    $months = 0;
    if ($launchDt) {
        $year = (int)$launchDt->format('Y');
        if ($year >= 2000 && $year <= 2100) {
            $invDt = new DateTime($invoiceDate);
            if ($invDt >= $launchDt) {
                $diff   = $launchDt->diff($invDt);
                $months = ($diff->y * 12) + $diff->m;
            }
        }
    }
    return $months;
}

/** months_from_launch for a given duration (max 23) - product.php jaisa */
function purchase_cart_months_from_launch($launchBase, $duration)
{
    if ($launchBase < 0) return 0;
    $mfl = $launchBase + (int)$duration;
    return $mfl > 23 ? 23 : $mfl;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    purchase_cart_reply('0', 'Please use the POST method.');
}
if (!isset($sql) || !($sql instanceof mysqli)) {
    http_response_code(500);
    purchase_cart_reply('0', 'Database connection is unavailable.');
}
mysqli_set_charset($sql, 'utf8mb4');

$customerId = isset($_POST['user_id']) ? (int)$_POST['user_id'] : (isset($_POST['kavach_customer_id']) ? (int)$_POST['kavach_customer_id'] : 0);
if ($customerId < 1) purchase_cart_reply('0', 'A valid user_id is required.');
$paymentMethod = strtolower(trim((string)($_POST['payment_method'] ?? 'online')));
if (!in_array($paymentMethod, array('online', 'cod'), true)) {
    purchase_cart_reply('0', 'Invalid payment method.');
}
$shippingName = trim((string)($_POST['shipping_name'] ?? ''));
$shippingMobile = trim((string)($_POST['shipping_mobile'] ?? ''));
$shippingEmail = trim((string)($_POST['shipping_email'] ?? ''));
$shippingAddress = trim((string)($_POST['shipping_address'] ?? ''));
$shippingStateId = (int)($_POST['shipping_state_id'] ?? 0);
$shippingCityId = (int)($_POST['shipping_city_id'] ?? 0);
$shippingPincode = trim((string)($_POST['shipping_pincode'] ?? ''));
$deliveryInstructions = trim((string)($_POST['delivery_instructions'] ?? ''));
if ($shippingName === '' || $shippingMobile === '' || $shippingEmail === '' || $shippingAddress === '' || $shippingStateId < 1 || $shippingCityId < 1 || $shippingPincode === '') {
    purchase_cart_reply('0', 'Complete the required shipping address details before placing your order.');
}
if ($paymentMethod === 'online' && (empty($RAZORPAY_KEY_ID) || empty($RAZORPAY_KEY_SECRET))) {
    purchase_cart_reply('0', 'Razorpay keys are not configured on the server.');
}

$customerIdSql = (string)$customerId;
$cartQuery = mysqli_query($sql, "SELECT c.cart_id, c.cart_product_id, c.cart_qty, c.cart_package_id, c.cart_duration,
        p.category_id, p.brand_id, p.model_id, p.product_type, p.product_variant, p.original_price, p.base_price, p.retailer_price,
        pk.package_name, pk.package_percentage
    FROM tbl_cart c
    INNER JOIN tbl_product p ON p.product_id = c.cart_product_id
    LEFT JOIN tbl_package pk ON pk.package_id = c.cart_package_id AND pk.is_deleted = 1
    WHERE c.cart_customer_id = '$customerIdSql' AND c.is_deleted = 1
    ORDER BY c.cart_id ASC");
if (!$cartQuery) purchase_cart_reply('0', 'Could not read the cart.');

$items        = array();
$productTotal = 0.0;   // sum(unit_price x qty)
$packageTotal = 0.0;   // sum(package_price x qty)
$totalBuyback = 0.0;   // sum(buyback x qty)
$hasPackage   = false;
$today        = date('Y-m-d');

while ($cart = mysqli_fetch_assoc($cartQuery)) {
    $productId = (int)$cart['cart_product_id'];
    $packageId = (int)$cart['cart_package_id'];
    $qty       = max(1, (int)$cart['cart_qty']);
    $duration  = $packageId > 0 ? (int)$cart['cart_duration'] : 0;
    if ((int)$cart['product_type'] === 3) {
        $packageId = 0;
        $duration  = 0;
    }
    if ($productId < 1) continue;
    if ($packageId > 0 && ($duration < 1 || $duration > 24 || empty($cart['package_name']))) {
        purchase_cart_reply('0', 'A protection selection in your cart is no longer available. Please update the cart.');
    }

    // Single unit price
    $unitPrice = (float)$cart['retailer_price'];
    if ($unitPrice <= 0) $unitPrice = (float)$cart['original_price'];
    if ($unitPrice <= 0) $unitPrice = (float)$cart['base_price'];
    if ($unitPrice <= 0) purchase_cart_reply('0', 'A product in your cart has no valid selling price.');
    $unitPrice = round($unitPrice, 2);

    $packagePercentage       = $packageId > 0 ? (float)$cart['package_percentage'] : 0.0;
    $buybackAmount           = 0.0;   // per unit
    $packagePrice            = 0.0;   // per unit
    $selectedDepreciationPct = 0.0;
    $selectedMonthsFromLaunch = 0;
    $depreciation            = array();

    if ($packageId > 0) {
        $hasPackage = true;

        // ===== Same lookups as product.php =====
        $depProductId = purchase_cart_dep_product($sql, $productId, $cart['brand_id'], $cart['model_id']);
        $rates        = purchase_cart_load_rates($sql, $depProductId, $packageId);

        // Launch date of the depreciation product
        $launchDate = '';
        $ld = mysqli_query($sql, "SELECT launch_date FROM tbl_product WHERE product_id = '$depProductId' LIMIT 1");
        if ($ld && ($ldRow = mysqli_fetch_assoc($ld))) {
            $launchDate = $ldRow['launch_date'];
        }
        $launchBase = purchase_cart_launch_months($launchDate, $today);

        // Selected duration ka rate zaroori hai (product.php mein bhi nahi ho to package nahi dikhta)
        if (!isset($rates[$duration])) {
            purchase_cart_reply('0', 'Protection rates are not available for the selected duration. Please update the cart.');
        }
        if (purchase_cart_months_from_launch($launchBase, $duration) <= 0) {
            purchase_cart_reply('0', 'Protection is not available for a product in your cart (launch date missing). Please update the cart.');
        }

        // Package price = unit price x package % (month par depend nahi), product.php jaisa ceil
        $thisPackagePrice = (float)ceil(round($unitPrice * $packagePercentage / 100, 2));

        for ($month = 1; $month <= 24; $month++) {
            if (!isset($rates[$month])) continue;   // is month ka rate nahi to skip

            $monthlyPct = (float)$rates[$month]['monthly_depreciation'];
            $mfl        = purchase_cart_months_from_launch($launchBase, $month);
            $postPct    = 0.0;
            if ($mfl > 0 && isset($rates[$mfl])) {
                $postPct = (float)$rates[$mfl]['post_new_model_depreciation'];
            }
            $totalPct = $monthlyPct + $postPct;

            $depRaw  = round($unitPrice * $totalPct / 100, 2);
            $buyRaw  = max(0, round($unitPrice - $depRaw, 2));
            $depAmt  = (float)ceil($depRaw);
            $buyback = (float)ceil($buyRaw);

            $depreciation[] = array(
                'month_number'                => (string)$month,
                'months_from_launch'          => (string)$mfl,
                'monthly_depreciation'        => (string)$monthlyPct,
                'post_new_model_depreciation' => (string)$postPct,
                'total_depreciation_pct'      => (string)ceil($totalPct),
                'depreciation_amount'         => (string)(int)$depAmt,
                'buyback_amount'              => (string)(int)$buyback,
                'package_price'               => (string)(int)$thisPackagePrice
            );

            if ($month === $duration) {
                $selectedDepreciationPct  = (float)ceil($totalPct);
                $selectedMonthsFromLaunch = $mfl;
                $buybackAmount            = $buyback;
                $packagePrice             = $thisPackagePrice;
            }
        }
    }

    // Line totals (qty se multiply)
    $lineProductTotal = round($unitPrice * $qty, 2);
    $linePackageTotal = round($packagePrice * $qty, 2);
    $lineTotal        = round($lineProductTotal + $linePackageTotal, 2);

    $productTotal += $lineProductTotal;
    $packageTotal += $linePackageTotal;
    $totalBuyback += $buybackAmount * $qty;

    $items[] = array(
        'cart_id'            => (int)$cart['cart_id'],
        'product_id'         => $productId,
        'category_id'        => (int)$cart['category_id'],
        'brand_id'           => (int)$cart['brand_id'],
        'model_id'           => (int)$cart['model_id'],
        'qty'                => $qty,
        'unit_price'         => $unitPrice,
        'package_id'         => $packageId,
        'package_name'       => $packageId > 0 ? (string)$cart['package_name'] : '',
        'package_percentage' => $packagePercentage,
        'duration'           => $duration,
        'months_from_launch' => $selectedMonthsFromLaunch,
        'buyback_amount'     => $buybackAmount,        // per unit
        'package_price'      => $packagePrice,         // per unit
        'depreciation_pct'   => $selectedDepreciationPct,
        'depreciation'       => $depreciation,
        'product_total'      => $lineProductTotal,     // unit_price x qty
        'package_total'      => $linePackageTotal,     // package_price x qty
        'line_total'         => $lineTotal             // payable for this line
    );
}

if (!$items) purchase_cart_reply('0', 'Your cart is empty.');

$productTotal   = round($productTotal, 2);
$packageTotal   = round($packageTotal, 2);
$totalBuyback   = round($totalBuyback, 2);
$payable        = round($productTotal + $packageTotal, 2);
$razorpayAmount = (int)round($payable * 100);
if ($razorpayAmount < 1) purchase_cart_reply('0', 'The order total must be greater than zero.');

$first      = $items[0];
$masterPlan = $first;
foreach ($items as $item) {
    if ($item['package_id'] > 0) {
        $masterPlan = $item;
        break;
    }
}
$orderType  = $hasPackage ? 2 : 1;
$startDate  = $today;
$createdAt  = date('Y-m-d H:i:s');

$masterDepreciation = json_encode(array_map(function ($item) {
    return array(
        'product_id'        => (string)$item['product_id'],
        'package_id'        => (string)$item['package_id'],
        'duration'          => (string)$item['duration'],
        'qty'               => (string)$item['qty'],
        'depreciation_json' => $item['depreciation']
    );
}, $items), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
$masterDepreciationSql = mysqli_real_escape_string($sql, $masterDepreciation);
$packageNameSql        = mysqli_real_escape_string($sql, $masterPlan['package_name']);
$masterDuration        = (int)$masterPlan['duration'];
$masterPackageId       = (int)$masterPlan['package_id'];
$masterPackagePct      = (float)$masterPlan['package_percentage'];
$shippingNameSql = mysqli_real_escape_string($sql, $shippingName);
$shippingMobileSql = mysqli_real_escape_string($sql, $shippingMobile);
$shippingEmailSql = mysqli_real_escape_string($sql, $shippingEmail);
$shippingAddressSql = mysqli_real_escape_string($sql, $shippingAddress);
$shippingPincodeSql = mysqli_real_escape_string($sql, $shippingPincode);
$deliveryInstructionsSql = mysqli_real_escape_string($sql, $deliveryInstructions);

mysqli_begin_transaction($sql);
try {
    // Keep the customer's current address up to date, while also saving an
    // independent order-time snapshot in tbl_order below.
    $customerUpdateSql = "UPDATE tbl_customer SET
        customer_name = '$shippingNameSql', customer_mobile = '$shippingMobileSql',
        customer_email = '$shippingEmailSql', customer_address = '$shippingAddressSql',
        state_id = '$shippingStateId', city_id = '$shippingCityId', customer_pincode = '$shippingPincodeSql'
        WHERE customer_id = '$customerIdSql' AND is_deleted = 1";
    if (!mysqli_query($sql, $customerUpdateSql)) {
        throw new RuntimeException('Could not update the customer shipping details.');
    }

    // ===== MASTER ORDER (totals = all lines, qty included) =====
    $masterSql = "INSERT INTO tbl_order
        (kavach_customer_id, shipping_name, shipping_mobile, shipping_email, shipping_address,
         shipping_state_id, shipping_city_id, shipping_pincode, delivery_instructions,
         payment_method,
         product_id, category_id, brand_id, model_id, package_id, package_name,
         invoice_date, duration, purchase_price, buyback_amount, package_percentage, package_price,
         depreciation_json, order_status, is_deleted, c_date, order_type, start_date)
        VALUES ('$customerIdSql', '$shippingNameSql', '$shippingMobileSql', '$shippingEmailSql', '$shippingAddressSql',
         '$shippingStateId', '$shippingCityId', '$shippingPincodeSql', '$deliveryInstructionsSql', '$paymentMethod',
         '{$first['product_id']}', '{$first['category_id']}', '{$first['brand_id']}', '{$first['model_id']}',
         '$masterPackageId', '$packageNameSql', '$today', '$masterDuration', '" . number_format($productTotal, 2, '.', '') . "',
         '" . number_format($totalBuyback, 2, '.', '') . "', '" . number_format($masterPackagePct, 2, '.', '') . "',
         '" . number_format($packageTotal, 2, '.', '') . "', '$masterDepreciationSql', '1', '1', '$createdAt', '$orderType', '$startDate')";
    if (!mysqli_query($sql, $masterSql)) throw new RuntimeException('Could not create the order.');
    $orderId = (int)mysqli_insert_id($sql);

    // ===== DETAIL: ek cart item = ek row (qty column mein) =====
    $detailIds = array();
    foreach ($items as $item) {
        $detailPackageName  = mysqli_real_escape_string($sql, $item['package_name']);
        $detailDepreciation = mysqli_real_escape_string($sql, json_encode($item['depreciation'], JSON_UNESCAPED_SLASHES));
        $expiry = $item['duration'] > 0 ? date('Y-m-d', strtotime('+' . $item['duration'] . ' months', strtotime($today))) : $today;

        $detailSql = "INSERT INTO tbl_order_detail
            (kavach_order_id, kavach_customer_id, product_id, category_id, brand_id, model_id, package_id,
             package_name, invoice_date, duration, expiry_date, purchase_price, buyback_amount, package_percentage,
             package_price, qty, product_total, package_total, line_total,
             depreciation_json, imei_number, invoice_number, invoice_file, serial_number, remarks,
             order_status, is_deleted, c_date, start_date)
            VALUES ('$orderId', '$customerIdSql', '{$item['product_id']}', '{$item['category_id']}', '{$item['brand_id']}', '{$item['model_id']}',
             '{$item['package_id']}', '$detailPackageName', '$today', '{$item['duration']}', '$expiry',
             '" . number_format($item['unit_price'], 2, '.', '') . "', '" . number_format($item['buyback_amount'], 2, '.', '') . "',
             '" . number_format($item['package_percentage'], 2, '.', '') . "', '" . number_format($item['package_price'], 2, '.', '') . "',
             '{$item['qty']}', '" . number_format($item['product_total'], 2, '.', '') . "',
             '" . number_format($item['package_total'], 2, '.', '') . "', '" . number_format($item['line_total'], 2, '.', '') . "',
             '$detailDepreciation', '', '', '', '', '', '1', '1', '$createdAt', '$startDate')";
        if (!mysqli_query($sql, $detailSql)) throw new RuntimeException('Could not save the order items.');
        $detailIds[] = (string)mysqli_insert_id($sql);
    }

    $payableSql = number_format($payable, 2, '.', '');
    $razorpayOrderId = '';
    $razorpayKeyId = '';

    if ($paymentMethod === 'online') {
        // ===== RAZORPAY ORDER (online only) =====
        $receipt = 'STORE_' . $orderId;
        $rzpPayload = array(
            'amount'   => $razorpayAmount,
            'currency' => 'INR',
            'receipt'  => $receipt,
            'notes'    => array('order_id' => (string)$orderId, 'customer_id' => (string)$customerId)
        );
        $ch = curl_init('https://api.razorpay.com/v1/orders');
        curl_setopt_array($ch, array(
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_USERPWD        => $RAZORPAY_KEY_ID . ':' . $RAZORPAY_KEY_SECRET,
            CURLOPT_HTTPHEADER     => array('Content-Type: application/json'),
            CURLOPT_POSTFIELDS     => json_encode($rzpPayload),
            CURLOPT_TIMEOUT        => 30
        ));
        $response  = curl_exec($ch);
        $httpCode  = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        $rzp = json_decode((string)$response, true);
        if ($curlError || $httpCode < 200 || $httpCode >= 300 || empty($rzp['id'])) {
            $description = isset($rzp['error']['description']) ? $rzp['error']['description'] : 'Could not create the Razorpay order.';
            throw new RuntimeException($curlError ? 'Razorpay service is unavailable.' : $description);
        }
        $razorpayOrderId = mysqli_real_escape_string($sql, (string)$rzp['id']);
        $razorpayKeyId = (string)$RAZORPAY_KEY_ID;

        if (!mysqli_query($sql, "UPDATE tbl_order SET kavach_razorpayOrderId = '$razorpayOrderId', kavach_payable = '$payableSql', kavach_received_amount = '0', kavach_remaining_amount = '$payableSql' WHERE kavach_order_id = '$orderId' AND kavach_customer_id = '$customerIdSql'")) {
            throw new RuntimeException('Could not link the Razorpay order.');
        }
        if (!mysqli_query($sql, "UPDATE tbl_order_detail SET kavach_razorpayOrderId = '$razorpayOrderId' WHERE kavach_order_id = '$orderId' AND kavach_customer_id = '$customerIdSql'")) {
            throw new RuntimeException('Could not link the Razorpay order to its items.');
        }
    } else {
        // COD is an active, unpaid order. It never creates or opens a gateway order.
        if (!mysqli_query($sql, "UPDATE tbl_order SET kavach_payable = '$payableSql', kavach_received_amount = '0', kavach_remaining_amount = '$payableSql', kavach_razorpay_status = '0', kavach_order_status = '1', order_status = '1' WHERE kavach_order_id = '$orderId' AND kavach_customer_id = '$customerIdSql'")) {
            throw new RuntimeException('Could not finalize the cash-on-delivery order.');
        }
        $cartIds = array_map(function ($item) {
            return (int)$item['cart_id'];
        }, $items);
        $cartIdsSql = implode(',', $cartIds);
        if (!$cartIdsSql || !mysqli_query($sql, "UPDATE tbl_cart SET is_deleted = 2 WHERE cart_customer_id = '$customerIdSql' AND is_deleted = 1 AND cart_id IN ($cartIdsSql)")) {
            throw new RuntimeException('Could not clear the ordered items from the cart.');
        }
    }

    mysqli_commit($sql);

    // Response mein har line ka simple breakup (unit price, qty, total)
    $lines = array();
    foreach ($items as $i => $item) {
        $lines[] = array(
            'kavach_order_detail_id' => $detailIds[$i],
            'product_id'             => (string)$item['product_id'],
            'qty'                    => (string)$item['qty'],
            'unit_price'             => number_format($item['unit_price'], 2, '.', ''),
            'product_total'          => number_format($item['product_total'], 2, '.', ''),
            'package_id'             => (string)$item['package_id'],
            'package_name'           => $item['package_name'],
            'duration'               => (string)$item['duration'],
            'months_from_launch'     => (string)$item['months_from_launch'],
            'total_depreciation_pct' => (string)$item['depreciation_pct'],
            'unit_buyback_amount'    => number_format($item['buyback_amount'], 2, '.', ''),
            'unit_package_price'     => number_format($item['package_price'], 2, '.', ''),
            'package_total'          => number_format($item['package_total'], 2, '.', ''),
            'line_total'             => number_format($item['line_total'], 2, '.', '')
        );
    }

    purchase_cart_reply('1', '', array(array(
        'kavach_order_id'         => (string)$orderId,
        'kavach_order_detail_ids' => $detailIds,
        'order_type'              => (string)$orderType,
        'payment_method'          => $paymentMethod,
        'items'                   => $lines,
        'product_total'           => number_format($productTotal, 2, '.', ''),
        'package_total'           => number_format($packageTotal, 2, '.', ''),
        'payable_amount'          => $payableSql,
        'razorpay_order_id'       => $paymentMethod === 'online' ? (string)$rzp['id'] : '',
        'razorpay_key_id'         => $razorpayKeyId,
        'razorpay_amount'         => $paymentMethod === 'online' ? (string)$razorpayAmount : '',
        'razorpay_currency'       => $paymentMethod === 'online' ? 'INR' : ''
    )));
} catch (Throwable $error) {
    mysqli_rollback($sql);
    error_log('purchase_cart.php: ' . $error->getMessage());
    purchase_cart_reply('0', $error->getMessage());
}
