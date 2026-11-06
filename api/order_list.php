<?php



header('Content-Type: application/json');
include 'dbconnect.php';

$result = array();

try {

    // ===== READ INPUT (GET or POST) =====
    $from_date       = isset($_REQUEST['from_date'])       ? trim($_REQUEST['from_date'])       : '';
    $to_date         = isset($_REQUEST['to_date'])         ? trim($_REQUEST['to_date'])         : '';
    $filter_user     = isset($_REQUEST['filter_user'])     ? intval($_REQUEST['filter_user'])   : 0;
    $created_by_user_id = isset($_REQUEST['created_by_user_id']) ? intval($_REQUEST['created_by_user_id']) : 0;
    $kavach_order_id = isset($_REQUEST['kavach_order_id']) ? intval($_REQUEST['kavach_order_id']) : 0;
    $limit           = isset($_REQUEST['limit'])           ? intval($_REQUEST['limit'])         : 100;
    $offset          = isset($_REQUEST['offset'])          ? intval($_REQUEST['offset'])        : 0;
    $order_type          = isset($_REQUEST['order_type'])          ? intval($_REQUEST['order_type']) : '';


    if ($limit <= 0 || $limit > 1000) $limit = 100;
    if ($offset < 0) $offset = 0;

    $main_table = 'tbl_order';
    $pk_col     = 'kavach_order_id';

    // ===== BUILD WHERE CLAUSE =====
    $where = " WHERE $main_table.is_deleted = 1 ";

    if ($from_date != '' && $to_date != '') {
        $from_esc = mysqli_real_escape_string($sql, $from_date);
        $to_esc   = mysqli_real_escape_string($sql, $to_date);
        $where .= " AND DATE($main_table.c_date) BETWEEN '$from_esc' AND '$to_esc' ";
    } elseif ($from_date != '') {
        $from_esc = mysqli_real_escape_string($sql, $from_date);
        $where .= " AND DATE($main_table.c_date) >= '$from_esc' ";
    } elseif ($to_date != '') {
        $to_esc = mysqli_real_escape_string($sql, $to_date);
        $where .= " AND DATE($main_table.c_date) <= '$to_esc' ";
    }

    if ($filter_user > 0) {
        $where .= " AND $main_table.kavach_customer_id = '$filter_user' ";
        // My Orders shows the customer's own purchases. Staff-created orders
        // are listed separately by created_by_user_id in Store Orders.
        if ($created_by_user_id <= 0) {
            $where .= " AND ($main_table.created_by_user_id IS NULL OR $main_table.created_by_user_id = 0) ";
        }
    }

    if ($created_by_user_id > 0) {
        $where .= " AND $main_table.created_by_user_id = '$created_by_user_id' ";
    }

    if ($kavach_order_id > 0) {
        $where .= " AND $main_table.kavach_order_id = '$kavach_order_id' ";
    }

    if ($order_type > 0) {
        $where .= " AND $main_table.order_type = '$order_type' ";
    }

    // ===== MAIN QUERY =====
      $str_query = "SELECT 
                    $main_table.kavach_order_id,
                    $main_table.kavach_customer_id,
                    $main_table.created_by_user_id,
                    creator.customer_name AS created_by_user_name,
                    $main_table.product_id,
                    $main_table.brand_id,
                    $main_table.model_id,
                    $main_table.category_id,
                    $main_table.package_id,
                    $main_table.package_name,
                    $main_table.package_percentage,
                    $main_table.package_price,
                    $main_table.purchase_price,
                    $main_table.buyback_amount,
                    $main_table.duration,
                    $main_table.invoice_date,
                    $main_table.start_date,
                    $main_table.order_status,
                    $main_table.c_date,
                    order_type,
                    $main_table.kavach_razorpayOrderId,
                    $main_table.depreciation_json,
                    $main_table.kavach_payable,
                    $main_table.kavach_discount,
                    $main_table.kavach_delivery_charges,
                    $main_table.kavach_razorpay_status,
                    $main_table.kavach_razorpay_payment_id,
                    tbl_customer.customer_name,
                    tbl_customer.customer_mobile,
                    tbl_customer.customer_email,
                    tbl_product.product_variant,
                    tbl_brand.brand_name,
                    tbl_model.model_name,
                    tbl_package.package_image,
                    tbl_model.model_image,
                    tbl_category.category_name
                  FROM `$main_table` 
                  LEFT JOIN tbl_customer ON $main_table.kavach_customer_id = tbl_customer.customer_id
                  LEFT JOIN tbl_customer AS creator ON $main_table.created_by_user_id = creator.customer_id
                  LEFT JOIN tbl_brand    ON tbl_brand.brand_id       = $main_table.brand_id
                  LEFT JOIN tbl_package    ON tbl_package.package_id       = $main_table.package_id
                  LEFT JOIN tbl_category ON tbl_category.category_id = $main_table.category_id
                  LEFT JOIN tbl_model    ON tbl_model.model_id       = $main_table.model_id
                  LEFT JOIN tbl_product  ON tbl_product.product_id   = $main_table.product_id
                  $where
                  ORDER BY $main_table.$pk_col DESC
                 ";

    $query = mysqli_query($sql, $str_query);

    if (!$query) {
        throw new Exception('SQL Error: ' . mysqli_error($sql));
    }

    // ===== FETCH ROWS =====
    $rows = array();

    while ($row = mysqli_fetch_assoc($query)) {

        // ===== Format order status =====
        $o_status      = intval($row['order_status'] ?? 0);
        $o_status_text = 'Cancelled';
        if ($o_status == 1)      $o_status_text = 'Active';
        elseif ($o_status == 2)  $o_status_text = 'Paid';

        // ===== Decode depreciation JSON =====
        $dep_arr = array();
        if (!empty($row['depreciation_json'])) {
            $tmp = json_decode($row['depreciation_json'], true);
            if (is_array($tmp)) $dep_arr = $tmp;
        }

        $row['model_image_url'] = !empty($row['model_image']) ? $server_model_url . $row['model_image'] : '';

        // Return the product rows belonging to this master order for the order list.
        $orderId = (int)$row['kavach_order_id'];
        $productsQuery = mysqli_query($sql, "SELECT d.product_id, d.purchase_price, d.package_id, d.package_name, d.package_price, d.buyback_amount, d.duration, d.invoice_date, d.invoice_number, d.depreciation_json,
                    p.product_variant, p.product_image, p.product_images, b.brand_name, m.model_name, c.category_name, m.model_image
                    FROM tbl_order_detail d
                    LEFT JOIN tbl_product p ON p.product_id = d.product_id
                    LEFT JOIN tbl_brand b ON b.brand_id = d.brand_id
                    LEFT JOIN tbl_model m ON m.model_id = d.model_id
                    LEFT JOIN tbl_category c ON c.category_id = d.category_id
                    WHERE d.kavach_order_id = '$orderId' AND d.is_deleted = 1
                    ORDER BY d.kavach_order_detail_id ASC");
        if (!$productsQuery) throw new Exception('Could not load order products: ' . mysqli_error($sql));
        $productRows = array();
        while ($product = mysqli_fetch_assoc($productsQuery)) {
            $productDepreciation = json_decode((string)($product['depreciation_json'] ?? ''), true);
            $product['depreciation_json'] = is_array($productDepreciation) ? $productDepreciation : array();
            $productImage = trim((string)($product['product_image'] ?? ''));
            $modelImage = trim((string)($product['model_image'] ?? ''));
            $product['product_image_url'] = $productImage !== ''
                ? (preg_match('/^(https?:)?\\/\\//i', $productImage) ? $productImage : $server_product_url . rawurlencode(basename($productImage)))
                : ($modelImage !== '' ? $server_model_url . rawurlencode(basename($modelImage)) : '');
            $product['product_images_url'] = $product['product_image_url'];
            $productRows[] = $product;
        }

        // Older single-item orders may not have detail rows; use the master row as a fallback.
        if (count($productRows) === 0 && !empty($row['product_id'])) {
            $productRows[] = array(
                'product_id' => (string)$row['product_id'],
                'product_variant' => $row['product_variant'] ?? '',
                'brand_name' => $row['brand_name'] ?? '',
                'model_name' => $row['model_name'] ?? '',
                'category_name' => $row['category_name'] ?? '',
                'purchase_price' => $row['purchase_price'] ?? '',
                'product_image_url' => $row['model_image_url'] ?? '',
                'package_id' => $row['package_id'] ?? '0',
                'package_name' => $row['package_name'] ?? '',
                'package_price' => $row['package_price'] ?? '',
                'buyback_amount' => $row['buyback_amount'] ?? '',
                'duration' => $row['duration'] ?? '',
            );
        }

        $productTotal = (float)($row['purchase_price'] ?? 0);
        $packageTotal = (float)($row['package_price'] ?? 0);
        $discountTotal = (float)($row['kavach_discount'] ?? 0);
        $deliveryTotal = (float)($row['kavach_delivery_charges'] ?? 0);
        $storedPayable = (float)($row['kavach_payable'] ?? 0);
        $payableTotal = $storedPayable > 0 ? $storedPayable : max(0, $productTotal + $packageTotal + $deliveryTotal - $discountTotal);


        $row_out = array(
            'kavach_order_id'        => (string)$row['kavach_order_id'],
            'kavach_customer_id'     => (string)$row['kavach_customer_id'],
            'created_by_user_id'     => (string)($row['created_by_user_id'] ?? ''),
            'created_by_user_name'   => (string)($row['created_by_user_name'] ?? ''),
            'customer_name'          => $row['customer_name'] ?? '',
            'customer_mobile'        => $row['customer_mobile'] ?? '',
            'customer_email'         => $row['customer_email'] ?? '',
            'image'         => $productRows[0]['product_image_url'] ?? ($row['model_image_url'] ?? ''),

            'product_id'             => (string)$row['product_id'],
            'brand_id'               => (string)$row['brand_id'],
            'model_id'               => (string)$row['model_id'],
            'category_id'            => (string)$row['category_id'],
            'brand_name'             => $row['brand_name'] ?? '',
            'model_name'             => $row['model_name'] ?? '',
            'category_name'          => $row['category_name'] ?? '',
            'product_variant'        => $row['product_variant'] ?? '',

            'package_id'             => (string)$row['package_id'],
            'package_name'           => $row['package_name'] ?? '',
            'package_percentage'     => (string)$row['package_percentage'],
            'package_price'          => (string)$row['package_price'],

            'purchase_price'         => (string)$row['purchase_price'],
            'buyback_amount'         => (string)$row['buyback_amount'],

            'duration'               => (string)$row['duration'],
            'invoice_date'           => $row['invoice_date'] ?? '',
            'start_date'             => $row['start_date'] ?? '',
            'purchase_date'          => $row['c_date'] ?? '',

            'order_status'           => (string)$o_status,
            'order_status_text'      => $o_status_text,

            'kavach_razorpayOrderId' => $row['kavach_razorpayOrderId'] ?? '',
            'depreciation_json'      => $dep_arr,
            'kavach_payable'         => (string)($row['kavach_payable'] ?? ''),
            'payable_amount'         => number_format($payableTotal, 2, '.', ''),
            'total_base_price'       => number_format($productTotal + $packageTotal + $deliveryTotal, 2, '.', ''),
            'total_discount_price'   => number_format($discountTotal, 2, '.', ''),
            'kavach_discount'        => (string)($row['kavach_discount'] ?? ''),
            'kavach_delivery_charges' => (string)($row['kavach_delivery_charges'] ?? ''),
            'kavach_razorpay_status' => (string)($row['kavach_razorpay_status'] ?? ''),
            'kavach_razorpay_payment_id' => (string)($row['kavach_razorpay_payment_id'] ?? ''),
            'products'               => $productRows,
            'product_count'          => count($productRows),
        );

        $rows[] = $row_out;
    }

    // ===== TOTAL COUNT =====
    $count_sql = "SELECT COUNT(*) AS total 
                  FROM `$main_table` 
                  LEFT JOIN tbl_customer ON $main_table.kavach_customer_id = tbl_customer.customer_id
                  $where";
    $count_res = mysqli_query($sql, $count_sql);
    $total     = 0;
    if ($count_res && $count_row = mysqli_fetch_assoc($count_res)) {
        $total = intval($count_row['total']);
    }

    // ===== RESPONSE =====
    $result['status'] = '1';
    $result['error']  = '';
    $result['total']  = (string)$total;
    $result['limit']  = (string)$limit;
    $result['offset'] = (string)$offset;
    $result['result'] = $rows;

    echo json_encode($result);

} catch (Exception $e) {
    $result['status'] = '0';
    $result['error']  = $e->getMessage();
    $result['result'] = array();
    echo json_encode($result);
}
?>
