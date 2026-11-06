<?php
include 'dbconnect.php';

$cid = $_REQUEST['cid'];

$query = mysqli_query($sql, "SELECT * FROM tbl_company_setting where is_deleted = 1 ");
if (mysqli_num_rows($query) > 0 && $cid==45841) {
    $admin_row = mysqli_fetch_assoc($query);
    $company_name = $admin_row['company_name'] ? $admin_row['company_name'] : $company_name;
    $company_mobile = $admin_row['company_mobile'] ? $admin_row['company_mobile'] : $company_mobile;
    $company_favicon = $admin_row['company_favicon'] ? $server_logo_url . $admin_row['company_favicon'] : '';
    $company_header_logo = $admin_row['company_header_logo'] ? $server_logo_url . $admin_row['company_header_logo'] : '';
    $company_login_logo = $admin_row['company_login_logo'] ? $server_logo_url . $admin_row['company_login_logo'] : '';
    $company_email = $admin_row['company_email'] ? $admin_row['company_email'] : '';
    $company_website = $admin_row['company_website'] ? $admin_row['company_website'] : '';
    $company_landline = $admin_row['company_landline'] ? $admin_row['company_landline'] : '';
    $company_address = $admin_row['company_address'] ? $admin_row['company_address'] : '';
    $company_terms_and_condition = $admin_row['company_terms_and_condition'] ? $admin_row['company_terms_and_condition'] : '';
    $company_privacy_policy = $admin_row['company_privacy_policy'] ? $admin_row['company_privacy_policy'] : '';
    $company_about_us = $admin_row['company_about_us'] ? $admin_row['company_about_us'] : '';

    $result['result'][] = $admin_row;
    $result['status'] = '1';
    $result['error'] = '';
} else {
    $result['status'] = '0';
    $result['error'] = '';
    $result['result'] = array();
}

echo json_encode($result);
