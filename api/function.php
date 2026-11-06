<?php

require '../notification/vendor/autoload.php';

use GuzzleHttp\Client;
use Firebase\JWT\JWT;


function send_message($type, $sms_text, $mobile_no) {
    include 'dbconnect.php';
    date_default_timezone_set('Asia/Kolkata');
    $c_date = date('Y-m-d H:i:s');
    $tempid = "";
    $output = "";
       $sms_text_store = $sms_text;
       if (strpos($sms_text, 'for registration is') !== false)
       {
         $tempid = '1507166235571890060';
       }
       if (strpos($sms_text, 'for forgot password') !== false)
       {
         $tempid = '1507166235576716167';
       }
       if (strpos($sms_text, 'New Order From') !== false)
       {
         $tempid = '1507166235804919796';
       }
       if (strpos($sms_text, 'Thank you for placing an order with') !== false)
       {
         $tempid = '1507166235611826481';
       }
       if (strpos($sms_text, 'is canceled') !== false)
       {
         $tempid = '1507166235775737809';
       }
       if (strpos($sms_text, 'has been rejected') !== false)
       {
         $tempid = '1507166235785858947';
       }
       if (strpos($sms_text, 'is out for delivery and') !== false)
       {
         $tempid = '1507166235769806054';
       }
       if (strpos($sms_text, 'ready to be shipped and will notify you') !== false)
       {
         $tempid = '1507166235622176873';
       }
       if (strpos($sms_text, 'has been delivered') !== false)
       {
         $tempid = '1507166235772853241';
       }
        // $ch = curl_init();
        // $postData = array(
        //     'authkey' => '4fa6d0216f1dd4e0a544a078ac63fcaa',
        //     'mobiles' => $mobile_no,
        //     'message' => $sms_text,
        //     'sender' => 'ALTBIS',
        //     'route' => 'B',
        //     'Template_ID' => $tempid
        // );
        // $url = "http://smss.dmaticsolutions.com/api/send_http.php";
        // $ch = curl_init();
        // curl_setopt_array($ch, array(
        //     CURLOPT_URL => $url,
        //     CURLOPT_RETURNTRANSFER => true,
        //     CURLOPT_POST => true,
        //     CURLOPT_POSTFIELDS => $postData
        // ));
        // curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        // curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        // $output = curl_exec($ch);
    $sms_text = urlencode($sms_text);
    $url = "";
    // $url = 'https://onlysms.co.in/api/otp.aspx?UserID=&UserPass=&MobileNo='.$mobile_no.'&GSMID=ALTBIS&PEID=1501483350000027107&Message='.$sms_text.'&TEMPID='.$tempid.'&UNICODE=TEXT';
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HEADER, false);
    $data = curl_exec($curl);
    $output = curl_close($curl);
        
    mysqli_query($sql, "INSERT INTO `tbl_sms`(`sms_type`, `sms_text`, `sms_response`, `sms_mobile_no`, `is_deleted`, `c_date`,`sms_temp_id`) VALUES ( '$type', '$sms_text_store', '$output', '$mobile_no', 1,'$c_date','$tempid')");
}
function check_user($customer_mobile) {
    include 'dbconnect.php';
    $select = mysqli_query($sql, "SELECT `customer_id` FROM `tbl_customer` WHERE `customer_mobile` = '$customer_mobile' AND `is_deleted` = 1");
    if (mysqli_num_rows($select) > 0) {
        return "true";
    } else {
        return "false";
    }
}

