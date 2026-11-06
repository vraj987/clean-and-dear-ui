<?php
// cart_manage.php (api example)
include 'dbconnect.php';

/* ==================== HELPER: Indian currency format ==================== */
if (!function_exists('formatIndianCurrency')) {
    function formatIndianCurrency($amount)
    {
        $amount = (string)round(floatval($amount));
        $len = strlen($amount);
        if ($len <= 3) return '₹' . $amount;

        $last3 = substr($amount, -3);
        $rest  = substr($amount, 0, -3);
        $rest  = preg_replace('/\B(?=(\d{2})+(?!\d))/', ',', $rest);

        return '₹' . $rest . ',' . $last3;
    }
}

/* ==================== REQUEST PARAMS ==================== */
$action         = isset($_REQUEST['action'])         ? trim($_REQUEST['action'])           : '';
$cart_id        = isset($_REQUEST['cart_id'])        ? intval($_REQUEST['cart_id'])        : 0;
$user_id        = isset($_REQUEST['user_id'])        ? intval($_REQUEST['user_id'])        : 0;
$product_id     = isset($_REQUEST['product_id'])     ? intval($_REQUEST['product_id'])     : 0;
$package_id     = isset($_REQUEST['package_id'])     ? intval($_REQUEST['package_id'])     : 0;
$duration       = isset($_REQUEST['duration'])       ? trim($_REQUEST['duration'])         : '';
$qty_set        = isset($_REQUEST['qty']);
$qty            = $qty_set ? intval($_REQUEST['qty']) : 1;

$invoice_date   = isset($_REQUEST['invoice_date'])   ? trim($_REQUEST['invoice_date'])     : '';
$filter_pkg_id  = isset($_REQUEST['filter_package_id']) ? intval($_REQUEST['filter_package_id']) : 0;

/* Default invoice_date = today */
if (empty($invoice_date)) {
    $invoice_date = date('Y-m-d');
}

/* ==================== VALIDATE INVOICE DATE ==================== */
$d = DateTime::createFromFormat('Y-m-d', $invoice_date);
if (!$d || $d->format('Y-m-d') !== $invoice_date) {
    $result['status'] = '0';
    $result['error']  = 'Invalid invoice_date format. Use YYYY-MM-DD';
    $result['result'] = array();
    echo json_encode($result);
    exit;
}

/* ==================== MONTHS ELAPSED ==================== */
$inv_dt = new DateTime($invoice_date);
$today  = new DateTime(date('Y-m-d'));
$diff   = $inv_dt->diff($today);
$months_elapsed = ($diff->y * 12) + $diff->m;

