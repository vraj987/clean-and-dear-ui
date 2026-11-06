<?php
session_start();
include "config/myconnection.php";
$page_name = "Kavach Order List";

// ===== DELETE (soft delete) =====
if (isset($_REQUEST['action']) && $_REQUEST['action'] == 'delete') {
    $id = intval($_REQUEST['id']);
    $delete_query = "UPDATE `tbl_order` SET `is_deleted` = 2 
                     WHERE `kavach_order_id` = $id AND `is_deleted` = 1";
    $query_result = mysqli_query($sql, $delete_query);

    if ($query_result) {
        echo "<script>window.location='kavach_order_purchase.php';</script>";
    } else {
        echo "<script>alert('Please Try Again.')</script>";
    }
}

// ===== FILTER VALUES =====
$from_date   = isset($_GET['from_date'])   ? trim($_GET['from_date'])   : '';
$to_date     = isset($_GET['to_date'])     ? trim($_GET['to_date'])     : '';
$filter_user = isset($_GET['filter_user']) ? intval($_GET['filter_user']) : 0;
$filter_order_type = isset($_GET['order_type']) ? trim($_GET['order_type']) : '';
$order_type_options = array(
    '1' => 'Product Order',
    '2' => 'Product + Kavach',
    '3' => 'Kavach Only',
);
if (!array_key_exists($filter_order_type, $order_type_options)) {
    $filter_order_type = '';
}

// ===== BUILD WHERE CLAUSE =====
$where = " WHERE tbl_order.is_deleted = 1 ";

if ($from_date != '' && $to_date != '') {
    $from_esc = mysqli_real_escape_string($sql, $from_date);
    $to_esc   = mysqli_real_escape_string($sql, $to_date);
    $where   .= " AND DATE(tbl_order.c_date) BETWEEN '$from_esc' AND '$to_esc' ";
} elseif ($from_date != '') {
    $from_esc = mysqli_real_escape_string($sql, $from_date);
    $where   .= " AND DATE(tbl_order.c_date) >= '$from_esc' ";
} elseif ($to_date != '') {
    $to_esc = mysqli_real_escape_string($sql, $to_date);
    $where .= " AND DATE(tbl_order.c_date) <= '$to_esc' ";
}

if ($filter_user > 0) {
    $where .= " AND tbl_order.kavach_customer_id = '$filter_user' ";
}

if ($filter_order_type !== '') {
    $where .= " AND tbl_order.order_type = '" . mysqli_real_escape_string($sql, $filter_order_type) . "' ";
}

// ===== CUSTOMER DROPDOWN LIST =====
$cust_sql   = "SELECT customer_id, customer_name, customer_mobile 
               FROM tbl_customer 
               WHERE is_deleted = 1 
               ORDER BY customer_name ASC";
$cust_query = mysqli_query($sql, $cust_sql);
?>
<!DOCTYPE html>
<html lang="en" dir="ltr" data-nav-layout="vertical" data-theme-mode="light" data-header-styles="light" data-menu-styles="light" data-toggled="close">

<head>
    <?php include "config/head.php"; ?>
</head>

