<?php
session_start();
include "config/myconnection.php";
$page_name = "Kavach Order Detail View";

$kavach_order_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($kavach_order_id <= 0) {
    echo "<script>alert('Invalid Order ID'); window.location='kavach_order_purchase.php';</script>";
    exit;
}

/**
 * Normalize depreciation JSON (supports flat + nested formats).
 */
function kavach_normalize_depreciation_json($raw, $master_package_id = '')
{
    if (empty($raw)) return array();
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) return array();

    $nestedBlocks = array();
    foreach ($decoded as $item) {
        if (is_array($item) && array_key_exists('depreciation_json', $item)) {
            $nestedBlocks[] = $item;
        }
    }

    if (!empty($nestedBlocks)) {
        if ($master_package_id !== '') {
            foreach ($nestedBlocks as $block) {
                $blockPkg = isset($block['package_id']) ? (string)$block['package_id'] : '';
                $blockDep = $block['depreciation_json'] ?? null;
                if ($blockPkg === (string)$master_package_id && is_array($blockDep) && count($blockDep) > 0) {
                    return $blockDep;
                }
            }
        }
        foreach ($nestedBlocks as $block) {
            $blockDep = $block['depreciation_json'] ?? null;
            if (is_array($blockDep) && count($blockDep) > 0) return $blockDep;
        }
        return array();
    }

    return $decoded;
}

/** Decode the saved old-device details JSON used by Kavach-only purchases. */
function kavach_decode_product_details($raw)
{
    if (is_array($raw)) return $raw;
    if (!is_string($raw) || trim($raw) === '') return array();
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : array();
}

// ===== FETCH MASTER ORDER =====
$order_query = "SELECT o.*, c.customer_name, c.customer_mobile, c.customer_email
                FROM tbl_order o
                LEFT JOIN tbl_customer c ON c.customer_id = o.kavach_customer_id
                WHERE o.kavach_order_id = '$kavach_order_id' AND o.is_deleted = 1
                LIMIT 1";
$order_res = mysqli_query($sql, $order_query);
if (!$order_res || mysqli_num_rows($order_res) == 0) {
    echo "<script>alert('Order not found'); window.location='kavach_order_purchase.php';</script>";
    exit;
}
$order = mysqli_fetch_assoc($order_res);

// ===== ORDER TYPE =====
$order_type = (string)($order['order_type'] ?? '');
$order_type_labels = array(
    '1' => 'Product Order',
    '2' => 'Product + Kavach',
    '3' => 'Kavach Only',
);
$has_kavach_order = in_array($order_type, array('2', '3'), true);
$is_kavach_only = ($order_type === '3');
$order_type_label = $order_type_labels[$order_type] ?? 'Unknown';

// ===== PLAN STATUS =====
$o_status = intval($order['kavach_order_status'] ?? 0);
$o_status_text = 'Not set';
$o_status_cls  = 'secondary';
if ($o_status == 1) {
    $o_status_text = 'Active';
    $o_status_cls = 'success';
} elseif ($o_status == 2) {
    $o_status_text = 'Paid';
    $o_status_cls = 'primary';
} elseif ($o_status == 3) {
    $o_status_text = 'Cancelled';
    $o_status_cls = 'danger';
}

// ===== RAZORPAY STATUS =====
$rz_status      = intval($order['kavach_razorpay_status'] ?? 0);
$rz_status_text = 'Not Initiated';
$rz_status_cls  = 'secondary';
if ($rz_status == 1) {
    $rz_status_text = 'Pending';
    $rz_status_cls = 'warning';
} elseif ($rz_status == 2) {
    $rz_status_text = 'Success';
    $rz_status_cls = 'success';
} elseif ($rz_status == 3) {
    $rz_status_text = 'Failed';
    $rz_status_cls = 'danger';
}

// ===== FETCH ALL DETAIL ROWS =====
$detail_query = "SELECT d.*,
                        p.product_variant, p.launch_date, p.original_price,
                        b.brand_name,
                        cat.category_name,
                        m.model_name, m.model_image
                 FROM tbl_order_detail d
                 LEFT JOIN tbl_product  p   ON p.product_id   = d.product_id
                 LEFT JOIN tbl_brand    b   ON b.brand_id     = d.brand_id
                 LEFT JOIN tbl_category cat ON cat.category_id= d.category_id
                 LEFT JOIN tbl_model    m   ON m.model_id     = d.model_id
                 WHERE d.kavach_order_id = '$kavach_order_id' AND d.is_deleted = 1
                 ORDER BY d.kavach_order_detail_id ASC";
$detail_res = mysqli_query($sql, $detail_query);

