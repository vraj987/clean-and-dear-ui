<?php
include 'dbconnect.php';
$version_code = $_REQUEST['version_code'];
$ios_version_code = $_REQUEST['ios_version_code'];
if (!empty($version_code)) {
    if ($version_code == $version_code) {   
        $result['status'] = '0';
        $result['error'] = '';
        $result['result'] = array();
    } else {
        $result['status'] = '1';
        $result['error'] = 'Your application is not updated. Please update from store.';
        $result['android_store_link'] = '' . $android_store_link . '';
        $result['ios_store_link'] = '' . $ios_store_link . '';
        $result['result'] = array();
    }
} elseif (!empty($ios_version_code)) {
    if ($ios_version_code == $ios_version_code) {
        $result['status'] = '0';
        $result['error'] = '';
        $result['result'] = array();
    } else {
        $result['status'] = '1';
        $result['error'] = 'Your application is not updated. Please update from store.';
        $result['android_store_link'] = '' . $android_store_link . '';
        $result['ios_store_link'] = '' . $ios_store_link . '';
        $result['result'] = array();
    }
} else {
    $result['status'] = '0';
    $result['error'] = 'Required data missing';
    $result['result'] = array();
}
echo json_encode($result);
?>