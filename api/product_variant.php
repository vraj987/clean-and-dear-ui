<?php
// Return subscription product variants for one selected brand and model.
include 'dbconnect.php';

header('Content-Type: application/json');

$brand_id = isset($_REQUEST['brand_id']) ? intval($_REQUEST['brand_id']) : 0;
$model_id = isset($_REQUEST['model_id']) ? intval($_REQUEST['model_id']) : 0;

if ($brand_id <= 0 || $model_id <= 0) {
    echo json_encode(array(
        'status' => '0',
        'error' => 'brand_id and model_id are required',
        'result' => array()
    ));
    exit;
}

/* =========================================================
   STEP 1 — Collect all package_product_id values into an array,
            then convert to a comma-separated string.
   ========================================================= */
$proArr = array();

$query_pro = mysqli_query(
    $sql,
    "SELECT package_product_id
     FROM `tbl_product`
     WHERE is_deleted = 1
       AND brand_id = '$brand_id'
       AND model_id = '$model_id'
       AND package_product_id IS NOT NULL
       AND package_product_id != ''
     ORDER BY product_id ASC"
);

if (!$query_pro) {
    echo json_encode(array(
        'status' => '0',
        'error' => 'Unable to load phone variants',
        'result' => array()
    ));
    exit;
}

while ($proRow = mysqli_fetch_assoc($query_pro)) {
    /* package_product_id may be "12,13,14" or "12" — split safely */
    $ids = explode(',', (string)$proRow['package_product_id']);
    foreach ($ids as $id) {
        $id = intval(trim($id));
        if ($id > 0) {
            $proArr[] = $id;
        }
    }
}

$proArr = array_values(array_unique($proArr));
$pro    = implode(',', $proArr);

/* If no IDs found, return an empty result — do NOT build "IN()" */
if ($pro === '') {
    echo json_encode(array(
        'status' => '1',
        'error'  => '',
        'result' => array()
    ));
    exit;
}

/* =========================================================
   STEP 2 — Main product query using the comma-separated $pro
   ========================================================= */
$query = mysqli_query(
    $sql,
    "SELECT p.product_id, p.product_type, p.brand_id, p.model_id, p.product_variant,
            p.short_description, p.long_description, p.launch_date, p.original_price,
            p.product_image, p.product_images, p.mrp, p.retailer_price,
            b.brand_name, m.model_name, m.model_image, c.category_name
     FROM tbl_product p
     LEFT JOIN tbl_brand b   ON b.brand_id    = p.brand_id
     LEFT JOIN tbl_model m   ON m.model_id    = p.model_id
     LEFT JOIN tbl_category c ON c.category_id = p.category_id
     WHERE p.is_deleted = 1
       AND p.brand_id = '$brand_id'
       AND p.model_id = '$model_id'
       AND p.product_variant IS NOT NULL
       AND p.product_variant != ''
       AND p.product_id IN ($pro)
     ORDER BY p.product_id ASC"
);

if (!$query) {
    echo json_encode(array(
        'status' => '0',
        'error' => 'Unable to load phone variants',
        'result' => array()
    ));
    exit;
}

/* =========================================================
   STEP 3 — Build response rows
   ========================================================= */
$rows = array();
while ($row = mysqli_fetch_assoc($query)) {
    $row['product_id'] = (string)$row['product_id'];
    $row['brand_id']   = (string)$row['brand_id'];
    $row['model_id']   = (string)$row['model_id'];
    $row['wishlist_id'] = '';

    $row['retailer_price_monthly'] = !empty($row['retailer_price'])
        ? (string)round(floatval($row['retailer_price']) / 20, 2)
        : '';

    $row['pro_name'] = trim(
        $row['brand_name'] . ' ' . $row['model_name'] . ' ' . $row['product_variant']
    );

    $row['model_image_url'] = !empty($row['model_image'])
        ? $server_model_url . $row['model_image']
        : '';

    $row['product_image_url'] = !empty($row['product_image'])
        ? $server_product_url . $row['product_image']
        : '';

    $row['product_images_url'] = !empty($row['product_images'])
        ? $server_product_url . $row['product_images']
        : '';

    $rows[] = $row;
}

echo json_encode(array(
    'status' => '1',
    'error'  => '',
    'result' => $rows
));