$details = array();
if ($detail_res) {
    while ($d = mysqli_fetch_assoc($detail_res)) {

        $dep_arr = kavach_normalize_depreciation_json(
            $d['depreciation_json'] ?? '',
            (string)($d['package_id'] ?? '')
        );
        $dep_arr = array_values(array_filter($dep_arr, function ($dm) {
            return is_array($dm) && isset($dm['month_number']);
        }));
        $product_details = kavach_decode_product_details(
            $d['product_details_json'] ?? ($order['product_details_json'] ?? '')
        );

        // Invoice date for calc
        $invoice_date_calc = !empty($d['invoice_date'])
            ? $d['invoice_date']
            : ($order['invoice_date'] ?? '');

        // Current month
        $cur_month = 0;
        if (!empty($invoice_date_calc)) {
            try {
                $inv_dt = new DateTime($invoice_date_calc);
                $today  = new DateTime(date('Y-m-d'));
                if ($inv_dt <= $today) {
                    $diff = $inv_dt->diff($today);
                    $cur_month = ($diff->y * 12) + $diff->m + 1;
                }
            } catch (Exception $e) {
            }
        }

        // Base values
        $base_price = floatval($d['purchase_price'] ?? 0);
        if ($base_price <= 0) $base_price = floatval($product_details['purchase_price'] ?? 0);
        if ($base_price <= 0) $base_price = floatval($order['purchase_price'] ?? 0);

        $base_pkg_pct = floatval($d['package_percentage'] ?? 0);
        if ($base_pkg_pct <= 0) $base_pkg_pct = floatval($order['package_percentage'] ?? 0);

        // File URLs
        $inv_file_url  = (!empty($d['invoice_file']) && isset($invoice_upload))
            ? $invoice_upload . $d['invoice_file'] : '';
        $model_img_url = (!empty($d['model_image']) && isset($server_model_url))
            ? $server_model_url . $d['model_image'] : '';

        $d['_dep_arr']         = $dep_arr;
        $d['_product_details'] = $product_details;
        $d['_invoice_date']    = $invoice_date_calc;
        $d['_current_month']   = $cur_month;
        $d['_base_price']      = $base_price;
        $d['_base_pkg_pct']    = $base_pkg_pct;
        $d['_invoice_file_url'] = $inv_file_url;
        $d['_model_img_url']   = $model_img_url;

        $details[] = $d;
    }
}

// ===== GROUP: pair each device row with its kavach row (same product only) =====
$groups         = array();
$device_pending = array();   // keyed by product_id

foreach ($details as $d) {
    $has_dep = !empty($d['_dep_arr']);
    $pkg_id  = intval($d['package_id'] ?? 0);
    $prod_id = intval($d['product_id'] ?? 0);

    if ($has_dep && $pkg_id > 0) {
        if (isset($device_pending[$prod_id])) {
            $device = $device_pending[$prod_id];
            unset($device_pending[$prod_id]);
            $groups[] = array('device' => $device, 'kavach' => $d);
        } else {
            $groups[] = array('device' => $d, 'kavach' => $d);
        }
    } else {
        $device_pending[$prod_id] = $d;
    }
}

// Anything still pending was never paired → emit as device-only rows
foreach ($device_pending as $d) {
    $groups[] = array('device' => $d, 'kavach' => null);
}

// ===== BILLING VALUES =====
$total_purchase = floatval($order['purchase_price'] ?? 0);
$total_package  = floatval($order['package_price'] ?? 0);
$total_buyback  = floatval($order['buyback_amount'] ?? 0);

$payable_raw    = floatval($order['kavach_payable'] ?? 0);
$discount_amt   = floatval($order['kavach_discount'] ?? 0);
$delivery_amt   = floatval($order['kavach_delivery_charges'] ?? 0);
$received_amt   = floatval($order['kavach_received_amount'] ?? 0);
$remaining_amt  = floatval($order['kavach_remaining_amount'] ?? 0);

$calc_payable = $payable_raw > 0 ? $payable_raw : ($total_purchase + $total_package);
$net_payable  = $calc_payable - $discount_amt + $delivery_amt;

if ($received_amt <= 0 && $remaining_amt <= 0) {
    $remaining_amt = $net_payable;
}

// Helper for currency
function fmt_amt($v)
{
    return '₹ ' . number_format((float)$v, 2);
}
?>

<!DOCTYPE html>
<html lang="en" dir="ltr"
    data-nav-layout="vertical"
    data-theme-mode="light"
    data-header-styles="light"
    data-menu-styles="light"
    data-toggled="close">

