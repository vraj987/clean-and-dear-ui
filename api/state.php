<?php
include 'dbconnect.php';
$query = mysqli_query($sql, "SELECT tbl_state.state_id,tbl_state.state_name FROM `tbl_state` WHERE tbl_state.`is_deleted`= 1  ORDER BY `state_name` ASC");
if (mysqli_num_rows($query) > 0) {
    $result['status'] = '1';
    $result['error'] = '';
    while ($c_rows = mysqli_fetch_assoc($query)) {
        $result['result'][] = $c_rows;
    }
} else {
    $result['status'] = '0';
    $result['error'] = '';
    $result['result'] = array();
}
echo json_encode($result);
