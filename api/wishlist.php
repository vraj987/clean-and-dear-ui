<?php
/**
 * Wishlist toggle endpoint.
 *
 * Pass:
 *   product_id   -> the product being toggled
 *   customer_id  -> the logged-in person's id
 *
 * Logic:
 *   1. Look for an existing wishlist row for this customer + product.
 *   2. If an active row (is_deleted = 1) exists  -> set is_deleted = 2 (remove).
 *   3. If a removed row (is_deleted = 2) exists  -> set is_deleted = 1 (add again).
 *   4. If no row exists at all                   -> INSERT a new row (add).
 *
 * Place this file beside dbconnect.php on the PHP API server.
 * The connection file must expose a mysqli connection named $sql.
 */
require_once __DIR__ . '/dbconnect.php';

function wishlist_reply($status, $error, $rows = array(), $httpCode = 200)
{
    http_response_code($httpCode);
    echo json_encode(array(
        'status' => (string)$status,
        'error'  => (string)$error,
        'result' => $rows,
    ), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    wishlist_reply('0', 'Please use the POST method.', array(), 405);
}

if (!isset($sql) || !($sql instanceof mysqli)) {
    wishlist_reply('0', 'Database connection is unavailable.', array(), 500);
}
mysqli_set_charset($sql, 'utf8mb4');

function wishlist_post($key, $default = '')
{
    return isset($_POST[$key]) ? trim((string)$_POST[$key]) : $default;
}

function wishlist_int($key)
{
    $value = wishlist_post($key, '0');
    return ctype_digit($value) ? (int)$value : 0;
}

$productId  = wishlist_int('product_id');
$customerId = wishlist_int('customer_id');

if ($productId < 1) {
    wishlist_reply('0', 'A valid product_id is required.');
}
if ($customerId < 1) {
    wishlist_reply('0', 'A valid customer_id is required.');
}

try {
    /* ---------------------------------------------------------------
     * 1. Check if this product is already in the wishlist
     * ------------------------------------------------------------- */
    $checkSql = "SELECT wishlist_id, is_deleted FROM tbl_wishlist WHERE wishlist_pro_id = $productId AND wishlist_customer_id = $customerId LIMIT 1";

    $checkResult = mysqli_query($sql, $checkSql);
    if (!$checkResult) {
        throw new RuntimeException('Could not check the wishlist.');
    }

    $existing = mysqli_fetch_assoc($checkResult);
    mysqli_free_result($checkResult);

    /* ---------------------------------------------------------------
     * 2. Already active -> remove it (is_deleted = 2)
     * ------------------------------------------------------------- */
    if ($existing && (int)$existing['is_deleted'] === 1) {
        $wishlistId = (int)$existing['wishlist_id'];

        $removeSql = "UPDATE tbl_wishlist SET is_deleted = 2 WHERE wishlist_id = $wishlistId";

        if (!mysqli_query($sql, $removeSql)) {
            throw new RuntimeException('Could not remove from wishlist.');
        }

        wishlist_reply('1', 'Removed from wishlist.', array(
            array(
                'action'      => 'removed',
                'wishlist_id' => (string)$wishlistId,
                'product_id'  => (string)$productId,
            )
        ));
    }

    /* ---------------------------------------------------------------
     * 3. Previously removed -> add it back (is_deleted = 1)
     * ------------------------------------------------------------- */
    if ($existing && (int)$existing['is_deleted'] === 2) {
        $wishlistId = (int)$existing['wishlist_id'];

        $addBackSql = "UPDATE tbl_wishlist SET is_deleted = 1, c_date = NOW() WHERE wishlist_id = $wishlistId";

        if (!mysqli_query($sql, $addBackSql)) {
            throw new RuntimeException('Could not add to wishlist.');
        }

        wishlist_reply('1', 'Added to wishlist.', array(
            array(
                'action'      => 'added',
                'wishlist_id' => (string)$wishlistId,
                'product_id'  => (string)$productId,
            )
        ));
    }

    /* ---------------------------------------------------------------
     * 4. Not in wishlist at all -> insert a new row
     * ------------------------------------------------------------- */
    $insertSql = "INSERT INTO tbl_wishlist (wishlist_pro_id, wishlist_customer_id, is_deleted, c_date) VALUES ($productId, $customerId, 1, NOW())";

    if (!mysqli_query($sql, $insertSql)) {
        throw new RuntimeException('Could not add to wishlist.');
    }

    $newId = (int)mysqli_insert_id($sql);

    wishlist_reply('1', 'Added to wishlist.', array(
        array(
            'action'      => 'added',
            'wishlist_id' => (string)$newId,
            'product_id'  => (string)$productId,
        )
    ));
} catch (Throwable $error) {
    error_log('wishlist.php: ' . $error->getMessage());
    wishlist_reply(
        '0',
        $error instanceof RuntimeException ? $error->getMessage() : 'Could not process this request.',
        array(),
        500
    );
}