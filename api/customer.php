<?php
include 'dbconnect.php';
$query = mysqli_query($sql, "SELECT tbl_state.state_name,tbl_city.city_name,tbl_customer.* FROM `tbl_customer` LEFT JOIN tbl_state ON tbl_state.state_id = tbl_customer.state_id LEFT JOIN  tbl_city ON tbl_city.city_id = tbl_customer.city_id WHERE tbl_customer.`is_deleted`= 1  ORDER BY `customer_name` ASC");
if (mysqli_num_rows($query) > 0) {
    $result['status'] = '1';
    $result['error'] = '';
    while ($c_rows = mysqli_fetch_assoc($query)) {

        foreach ($c_rows as $index => $value) {
                if ($value === null) {
                    $c_rows[$index] = '';
                } else {
                    $c_rows[$index] = $value;
                }
        }


        $result['result'][] = $c_rows;
    }
} else {
    $result['status'] = '0';
    $result['error'] = '';
    $result['result'] = array();
}
echo json_encode($result);
?>