<?php
/* ============================================================
   MOBILE PRODUCT API  (with Vendor ID)
   Endpoints (via POST):
     action=add         → Add new product
     action=update      → Update existing product
     action=list        → List all products
     action=view        → View single product
     action=delete      → Soft delete product
     action=duplicate   → Get data ready for duplicate

   Request format: multipart/form-data
   Response format: { "status": "...", "error": "...", "result": [] }

   NOTE: The database stores ONLY the filename (e.g. main-120924120000-1234.jpg).
         Physical files are saved in $product_image_upload.
         Clients must prepend the upload base URL when displaying images.
   ============================================================ */

include 'dbconnect.php';

header('Content-Type: application/json');

/* ---------- ACTION ---------- */
$action = isset($_POST['action']) ? mysqli_real_escape_string($sql, $_POST['action']) : '';

/* ============================================================
   HELPER — Normalize kept_images input
   Accepts: string | array | nested array | comma-separated
   Returns: flat array of trimmed non-empty filenames
   ============================================================ */
function normalize_kept_images($raw)
{
    $out = array();
    if (empty($raw)) return $out;

    if (!is_array($raw)) $raw = array($raw);

    foreach ($raw as $item) {
        if (is_array($item)) {
            foreach ($item as $inner) {
                if (!is_array($inner)) {
                    $inner = trim((string)$inner);
                    if ($inner !== '') $out[] = $inner;
                }
            }
        } else {
            /* Support comma-separated values inside a single field */
            $parts = explode(',', (string)$item);
            foreach ($parts as $p) {
                $p = trim($p);
                if ($p !== '') $out[] = $p;
            }
        }
    }
    return array_values(array_unique($out));
}

/* ============================================================
   HELPER — Safely collect uploaded gallery files
   Returns: array of filenames successfully moved to disk
   ============================================================ */
function upload_gallery_files($filesKey, $uploadDir, $prefix = 'gal')
{
    $saved = array();

    if (empty($_FILES[$filesKey]['name'])) return $saved;

    /* If not array → wrap into array (single-file upload safety) */
    if (!is_array($_FILES[$filesKey]['name'])) {
        $_FILES[$filesKey]['name']     = array($_FILES[$filesKey]['name']);
        $_FILES[$filesKey]['tmp_name'] = array($_FILES[$filesKey]['tmp_name']);
        $_FILES[$filesKey]['error']    = array($_FILES[$filesKey]['error']);
        $_FILES[$filesKey]['size']     = array($_FILES[$filesKey]['size']);
        $_FILES[$filesKey]['type']     = array($_FILES[$filesKey]['type']);
    }

    if (!is_dir($uploadDir)) @mkdir($uploadDir, 0777, true);

    foreach ($_FILES[$filesKey]['name'] as $k => $name) {
        if (empty($name)) continue;
        if (!isset($_FILES[$filesKey]['tmp_name'][$k])) continue;
        if ((int)$_FILES[$filesKey]['error'][$k] !== UPLOAD_ERR_OK) continue;

        $ext       = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        $allowed   = array('jpg', 'jpeg', 'png', 'gif', 'webp');
        if (!in_array($ext, $allowed)) continue;

        $random    = mt_rand(1000, 9999);
        $filename  = $prefix . "-" . date("dmyhis") . "-" . $random . "." . $ext;
        $target    = rtrim($uploadDir, '/\\') . DIRECTORY_SEPARATOR . $filename;

        if (move_uploaded_file($_FILES[$filesKey]['tmp_name'][$k], $target)) {
            $saved[] = $filename;
        }
    }

    return $saved;
}

/* ============================================================
   HELPER — Safely upload a single main image
   Returns: filename or "" on failure
   ============================================================ */