<head>
    <?php include "config/head.php"; ?>
    <style>
        /* ===== Sirf layout CSS - koi hard-coded color nahi (theme light/dark follow karega) ===== */

        /* 100% width, overflow nahi - text lamba ho to nayi line mein */
        .kv-table {
            width: 100%;
            max-width: 100%;
            table-layout: auto;
        }

        .kv-table th,
        .kv-table td {
            white-space: normal !important;
            word-break: break-word;
            overflow-wrap: anywhere;
            vertical-align: middle;
        }

        .page .card,
        .page .card-body {
            max-width: 100%;
        }

        .section-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
        }

        .product-summary-row {
            cursor: pointer;
        }

        .product-summary-row:hover {
            background: rgba(var(--primary-rgb, 128, 128, 128), .06);
        }

        .product-detail-row>td {
            background: transparent !important;
            padding: 16px !important;
            border-top: 1px solid var(--default-border, currentColor);
        }

        .protection-summary-card {
            border: 1px solid var(--default-border, currentColor);
            border-radius: 12px;
            padding: 16px;
            width: 100%;
            max-width: 100%;
        }

        .protection-duration-range {
            width: 100%;
            height: 8px;
            cursor: pointer;
            accent-color: var(--primary-color, auto);
        }

        .protection-duration-marks {
            display: flex;
            justify-content: space-between;
            margin-top: 8px;
            font-size: 11px;
            font-weight: 600;
        }

        .protection-live-metric {
            border-top: 1px solid var(--default-border, currentColor);
            margin-top: 14px;
            padding-top: 12px;
        }

        .billing-table td {
            padding: 6px 10px;
        }

        .billing-table tr td:last-child {
            text-align: right;
            font-weight: 500;
        }
    </style>
</head>

