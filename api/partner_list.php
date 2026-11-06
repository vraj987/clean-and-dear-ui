<?php
include 'dbconnect.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array('status' => '0', 'error' => 'POST method required.', 'result' => array()));
    exit;
}

$query = mysqli_query(
    $sql,
    "SELECT partner_id, partner_name, partner_image, partner_url, partner_priority
     FROM tbl_partner
     WHERE is_deleted = 1
     ORDER BY partner_priority ASC, partner_id ASC"
);

if (!$query) {
    http_response_code(500);
    echo json_encode(array('status' => '0', 'error' => 'Unable to load partners.', 'result' => array()));
    exit;
}

$partners = array();
while ($row = mysqli_fetch_assoc($query)) {
    $image = trim((string)($row['partner_image'] ?? ''));
    $row['partner_image_url'] = '';
    if ($image !== '') {
        $row['partner_image_url'] = preg_match('/^(https?:)?\/\//i', $image)
            ? $image
            : rtrim($server_url, '/') . '/uploads/partner/' . rawurlencode(basename($image));
    }
    $partners[] = $row;
}

echo json_encode(array(
    'status' => count($partners) > 0 ? '1' : '0',
    'error' => '',
    'result' => $partners
));
?>