function sendEmployee_notification($employee_id_all, $notification_title, $notification_description, $c_date, $type)
{

    include "dbconnect.php";

    date_default_timezone_set('Asia/Kolkata');
    $c_date = date('Y-m-d H:i:s');

    $employee_android_token = '';
    $employee_ios_token = '';

    $myArray = explode(',', $employee_id_all);

    foreach ($myArray as $key => $employee_id) {

        $fetch_employee_id = mysqli_fetch_assoc(mysqli_query($sql, "SELECT  employee_ios_token,`employee_android_token`,`employee_id` FROM `tbl_employee` WHERE is_deleted = 1 AND  `employee_id`='$employee_id'"));
        $employee_android_token = !empty($fetch_employee_id['employee_android_token']) ? $fetch_employee_id['employee_android_token'] : "";
        $employee_ios_token = !empty($fetch_employee_id['employee_ios_token']) ? $fetch_employee_id['employee_ios_token'] : "";

        if ($employee_android_token != '') {

            $keyFilePath = '../notification/notification.json';
            $serviceAccount = json_decode(file_get_contents($keyFilePath), true);
            $clientEmail = $serviceAccount['client_email'];
            $privateKey = $serviceAccount['private_key'];
            $project_id = $serviceAccount['project_id'];

            $jwtHeader = [
                'alg' => 'RS256',
                'typ' => 'JWT',
            ];

            $jwtPayload = [
                'iss' => $clientEmail,
                'sub' => $clientEmail,
                'aud' => 'https://fcm.googleapis.com/',
                'iat' => time(),
                'exp' => time() + 3600,
            ];
            $jwt = JWT::encode($jwtPayload, $privateKey, 'RS256');

            $client = new Client();


            $notificationData = [
                'message' => [
                    'token' => $employee_android_token, // Ensure this token is valid
                    'data' => [
                        'title' => $notification_title,
                        'body' => $notification_description,
                        'type' => strval($type),
                    ],
                ],
            ];

            try {
                $response = $client->post('https://fcm.googleapis.com/v1/projects/' . $project_id . '/messages:send', [
                    'headers' => [
                        'Authorization' => 'Bearer ' . $jwt,
                        'Content-Type' => 'application/json',
                    ],
                    'json' => $notificationData,
                ]);

                $body = $response->getBody();
                $statusCode = $response->getStatusCode();
                $reasonPhrase = $response->getreasonPhrase();
                $responseData = json_decode($body, true);
            } catch (\GuzzleHttp\Exception\RequestException $e) {


                "Error: " . $e->getMessage() . "\n";
                if ($e->hasResponse()) {
                    "Response Body: " . $e->getResponse()->getBody() . "\n";
                }
            }
        }

        if ($employee_ios_token != '') {

            $keyFilePath = '../notification/notification.json';
            $serviceAccount = json_decode(file_get_contents($keyFilePath), true);
            $clientEmail = $serviceAccount['client_email'];
            $privateKey = $serviceAccount['private_key'];
            $project_id = $serviceAccount['project_id'];

            $jwtHeader = [
                'alg' => 'RS256',
                'typ' => 'JWT',
            ];

            $jwtPayload = [
                'iss' => $clientEmail,
                'sub' => $clientEmail,
                'aud' => 'https://fcm.googleapis.com/',
                'iat' => time(),
                'exp' => time() + 3600,
            ];
            $jwt = JWT::encode($jwtPayload, $privateKey, 'RS256');

            $client = new Client();

            $notificationData = [
                'message' => [
                    'token' => $employee_android_token, // Ensure this token is valid
                    'data' => [
                        'title' => $notification_title,
                        'body' => $notification_description,
                        'type' => strval($type),
                    ],
                ],
            ];

            try {
                $response = $client->post('https://fcm.googleapis.com/v1/projects/' . $project_id . '/messages:send', [
                    'headers' => [
                        'Authorization' => 'Bearer ' . $jwt,
                        'Content-Type' => 'application/json',
                    ],
                    'json' => $notificationData,
                ]);

                $body = $response->getBody();
                $statusCode = $response->getStatusCode();
                $reasonPhrase = $response->getreasonPhrase();
                $responseData = json_decode($body, true);
            } catch (\GuzzleHttp\Exception\RequestException $e) {


                "Error: " . $e->getMessage() . "\n";
                if ($e->hasResponse()) {
                    "Response Body: " . $e->getResponse()->getBody() . "\n";
                }
            }
        }
    }

    $notification_title = mysqli_real_escape_string($sql, $notification_title);
    $notification_description = mysqli_real_escape_string($sql, $notification_description);

    $str_insert_notification = "INSERT INTO `tbl_notification` (notification_type,`notification_title`, `notification_description`, `employee_id`, `is_deleted`, `c_date`) VALUES ('$type','$notification_title', '$notification_description', '$employee_id_all', '1', '$c_date')";
    $insert_notification = mysqli_query($sql, $str_insert_notification);

}
