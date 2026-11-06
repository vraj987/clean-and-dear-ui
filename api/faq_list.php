<?php
// faq_list.php (api example)
include 'dbconnect.php';

/* ==================== REQUEST PARAMS ==================== */
$faq_id    = isset($_REQUEST['faq_id'])    ? intval($_REQUEST['faq_id'])    : 0;
$search    = isset($_REQUEST['search'])    ? trim($_REQUEST['search'])      : '';
$limit     = isset($_REQUEST['limit'])     ? intval($_REQUEST['limit'])     : 0;
$offset    = isset($_REQUEST['offset'])    ? intval($_REQUEST['offset'])    : 0;

/* ==================== FILTERS ==================== */
$where = "is_deleted = 1";
if ($faq_id > 0) {
    $where .= " AND faq_id = '$faq_id'";
}
if (!empty($search)) {
    $s = mysqli_real_escape_string($sql, $search);
    $where .= " AND (faq_title LIKE '%$s%' OR faq_description LIKE '%$s%')";
}

/* ==================== LIMIT / OFFSET ==================== */
$limit_sql = "";
if ($limit > 0) {
    $limit_sql = " LIMIT $offset, $limit";
}

/* ==================== QUERY ==================== */
$query = mysqli_query($sql, "SELECT faq_id, faq_title, faq_description, is_deleted, c_date 
                             FROM tbl_faq 
                             WHERE $where 
                             ORDER BY faq_id ASC 
                             $limit_sql");

if (mysqli_num_rows($query) > 0) {

    $result['status'] = '1';
    $result['error']  = '';
    $result['result'] = array();

    while ($row = mysqli_fetch_assoc($query)) {

        /* format date (d-m-Y) if available */
        $row['c_date_formatted'] = !empty($row['c_date']) && $row['c_date'] != '0000-00-00 00:00:00'
            ? date('d-m-Y', strtotime($row['c_date']))
            : '';

        $result['result'][] = $row;
    }

    /* total count (for pagination) */
    $count_q = mysqli_query($sql, "SELECT COUNT(*) AS total FROM tbl_faq WHERE $where");
    $count_r = mysqli_fetch_assoc($count_q);
    $result['total'] = intval($count_r['total']);
} else {
    $result['status'] = '0';
    $result['error']  = '';
    $result['result'] = array();
    $result['total']  = 0;
}

echo json_encode($result);
