<?php

/**
 * vendor_product.php.php
 * Vendor accessory product endpoint.
 *
 * type=1: list the signed-in vendor's products
 * type=2: create a product
 * type=3: update a product
 * type=4: soft-delete a product
 *
 * Place this file beside dbconnect.php on the PHP API server. The connection
 * file is expected to expose a mysqli connection named $sql, plus the
 * $product_image_upload and $server_product_url settings.
 */
require_once __DIR__ . '/dbconnect.php';

function vendor_product_reply($status, $error, $rows = array(), $httpCode = 200)
{
    http_response_code($httpCode);
    echo json_encode(array(
        'status' => (string)$status,
        'error' => (string)$error,
        'result' => $rows,
    ), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    vendor_product_reply('0', 'Please use the POST method.', array(), 405);
}

if (!isset($sql) || !($sql instanceof mysqli)) {
    vendor_product_reply('0', 'Database connection is unavailable.', array(), 500);
}
mysqli_set_charset($sql, 'utf8mb4');

function vendor_product_post($key, $default = '')
{
    return isset($_POST[$key]) ? trim((string)$_POST[$key]) : $default;
}

function vendor_product_int($key)
{
    $value = vendor_product_post($key, '0');
    return ctype_digit($value) ? (int)$value : 0;
}

function vendor_product_decimal($key)
{
    $value = vendor_product_post($key, '0');
    if ($value === '' || !is_numeric($value)) return '0.00';
    return number_format((float)$value, 2, '.', '');
}

/** Escape a value for direct use inside a single-quoted SQL string. */
function vendor_product_escape($value)
{
    global $sql;
    return mysqli_real_escape_string($sql, (string)$value);
}

/** Wrap a value in quotes and escape it. */
function vendor_product_quote($value)
{
    return "'" . vendor_product_escape($value) . "'";
}

/** Folder where product images are stored (from dbconnect.php). */
function vendor_product_upload_dir()
{
    global $product_image_upload;

    $directory = isset($product_image_upload) && $product_image_upload !== ''
        ? (string)$product_image_upload
        : '../uploads/product/';

    $directory = rtrim(str_replace('\\', '/', $directory), '/');

    // Resolve relative paths against this API directory.
    if (!preg_match('#^(/|[A-Za-z]:/)#', $directory)) {
        $directory = rtrim(str_replace('\\', '/', __DIR__), '/') . '/' . $directory;
    }

    return $directory;
}

/** Public base URL for product images (from dbconnect.php). */
function vendor_product_image_base()
{
    global $server_product_url;

    if (isset($server_product_url) && $server_product_url !== '') {
        return rtrim((string)$server_product_url, '/') . '/';
    }

    return '/uploads/product/';
}

function vendor_product_safe_filename($value)
{
    $value = str_replace('\\', '/', (string)$value);
    return basename($value);
}

function vendor_product_upload($fileKey)
{
    if (!isset($_FILES[$fileKey]) || !is_array($_FILES[$fileKey])) return '';
    $file = $_FILES[$fileKey];
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) return '';
    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK || empty($file['tmp_name'])) {
        throw new RuntimeException('An image could not be uploaded. Please try again.');
    }

    $extension = strtolower(pathinfo((string)$file['name'], PATHINFO_EXTENSION));
    $allowed = array('jpg', 'jpeg', 'png', 'gif', 'webp');
    if (!in_array($extension, $allowed, true)) {
        throw new RuntimeException('Upload JPG, PNG, GIF, or WEBP product images.');
    }
    if (!is_uploaded_file($file['tmp_name'])) {
        throw new RuntimeException('The uploaded image could not be verified.');
    }
    $imageInfo = @getimagesize($file['tmp_name']);
    if ($imageInfo === false) {
        throw new RuntimeException('The selected file is not a valid image.');
    }

    $directory = vendor_product_upload_dir();
    if (!is_dir($directory) && !@mkdir($directory, 0755, true) && !is_dir($directory)) {
        throw new RuntimeException('The product image folder is unavailable.');
    }

    $filename = 'vendor_' . date('Ymd_His') . '_' . bin2hex(random_bytes(6)) . '.' . $extension;
    if (!move_uploaded_file($file['tmp_name'], $directory . '/' . $filename)) {
        throw new RuntimeException('The product image could not be saved.');
    }
    return $filename;
}