function upload_main_file($filesKey, $uploadDir, $prefix = 'main')
{
    if (empty($_FILES[$filesKey]['name'])) return "";

    /* Handle case where client sent an array for a single-image field */
    $name = $_FILES[$filesKey]['name'];
    if (is_array($name)) $name = reset($name);

    if (empty($name)) return "";

    $ext     = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    $allowed = array('jpg', 'jpeg', 'png', 'gif', 'webp');
    if (!in_array($ext, $allowed)) return "";

    $tmp = $_FILES[$filesKey]['tmp_name'];
    if (is_array($tmp)) $tmp = reset($tmp);

    $err = $_FILES[$filesKey]['error'];
    if (is_array($err)) $err = reset($err);
    if ((int)$err !== UPLOAD_ERR_OK) return "";

    if (!is_dir($uploadDir)) @mkdir($uploadDir, 0777, true);

    $random   = mt_rand(1000, 9999);
    $filename = $prefix . "-" . date("dmyhis") . "-" . $random . "." . $ext;
    $target   = rtrim($uploadDir, '/\\') . DIRECTORY_SEPARATOR . $filename;

    if (move_uploaded_file($tmp, $target)) return $filename;

    return "";
}

/* ============================================================
   ADD PRODUCT
   ============================================================ */
if ($action == 'add') {

    /* ---------- READ INPUTS ---------- */
    $customer_id       = isset($_POST['customer_id'])       ? mysqli_real_escape_string($sql, $_POST['customer_id'])       : '';
    $category_id       = isset($_POST['category_id'])       ? mysqli_real_escape_string($sql, $_POST['category_id'])       : '';
    $brand_id          = isset($_POST['brand_id'])          ? mysqli_real_escape_string($sql, $_POST['brand_id'])          : '';
    $model_id          = isset($_POST['model_id'])          ? mysqli_real_escape_string($sql, $_POST['model_id'])          : '';
    $product_variant   = isset($_POST['product_variant'])   ? mysqli_real_escape_string($sql, $_POST['product_variant'])   : '';
    $short_description = isset($_POST['short_description']) ? mysqli_real_escape_string($sql, $_POST['short_description']) : '';
    $long_description  = isset($_POST['long_description'])  ? mysqli_real_escape_string($sql, $_POST['long_description'])  : '';
    $cgst              = isset($_POST['cgst'])              ? mysqli_real_escape_string($sql, $_POST['cgst'])              : '0';
    $sgst              = isset($_POST['sgst'])              ? mysqli_real_escape_string($sql, $_POST['sgst'])              : '0';
    $is_exclusive_tax  = isset($_POST['is_exclusive_tax'])  ? mysqli_real_escape_string($sql, $_POST['is_exclusive_tax'])  : '0';
    $posted_base       = isset($_POST['base_price'])        ? mysqli_real_escape_string($sql, $_POST['base_price'])        : '0';
    $mrp               = isset($_POST['mrp'])               ? mysqli_real_escape_string($sql, $_POST['mrp'])               : '0';
    $retailer_price    = isset($_POST['retailer_price'])    ? mysqli_real_escape_string($sql, $_POST['retailer_price'])    : '0';
    $vendor_offer      = isset($_POST['vendor_offer'])      ? mysqli_real_escape_string($sql, $_POST['vendor_offer'])      : '0';
    $hsn_code          = isset($_POST['hsn_code'])          ? mysqli_real_escape_string($sql, $_POST['hsn_code'])          : '';
    $product_sku       = isset($_POST['product_sku'])       ? mysqli_real_escape_string($sql, $_POST['product_sku'])       : '';
    $priority          = isset($_POST['priority'])          ? mysqli_real_escape_string($sql, $_POST['priority'])          : '0';
    $status            = isset($_POST['status'])            ? mysqli_real_escape_string($sql, $_POST['status'])            : '1';
    $reference_id      = isset($_POST['reference_id'])      ? mysqli_real_escape_string($sql, $_POST['reference_id'])      : '0';

    /* ---------- VALIDATION ---------- */
    if (empty($customer_id)) {
        $result['status'] = '0';
        $result['error']  = 'customer_id is required';
        $result['result'] = array();
        echo json_encode($result);
        exit;
    }
    if (
        empty($category_id) ||
        empty($brand_id)    ||
        empty($model_id)    ||
        empty($product_variant) ||
        empty($short_description) ||
        empty($long_description)
    ) {
        $result['status'] = '0';
        $result['error']  = 'Required data missing';
        $result['result'] = array();
        echo json_encode($result);
        exit;
    }

    /* ---------- BASE PRICE AUTO-CALC ---------- */
    if ($is_exclusive_tax == '1') {
        $total_tax_pct = floatval($cgst) + floatval($sgst);
        if ($total_tax_pct > 0) {
            $base_price = round(floatval($mrp) / (1 + ($total_tax_pct / 100)), 2);
        } else {
            $base_price = round(floatval($mrp), 2);
        }
    } else {
        $base_price = floatval($posted_base);
    }

    /* ---------- MAIN IMAGE UPLOAD ---------- */
    $product_image = upload_main_file('product_image', $product_image_upload, 'main');

    /* ---------- KEPT GALLERY IMAGES (from form / duplicate flow) ---------- */
    $keptArr = normalize_kept_images(isset($_POST['kept_images']) ? $_POST['kept_images'] : null);

    /* ---------- NEW GALLERY UPLOADS ---------- */
    $newGallery = upload_gallery_files('product_images', $product_image_upload, 'gal');
    foreach ($newGallery as $g) $keptArr[] = $g;

    /* Keep order unique */
    $keptArr = array_values(array_unique($keptArr));

    $product_images = implode(",", $keptArr);

    /* ---------- INSERT ---------- */
    $is_duplicated = ($reference_id > 0) ? 1 : 0;

    $insert_product = "INSERT INTO tbl_product(
                        customer_id,
                        product_type,
                        reference_id,
                        is_duplicated,
                        category_id,
                        brand_id,
                        model_id,
                        product_variant,
                        short_description,
                        long_description,
                        product_image,
                        product_images,
                        cgst,
                        sgst,
                        is_exclusive_tax,
                        base_price,
                        mrp,
                        retailer_price,
                        vendor_offer,
                        hsn_code,
                        product_sku,
                        priority,
                        status,
                        is_deleted,
                        c_date
                      ) VALUES(
                        '$customer_id',
                        '3',
                        '$reference_id',
                        '$is_duplicated',
                        '$category_id',
                        '$brand_id',
                        '$model_id',
                        '$product_variant',
                        '$short_description',
                        '$long_description',
                        '$product_image',
                        '$product_images',
                        '$cgst',
                        '$sgst',
                        '$is_exclusive_tax',
                        '$base_price',
                        '$mrp',
                        '$retailer_price',
                        '$vendor_offer',
                        '$hsn_code',
                        '$product_sku',
                        '$priority',
                        '$status',
                        1,
                        '$c_date'
                      )";

    $query_str_product = mysqli_query($sql, $insert_product);
    $last_id = $sql->insert_id;

    if ($query_str_product) {
        $result['status'] = '1';
        $result['error']  = 'Add Product Successfully';
        $result['result'][] = array(
            'product_id'     => $last_id,
            'product_image'  => $product_image,
            'product_images' => $keptArr,
            'vendor_offer'   => $vendor_offer
        );
    } else {
        $result['status'] = '0';
        $result['error']  = 'Please try again sometime.';
        $result['result'] = array();
    }

    echo json_encode($result);
    exit;
}