/* ==================== LOAD PACKAGES ==================== */
$packages = [];
$pkg_where = "is_deleted=1";
if ($filter_pkg_id > 0)     $pkg_where .= " AND package_id='$filter_pkg_id'";
elseif ($package_id > 0)    $pkg_where .= " AND package_id='$package_id'";
$pq = mysqli_query($sql, "SELECT package_id, package_name, package_percentage 
                          FROM tbl_package 
                          WHERE $pkg_where 
                          ORDER BY package_id ASC");
while ($p = mysqli_fetch_assoc($pq)) {
    $packages[] = $p;
}

/* ==================== AUTO-DETECT ACTION ==================== */
if (empty($action)) {
    if ($cart_id > 0) {
        $action = 'update';                 // qty=0 will still remove
    } elseif ($user_id > 0 && $product_id > 0) {
        $action = 'add';
    } else {
        $action = 'list';
    }
}

/* ================================================================ */
/* ==================== 1) ADD TO CART ============================ */
/* ================================================================ */
if ($action === 'add') {

    if ($user_id <= 0 || $product_id <= 0) {
        $result['status'] = '0';
        $result['error']  = 'user_id and product_id are required';
        $result['result'] = array();
        echo json_encode($result);
        exit;
    }

    $qty = $qty > 0 ? $qty : 1;

    /* -------- Check if same product + package + duration already in cart -------- */
    $chk = mysqli_query($sql, "SELECT cart_id, cart_qty FROM tbl_cart 
                               WHERE cart_customer_id = '$user_id' 
                                 AND cart_product_id  = '$product_id' 
                                 AND cart_package_id  = '$package_id' 
                                 AND cart_duration    = '$duration' 
                                 AND is_deleted = 1 
                               LIMIT 1");

    if ($c_row = mysqli_fetch_assoc($chk)) {
        $cart_id     = $c_row['cart_id'];
        $new_qty     = intval($c_row['cart_qty']) + $qty;

        mysqli_query($sql, "UPDATE tbl_cart 
                            SET cart_qty='$new_qty' 
                            WHERE cart_id='$cart_id'");
    } else {
        mysqli_query($sql, "INSERT INTO tbl_cart
            (cart_customer_id, cart_product_id, cart_qty, cart_package_id, cart_duration, is_deleted, c_date) 
            VALUES ('$user_id', '$product_id', '$qty', '$package_id', '$duration', '1', NOW())");

        $cart_id = mysqli_insert_id($sql);
    }

    $result['status']  = '1';
    $result['error']   = '';
    $result['message'] = 'Added to cart';
    $result['cart_id'] = $cart_id;
    $result['result']  = array();
    echo json_encode($result);
    exit;
}

/* ================================================================ */
/* ==================== 2) UPDATE QTY / REMOVE ==================== */
/* ================================================================ */
if ($action === 'update' || $action === 'remove') {

    if ($cart_id <= 0) {
        $result['status'] = '0';
        $result['error']  = 'cart_id is required';
        $result['result'] = array();
        echo json_encode($result);
        exit;
    }

    /* -------- Determine remove vs update -------- */
    $is_remove = ($action === 'remove') || ($qty_set && $qty <= 0);

    if ($is_remove) {

        /* If package_id passed → remove only that package row */
        if ($package_id > 0) {
            mysqli_query($sql, "UPDATE tbl_cart 
                                SET is_deleted = 2 
                                WHERE cart_id = '$cart_id' 
                                  AND cart_package_id = '$package_id'");
        } else {
            mysqli_query($sql, "UPDATE tbl_cart 
                                SET is_deleted = 2 
                                WHERE cart_id = '$cart_id'");
        }

        $result['status']  = '1';
        $result['error']   = '';
        $result['message'] = 'Removed from cart';
        $result['cart_id'] = $cart_id;
        $result['result']  = array();
        echo json_encode($result);
        exit;
    }

    /* -------- Update quantity -------- */
    mysqli_query($sql, "UPDATE tbl_cart 
                        SET cart_qty='$qty' 
                        WHERE cart_id='$cart_id'");

    $result['status']  = '1';
    $result['error']   = '';
    $result['message'] = 'Cart updated';
    $result['cart_id'] = $cart_id;
    $result['result']  = array();
    echo json_encode($result);
    exit;
}

/* ================================================================ */
/* ==================== 3) CART LIST ============================== */
/* ================================================================ */
if ($action === 'list') {

    if ($user_id <= 0) {
        $result['status'] = '0';
        $result['error']  = 'user_id is required';
        $result['result'] = array();
        echo json_encode($result);
        exit;
    }

    /* -------- Filters -------- */
    $where = "c.is_deleted = 1 AND c.cart_customer_id = '$user_id'";
    if ($cart_id > 0)     $where .= " AND c.cart_id = '$cart_id'";
    if ($product_id > 0)  $where .= " AND c.cart_product_id = '$product_id'";
    if ($package_id > 0)  $where .= " AND c.cart_package_id = '$package_id'";

    $query = mysqli_query($sql, "SELECT 
            c.cart_id, c.cart_customer_id, c.cart_product_id, c.cart_qty, 
            c.cart_package_id, c.cart_duration, c.is_deleted, c.c_date,

            p.brand_id, p.model_id, p.product_id, p.product_variant, 
            p.launch_date, p.original_price, 
            cat.category_name, 
            b.brand_name, 
            m.model_name, m.model_image, 
            p.product_images, p.product_image, 
            p.mrp, p.retailer_price,

            pk.package_name, pk.package_percentage

        FROM tbl_cart c
        LEFT JOIN tbl_product  p   ON p.product_id   = c.cart_product_id
        LEFT JOIN tbl_category cat ON cat.category_id = p.category_id
        LEFT JOIN tbl_brand    b   ON b.brand_id     = p.brand_id
        LEFT JOIN tbl_model    m   ON m.model_id     = p.model_id
        LEFT JOIN tbl_package  pk  ON pk.package_id  = c.cart_package_id
        WHERE $where
        ORDER BY c.cart_id DESC");

    /* -------- Summary accumulators -------- */
    $summary_products   = 0;
    $summary_protection = 0;

    if (mysqli_num_rows($query) > 0) {

        $result['status'] = '1';
        $result['error']  = '';
        $result['result'] = array();

        while ($row = mysqli_fetch_assoc($query)) {

            $pid = $row['cart_product_id'];

            /* -------- wishlist -------- */
            $row['wishlist_id'] = '';
            if ($user_id > 0 && $pid > 0) {
                $dq = mysqli_query($sql, "SELECT wishlist_id FROM tbl_wishlist WHERE wishlist_pro_id = '$pid' AND wishlist_customer_id = '$user_id' AND is_deleted = '1'");
                if ($d_row = mysqli_fetch_assoc($dq)) {
                    $row['wishlist_id'] = $d_row['wishlist_id'];
                }
            }

            /* -------- derived product fields (same as product API) -------- */
            $row['retailer_price_monthly'] = $row['retailer_price']
                ? strval(round($row['retailer_price'] / 20, 2))
                : '';
            $row['pro_name'] = $row['brand_name'] . ' ' . $row['model_name'] . ' ' . $row['product_variant'];
            $row['model_image_url'] = !empty($row['model_image'])
                ? $server_model_url . $row['model_image']
                : '';
            $row['product_images'] = !empty($row['product_images'])
                ? $server_product_url . $row['product_images']
                : '';

            /* -------- duration used for this cart item -------- */
            $cart_duration = intval($row['cart_duration']);
            if ($cart_duration <= 0 && !empty($duration)) {
                $cart_duration = intval($duration);
            }

            /* ==================================================== */
            /* ============ RESALE / DEPRECIATION ================= */
            /* ============ Base price = retailer_price =========== */
            /* ==================================================== */
            $base_purchase_price = floatval($row['retailer_price']);
            $base_resale_value   = round($base_purchase_price, 2);
            $package_breakdown   = array();

            /* Calculate breakdown whenever we have a duration (from cart or request) */
            if ($months_elapsed <= 24 && count($packages) > 0 && $cart_duration > 0) {

                foreach ($packages as $pkg) {
                    $pkg_id   = $pkg['package_id'];
                    $pkg_name = $pkg['package_name'];
                    $pkg_pct  = floatval($pkg['package_percentage']);

                    $dq = mysqli_query($sql, "SELECT monthly_depreciation, post_new_model_depreciation 
                                              FROM tbl_product_depreciation 
                                              WHERE product_id='$pid' 
                                                AND package_id='$pkg_id' 
                                                AND month_number='$cart_duration' 
                                              ORDER BY depreciation_id DESC LIMIT 1");

                    $total_percentage = 0;
                    if ($d_row = mysqli_fetch_assoc($dq)) {
                        $total_percentage = floatval($d_row['monthly_depreciation'])
                                          + floatval($d_row['post_new_model_depreciation']);
                    }

                    $dep_amount     = round($base_purchase_price * $total_percentage / 100, 2);
                    $buyback_amount = max(0, round($base_resale_value - $dep_amount, 2));
                    $package_price  = round($base_resale_value * $pkg_pct / 100, 2);

                    $package_breakdown[] = [
                        'package_id'             => $pkg_id,
                        'package_name'           => $pkg_name,
                        'package_percentage'     => "" . ceil($pkg_pct) . "",
                        'total_depreciation_pct' => "" . ceil($total_percentage) . "",
                        'depreciation_amount'    => "" . ceil($dep_amount) . "",
                        'buyback_amount'         => "" . ceil($buyback_amount) . "",
                        'package_price'          => "" . ceil($package_price) . "",
                    ];
                }
            }

            $row['invoice_date']       = $invoice_date;
            $row['months_elapsed']     = $months_elapsed;
            $row['purchase_price']     = number_format($base_purchase_price, 2, '.', '');
            $row['base_resale_amount'] = number_format($base_resale_value, 2, '.', '');
            $row['packages']           = $package_breakdown;

            /* ==================================================== */
            /* ============ ORDER SUMMARY ACCUMULATION ============ */
            /* ==================================================== */
            $item_qty   = intval($row['cart_qty']);
            $item_price = floatval($row['retailer_price']);   // <-- use retailer_price
            $item_total = $item_price * $item_qty;

            /* Products subtotal */
            $summary_products += $item_total;

            /* Protection fee = product_price × qty × (package_percentage / 100)
               e.g. Silver with 4% → 4% of product price */
            $pkg_pct_row = $row['package_percentage'];
            if ($pkg_pct_row !== null && floatval($pkg_pct_row) > 0) {
                $protection_rate = floatval($pkg_pct_row) / 100;
                $item_protection = $item_total * $protection_rate;
                $summary_protection += $item_protection;
            }

            $result['result'][] = $row;
        }

        /* ==================================================== */
        /* ============ BUILD SUMMARY OBJECT ================== */
        /* ==================================================== */
        $summary_total = $summary_products + $summary_protection;

        $result['summary'] = [
            'products'                      => number_format($summary_products, 2, '.', ''),
            'products_formatted'            => formatIndianCurrency($summary_products),
            'protection_packages'           => number_format($summary_protection, 2, '.', ''),
            'protection_packages_formatted' => formatIndianCurrency($summary_protection),
            'total'                         => number_format($summary_total, 2, '.', ''),
            'total_formatted'               => formatIndianCurrency($summary_total),
        ];

    } else {
        $result['status'] = '0';
        $result['error']  = '';
        $result['result'] = array();

        /* Empty summary so the app can still render the block */
        $result['summary'] = [
            'products'                      => '0.00',
            'products_formatted'            => '₹0',
            'protection_packages'           => '0.00',
            'protection_packages_formatted' => '₹0',
            'total'                         => '0.00',
            'total_formatted'               => '₹0',
        ];
    }

    echo json_encode($result);
    exit;
}

/* ==================== FALLBACK ==================== */
$result['status'] = '0';
$result['error']  = 'Invalid action';
$result['result'] = array();
echo json_encode($result);