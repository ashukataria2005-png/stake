<?php
/**
 * Stake Casino - /api/settings Handler
 * Public platform settings endpoint (Gateway mode, Limits, Quick Amounts, UPI)
 */

use Stake\Config\Database;
use Stake\Core\Response;

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/constants.php';
require_once __DIR__ . '/core/Response.php';

Response::handleOptions();

$defaultSettings = [
    'upiId'               => 'stakeofficial@upi',
    'upiName'             => 'Stake Gaming',
    'gatewayMode'         => 'MANUAL',
    'activeGateway'       => 'MANUAL',
    'paymentChannel'      => 'MANUAL_QR',
    'minDepositAmount'    => 100,
    'minWithdrawalAmount' => 500,
    'quickAmounts'        => [300, 500, 1000, 5000, 10000, 25000]
];

$db = Database::getConnection();

if ($db) {
    try {
        $stmt = $db->prepare("SELECT `key`, `value` FROM system_settings WHERE `key` IN ('SYSTEM_UPI', 'LIMITS')");
        $stmt->execute();
        $rows = $stmt->fetchAll();
        foreach ($rows as $r) {
            $val = json_decode($r['value'], true);
            if (is_array($val)) {
                $defaultSettings = array_merge($defaultSettings, $val);
            }
        }
    } catch (\Exception $e) {
        error_log("[Public Settings Fetch Error] " . $e->getMessage());
    }
}

// Normalize gateway mode & active gateway
$chan = strtoupper(trim($defaultSettings['paymentChannel'] ?? ''));
$mode = strtoupper(trim($defaultSettings['gatewayMode'] ?? ''));

$isLgpay = ($chan === 'LGPAY' || $mode === 'LGPAY' || $mode === 'LGPAY_AUTO');
$activeGateway = $isLgpay ? 'LGPAY' : 'MANUAL';
$gatewayMode = $isLgpay ? 'LGPAY_AUTO' : 'MANUAL';

$defaultSettings['gatewayMode'] = $gatewayMode;
$defaultSettings['activeGateway'] = $activeGateway;

Response::success([
    'gatewayMode'   => $activeGateway,
    'activeGateway' => $activeGateway,
    'settings'      => $defaultSettings
]);
