<?php
/**
 * Stake Casino - /api/payment/create-order Handler
 * Dispatches automated order creation to RupayEx / LG-Pay payment gateways
 */

use Stake\Config\Database;
use Stake\Core\Response;
use Stake\Core\Validator;
use Stake\Core\Auth;

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../core/Validator.php';
require_once __DIR__ . '/../core/Auth.php';

Response::handleOptions();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method not allowed", 405);
}

$input = Validator::getRequestData();
$userData = Auth::getOrCreateUser($input);
$user = $userData['user'];

$amount = Validator::toFloat($input['amount'] ?? 0);
if ($amount < MIN_DEPOSIT_AMOUNT) {
    Response::error("Minimum order amount is ₹" . number_format(MIN_DEPOSIT_AMOUNT, 2), 400);
}

$orderId = 'ORD_' . time() . '_' . rand(1000, 9999);
$db = Database::getConnection();

// Default Gateway Configuration
$gatewayMode = 'MANUAL';
$paymentChannel = 'MANUAL_QR';
$merchantId = 'stake_merchant';
$apiKey = 'stake_secret_key';
$baseUrl = 'https://api.rupayex.com';

if ($db) {
    try {
        $sstmt = $db->prepare("SELECT value FROM system_settings WHERE `key` = 'SYSTEM_UPI' LIMIT 1");
        $sstmt->execute();
        $rawSetting = $sstmt->fetchColumn();
        if ($rawSetting) {
            $parsed = json_decode($rawSetting, true);
            if (isset($parsed['gatewayMode'])) $gatewayMode = $parsed['gatewayMode'];
            if (isset($parsed['paymentChannel'])) $paymentChannel = $parsed['paymentChannel'];
            if (isset($parsed['lgpayMerchantId'])) $merchantId = $parsed['lgpayMerchantId'];
            if (isset($parsed['lgpayApiKey'])) $apiKey = $parsed['lgpayApiKey'];
            if (isset($parsed['lgpayBaseUrl'])) $baseUrl = $parsed['lgpayBaseUrl'];
        }

        // Record PENDING deposit in MySQL
        $depId = 'dep_' . substr(md5(uniqid('', true)), 0, 14);
        $dstmt = $db->prepare("INSERT INTO deposits (id, userId, order_sn, amount, currency, status, method, remark, createdAt, updatedAt) VALUES (:id, :uid, :order_sn, :amount, 'INR', 'PENDING', :method, 'Gateway automated order', NOW(3), NOW(3))");
        $dstmt->execute([
            ':id'       => $depId,
            ':uid'      => $user['id'],
            ':order_sn' => $orderId,
            ':amount'   => $amount,
            ':method'   => $paymentChannel
        ]);
    } catch (\Exception $e) {
        error_log("[Payment Create Order Error] " . $e->getMessage());
    }
}

// Generate checkout URL
$proto = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$fallbackPayUrl = "{$proto}://{$host}/deposit/pay?amount={$amount}&orderId={$orderId}";

// If live external API configured, call gateway via cURL
$isLgpayOrder = ($gatewayMode === 'LGPAY_AUTO' || $gatewayMode === 'LGPAY' || ($input['provider'] ?? '') === 'LGPAY');
if ($isLgpayOrder && !empty($baseUrl) && !str_contains($baseUrl, 'localhost')) {
    $postFields = [
        'merchant_id' => $merchantId,
        'order_id'    => $orderId,
        'amount'      => ($amount * 100), // paise
        'notify_url'  => "{$proto}://{$host}/api/payment/webhook",
        'return_url'  => "{$proto}://{$host}/casino/home",
    ];
    ksort($postFields);
    $signStr = http_build_query($postFields) . "&key=" . $apiKey;
    $postFields['sign'] = md5($signStr);

    $ch = curl_init("{$baseUrl}/api/order/create");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postFields));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $resJson = json_decode($response, true);
        if (!empty($resJson['pay_url'])) {
            Response::success([
                'payUrl'  => $resJson['pay_url'],
                'orderId' => $orderId,
                'amount'  => $amount
            ]);
        }
    }
}

// Return seamless internal UPI pay URL
Response::success([
    'payUrl'  => $fallbackPayUrl,
    'orderId' => $orderId,
    'amount'  => $amount
]);