/* ============================================================
   UPDATE PRODUCT
   ============================================================ */
if ($action == 'update') {

    $id                = isset($_POST['id'])                ? mysqli_real_escape_string($sql, $_POST['id'])                : '';
    $customer_id       = isset($_POST['customer_id'])       ? mysqli_real_escape_string($sql, $_POST['customer_id'])       : '';
    $category_id       = isset($_POST['category_id'])       ? mysqli_real_escape_string($sql, $_POST['category_id'])       : '';
    $brand_id          = isset($_POST['brand_id'])          ? mysqli_real_escape_string($sql, $_POST['brand_id'])          : '';
    $model_id          = isset($_POST['model_id'])          ? mysqli_real_escape_string($sql, $_POST['model_id'])          : '';
    $product_variant   = isset($_POST['product_variant'])   ? mysqli_real_escape_string($sql, $_POST['product_variant'])   : '';
    $short_description = isset($_POST['short_description']) ? mysqli_real_escape_string($sql, $_POST['short_description']) : '';
    $long_description  = isset($_POST['long_description'])  ? mysqli_real_escape_string($sql, $_POST['long_description'])  : '';
    $cgst              = isset($_POST['cgst'])              ? mysqli_real_escape_string($sql, $_POST['cgst'])              : '0';
    $sgst              = isset($_POST['sgst'])              ? mysqli_real_escape_string($sql, $_POST['sgst'])              : '0';
    $is_exclusive_tax  = isset($_POST['is_exclusive_tax'])  ? mysqli_real_escape_string($sql, $_POST['is_exclusive_tax'])  : '0';
    $posted_base       = isset($_POST['base_price'])        ? mysqli_real_escape_string($sql, $_POST['base_price'])        : '0';
    $mrp               = isset($_POST['mrp'])               ? mysqli_real_escape_string($sql, $_POST['mrp'])               : '0';
    $retailer_price    = isset($_POST['retailer_price'])    ? mysqli_real_escape_string($sql, $_POST['retailer_price'])    : '0';
    $vendor_offer      = isset($_POST['vendor_offer'])      ? mysqli_real_escape_string($sql, $_POST['vendor_offer'])      : '0';
    $hsn_code          = isset($_POST['hsn_code'])          ? mysqli_real_escape_string($sql, $_POST['hsn_code'])          : '';
    $product_sku       = isset($_POST['product_sku'])       ? mysqli_real_escape_string($sql, $_POST['product_sku'])       : '';
    $priority          = isset($_POST['priority'])          ? mysqli_real_escape_string($sql, $_POST['priority'])          : '0';
    $status            = isset($_POST['status'])            ? mysqli_real_escape_string($sql, $_POST['status'])            : '1';

    if (empty($id)) {
        $result['status'] = '0';
        $result['error']  = 'id is required';
        $result['result'] = array();
        echo json_encode($result);
        exit;
    }

    /* Base Price recalc */
    if ($is_exclusive_tax == '1') {
        $total_tax_pct = floatval($cgst) + floatval($sgst);
        $base_price = ($total_tax_pct > 0)
            ? round(floatval($mrp) / (1 + ($total_tax_pct / 100)), 2)
            : round(floatval($mrp), 2);
    } else {
        $base_price = floatval($posted_base);
    }

    /* Fetch current main + gallery */
    $current_q = mysqli_query($sql, "SELECT product_image, product_images FROM tbl_product 
                                     WHERE product_id='$id' AND is_deleted=1 AND product_type=3");
    $current   = mysqli_fetch_assoc($current_q);
    $current_main = isset($current['product_image']) ? $current['product_image'] : '';

    /* Replace main image if new uploaded */
    $newMain = upload_main_file('product_image', $product_image_upload, 'main');
    if (!empty($newMain)) {
        $current_main = $newMain;
    }

    /* Kept gallery images (normalized) */
    $keptArr = normalize_kept_images(isset($_POST['kept_images']) ? $_POST['kept_images'] : null);

    /* Add new gallery uploads */
    $newGallery = upload_gallery_files('product_images', $product_image_upload, 'gal');
    foreach ($newGallery as $g) $keptArr[] = $g;

    $keptArr = array_values(array_unique($keptArr));

    $gallery_str = implode(",", $keptArr);

    /* Build customer_id update clause (only if customer_id sent) */
    $customer_sql = "";
    if (!empty($customer_id)) {
        $customer_sql = "customer_id = '$customer_id',";
    }

    /* Update */
    $update_product = "UPDATE tbl_product SET 
                        $customer_sql
                        category_id       = '$category_id',
                        brand_id          = '$brand_id',
                        model_id          = '$model_id',
                        product_variant   = '$product_variant',
                        short_description = '$short_description',
                        long_description  = '$long_description',
                        product_image     = '$current_main',
                        product_images    = '$gallery_str',
                        cgst              = '$cgst',
                        sgst              = '$sgst',
                        is_exclusive_tax  = '$is_exclusive_tax',
                        base_price        = '$base_price',
                        mrp               = '$mrp',
                        retailer_price    = '$retailer_price',
                        vendor_offer      = '$vendor_offer',
                        hsn_code          = '$hsn_code',
                        product_sku       = '$product_sku',
                        priority          = '$priority',
                        status            = '$status'
                       WHERE product_id='$id' AND is_deleted=1 AND product_type=3";

    $query_str_product = mysqli_query($sql, $update_product);

    if ($query_str_product) {
        $result['status'] = '1';
        $result['error']  = 'Update Product Successfully';
        $result['result'][] = array(
            'product_id'     => (int)$id,
            'product_image'  => $current_main,
            'product_images' => $keptArr,
            'vendor_offer'   => $vendor_offer
        );
    } else {
        $result['status'] = '0';
        $result['error']  = 'Please try again sometime.';
        $result['result'] = array();
    }

    echo json_encode($result);
    exit;
}

/* ============================================================
   LIST PRODUCTS
   ============================================================ */
if ($action == 'list' || $action == '') {

    $str_query = "";

    $customer_id = isset($_POST['customer_id']) ? mysqli_real_escape_string($sql, $_POST['customer_id']) : '';
    $category_id = isset($_POST['category_id']) ? mysqli_real_escape_string($sql, $_POST['category_id']) : '';
    $brand_id    = isset($_POST['brand_id'])    ? mysqli_real_escape_string($sql, $_POST['brand_id'])    : '';
    $model_id    = isset($_POST['model_id'])    ? mysqli_real_escape_string($sql, $_POST['model_id'])    : '';
    $status      = isset($_POST['status'])      ? mysqli_real_escape_string($sql, $_POST['status'])      : '';
    $search      = isset($_POST['search'])      ? mysqli_real_escape_string($sql, $_POST['search'])      : '';

    if (!empty($customer_id)) $str_query .= " AND p.customer_id = '$customer_id' ";
    if (!empty($category_id)) $str_query .= " AND p.category_id = '$category_id' ";
    if (!empty($brand_id))    $str_query .= " AND p.brand_id    = '$brand_id' ";
    if (!empty($model_id))    $str_query .= " AND p.model_id    = '$model_id' ";
    if ($status !== '')       $str_query .= " AND p.status      = '$status' ";
    if (!empty($search))      $str_query .= " AND (p.product_variant LIKE '%$search%' OR p.product_sku LIKE '%$search%') ";

    $query = mysqli_query($sql, "SELECT p.*, 
                                        c.category_name,
                                        b.brand_name,
                                        m.model_name,
                                        v.customer_name,
                                        v.customer_mobile
                                 FROM tbl_product p
                                 LEFT JOIN tbl_category c ON c.category_id = p.category_id
                                 LEFT JOIN tbl_brand    b ON b.brand_id    = p.brand_id
                                 LEFT JOIN tbl_model    m ON m.model_id    = p.model_id
                                 LEFT JOIN tbl_customer v ON v.customer_id = p.customer_id
                                 WHERE p.is_deleted = 1 
                                   AND p.product_type = 3
                                 " . $str_query . "
                                 ORDER BY p.priority DESC, p.product_id DESC");

    if (mysqli_num_rows($query) > 0) {
        $result['status'] = '1';
        $result['error']  = '';
        $result['result'] = array();
        while ($row = mysqli_fetch_assoc($query)) {

            /* Main image → full URL only */
            if (!empty($row['product_image'])) {
                $row['product_image'] = $server_product_url . $row['product_image'];
            }

            /* Gallery → array of full URLs only */
            $row['product_images'] = array();
            if (!empty($row['product_images'])) {
                $files = array_filter(array_map('trim', explode(',', $row['product_images'])));
                foreach ($files as $img) {
                    $row['product_images'][] = $server_product_url . $img;
                }
            }

            /* vendor_offer safety default */
            if (!isset($row['vendor_offer'])) $row['vendor_offer'] = '0';

            $result['result'][] = $row;
        }
    } else {
        $result['status'] = '0';
        $result['error']  = 'No record found';
        $result['result'] = array();
    }

    echo json_encode($result);
    exit;
}

/* ============================================================
   VIEW SINGLE PRODUCT
   ============================================================ */
if ($action == 'view') {

    $id = isset($_POST['id']) ? mysqli_real_escape_string($sql, $_POST['id']) : '';

    if (empty($id)) {
        $result['status'] = '0';
        $result['error']  = 'id is required';
        $result['result'] = array();
        echo json_encode($result);
        exit;
    }

    $query = mysqli_query($sql, "SELECT p.*, 
                                        c.category_name,
                                        b.brand_name,
                                        m.model_name,
                                        v.customer_name,
                                        v.customer_mobile
                                 FROM tbl_product p
                                 LEFT JOIN tbl_category c ON c.category_id = p.category_id
                                 LEFT JOIN tbl_brand    b ON b.brand_id    = p.brand_id
                                 LEFT JOIN tbl_model    m ON m.model_id    = p.model_id
                                 LEFT JOIN tbl_customer v ON v.customer_id = p.customer_id
                                 WHERE p.product_id = '$id' 
                                   AND p.is_deleted = 1 
                                   AND p.product_type = 3");

    if (mysqli_num_rows($query) > 0) {
        $result['status'] = '1';
        $result['error']  = '';
        $result['result'] = array();
        while ($row = mysqli_fetch_assoc($query)) {

            /* Main image → full URL only */
            if (!empty($row['product_image'])) {
                $row['product_image'] = $server_product_url . $row['product_image'];
            }

            /* Gallery → array of full URLs only */
            $row['product_images'] = array();
            if (!empty($row['product_images'])) {
                $files = array_filter(array_map('trim', explode(',', $row['product_images'])));
                foreach ($files as $img) {
                    $row['product_images'][] = $server_product_url . $img;
                }
            }

            /* vendor_offer safety default */
            if (!isset($row['vendor_offer'])) $row['vendor_offer'] = '0';

            $result['result'][] = $row;
        }
    } else {
        $result['status'] = '0';
        $result['error']  = 'No record found';
        $result['result'] = array();
    }

    echo json_encode($result);
    exit;
}

/* ============================================================
   DUPLICATE — Load data for edit form
   ============================================================ */
if ($action == 'duplicate') {

    $id = isset($_POST['id']) ? mysqli_real_escape_string($sql, $_POST['id']) : '';

    if (empty($id)) {
        $result['status'] = '0';
        $result['error']  = 'id is required';
        $result['result'] = array();
        echo json_encode($result);
        exit;
    }

    $query = mysqli_query($sql, "SELECT * FROM tbl_product 
                                 WHERE product_id = '$id' 
                                   AND is_deleted = 1 
                                   AND product_type = 3");

    if (mysqli_num_rows($query) > 0) {
        $result['status'] = '1';
        $result['error']  = '';
        $result['result'] = array();
        while ($row = mysqli_fetch_assoc($query)) {

            /* Clear fields for duplicate */
            $row['product_variant'] = '';
            $row['product_sku']     = '';
            $row['reference_id']    = $row['product_id'];
            $row['is_duplicated']   = 1;

            /* Main image → full URL only */
            if (!empty($row['product_image'])) {
                $row['product_image'] = $server_product_url . $row['product_image'];
            }

            /* Gallery → array of full URLs only */
            $row['product_images'] = array();
            if (!empty($row['product_images'])) {
                $files = array_filter(array_map('trim', explode(',', $row['product_images'])));
                foreach ($files as $img) {
                    $row['product_images'][] = $server_product_url . $img;
                }
            }

            /* vendor_offer safety default */
            if (!isset($row['vendor_offer'])) $row['vendor_offer'] = '0';

            $result['result'][] = $row;
        }
    } else {
        $result['status'] = '0';
        $result['error']  = 'No record found';
        $result['result'] = array();
    }

    echo json_encode($result);
    exit;
}

/* ============================================================
   DELETE — Soft delete
   ============================================================ */
if ($action == 'delete') {

    $id = isset($_POST['id']) ? mysqli_real_escape_string($sql, $_POST['id']) : '';

    if (empty($id)) {
        $result['status'] = '0';
        $result['error']  = 'id is required';
        $result['result'] = array();
        echo json_encode($result);
        exit;
    }

    $delete_product = "UPDATE tbl_product SET is_deleted = 2 
                       WHERE product_id='$id' AND is_deleted=1 AND product_type=3";

    $query_str_product = mysqli_query($sql, $delete_product);

    if ($query_str_product) {
        $result['status'] = '1';
        $result['error']  = 'Delete Product Successfully';
        $result['result'] = array();
    } else {
        $result['status'] = '0';
        $result['error']  = 'Please try again sometime.';
        $result['result'] = array();
    }

    echo json_encode($result);
    exit;
}

/* ============================================================
   FALLBACK — Unknown action
   ============================================================ */
$result['status'] = '0';
$result['error']  = 'Invalid action';
$result['result'] = array();
echo json_encode($result);