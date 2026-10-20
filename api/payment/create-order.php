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
        $sstmt = $db->prepare("SELECT `key`, `value` FROM system_settings WHERE `key` IN ('SYSTEM_UPI', 'GATEWAY_RUPAYEX')");
        $sstmt->execute();
        $settingsRows = $sstmt->fetchAll();
        foreach ($settingsRows as $sr) {
            $parsed = json_decode($sr['value'], true);
            if (is_array($parsed)) {
                if (!empty($parsed['gatewayMode'])) $gatewayMode = $parsed['gatewayMode'];
                if (!empty($parsed['paymentChannel'])) $paymentChannel = $parsed['paymentChannel'];
                if (!empty($parsed['lgpayMerchantId'])) $merchantId = $parsed['lgpayMerchantId'];
                if (!empty($parsed['merchantCode'])) $merchantId = $parsed['merchantCode'];
                if (!empty($parsed['lgpayApiKey'])) $apiKey = $parsed['lgpayApiKey'];
                if (!empty($parsed['apiKey'])) $apiKey = $parsed['apiKey'];
                if (!empty($parsed['lgpayBaseUrl'])) $baseUrl = $parsed['lgpayBaseUrl'];
                if (!empty($parsed['apiUrl'])) $baseUrl = $parsed['apiUrl'];
            }
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
$chan = strtoupper(trim($paymentChannel));
$gmode = strtoupper(trim($gatewayMode));
$isLgpayOrder = ($chan === 'LGPAY' || $chan === 'LGPAY_STANDARD' || $chan === 'RUPAYEX' || $chan === 'CUSTOM_API' || $gmode === 'LGPAY' || $gmode === 'LGPAY_AUTO' || ($input['provider'] ?? '') === 'LGPAY');

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

    $endpoint = str_ends_with($baseUrl, '/create') ? $baseUrl : (rtrim($baseUrl, '/') . '/api/order/create');
    $ch = curl_init($endpoint);
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
        $remotePayUrl = $resJson['pay_url'] ?? $resJson['paymentUrl'] ?? $resJson['data']['pay_url'] ?? $resJson['data']['paymentUrl'] ?? $resJson['payUrl'] ?? $resJson['url'] ?? null;
        if (!empty($remotePayUrl)) {
            Response::success([
                'paymentUrl' => $remotePayUrl,
                'payUrl'     => $remotePayUrl,
                'orderId'    => $orderId,
                'amount'     => $amount
            ]);
        }
    }
}

// Return seamless internal UPI pay URL
Response::success([
    'paymentUrl' => $fallbackPayUrl,
    'payUrl'     => $fallbackPayUrl,
    'orderId'    => $orderId,
    'amount'     => $amount
]);
