<?php
/**
 * Stake Casino - /api/admin/settings Handler
 * Manages UPI ID, Payment Gateway, Limits, and System Configurations
 */

use Stake\Config\Database;
use Stake\Core\Response;
use Stake\Core\Validator;

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../core/Validator.php';

Response::handleOptions();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getConnection();

$defaultSettings = [
    'upiId'                => 'stakeofficial@upi',
    'upiName'              => 'Stake Gaming',
    'gatewayMode'          => 'MANUAL',
    'paymentChannel'       => 'MANUAL_QR',
    'lgpayMerchantId'      => 'stake_lgpay_merchant',
    'lgpayApiKey'          => 'lgpay_secret_key_prod_8829',
    'lgpayBaseUrl'         => 'https://www.lg-pay.com',
    'tradeType'            => 'INRUPI',
    'amountUnit'           => 'PAISE',
    'minDepositAmount'     => 100,
    'minWithdrawalAmount'  => 500,
    'quickAmounts'         => [300, 500, 1000, 5000, 10000, 25000]
];

if ($method === 'GET') {
    if ($db) {
        try {
            $stmt = $db->prepare("SELECT value FROM system_settings WHERE `key` = 'SYSTEM_UPI' LIMIT 1");
            $stmt->execute();
            $raw = $stmt->fetchColumn();
            if ($raw) {
                $parsed = json_decode($raw, true);
                if (is_array($parsed)) {
                    $defaultSettings = array_merge($defaultSettings, $parsed);
                }
            }
        } catch (\Exception $e) {}
    }

    Response::success(['settings' => $defaultSettings]);
}

if ($method === 'POST') {
    $input = Validator::getRequestData();
    $action = $input['action'] ?? 'UPDATE_ALL';

    if ($db) {
        try {
            // Fetch existing
            $stmt = $db->prepare("SELECT value FROM system_settings WHERE `key` = 'SYSTEM_UPI' LIMIT 1");
            $stmt->execute();
            $raw = $stmt->fetchColumn();
            $current = $raw ? (json_decode($raw, true) ?: []) : $defaultSettings;

            if ($action === 'UPDATE_UPI') {
                if (!empty($input['upiId'])) $current['upiId'] = trim($input['upiId']);
                if (!empty($input['upiName'])) $current['upiName'] = trim($input['upiName']);
            } elseif ($action === 'UPDATE_GATEWAY') {
                if (isset($input['gatewayMode'])) $current['gatewayMode'] = $input['gatewayMode'];
                if (isset($input['paymentChannel'])) $current['paymentChannel'] = $input['paymentChannel'];
                if (isset($input['lgpayMerchantId'])) $current['lgpayMerchantId'] = trim($input['lgpayMerchantId']);
                if (isset($input['lgpayApiKey'])) $current['lgpayApiKey'] = trim($input['lgpayApiKey']);
                if (isset($input['lgpayBaseUrl'])) $current['lgpayBaseUrl'] = trim($input['lgpayBaseUrl']);
                if (isset($input['tradeType'])) $current['tradeType'] = trim($input['tradeType']);
                if (isset($input['minDepositAmount'])) $current['minDepositAmount'] = floatval($input['minDepositAmount']);
                if (isset($input['minWithdrawalAmount'])) $current['minWithdrawalAmount'] = floatval($input['minWithdrawalAmount']);
            } else {
                $current = array_merge($current, $input);
            }

            $jsonStr = json_encode($current, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            $upd = $db->prepare("INSERT INTO system_settings (`id`, `key`, `value`, `description`, `updatedAt`) VALUES ('setting_upi', 'SYSTEM_UPI', :val, 'Platform UPI & Gateway Config', NOW(3)) ON DUPLICATE KEY UPDATE `value` = :val2, `updatedAt` = NOW(3)");
            $upd->execute([':val' => $jsonStr, ':val2' => $jsonStr]);

            Response::success(['settings' => $current], "Platform settings updated successfully");
        } catch (\Exception $e) {
            error_log("[Settings Update Error] " . $e->getMessage());
            Response::error("Failed to update settings: " . $e->getMessage(), 500);
        }
    } else {
        Response::success(['settings' => $defaultSettings], "Settings updated in memory");
    }
}
