<?php
/**
 * Stake Casino - /api/admin/settings Handler
 * Manages UPI ID, Payment Gateway, Limits, Passwords, and System Configurations
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
            $stmt = $db->prepare("SELECT `key`, `value` FROM system_settings WHERE `key` IN ('SYSTEM_UPI', 'LIMITS', 'GATEWAY_RUPAYEX')");
            $stmt->execute();
            $rows = $stmt->fetchAll();
            foreach ($rows as $r) {
                $val = json_decode($r['value'], true);
                if (is_array($val)) {
                    $defaultSettings = array_merge($defaultSettings, $val);
                }
            }
        } catch (\Exception $e) {
            error_log("[Settings Fetch Error] " . $e->getMessage());
        }
    }

    Response::success(['settings' => $defaultSettings]);
}

if ($method === 'POST') {
    $input = Validator::getRequestData();
    $action = $input['action'] ?? 'UPDATE_ALL';

    if ($action === 'UPDATE_PASSWORD') {
        $curPass = trim($input['currentPassword'] ?? '');
        $newPass = trim($input['newPassword'] ?? '');

        if (empty($newPass) || strlen($newPass) < 6) {
            Response::error("New password must be at least 6 characters", 400);
        }

        if ($db) {
            try {
                $astmt = $db->prepare("SELECT * FROM admin_users WHERE username = 'admin' LIMIT 1");
                $astmt->execute();
                $admin = $astmt->fetch();

                if ($admin) {
                    $valid = password_verify($curPass, $admin['password']) || ($admin['password'] === $curPass);
                    if (!$valid && !empty($curPass)) {
                        Response::error("Current password does not match", 401);
                    }

                    $newHash = password_hash($newPass, PASSWORD_BCRYPT);
                    $upd = $db->prepare("UPDATE admin_users SET password = :p WHERE id = :id");
                    $upd->execute([':p' => $newHash, ':id' => $admin['id']]);

                    Response::success([], "Admin password changed successfully");
                } else {
                    Response::error("Admin user not found", 404);
                }
            } catch (\Exception $e) {
                Response::error("Failed to update password: " . $e->getMessage(), 500);
            }
        } else {
            Response::success([], "Admin password updated (demo mode)");
        }
    }

    if ($db) {
        try {
            // Fetch current settings
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
                if (isset($input['amountUnit'])) $current['amountUnit'] = trim($input['amountUnit']);
                if (isset($input['minDepositAmount'])) $current['minDepositAmount'] = floatval($input['minDepositAmount']);
                if (isset($input['minWithdrawalAmount'])) $current['minWithdrawalAmount'] = floatval($input['minWithdrawalAmount']);

                // Also update GATEWAY_RUPAYEX in system_settings if RupayEx credentials are provided
                $rupayData = [
                    'channel'      => $input['paymentChannel'] ?? 'RUPAYEX',
                    'merchantCode' => $input['lgpayMerchantId'] ?? 'RUPAYEX_STAKE',
                    'apiKey'       => $input['lgpayApiKey'] ?? '',
                    'apiUrl'       => $input['lgpayBaseUrl'] ?? 'https://api.rupayex.com/v1/order/create',
                    'status'       => 'ACTIVE'
                ];
                $rJson = json_encode($rupayData, JSON_UNESCAPED_SLASHES);
                $db->prepare("INSERT INTO system_settings (`id`, `key`, `value`, `description`, `updatedAt`) VALUES ('setting_gateway_rupayex', 'GATEWAY_RUPAYEX', :v, 'RupayEx gateway settings', NOW(3)) ON DUPLICATE KEY UPDATE `value` = :v2, `updatedAt` = NOW(3)")
                   ->execute([':v' => $rJson, ':v2' => $rJson]);
            } elseif ($action === 'UPDATE_LIMITS') {
                if (isset($input['minDepositAmount'])) $current['minDepositAmount'] = floatval($input['minDepositAmount']);
                if (isset($input['minWithdrawalAmount'])) $current['minWithdrawalAmount'] = floatval($input['minWithdrawalAmount']);
                if (isset($input['quickAmounts']) && is_array($input['quickAmounts'])) {
                    $current['quickAmounts'] = array_map('intval', $input['quickAmounts']);
                }

                $limitsData = [
                    'minDepositAmount'    => $current['minDepositAmount'],
                    'minWithdrawalAmount' => $current['minWithdrawalAmount'],
                    'quickAmounts'        => $current['quickAmounts'] ?? [300, 500, 1000, 5000, 10000, 25000]
                ];
                $lJson = json_encode($limitsData, JSON_UNESCAPED_SLASHES);
                $db->prepare("INSERT INTO system_settings (`id`, `key`, `value`, `description`, `updatedAt`) VALUES ('setting_limits', 'LIMITS', :v, 'Platform limits', NOW(3)) ON DUPLICATE KEY UPDATE `value` = :v2, `updatedAt` = NOW(3)")
                   ->execute([':v' => $lJson, ':v2' => $lJson]);
            } else {
                $current = array_merge($current, $input);
            }

            $jsonStr = json_encode($current, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            $upd = $db->prepare("INSERT INTO system_settings (`id`, `key`, `value`, `description`, `updatedAt`) VALUES ('setting_system_upi', 'SYSTEM_UPI', :val, 'Platform UPI & Gateway Config', NOW(3)) ON DUPLICATE KEY UPDATE `value` = :val2, `updatedAt` = NOW(3)");
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
