<?php
include 'dbconnect.php';
$employee_id = mysqli_real_escape_string($sql, $_POST['employee_id']);
$to_date = date("Y-m-d");
$from_date = date("Y-m-d", strtotime($to_date . "-14 days"));

if ( (!empty($employee_id) || !empty($associate_id))) {

    $str_query = "";

    if(!empty($employee_id)) {
        $str_query .= "  and FIND_IN_SET('$employee_id',tbl_notification.employee_id)  ";
    }

    $str_cust = "SELECT tbl_notification.* FROM `tbl_notification`  WHERE  tbl_notification.`is_deleted`=1  AND STR_TO_DATE(tbl_notification.c_date, '%Y-%m-%D') BETWEEN '$from_date' and '$to_date' ".$str_query."   ORDER BY tbl_notification.notification_id desc";
    $query_cust = mysqli_query($sql, $str_cust);
    if (mysqli_num_rows($query_cust) > 0) {
        $result['status'] = '1';
        $result['error'] = '';
        while ($row = mysqli_fetch_assoc($query_cust)) {

            foreach ($row as $index => $value) {
                if ($value === null) {
                    $row[$index] = '';
                } else {
                    $row[$index] = $value;
                }
            }

            $row['c_date'] = date("d-m-Y", strtotime($row['c_date']));
          
            $result['result'][] = $row;

        }
    } else {
        $result['status'] = '0';
        $result['error'] = 'No data found';
        $result['result'] = array();
    }
} else {
    $result['status'] = '3';
    $result['error'] = '';
    $result['result'] = array();
}
echo json_encode($result);
?>