<body class="">

    <?php include "config/switcher.php"; ?>

    <div class="page">

        <?php
        include "config/header.php";
        include "config/sidebar.php";
        ?>

        <div class="main-content app-content">
            <div class="container-fluid">

                <!-- ===== ORDER SUMMARY ===== -->
                <div class="row">
                    <div class="col-xl-12">
                        <div class="card custom-card">
                            <div class="card-header">
                                <div class="card-title">
                                    Order #<?php echo $kavach_order_id; ?> — Summary
                                </div>
                                <div class="ms-auto d-flex flex-wrap gap-2">
                                    <span class="badge border text-default">
                                        <?php echo htmlspecialchars($order_type_label); ?>
                                    </span>
                                    <?php if ($has_kavach_order) { ?>
                                        <span class="badge bg-<?php echo $o_status_cls; ?>-transparent">
                                            Plan: <?php echo $o_status_text; ?>
                                        </span>
                                        <span class="badge bg-<?php echo $rz_status_cls; ?>-transparent">
                                            Razorpay: <?php echo $rz_status_text; ?>
                                        </span>
                                    <?php } ?>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">

                                    <div class="col-md-4 col-12">
                                        <small class="text-muted d-block">Customer</small>
                                        <strong><?php echo htmlspecialchars($order['customer_name'] ?? '-'); ?></strong>
                                        <div class="text-muted small"><?php echo htmlspecialchars($order['customer_mobile'] ?? ''); ?></div>
                                        <div class="text-muted small"><?php echo htmlspecialchars($order['customer_email'] ?? ''); ?></div>
                                    </div>

                                    <div class="col-md-2 col-6">
                                        <small class="text-muted d-block">Order Type</small>
                                        <strong><?php echo htmlspecialchars($order_type_label); ?></strong>
                                    </div>

                                    <div class="col-md-2 col-6">
                                        <small class="text-muted d-block">Order Date</small>
                                        <strong>
                                            <?php echo !empty($order['c_date']) ? date('d-m-Y', strtotime($order['c_date'])) : '-'; ?>
                                        </strong>
                                    </div>

                                    <div class="col-md-2 col-6">
                                        <small class="text-muted d-block">Invoice Date</small>
                                        <strong>
                                            <?php echo !empty($order['invoice_date']) ? date('d-m-Y', strtotime($order['invoice_date'])) : '-'; ?>
                                        </strong>
                                    </div>

                                    <div class="col-md-2 col-6">
                                        <small class="text-muted d-block">Products Count</small>
                                        <strong><?php echo count($groups); ?></strong>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ===== PRODUCTS TABLE (expandable) ===== -->
                <div class="row">
                    <div class="col-xl-12">
                        <div class="card custom-card">

                            <div class="card-header">
                                <?php if (!$is_kavach_only) { ?>
                                    <div class="card-title">
                                        Products (<?php echo count($groups); ?>)
                                    </div>
                                <?php } ?>
                                <div class="ms-auto d-flex flex-wrap gap-2">
                                    <button type="button" class="btn btn-sm btn-outline-secondary" onclick="expandAll()">
                                        <i class="ri-expand-diagonal-line"></i> Expand All
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline-secondary" onclick="collapseAll()">
                                        <i class="ri-collapse-diagonal-line"></i> Collapse All
                                    </button>
                                </div>
                            </div>

                            <div class="card-body">
                                <?php if (empty($groups)) { ?>
                                    <div class="text-muted">
                                        No product details found for this order.
                                    </div>
                                <?php } else { ?>

                                    <table class="table table-bordered kv-table align-middle mb-0">
                                        <thead>
                                            <tr>
                                                <th width="40">#</th>
                                                <th>Product</th>
                                                <th>IMEI</th>
                                                <th>Invoice No</th>
                                                <th>Package</th>
                                                <th>Plan Status</th>
                                                <th class="text-end">Device Value</th>
                                                <th class="text-end">Package Amt</th>
                                                <th>Dep %</th>
                                                <th width="70">Action</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            <?php foreach ($groups as $gi => $group):
                                                $device  = $group['device'];
                                                $kavach  = $group['kavach'];

                                                $has_kavach = ($kavach !== null && !empty($kavach['_dep_arr']));
                                                $is_paired  = ($has_kavach && intval($kavach['kavach_order_detail_id']) !== intval($device['kavach_order_detail_id']));

                                                // Current month entry (from kavach row)
                                                $cur_month  = $has_kavach ? intval($kavach['_current_month']) : 0;
                                                $cur_pct    = 0;
                                                $cur_dep    = 0;
                                                $cur_buy    = 0;

                                                if ($has_kavach && $cur_month > 0) {
                                                    foreach ($kavach['_dep_arr'] as $dm) {
                                                        if (intval($dm['month_number']) === $cur_month) {
                                                            $cur_pct = floatval($dm['monthly_depreciation'] ?? 0)
                                                                + floatval($dm['post_new_model_depreciation'] ?? 0);
                                                            $cur_dep = floatval($dm['depreciation_amount'] ?? 0);
                                                            $cur_buy = floatval($dm['buyback_amount'] ?? 0);
                                                            break;
                                                        }
                                                    }
                                                }

                                                $device_label = trim(($device['brand_name'] ?? '') . ' - ' . ($device['model_name'] ?? ''), ' -');
                                                if ($device_label === '') $device_label = 'Product #' . ($device['product_id'] ?? '');

                                                // Device value (Kavach Only mein customer ka entered base price)
                                                $device_value = $is_kavach_only
                                                    ? ($device['_base_price'] ?? 0)
                                                    : ($device['purchase_price'] ?? 0);
                                            ?>

                                                <!-- SUMMARY ROW -->
                                                <tr class="product-summary-row" onclick="toggleDetail(<?php echo $gi; ?>)">
                                                    <td><strong><?php echo $gi + 1; ?></strong></td>
                                                    <td>
                                                        <?php echo htmlspecialchars($device_label); ?>
                                                        <div class="text-muted small"><?php echo htmlspecialchars($device['product_variant'] ?? ''); ?></div>
                                                        <?php if ($has_kavach && $is_paired): ?>
                                                            <span class="badge border text-default ms-1">+ Kavach</span>
                                                        <?php elseif ($has_kavach): ?>
                                                            <span class="badge border text-default ms-1">Kavach</span>
                                                        <?php endif; ?>
                                                    </td>
                                                    <td><?php echo !empty($device['imei_number']) ? htmlspecialchars($device['imei_number']) : '-'; ?></td>
                                                    <td><?php echo !empty($device['invoice_number']) ? htmlspecialchars($device['invoice_number']) : '-'; ?></td>
                                                    <td><?php echo $has_kavach ? htmlspecialchars($kavach['package_name'] ?? '-') : '-'; ?></td>
                                                    <td>
                                                        <?php if ($has_kavach): ?>
                                                            <span class="badge bg-<?php echo $o_status_cls; ?>-transparent">
                                                                <?php echo $o_status_text; ?>
                                                            </span>
                                                            <?php else: ?>-<?php endif; ?>
                                                    </td>
                                                    <td class="text-end"><?php echo fmt_amt($device_value); ?></td>

                                                    <td class="text-end">
                                                        <?php echo $has_kavach ? fmt_amt($kavach['package_price'] ?? 0) : '-'; ?>
                                                    </td>

                                                    <td><?php echo $cur_pct > 0 ? number_format($cur_pct, 2) . '%' : '-'; ?></td>

                                                    <td class="text-center">
                                                        <button type="button" class="btn btn-sm btn-outline-secondary">
                                                            <i class="ri-arrow-<?php echo $is_kavach_only ? 'up' : 'down'; ?>-s-line"></i>
                                                        </button>
                                                    </td>
                                                </tr>

                                                <!-- DETAIL ROW (collapsed) -->
                                                <tr id="detail-<?php echo $gi; ?>" class="product-detail-row" style="display:<?php echo $is_kavach_only ? 'table-row' : 'none'; ?>;">
                                                    <td colspan="11">

                                                        <!-- ===== DEVICE DETAILS (single section, no duplicates) ===== -->
                                                        <div class="mb-3">
                                                            <div class="section-label text-muted mb-2">Device Details</div>

                                                            <div class="row g-3">

                                                                <div class="col-md-2 col-6">
                                                                    <small class="text-muted d-block">Invoice Date</small>
                                                                    <strong>
                                                                        <?php echo !empty($device['invoice_date']) ? date('d-m-Y', strtotime($device['invoice_date'])) : '-'; ?>
                                                                    </strong>
                                                                </div>


                                                                <div class="col-md-3 col-6">
                                                                    <small class="text-muted d-block">Serial Number</small>
                                                                    <strong><?php echo !empty($device['serial_number']) ? htmlspecialchars($device['serial_number']) : '-'; ?></strong>
                                                                </div>
                                                            </div>

                                                            <div class="row g-3 mt-2">


                                                                <div class="col-md-4 col-12">
                                                                    <small class="text-muted d-block">Invoice File</small>
                                                                    <?php if (!empty($device['_invoice_file_url'])) { ?>
                                                                        <div class="d-flex gap-2 flex-wrap">
                                                                            <a href="<?php echo $device['_invoice_file_url']; ?>" target="_blank" class="btn btn-sm btn-outline-secondary">
                                                                                <i class="ri-eye-line"></i> View
                                                                            </a>
                                                                            <a href="<?php echo $device['_invoice_file_url']; ?>" download class="btn btn-sm btn-outline-secondary">
                                                                                <i class="ri-download-line"></i> Download
                                                                            </a>
                                                                        </div>
                                                                    <?php } else { ?>
                                                                        <span class="text-muted">No invoice uploaded</span>
                                                                    <?php } ?>
                                                                </div>

                                                                <?php if (!empty($device['remarks'])) { ?>
                                                                    <div class="col-md-5 col-12">
                                                                        <small class="text-muted d-block">Remarks</small>
                                                                        <strong><?php echo htmlspecialchars($device['remarks']); ?></strong>
                                                                    </div>
                                                                <?php } ?>
                                                            </div>
                                                        </div>

                                                        <!-- ===== KAVACH PLAN ===== -->
                                                        <?php if ($has_kavach) {
                                                            $kv         = $kavach;
                                                            $kv_dep     = $kv['_dep_arr'];
                                                            $kv_base    = floatval($kv['_base_price']);
                                                            $kv_pkg_pct = floatval($kv['_base_pkg_pct']);
                                                            $kv_cur     = intval($kv['_current_month']);
                                                        ?>
                                                            <hr>

                                                            <div class="dep-section"
                                                                data-order-id="<?php echo $kavach_order_id; ?>"
                                                                data-detail-id="<?php echo $kv['kavach_order_detail_id']; ?>">

                                                                <div class="section-label text-muted mb-2">
                                                                    <?php echo $is_kavach_only ? 'Your protection' : 'Kavach Plan'; ?>
                                                                    <?php if ($is_paired): ?>
                                                                        <span class="badge border text-default ms-2">
                                                                            Paired with device above
                                                                        </span>
                                                                    <?php endif; ?>
                                                                </div>

                                                                <?php if ($is_kavach_only) {
                                                                    $plan_sell_amount = floatval($kv['buyback_amount'] ?? 0);
                                                                    $selected_plan_price = floatval($kv['package_price'] ?? 0);
                                                                    $selected_duration = max(1, min(24, intval($kv['duration'] ?? 1)));
                                                                    $duration_minimum = min($selected_duration, max(1, min(24, $kv_cur)));
                                                                    $duration_marks = array();
                                                                    for ($mark_index = 0; $mark_index <= 5; $mark_index++) {
                                                                        $duration_marks[] = (int)round($duration_minimum + ((24 - $duration_minimum) * $mark_index / 5));
                                                                    }
                                                                    $duration_marks = array_values(array_unique($duration_marks));
                                                                    foreach ($kv_dep as $plan_month) {
                                                                        if (intval($plan_month['month_number'] ?? 0) === intval($kv['duration'] ?? 0)) {
                                                                            $plan_sell_amount = floatval($plan_month['buyback_amount'] ?? $plan_sell_amount);
                                                                            $selected_plan_price = floatval($plan_month['package_price'] ?? $selected_plan_price);
                                                                            break;
                                                                        }
                                                                    }
                                                                ?>
                                                                    <div class="protection-summary-card mb-3">
                                                                        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                                                                            <div class="d-flex flex-wrap align-items-center gap-2">
                                                                                <h4 class="mb-0"><?php echo htmlspecialchars($kv['package_name'] ?? 'Kavach'); ?></h4>
                                                                                <span class="badge border text-default">PURCHASED</span>
                                                                            </div>
                                                                            <i class="ri-shield-check-line fs-5" aria-hidden="true"></i>
                                                                        </div>

                                                                        <div class="mt-3">
                                                                            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
                                                                                <strong class="small text-uppercase">Choose your duration</strong>
                                                                                <span class="badge border text-default" id="plan-duration-<?php echo intval($kv['kavach_order_detail_id']); ?>"><?php echo $selected_duration; ?> months</span>
                                                                            </div>
                                                                            <input type="range" min="<?php echo $duration_minimum; ?>" max="24" step="1" value="<?php echo $selected_duration; ?>"
                                                                                class="protection-duration-range mt-3"
                                                                                aria-label="Choose Kavach duration"
                                                                                data-duration-output="plan-duration-<?php echo intval($kv['kavach_order_detail_id']); ?>"
                                                                                data-buyback-output="plan-buyback-<?php echo intval($kv['kavach_order_detail_id']); ?>"
                                                                                data-price-output="plan-price-<?php echo intval($kv['kavach_order_detail_id']); ?>"
                                                                                data-schedule="<?php echo htmlspecialchars(json_encode($kv_dep), ENT_QUOTES, 'UTF-8'); ?>"
                                                                                oninput="updateProtectionSnapshot(this)">
                                                                            <div class="protection-duration-marks">
                                                                                <?php foreach ($duration_marks as $duration_mark): ?><span><?php echo $duration_mark; ?></span><?php endforeach; ?>
                                                                            </div>
                                                                            <small class="d-block mt-2 text-muted">Showing month-wise values from the saved order schedule.</small>
                                                                        </div>

                                                                        <div class="protection-live-metric d-flex flex-wrap align-items-baseline gap-2">
                                                                            <strong class="fs-4" id="plan-buyback-<?php echo intval($kv['kavach_order_detail_id']); ?>"><?php echo fmt_amt($plan_sell_amount); ?></strong>
                                                                            <span class="fw-semibold">Assured buyback amount</span>
                                                                        </div>
                                                                        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-3">
                                                                            <span class="text-muted">Package price</span>
                                                                            <strong class="fs-5" id="plan-price-<?php echo intval($kv['kavach_order_detail_id']); ?>"><?php echo fmt_amt($selected_plan_price); ?></strong>
                                                                        </div>
                                                                    </div>
                                                                <?php } else { ?>
                                                                    <div class="row g-3 mb-3">
                                                                        <div class="col-md-2 col-6">
                                                                            <small class="text-muted d-block">Package Name</small>
                                                                            <strong><?php echo htmlspecialchars($kv['package_name'] ?? '-'); ?></strong>
                                                                        </div>
                                                                        <div class="col-md-2 col-6">
                                                                            <small class="text-muted d-block">Kavach Base Value</small>
                                                                            <strong><?php echo fmt_amt($kv_base); ?></strong>
                                                                        </div>
                                                                        <div class="col-md-2 col-6">
                                                                            <small class="text-muted d-block">Package %</small>
                                                                            <strong><?php echo number_format($kv_pkg_pct, 2); ?>%</strong>
                                                                        </div>
                                                                        <div class="col-md-2 col-6">
                                                                            <small class="text-muted d-block">Package Amount</small>
                                                                            <strong><?php echo fmt_amt($kv['package_price'] ?? 0); ?></strong>
                                                                        </div>
                                                                        <div class="col-md-2 col-6">
                                                                            <small class="text-muted d-block">Duration</small>
                                                                            <strong><?php echo intval($kv['duration'] ?? 0); ?> months</strong>
                                                                        </div>
                                                                        <div class="col-md-2 col-6">
                                                                            <small class="text-muted d-block">Current Month</small>
                                                                            <?php if ($kv_cur > 0): ?>
                                                                                <span class="badge border text-default">Month <?php echo $kv_cur; ?></span>
                                                                                <?php else: ?>-<?php endif; ?>
                                                                        </div>
                                                                    </div>
                                                                <?php } ?>

                                                            </div>
                                                        <?php } ?>

                                                    </td>
                                                </tr>

                                            <?php endforeach; ?>
                                        </tbody>
                                    </table>

                                <?php } ?>
                            </div>

                        </div>
                    </div>
                </div>

                <!-- ===== BILLING SUMMARY ===== -->
                <div class="row">
                    <div class="col-xl-12">
                        <div class="card custom-card">
                            <div class="card-header">
                                <div class="card-title">Billing Summary</div>
                            </div>
                            <div class="card-body">
                                <div class="row g-4">

                                    <!-- Left: Order value breakdown -->
                                    <div class="col-md-6 col-12">
                                        <div class="section-label text-muted mb-2">Order Value</div>
                                        <table class="table table-sm billing-table mb-0">
                                            <tbody>
                                                <tr>
                                                    <td>Total Device Value</td>
                                                    <td><?php echo fmt_amt($total_purchase); ?></td>
                                                </tr>
                                                <tr>
                                                    <td>Total Package Amount</td>
                                                    <td><?php echo fmt_amt($total_package); ?></td>
                                                </tr>
                                                <tr>
                                                    <td>Total Buyback Amount</td>
                                                    <td><?php echo fmt_amt($total_buyback); ?></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <!-- Right: Payable / Received -->
                                    <div class="col-md-6 col-12">
                                        <div class="section-label text-muted mb-2">Payment</div>
                                        <table class="table table-sm billing-table mb-0">
                                            <tbody>
                                                <tr>
                                                    <td>Payable Amount</td>
                                                    <td><?php echo $calc_payable > 0 ? fmt_amt($calc_payable) : '-'; ?></td>
                                                </tr>
                                                <tr>
                                                    <td>Discount</td>
                                                    <td><?php echo $discount_amt > 0 ? '- ' . fmt_amt($discount_amt) : '-'; ?></td>
                                                </tr>
                                                <tr>
                                                    <td>Delivery Charges</td>
                                                    <td><?php echo $delivery_amt > 0 ? '+ ' . fmt_amt($delivery_amt) : '-'; ?></td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Net Payable</strong></td>
                                                    <td><strong><?php echo fmt_amt($net_payable); ?></strong></td>
                                                </tr>
                                                <tr>
                                                    <td>Amount Received</td>
                                                    <td><?php echo $received_amt > 0 ? fmt_amt($received_amt) : '-'; ?></td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Remaining</strong></td>
                                                    <td><strong><?php echo fmt_amt($remaining_amt); ?></strong></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <hr>

                                <!-- Razorpay -->
                                <div class="row g-3">
                                    <div class="col-md-4 col-12">
                                        <small class="text-muted d-block">Razorpay Order ID</small>
                                        <strong class="text-break">
                                            <?php echo !empty($order['kavach_razorpayOrderId'])
                                                ? htmlspecialchars($order['kavach_razorpayOrderId']) : '-'; ?>
                                        </strong>
                                    </div>
                                    <div class="col-md-4 col-12">
                                        <small class="text-muted d-block">Razorpay Payment ID</small>
                                        <strong class="text-break">
                                            <?php echo !empty($order['kavach_razorpay_payment_id'])
                                                ? htmlspecialchars($order['kavach_razorpay_payment_id']) : '-'; ?>
                                        </strong>
                                    </div>
                                    <div class="col-md-4 col-12">
                                        <small class="text-muted d-block">Razorpay Status</small>
                                        <?php if ($has_kavach_order): ?>
                                            <span class="badge bg-<?php echo $rz_status_cls; ?>-transparent"><?php echo $rz_status_text; ?></span>
                                        <?php else: ?>
                                            <span class="text-muted">Not applicable</span>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <?php include "config/footer.php"; ?>
    </div>

    <?php include "config/footer_script.php"; ?>

    <script>
        // ===== TOGGLE ONE ROW =====
        function toggleDetail(idx) {
            var detailRow = document.getElementById('detail-' + idx);
            if (!detailRow) return;

            var summaryRow = detailRow.previousElementSibling;
            var icon = summaryRow.querySelector('button i');

            if (detailRow.style.display === 'none' || detailRow.style.display === '') {
                detailRow.style.display = 'table-row';
                if (icon) icon.className = 'ri-arrow-up-s-line';
            } else {
                detailRow.style.display = 'none';
                if (icon) icon.className = 'ri-arrow-down-s-line';
            }
        }

        // ===== EXPAND / COLLAPSE ALL =====
        function expandAll() {
            document.querySelectorAll('[id^="detail-"]').forEach(function(row) {
                row.style.display = 'table-row';
                var icon = row.previousElementSibling?.querySelector('button i');
                if (icon) icon.className = 'ri-arrow-up-s-line';
            });
        }

        function collapseAll() {
            document.querySelectorAll('[id^="detail-"]').forEach(function(row) {
                row.style.display = 'none';
                var icon = row.previousElementSibling?.querySelector('button i');
                if (icon) icon.className = 'ri-arrow-down-s-line';
            });
        }

        function updateProtectionSnapshot(input) {
            var durationId = input.dataset.durationOutput;
            var buybackId = input.dataset.buybackOutput;
            var priceId = input.dataset.priceOutput;
            var durationOutput = durationId ? document.getElementById(durationId) : null;
            var buybackOutput = buybackId ? document.getElementById(buybackId) : null;
            var priceOutput = priceId ? document.getElementById(priceId) : null;
            var month = parseInt(input.value, 10) || 1;
            var schedule = [];

            try {
                schedule = JSON.parse(input.dataset.schedule || '[]');
            } catch (error) {
                schedule = [];
            }

            var row = schedule.find(function(item) {
                return parseInt(item.month_number, 10) === month;
            });
            var formatMoney = function(value) {
                var amount = Number(value);
                return '₹ ' + (Number.isFinite(amount) ? amount.toLocaleString('en-IN') : '0');
            };

            if (durationOutput) durationOutput.textContent = month + (month === 1 ? ' month' : ' months');
            if (buybackOutput && row) buybackOutput.textContent = formatMoney(row.buyback_amount);
            if (priceOutput && row) priceOutput.textContent = formatMoney(row.package_price);
        }

        // ===== RECALCULATE — per table (non-cumulative, per-month) =====
        function recalcAll() {
            document.querySelectorAll('.dep-tbody').forEach(function(tbody) {
                var basePrice = parseFloat(tbody.dataset.basePrice || 0);
                var basePkgPct = parseFloat(tbody.dataset.pkgPct || 0);

                tbody.querySelectorAll('tr').forEach(function(tr) {
                    var monthlyEl = tr.querySelector('.input-monthly');
                    var postEl = tr.querySelector('.input-post');
                    if (!monthlyEl || !postEl) return;

                    var monthly = parseFloat(monthlyEl.value) || 0;
                    var post = parseFloat(postEl.value) || 0;

                    var monthPct = monthly + post;
                    var depAmt = Math.ceil(basePrice * monthPct / 100);
                    var buyAmt = Math.ceil(Math.max(0, basePrice - (basePrice * monthPct / 100)));
                    var pkgAmt = Math.ceil(basePrice * basePkgPct / 100);

                    tr.querySelector('.cell-month-pct').innerText = monthPct.toFixed(2) + '%';
                    tr.querySelector('.cell-dep-amt').innerText = '₹ ' + depAmt.toFixed(2);
                    tr.querySelector('.cell-buy-amt').innerText = '₹ ' + buyAmt.toFixed(2);
                    tr.querySelector('.cell-pkg-amt').innerText = '₹ ' + pkgAmt.toFixed(2);
                });
            });
        }

        // ===== SAVE — per kavach plan =====
        function saveDepreciation(btn) {
            var section = btn.closest('.dep-section');
            var orderId = section.dataset.orderId;
            var detailId = section.dataset.detailId;
            var tbody = section.querySelector('.dep-tbody');

            var data = [];
            tbody.querySelectorAll('tr').forEach(function(tr) {
                var monthPctTxt = tr.querySelector('.cell-month-pct').innerText.replace('%', '').trim();
                var depAmtTxt = tr.querySelector('.cell-dep-amt').innerText.replace(/[₹,\s]/g, '').trim();
                var buyAmtTxt = tr.querySelector('.cell-buy-amt').innerText.replace(/[₹,\s]/g, '').trim();
                var pkgAmtTxt = tr.querySelector('.cell-pkg-amt').innerText.replace(/[₹,\s]/g, '').trim();

                data.push({
                    month_number: String(tr.getAttribute('data-month')),
                    monthly_depreciation: String(parseFloat(tr.querySelector('.input-monthly').value) || 0),
                    post_new_model_depreciation: String(parseFloat(tr.querySelector('.input-post').value) || 0),
                    total_depreciation_pct: String(parseFloat(monthPctTxt) || 0),
                    depreciation_amount: String(parseFloat(depAmtTxt) || 0),
                    buyback_amount: String(parseFloat(buyAmtTxt) || 0),
                    package_price: String(parseFloat(pkgAmtTxt) || 0)
                });
            });

            btn.disabled = true;
            btn.innerHTML = '<i class="ri-loader-4-line"></i> Saving...';

            fetch('kavach_order_save_depreciation.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        kavach_order_id: orderId,
                        kavach_order_detail_id: detailId,
                        depreciation_json: data
                    })
                })
                .then(function(res) {
                    return res.json();
                })
                .then(function(resp) {
                    if (resp.status === '1') {
                        sessionStorage.setItem('dep_saved', '1');
                        window.location.reload();
                    } else {
                        btn.disabled = false;
                        btn.innerHTML = '<i class="ri-save-line"></i> Save Changes';
                        alert('Error: ' + (resp.error || 'Unknown error'));
                    }
                })
                .catch(function(err) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="ri-save-line"></i> Save Changes';
                    alert('Request failed: ' + err.message);
                });
        }

        // ===== ONE-TIME SUCCESS ALERT =====
        (function() {
            if (sessionStorage.getItem('dep_saved') === '1') {
                sessionStorage.removeItem('dep_saved');
                setTimeout(function() {
                    alert('Depreciation updated successfully!');
                }, 300);
            }
        })();
    </script>

</body>

</html>