function vendor_product_upload_gallery()
{
    $key = isset($_FILES['product_images']) ? 'product_images' : (isset($_FILES['product_images[]']) ? 'product_images[]' : '');
    if ($key === '') return array();
    $files = $_FILES[$key];
    if (!isset($files['name']) || !is_array($files['name'])) {
        $single = vendor_product_upload($key);
        return $single !== '' ? array($single) : array();
    }

    $uploaded = array();
    $count = count($files['name']);
    for ($index = 0; $index < $count; $index++) {
        if (($files['error'][$index] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) continue;
        $single = array(
            'name' => $files['name'][$index],
            'type' => $files['type'][$index] ?? '',
            'tmp_name' => $files['tmp_name'][$index] ?? '',
            'error' => $files['error'][$index] ?? UPLOAD_ERR_NO_FILE,
            'size' => $files['size'][$index] ?? 0,
        );
        $original = $_FILES[$key];
        $_FILES[$key] = $single;
        try {
            $filename = vendor_product_upload($key);
        } finally {
            $_FILES[$key] = $original;
        }
        if ($filename !== '') $uploaded[] = $filename;
    }
    return $uploaded;
}

function vendor_product_gallery_names($values)
{
    if (!is_array($values)) return array();
    $names = array();
    foreach ($values as $value) {
        $name = vendor_product_safe_filename($value);
        if ($name !== '' && !in_array($name, $names, true)) $names[] = $name;
    }
    return $names;
}

function vendor_product_find($db, $productId, $customerId)
{
    $productId = (int)$productId;
    $customerId = (int)$customerId;
    $result = mysqli_query($db, "SELECT product_id, customer_id, product_image, product_images FROM tbl_product WHERE product_id = $productId AND customer_id = $customerId AND product_type = 3 AND is_deleted = 1 LIMIT 1");
    if (!$result) throw new RuntimeException('Could not read the product.');
    $row = mysqli_fetch_assoc($result);
    mysqli_free_result($result);
    return $row ? $row : null;
}

$type = vendor_product_int('type');
$customerId = vendor_product_int('customer_id');
$productId = vendor_product_int('product_id');

if (!in_array($type, array(1, 2, 3, 4), true)) {
    vendor_product_reply('0', 'Invalid action type. Use 1, 2, 3, or 4.');
}
if ($customerId < 1) {
    vendor_product_reply('0', 'A valid vendor customer_id is required.');
}

try {
    /* ---------------------------------------------------------------
     * type = 1 : list the vendor's products
     * ------------------------------------------------------------- */
    if ($type === 1) {
        $listSql = "SELECT p.product_id, p.customer_id, p.category_id, p.brand_id, p.model_id, p.product_variant, p.short_description, p.long_description, p.vendor_offer, p.product_image, p.product_images, p.cgst, p.sgst, p.is_exclusive_tax, p.base_price, p.mrp, p.retailer_price, p.wholesaler_price, p.hsn_code, p.product_sku, p.priority, p.status, p.launch_date, p.original_price, p.reference_id, p.product_type, c.category_name, b.brand_name, m.model_name FROM tbl_product p LEFT JOIN tbl_category c ON c.category_id = p.category_id LEFT JOIN tbl_brand b ON b.brand_id = p.brand_id LEFT JOIN tbl_model m ON m.model_id = p.model_id WHERE p.customer_id = $customerId AND p.product_type = 3 AND p.is_deleted = 1 ORDER BY p.priority ASC, p.product_id DESC";

        $result = mysqli_query($sql, $listSql);
        if (!$result) throw new RuntimeException('Could not load vendor products.');

        $imageBaseUrl = vendor_product_image_base();
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $row['product_image_url'] = !empty($row['product_image']) ? $imageBaseUrl . $row['product_image'] : '';
            $row['product_images_url'] = !empty($row['product_images']) ? $imageBaseUrl . str_replace(',', ',' . $imageBaseUrl, $row['product_images']) : '';
            $rows[] = $row;
        }
        mysqli_free_result($result);
        vendor_product_reply('1', '', $rows);
    }

    /* ---------------------------------------------------------------
     * type = 4 : soft delete
     * ------------------------------------------------------------- */
    if ($type === 4) {
        if ($productId < 1) vendor_product_reply('0', 'A valid product_id is required.');

        $deleteSql = "UPDATE tbl_product SET is_deleted = 2 WHERE product_id = $productId AND customer_id = $customerId AND product_type = 3 AND is_deleted = 1";

        $deleted = mysqli_query($sql, $deleteSql);
        if (!$deleted) throw new RuntimeException('Could not delete the product.');
        if (mysqli_affected_rows($sql) < 1) {
            vendor_product_reply('0', 'Product not found or it has already been deleted.');
        }
        vendor_product_reply('1', 'Product deleted.', array());
    }

    /* ---------------------------------------------------------------
     * type = 3 : update (validate the product first)
     * ------------------------------------------------------------- */
    if ($type === 3) {
        if ($productId < 1 || !vendor_product_find($sql, $productId, $customerId)) {
            vendor_product_reply('0', 'Product not found.');
        }
    }

    $categoryId = vendor_product_int('category_id');
    $brandId = vendor_product_int('brand_id');
    $modelId = vendor_product_int('model_id');
    $variant = vendor_product_post('product_variant');
    if ($brandId < 1 || $variant === '') {
        vendor_product_reply('0', 'Category, brand, model, and product name are required.');
    }

    $shortDescription = vendor_product_post('short_description');
    $longDescription = vendor_product_post('long_description');
    $vendorOffer = vendor_product_post('vendor_offer');
    $cgst = vendor_product_decimal('cgst');
    $sgst = vendor_product_decimal('sgst');
    $isExclusiveTax = vendor_product_int('is_exclusive_tax') === 1 ? 1 : 0;
    $basePrice = vendor_product_decimal('base_price');
    $mrp = vendor_product_decimal('mrp');
    $retailerPrice = vendor_product_decimal('retailer_price');
    $wholesalerPrice = vendor_product_decimal('wholesaler_price');
    $hsnCode = vendor_product_post('hsn_code');
    $productSku = vendor_product_post('product_sku');
    $priority = vendor_product_int('priority');
    $status = vendor_product_int('status') === 1 ? 1 : 0;
    $existing = $type === 3 ? vendor_product_find($sql, $productId, $customerId) : null;

    $mainImage = $existing ? (string)$existing['product_image'] : '';
    $newMainImage = vendor_product_upload('product_image');
    if ($newMainImage !== '') $mainImage = $newMainImage;

    if ($existing) {
        if (isset($_POST['kept_images[]'])) $keptValues = $_POST['kept_images[]'];
        elseif (isset($_POST['kept_images'])) $keptValues = $_POST['kept_images'];
        else $keptValues = explode(',', (string)$existing['product_images']);
    } else {
        $keptValues = isset($_POST['kept_images[]']) ? $_POST['kept_images[]'] : (isset($_POST['kept_images']) ? $_POST['kept_images'] : array());
    }
    $gallery = vendor_product_gallery_names($keptValues);
    foreach (vendor_product_upload_gallery() as $uploadedName) {
        if (!in_array($uploadedName, $gallery, true)) $gallery[] = $uploadedName;
    }
    $galleryImages = implode(',', $gallery);

    /* ---------------------------------------------------------------
     * type = 2 : create
     * ------------------------------------------------------------- */
    if ($type === 2) {
        $isDuplicated = 0;
        $productType = 3;
        $deleted = 1;
        $referenceId = 0;
        $createdAt = date('Y-m-d H:i:s');

        $columns = "is_duplicated, product_variant, short_description, long_description, product_image, product_images, cgst, sgst, is_exclusive_tax, base_price, mrp, retailer_price, wholesaler_price, hsn_code, product_sku, priority, status, category_id, brand_id, model_id, is_deleted, customer_id, c_date, reference_id, product_type, vendor_offer";

        $insertValues = array((string)$isDuplicated, vendor_product_quote($variant), vendor_product_quote($shortDescription), vendor_product_quote($longDescription), vendor_product_quote($mainImage), vendor_product_quote($galleryImages), vendor_product_quote($cgst), vendor_product_quote($sgst), (string)$isExclusiveTax, vendor_product_quote($basePrice), vendor_product_quote($mrp), vendor_product_quote($retailerPrice), vendor_product_quote($wholesalerPrice), vendor_product_quote($hsnCode), vendor_product_quote($productSku), (string)$priority, (string)$status, (string)$categoryId, (string)$brandId, (string)$modelId, (string)$deleted, (string)$customerId, vendor_product_quote($createdAt), (string)$referenceId, (string)$productType, vendor_product_quote($vendorOffer),);

        $insertSql = "INSERT INTO tbl_product ($columns) VALUES (" . implode(', ', $insertValues) . ")";

        if (!mysqli_query($sql, $insertSql)) {
            throw new RuntimeException('Could not save the product.');
        }

        $newProductId = (int)mysqli_insert_id($sql);
        vendor_product_reply('1', 'Product added.', array(array('product_id' => (string)$newProductId)));
    }

    /* ---------------------------------------------------------------
     * type = 3 : update
     * ------------------------------------------------------------- */
    $updateSql = "UPDATE tbl_product SET product_variant = " . vendor_product_quote($variant) . ", short_description = " . vendor_product_quote($shortDescription) . ", long_description = " . vendor_product_quote($longDescription) . ", product_image = " . vendor_product_quote($mainImage) . ", product_images = " . vendor_product_quote($galleryImages) . ", cgst = " . vendor_product_quote($cgst) . ", sgst = " . vendor_product_quote($sgst) . ", is_exclusive_tax = " . (int)$isExclusiveTax . ", base_price = " . vendor_product_quote($basePrice) . ", mrp = " . vendor_product_quote($mrp) . ", retailer_price = " . vendor_product_quote($retailerPrice) . ", wholesaler_price = " . vendor_product_quote($wholesalerPrice) . ", hsn_code = " . vendor_product_quote($hsnCode) . ", product_sku = " . vendor_product_quote($productSku) . ", priority = " . (int)$priority . ", status = " . (int)$status . ", category_id = " . (int)$categoryId . ", brand_id = " . (int)$brandId . ", model_id = " . (int)$modelId . ", vendor_offer = " . vendor_product_quote($vendorOffer) . " WHERE product_id = $productId AND customer_id = $customerId AND product_type = 3 AND is_deleted = 1";

    if (!mysqli_query($sql, $updateSql)) {
        throw new RuntimeException('Could not update the product.');
    }

    vendor_product_reply('1', 'Product updated.', array(array('product_id' => (string)$productId)));
} catch (Throwable $error) {
    error_log('vendor_product.php: ' . $error->getMessage());
    vendor_product_reply(
        '0',
        $error instanceof RuntimeException ? $error->getMessage() : 'Could not process this request.',
        array(),
        500
    );
}
