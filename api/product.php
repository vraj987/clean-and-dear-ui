<?php
// product.php (api example)
include 'dbconnect.php';

$product_id     = isset($_REQUEST['product_id'])     ? intval($_REQUEST['product_id'])     : 0;
$category_id    = isset($_REQUEST['category_id'])    ? intval($_REQUEST['category_id'])    : 0;
$product_category_id = isset($_REQUEST['product_category_id']) ? intval($_REQUEST['product_category_id']) : 0;
$brand_id       = isset($_REQUEST['brand_id'])       ? intval($_REQUEST['brand_id'])       : 0;
$model_id       = isset($_REQUEST['model_id'])       ? intval($_REQUEST['model_id'])       : 0;
$invoice_date   = isset($_REQUEST['invoice_date'])   ? trim($_REQUEST['invoice_date'])     : '';
$purchase_price = isset($_REQUEST['purchase_price']) ? trim($_REQUEST['purchase_price'])   : 0;
$duration       = isset($_REQUEST['duration'])       ? trim($_REQUEST['duration'])         : 0;
$package_id     = isset($_REQUEST['package_id'])     ? intval($_REQUEST['package_id'])     : 0;
$user_id        = isset($_REQUEST['user_id'])        ? intval($_REQUEST['user_id'])        : 0;
$type_id        = isset($_REQUEST['type_id'])        ? intval($_REQUEST['type_id'])        : 0;
$product_type   = isset($_REQUEST['product_type'])   ? intval($_REQUEST['product_type'])   : 0;
$search         = isset($_REQUEST['search'])         ? trim($_REQUEST['search'])          : '';
$limit          = isset($_REQUEST['limit'])          ? max(0, intval($_REQUEST['limit'])) : 0;
$offset         = isset($_REQUEST['offset'])         ? max(0, intval($_REQUEST['offset'])) : 0;

$purchase_price = $purchase_price > 0 ? $purchase_price : '';

// ===== Validate invoice_date only if provided =====
$calc_resale = false;
if (!empty($invoice_date) && !empty($purchase_price) && !empty($duration)) {
    $d = DateTime::createFromFormat('Y-m-d', $invoice_date);
    if (!$d || $d->format('Y-m-d') !== $invoice_date) {
        $result['status'] = '0';
        $result['error']  = 'Invalid invoice_date format. Use YYYY-MM-DD';
        $result['result'] = array();
        echo json_encode($result);
        exit;
    }
    $calc_resale = true;
}

// ===== Load Packages =====
$packages = [];
$pkg_where = "is_deleted=1";
if ($package_id > 0) $pkg_where .= " AND package_id='$package_id'";
$pq = mysqli_query($sql, "SELECT package_id, package_name, package_percentage FROM tbl_package WHERE $pkg_where ORDER BY package_id ASC");
while ($p = mysqli_fetch_assoc($pq)) {
    $packages[] = $p;
}
$product_type = $product_type == 1 ? 2 : $product_type;
// ===== Filters =====
$where = "p.is_deleted = 1";
if ($product_id > 0)  $where .= " AND p.product_id = '$product_id'";
if ($category_id > 0) $where .= " AND p.category_id = '$category_id'";
if ($product_category_id > 0) $where .= " AND p.product_category_id = '$product_category_id'";
if ($brand_id > 0)    $where .= " AND p.brand_id = '$brand_id'";
if ($model_id > 0)    $where .= " AND p.model_id = '$model_id'";
if ($product_type > 0) $where .= " AND p.product_type = '$product_type'";
if ($search !== '') {
    $search_esc = mysqli_real_escape_string($sql, $search);
    $search_like = "'%$search_esc%'";
    $where .= " AND (
        b.brand_name LIKE $search_like
        OR m.model_name LIKE $search_like
        OR p.product_variant LIKE $search_like
        OR CONCAT_WS(' ', b.brand_name, m.model_name, p.product_variant) LIKE $search_like
    )";
}

$limit_sql = $limit > 0 ? " LIMIT $offset, $limit" : '';

/* NOTE: p.reference_id & p.is_duplicated added so we can group variants */
$query = mysqli_query($sql, "SELECT short_description, long_description, p.product_type, p.brand_id, p.model_id, p.product_id, p.product_variant, p.launch_date, p.original_price, COALESCE(pc.category_name, c.category_name) AS category_name, p.product_category_id, b.brand_name, m.model_name, m.model_image, p.product_images, p.product_image, p.mrp, p.retailer_price, p.reference_id, p.is_duplicated FROM tbl_product p LEFT JOIN tbl_category c ON c.category_id = p.category_id LEFT JOIN tbl_product_category pc ON pc.product_category_id = p.product_category_id AND pc.is_deleted = 1 LEFT JOIN tbl_brand b ON b.brand_id = p.brand_id LEFT JOIN tbl_model m ON m.model_id = p.model_id WHERE $where ORDER BY p.product_id DESC $limit_sql");