<body class="">

    <?php include "config/switcher.php"; ?>

    <div class="page">

        <?php include "config/header.php";
        include "config/sidebar.php"; ?>

        <div class="main-content app-content">
            <div class="container-fluid">

                <!-- ===== FILTER CARD ===== -->
                <div class="row">
                    <div class="col-xl-12">
                        <div class="card custom-card">
                            <div class="card-body">
                                <form method="get" action="kavach_order_purchase.php" class="row g-2 align-items-end">

                                    <div class="col-md-3">
                                        <label class="form-label mb-1">From Date</label>
                                        <input type="date" class="form-control" name="from_date"
                                               value="<?php echo htmlspecialchars($from_date); ?>">
                                    </div>

                                    <div class="col-md-3">
                                        <label class="form-label mb-1">To Date</label>
                                        <input type="date" class="form-control" name="to_date"
                                               value="<?php echo htmlspecialchars($to_date); ?>">
                                    </div>

                                    <div class="col-md-3">
                                        <label class="form-label mb-1">User</label>
                                        <select name="filter_user" class="form-control js-example-basic-single">
                                            <option value="">-</option>
                                            <?php if ($cust_query && mysqli_num_rows($cust_query) > 0) {
                                                while ($cust = mysqli_fetch_assoc($cust_query)) {
                                                    $sel = ($filter_user == $cust['customer_id']) ? 'selected' : '';
                                            ?>
                                                    <option value="<?php echo $cust['customer_id']; ?>" <?php echo $sel; ?>>
                                                        <?php echo htmlspecialchars($cust['customer_name'] . ' - ' . $cust['customer_mobile']); ?>
                                                    </option>
                                            <?php }
                                            } ?>
                                        </select>
                                    </div>

                                    <div class="col-md-2">
                                        <label class="form-label mb-1">Order Type</label>
                                        <select name="order_type" class="form-control">
                                            <option value="">All Order Types</option>
                                            <?php foreach ($order_type_options as $type_value => $type_label) {
                                                $selected = ($filter_order_type === $type_value) ? 'selected' : '';
                                            ?>
                                                <option value="<?php echo htmlspecialchars($type_value); ?>" <?php echo $selected; ?>>
                                                    <?php echo htmlspecialchars($type_label); ?>
                                                </option>
                                            <?php } ?>
                                        </select>
                                    </div>

                                    <div class="col-md-1">
                                        <button type="submit" class="btn btn-primary me-1">
                                            <i class="ri-search-line"></i> Search
                                        </button>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- ===== END FILTER CARD ===== -->

                <!-- ===== MAIN TABLE CARD ===== -->
                <div class="row">
                    <div class="col-xl-12">
                        <div class="card custom-card">
                            <div class="card-header">
                                <div class="card-title"><?php echo $page_name ?></div>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table id="file-export" class="table table-bordered text-nowrap w-100">
                                        <thead>
                                            <tr>
                                                <th>Id</th>
                                                <th width="140">Action</th>
                                                <th>User</th>
                                                <th>Order Type</th>
                                                <th>Product</th>

                                                <th>IMEI No</th>
                                                <th>Invoice No</th>
                                                <th>Invoice File</th>

                                                <th>Package Name</th>
                                                <th>Plan Status</th>
                                                <th>Invoice Date</th>
                                                <th>Purchase Date</th>

                                                <th>Current Month</th>
                                                <th>Curr. Dep. %</th>
                                                <th>Curr. Dep. Amt</th>
                                                <th>Curr. Buyback</th>

                                                <th>Model Value</th>
                                                <th>Buyback Amount</th>
                                                <th>Package Price</th>

                                                <th>Razorpay Order ID</th>
                                                <th>Razorpay Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php
                                             $str_query = "SELECT tbl_product.product_variant,
                                                                 tbl_brand.brand_name,
                                                                 tbl_category.category_name,
                                                                 tbl_model.model_name,
                                                                 tbl_customer.customer_name,
                                                                 tbl_customer.customer_mobile,
                                                                 tbl_order_detail.imei_number,
                                                                 tbl_order_detail.invoice_number,
                                                                 tbl_order_detail.invoice_file,
                                                                 tbl_order_detail.serial_number,
                                                                 tbl_order_detail.remarks,
                                                                 tbl_order.* 
                                                          FROM `tbl_order` 
                                                          LEFT JOIN tbl_customer ON tbl_order.kavach_customer_id = tbl_customer.customer_id
                                                          LEFT JOIN tbl_brand    ON tbl_brand.brand_id       = tbl_order.brand_id
                                                          LEFT JOIN tbl_category ON tbl_category.category_id = tbl_order.category_id
                                                          LEFT JOIN tbl_model    ON tbl_model.model_id       = tbl_order.model_id
                                                          LEFT JOIN tbl_product  ON tbl_product.product_id   = tbl_order.product_id
                                                          LEFT JOIN tbl_order_detail ON tbl_order_detail.kavach_order_id = tbl_order.kavach_order_id
                                                          $where
                                                          GROUP BY tbl_order.kavach_order_id
                                                          ORDER BY tbl_order.kavach_order_id DESC";

                                            $query = mysqli_query($sql, $str_query);
                                            if (mysqli_num_rows($query) > 0) {
                                                while ($row = mysqli_fetch_assoc($query)) {

                                                    // ===== DECODE DEPRECIATION JSON =====
                                                    $dep_arr = array();
                                                    if (!empty($row['depreciation_json'])) {
                                                        $tmp = json_decode($row['depreciation_json'], true);
                                                        if (is_array($tmp)) $dep_arr = $tmp;
                                                    }

                                                    // ===== FIND CURRENT MONTH ENTRY =====
                                                    $current_month_num = 0;
                                                    $current_pct       = 0;
                                                    $current_dep_amt   = 0;
                                                    $current_buyback   = 0;
                                                    $current_pkg_price = 0;

                                                    if (!empty($row['invoice_date'])) {
                                                        try {
                                                            $inv_dt = new DateTime($row['invoice_date']);
                                                            $today  = new DateTime(date('Y-m-d'));
                                                            if ($inv_dt <= $today) {
                                                                $diff = $inv_dt->diff($today);
                                                                $current_month_num = ($diff->y * 12) + $diff->m;
                                                            }
                                                        } catch (Exception $e) {
                                                            $current_month_num = 0;
                                                        }
                                                    }

                                                    if ($current_month_num > 0 && !empty($dep_arr)) {
                                                        foreach ($dep_arr as $dm) {
                                                            if (intval($dm['month_number']) === intval($current_month_num)) {
                                                                $current_pct       = floatval($dm['total_depreciation_pct']);
                                                                $current_dep_amt   = floatval($dm['depreciation_amount']);
                                                                $current_buyback   = floatval($dm['buyback_amount']);
                                                                $current_pkg_price = floatval($dm['package_price']);
                                                                break;
                                                            }
                                                        }
                                                    }

                                                    // ===== INVOICE FILE URL =====
                                                    $invoice_url = '';
                                                    if (!empty($row['invoice_file']) && isset($invoice_upload)) {
                                                        $invoice_url = $invoice_upload . $row['invoice_file'];
                                                    }
                                                   ?>
                                                    <tr>
                                                        <td><?php echo $row['kavach_order_id'] ?? ''; ?></td>
                                                        <td>
                                                            <!-- VIEW -->
                                                            <a href="kavach_order_purchase_view.php?id=<?php echo $row['kavach_order_id']; ?>"
                                                                class="btn btn-icon btn-sm btn-primary-transparent rounded-pill"
                                                                title="View">
                                                                <i class="ri-eye-line"></i>
                                                            </a>

                                                            <!-- DELETE -->
                                                            <a href="javascript:void(0);"
                                                                class="btn btn-icon btn-sm btn-danger-transparent rounded-pill"
                                                                title="Delete"
                                                                data-bs-toggle="modal"
                                                                data-bs-target="#deleteModal"
                                                                onclick="setDeleteId(<?php echo $row['kavach_order_id']; ?>)">
                                                                <i class="ri-delete-bin-line"></i>
                                                            </a>
                                                        </td>
                                                        <td><?php echo htmlspecialchars(($row['customer_name'] ?? '') . ' - ' . ($row['customer_mobile'] ?? '')); ?></td>
                                                        <td>
                                                            <?php
                                                            $order_type = (string)($row['order_type'] ?? '');
                                                            echo htmlspecialchars($order_type_options[$order_type] ?? 'Unknown');
                                                            ?>
                                                        </td>
                                                        <td>
                                                            <?php echo $row['brand_name'] ?? ''; ?> - 
                                                            <?php echo $row['model_name'] ?? ''; ?> - 
                                                            <?php echo $row['product_variant'] ?? ''; ?>
                                                        </td>

                                                        <!-- ===== NEW FIELDS ===== -->
                                                        <td><?php echo !empty($row['imei_number']) ? htmlspecialchars($row['imei_number']) : '-'; ?></td>
                                                        <td><?php echo !empty($row['invoice_number']) ? htmlspecialchars($row['invoice_number']) : '-'; ?></td>
                                                        <td>
                                                            <?php if (!empty($invoice_url)) { ?>
                                                                <a href="<?php echo $invoice_url; ?>"
                                                                   target="_blank"
                                                                   class="btn btn-sm btn-info-transparent">
                                                                    <i class="ri-file-line"></i> View
                                                                </a>
                                                            <?php } else { echo '-'; } ?>
                                                        </td>

                                                        <td><?php echo $row['package_name'] ?? ''; ?></td>

                                                        <td>
                                                            <?php
                                                            $has_kavach = in_array($order_type, array('2', '3'), true);
                                                            $o_status = intval($row['kavach_order_status'] ?? $row['order_status'] ?? 0);
                                                            if (!$has_kavach) {
                                                                echo '-';
                                                            } elseif ($o_status == 1) {
                                                                echo '<span class="badge bg-success-transparent">Active</span>';
                                                            } elseif ($o_status == 2) {
                                                                echo '<span class="badge bg-primary-transparent">Paid</span>';
                                                            } elseif ($o_status == 3) {
                                                                echo '<span class="badge bg-danger-transparent">Cancelled</span>';
                                                            } else {
                                                                echo '-';
                                                            }
                                                            ?>
                                                        </td>

                                                        <td><?php echo !empty($row['invoice_date']) ? date('d-m-Y', strtotime($row['invoice_date'])) : '-'; ?></td>

                                                        <td><?php echo !empty($row['start_date']) ? date('d-m-Y', strtotime($row['start_date'])) : '-'; ?></td>

                                                        <td>
                                                            <?php if ($current_month_num > 0) { ?>
                                                                <span class="badge bg-info-transparent">
                                                                    Month <?php echo $current_month_num; ?>
                                                                </span>
                                                            <?php } else { echo '-'; } ?>
                                                        </td>
                                                        <td><?php echo $current_pct > 0 ? $current_pct . '%' : '-'; ?></td>
                                                        <td><?php echo $current_dep_amt > 0 ? '₹ ' . number_format($current_dep_amt, 2) : '-'; ?></td>
                                                        <td><?php echo $current_buyback > 0 ? '₹ ' . number_format($current_buyback, 2) : '-'; ?></td>

                                                        <td>₹ <?php echo number_format($row['purchase_price'] ?? 0, 2); ?></td>
                                                        <td>₹ <?php echo number_format($row['buyback_amount'] ?? 0, 2); ?></td>
                                                        <td>₹ <?php echo number_format($row['package_price'] ?? 0, 2); ?></td>

                                                        <!-- ===== RAZORPAY INFO ===== -->
                                                        <td>
                                                            <?php if (!empty($row['kavach_razorpayOrderId'])) { ?>
                                                                <span class="badge bg-light text-dark" style="font-size:11px;">
                                                                    <?php echo htmlspecialchars($row['kavach_razorpayOrderId']); ?>
                                                                </span>
                                                            <?php } else { echo '-'; } ?>
                                                        </td>

                                                        <td>
                                                            <?php
                                                            $rz_status = intval($row['kavach_razorpay_status'] ?? 0);
                                                            if (!$has_kavach) {
                                                                echo '-';
                                                            } elseif ($rz_status == 2) {
                                                                echo '<span class="badge bg-success">Success</span>';
                                                            } elseif ($rz_status == 3) {
                                                                echo '<span class="badge bg-danger">Failed</span>';
                                                            } elseif ($rz_status == 1) {
                                                                echo '<span class="badge bg-warning">Pending</span>';
                                                            } else {
                                                                echo '<span class="badge bg-secondary">Not Initiated</span>';
                                                            }
                                                            ?>
                                                        </td>
                                                    </tr>
                                                <?php
                                                }
                                            } ?>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- ===== END MAIN TABLE CARD ===== -->

            </div>
        </div>

        <?php include "config/footer.php"; ?>
    </div>

    <?php include "config/footer_script.php"; ?>

    <!-- Delete Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h6 class="modal-title">Confirm Delete</h6>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    Are you sure you want to delete this Kavach Order?
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Cancel</button>
                    <a href="#" id="confirmDeleteBtn" class="btn btn-danger">Yes, Delete</a>
                </div>
            </div>
        </div>
    </div>
</body>

<script>
    function setDeleteId(id) {
        document.getElementById('confirmDeleteBtn').href =
            "kavach_order_purchase.php?action=delete&id=" + id;
    }
</script>

</html>
