<?php
include 'dbconnect.php';
$state_id = mysqli_real_escape_string($sql, $_POST['state_id']);
$str_query = "";
if (!empty($state_id)) {
    $str_query .= " AND tbl_city.state_id = '$state_id' ";
}
$query = mysqli_query($sql, "SELECT tbl_city.* FROM tbl_city WHERE tbl_city.is_deleted = 1 " . $str_query . " ORDER BY `city_name` ASC");
if (mysqli_num_rows($query) > 0) {
    $result['status'] = '1';
    $result['error'] = '';
    while ($c_rows = mysqli_fetch_assoc($query)) {
        $result['result'][] = $c_rows;
    }
} else {
    $result['status'] = '0';
    $result['error'] = 'No record found';
    $result['result'] = array();
}
echo json_encode($result);
?>