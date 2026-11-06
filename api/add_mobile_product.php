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

   Request format: multipart/form-data  OR  application/x-www-form-urlencoded
   Response format: { "status": "...", "error": "...", "result": [] }

   IMAGE HANDLING RULES
   --------------------
   1. If a FILE is uploaded via $_FILES  → filename is generated & saved to disk.
   2. Else if a POST field with the same name is provided
      (e.g. product_image = "main-xxx.jpg")  → that value is stored AS-IS.
   3. Otherwise → empty string.

   The database stores ONLY the filename (no path prefix).
   Clients must prepend $server_product_url when displaying images.
   ============================================================ */

include 'dbconnect.php';

header('Content-Type: application/json');

/* ---------- ACTION ---------- */
$action = isset($_POST['action']) ? mysqli_real_escape_string($sql, $_POST['action']) : '';

/* ============================================================
   HELPER — Normalize kept_images / product_images input
   Accepts: string | array | nested array | comma-separated
   Returns: flat array of trimmed non-empty filenames
   ============================================================ */
function normalize_image_list($raw)
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
            foreach (explode(',', (string)$item) as $p) {
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

        $ext     = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        $allowed = array('jpg', 'jpeg', 'png', 'gif', 'webp');
        if (!in_array($ext, $allowed)) continue;

        $random   = mt_rand(1000, 9999);
        $filename = $prefix . "-" . date("dmyhis") . "-" . $random . "." . $ext;
        $target   = rtrim($uploadDir, '/\\') . DIRECTORY_SEPARATOR . $filename;

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
   HELPER — Resolve main image value (file > POST field > "")
   Returns: filename (or empty)
   ============================================================ */
function resolve_main_image($sql, $uploadDir)
{
    /* 1. File upload wins */
    $fromFile = upload_main_file('product_image', $uploadDir, 'main');
    if ($fromFile !== "") return mysqli_real_escape_string($sql, $fromFile);

    /* 2. Otherwise accept filename from POST (single) */
    if (!empty($_POST['product_image'])) {
        $raw = $_POST['product_image'];

        /* Accept array too (take first non-empty) */
        if (is_array($raw)) {
            foreach ($raw as $r) {
                $r = trim((string)$r);
                if ($r !== '') return mysqli_real_escape_string($sql, basename($r));
            }
        } else {
            $raw = trim((string)$raw);
            if ($raw !== '') return mysqli_real_escape_string($sql, basename($raw));
        }
    }

    /* 3. Optional back-compat: existing_main_image */
    if (!empty($_POST['existing_main_image'])) {
        return mysqli_real_escape_string($sql, basename(trim($_POST['existing_main_image'])));
    }

    return "";
}

/* ============================================================
   HELPER — Resolve gallery list (kept + posted + uploaded)
   Returns: flat array of filenames
   ============================================================ */
function resolve_gallery_images($sql, $uploadDir)
{
    $arr = array();

    /* 1. kept_images[] — existing gallery kept by client */
    if (!empty($_POST['kept_images'])) {
        foreach (normalize_image_list($_POST['kept_images']) as $k) {
            $arr[] = basename($k);
        }
    }

    /* 2. product_images — posted as name(s), no file */
    if (!empty($_POST['product_images'])) {
        foreach (normalize_image_list($_POST['product_images']) as $k) {
            $arr[] = basename($k);
        }
    }

    /* 3. Actual uploaded files — override / append */
    $uploaded = upload_gallery_files('product_images_file', $uploadDir, 'gal');
    foreach ($uploaded as $u) $arr[] = $u;

    /* Also support the classic key "product_images" when it's a FILE array */
    $uploaded2 = upload_gallery_files('product_images', $uploadDir, 'gal');
    foreach ($uploaded2 as $u) $arr[] = $u;

    return array_values(array_unique($arr));
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

    /* ---------- MAIN IMAGE ---------- */
    /* File upload → saves to disk & uses generated name.
       Else POST field "product_image" → stores name as-is. */
    $product_image = resolve_main_image($sql, $product_image_upload);

    /* ---------- GALLERY IMAGES ---------- */
    /* Accepts: kept_images[], product_images[], product_images_file[] */
    $galleryArr = resolve_gallery_images($sql, $product_image_upload);
    $product_images = implode(",", $galleryArr);

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
                        '2',
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
            'product_images' => $galleryArr,
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
                                     WHERE product_id='$id' AND is_deleted=1 AND product_type=2");
    $current   = mysqli_fetch_assoc($current_q);
    $current_main   = isset($current['product_image'])  ? $current['product_image']  : '';
    $current_galler = isset($current['product_images']) ? $current['product_images'] : '';

    /* ---------- MAIN IMAGE ---------- */
    /* File upload wins; else use posted filename; else keep existing */
    $resolved = resolve_main_image($sql, $product_image_upload);
    if ($resolved !== "") {
        $current_main = $resolved;
    }

    /* ---------- GALLERY ---------- */
    /* If client sent kept_images[] or product_images[] → rebuild.
       Else keep the existing gallery untouched. */
    $sentKept    = !empty($_POST['kept_images']);
    $sentGallery = !empty($_POST['product_images']);
    $sentFiles   = !empty($_FILES['product_images_file']['name'][0])
                || !empty($_FILES['product_images']['name'][0]);

    if ($sentKept || $sentGallery || $sentFiles) {
        $galleryArr = resolve_gallery_images($sql, $product_image_upload);
    } else {
        /* Keep existing */
        $galleryArr = array();
        if (!empty($current_galler)) {
            $galleryArr = array_values(array_filter(array_map('trim', explode(',', $current_galler))));
        }
    }

    $gallery_str = implode(",", array_values(array_unique($galleryArr)));

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
                       WHERE product_id='$id' AND is_deleted=1 AND product_type=2";

    $query_str_product = mysqli_query($sql, $update_product);

    if ($query_str_product) {
        $result['status'] = '1';
        $result['error']  = 'Update Product Successfully';
        $result['result'][] = array(
            'product_id'     => (int)$id,
            'product_image'  => $current_main,
            'product_images' => array_values(array_unique($galleryArr)),
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
                                   AND p.product_type = 2
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
                                   AND p.product_type = 2");

    if (mysqli_num_rows($query) > 0) {
        $result['status'] = '1';
        $result['error']  = '';
        $result['result'] = array();
        while ($row = mysqli_fetch_assoc($query)) {

            if (!empty($row['product_image'])) {
                $row['product_image'] = $server_product_url . $row['product_image'];
            }

            $row['product_images'] = array();
            if (!empty($row['product_images'])) {
                $files = array_filter(array_map('trim', explode(',', $row['product_images'])));
                foreach ($files as $img) {
                    $row['product_images'][] = $server_product_url . $img;
                }
            }

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
                                   AND product_type = 2");

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

            if (!empty($row['product_image'])) {
                $row['product_image'] = $server_product_url . $row['product_image'];
            }

            $row['product_images'] = array();
            if (!empty($row['product_images'])) {
                $files = array_filter(array_map('trim', explode(',', $row['product_images'])));
                foreach ($files as $img) {
                    $row['product_images'][] = $server_product_url . $img;
                }
            }

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
                       WHERE product_id='$id' AND is_deleted=1 AND product_type=2";

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