if (mysqli_num_rows($query) > 0) {

    $result['status'] = '1';
    $result['error']  = '';
    $result['result'] = array();

    // ===== Months elapsed (only if invoice_date given) =====
    $months_elapsed = 0;
    if ($calc_resale) {
        $inv_dt = new DateTime($invoice_date);
        $today  = new DateTime(date('Y-m-d'));
        $diff   = $inv_dt->diff($today);
        $months_elapsed = ($diff->y * 12) + $diff->m;
    }

    while ($row = mysqli_fetch_assoc($query)) {

        $product_id = $row['product_id'];
        $row['wishlist_id'] = '';
        if ($user_id > 0) {
            $dq = mysqli_query($sql, "SELECT `wishlist_id` FROM `tbl_wishlist` WHERE wishlist_pro_id = '$product_id' AND wishlist_customer_id = '$user_id' AND is_deleted='1'");
            if ($d_row = mysqli_fetch_assoc($dq)) {
                $row['wishlist_id'] = $d_row['wishlist_id'];
            }
        }

        /* =========================================================
           VARIANTS
           ---------------------------------------------------------
           - If current product is a variant  (reference_id > 0)
             → group parent = reference_id
           - If current product is a main one (reference_id = 0)
             → group parent = product_id
           - Fetch PARENT + ALL sibling variants in one query so the
             client can see both the main product and every variant.
           ========================================================= */
        $parent_id = ($row['reference_id'] > 0)
            ? intval($row['reference_id'])
            : intval($row['product_id']);

        $variants = [];
        $vq = mysqli_query($sql, "SELECT product_id, product_variant, mrp, retailer_price, product_image, product_images, is_duplicated, reference_id
                                  FROM tbl_product
                                  WHERE (product_id = '$parent_id' OR reference_id = '$parent_id')
                                    AND is_deleted = 1
                                  ORDER BY is_duplicated ASC, product_id ASC");
        if ($vq) {
            while ($v_rows = mysqli_fetch_assoc($vq)) {

                $v_mrp  = floatval($v_rows['mrp']);
                $v_disc = floatval($v_rows['retailer_price']);

                /* % OFF (same formula as your snippet) */
                $v_dis_per = ($v_mrp > 0)
                    ? number_format(100 - ((100 * $v_disc) / $v_mrp), 0)
                    : 0;
                $v_rows['percentage_discount'] = ($v_dis_per > 0) ? $v_dis_per . '% OFF' : '';

                /* Display MRP (blank when no discount) + Offer price */
                if ($v_disc == $v_mrp) {
                    $v_rows['product_mrp'] = '';
                } else {
                    $v_rows['product_mrp'] = '₹' . number_format($v_mrp, 2, '.', '');
                }
                $v_rows['product_discount_amt'] = '₹' . number_format($v_disc, 2, '.', '');

                /* Raw numeric values (useful if client needs to sort/filter) */
                $v_rows['mrp_numeric']            = $v_mrp;
                $v_rows['retailer_price_numeric'] = $v_disc;

                /* Variant image URL (main image; falls back to model image of parent) */
                $v_rows['product_image_url'] = !empty($v_rows['product_image'])
                    ? $server_product_url . $v_rows['product_image']
                    : (!empty($row['model_image']) ? $server_model_url . $row['model_image'] : '');

                /* Resolve gallery URLs */
                $v_gallery = [];
                if (!empty($v_rows['product_images'])) {
                    foreach (explode(',', $v_rows['product_images']) as $vg) {
                        $vg = trim($vg);
                        if ($vg !== '') $v_gallery[] = $server_product_url . $vg;
                    }
                }
                $v_rows['product_images'] = $v_gallery;

                /* Flag telling client which one is the parent */
                $v_rows['is_main'] = ($v_rows['product_id'] == $parent_id) ? 1 : 0;

                $variants[] = $v_rows;
            }
        }
        $row['product_varient'] = $variants;   // keep original key name

        /* =========================================================
           Resale / Buyback calculations (existing logic unchanged)
           ========================================================= */
        $row['retailer_price_monthly'] = $row['retailer_price'] ? strval(round($row['retailer_price'] / 20, 2)) : '';
        $row['pro_name'] = $row['brand_name'] . ' ' . $row['model_name'] . ' ' . $row['product_variant'];
        $row['model_image_url'] = !empty($row['model_image']) ? $server_model_url . $row['model_image'] : '';
        $row['product_images']  = !empty($row['product_images']) ? $server_product_url . $row['product_images'] : '';

        $original_price    = floatval($purchase_price);
        $base_resale_value = round($original_price, 2);
        $final_resale      = "0";
        $package_breakdown = [];

        if ($calc_resale && $months_elapsed <= 24 && count($packages) > 0) {

            foreach ($packages as $pkg) {
                $pkg_id   = $pkg['package_id'];
                $pkg_name = $pkg['package_name'];
                $pkg_pct  = floatval($pkg['package_percentage']);

                $product_id_new = $row['product_id'];
                if ($product_type != 1) {
                    $dq = mysqli_query($sql, "SELECT product_id FROM tbl_product WHERE FIND_IN_SET('" . $row['product_id'] . "', package_product_id) AND brand_id = '$brand_id' AND model_id = '$model_id' ORDER BY product_id DESC LIMIT 1");
                    if ($d_row = mysqli_fetch_assoc($dq)) {
                        $product_id_new = $d_row['product_id'];
                    }
                }
                $launch_date = "";
                $dq = mysqli_query($sql, "SELECT launch_date,monthly_depreciation, post_new_model_depreciation FROM tbl_product_depreciation LEFT JOIN tbl_product ON tbl_product.product_id = tbl_product_depreciation.product_id WHERE FIND_IN_SET('" . $product_id_new . "', tbl_product.product_id) AND package_id='$pkg_id' AND month_number='$duration' ORDER BY depreciation_id DESC LIMIT 1");

                $total_percentage = 0;
                if ($d_row = mysqli_fetch_assoc($dq)) {
                    $total_percentage = floatval($d_row['monthly_depreciation']);
                    $launch_date = $d_row['launch_date'];
                }

                $months_from_launch    = 0;
                if ($calc_resale && !empty($launch_date) && $launch_date !== '0000-00-00') {

                    $launch_raw = trim($launch_date);
                    $launch_dt  = null;

                    // Accept Y-m-d, d/m/Y, d-m-Y - pick whichever round-trips correctly
                    foreach (['Y-m-d', 'd/m/Y', 'd-m-Y'] as $fmt) {
                        $tmp = DateTime::createFromFormat($fmt, $launch_raw);
                        if ($tmp && $tmp->format($fmt) === $launch_raw) {
                            $launch_dt = $tmp;
                            break;
                        }
                    }

                    if ($launch_dt) {
                        $launch_year = intval($launch_dt->format('Y'));

                        // Reject bogus years
                        if ($launch_year >= 2000 && $launch_year <= 2100) {
                            $inv_dt2 = new DateTime($invoice_date);
                            if ($inv_dt2 >= $launch_dt) {
                                $diff_launch        = $launch_dt->diff($inv_dt2);
                                $months_from_launch = ($diff_launch->y * 12) + $diff_launch->m;
                            }
                        }
                    }
                    $months_from_launch += $duration;
                    if ($months_from_launch > 23) {
                        $months_from_launch = 23;
                    }
                }



                $dq = mysqli_query($sql, "SELECT monthly_depreciation, post_new_model_depreciation FROM tbl_product_depreciation LEFT JOIN tbl_product ON tbl_product.product_id = tbl_product_depreciation.product_id WHERE FIND_IN_SET('" . $product_id_new . "', tbl_product.product_id) AND package_id='$pkg_id' AND month_number='$months_from_launch' ORDER BY depreciation_id DESC LIMIT 1");

                if ($d_row = mysqli_fetch_assoc($dq)) {
                    $total_percentage +=  floatval($d_row['post_new_model_depreciation']);
                }

                $dep_amount    = round($original_price * $total_percentage / 100, 2);
                $buyback_amount = max(0, round($base_resale_value - $dep_amount, 2));
                $package_price  = round($base_resale_value * $pkg_pct / 100, 2);

                if ($months_from_launch > 0) {
                    $package_breakdown[] = [
                        'package_id'             => $pkg_id,
                        'package_name'           => $pkg_name,
                        'package_percentage'     => "" . ceil($pkg_pct) . "",
                        'total_depreciation_pct' => "" . ceil($total_percentage) . "",
                        'depreciation_amount'    => "" . ceil($dep_amount) . "",
                        'buyback_amount'         => "" . ceil($buyback_amount) . "",
                        'package_price'          => "" . ceil($package_price) . "",
                        'duration'          => "" . ceil($duration) . "",
                        'months_from_launch'          => "" . ceil($months_from_launch) . "",
                    ];
                }
            }
        }

        $row['invoice_date']       = $invoice_date;
        $row['months_elapsed']     = $months_elapsed;
        $row['purchase_price']     = number_format($original_price, 2, '.', '');
        $row['base_resale_amount'] = number_format($base_resale_value, 2, '.', '');
        $row['packages']           = $package_breakdown;

        $result['result'][] = $row;
    }
} else {
    $result['status'] = '0';
    $result['error']  = '';
    $result['result'] = array();
}

echo json_encode($result);
