<?php
/**
 * Stake Casino - /api/wallet/balance Handler
 * Synchronizes balance, totalWagered, VIP tier, and user state
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

$input = Validator::getRequestData();
$userData = Auth::getOrCreateUser($input);
$user = $userData['user'];
$wallet = $userData['wallet'];

function calculateVipInfo(float $wagered): array {
    $tiers = [
        ['name' => 'Unranked', 'threshold' => 0, 'next' => 10000, 'icon' => '🛡️', 'nextIcon' => '🥉'],
        ['name' => 'Bronze', 'threshold' => 10000, 'next' => 50000, 'icon' => '🥉', 'nextIcon' => '🥈'],
        ['name' => 'Silver', 'threshold' => 50000, 'next' => 100000, 'icon' => '🥈', 'nextIcon' => '🥇'],
        ['name' => 'Gold', 'threshold' => 100000, 'next' => 250000, 'icon' => '🥇', 'nextIcon' => '💎'],
        ['name' => 'Platinum', 'threshold' => 250000, 'next' => 1000000, 'icon' => '💎', 'nextIcon' => '👑'],
        ['name' => 'Diamond', 'threshold' => 1000000, 'next' => 10000000, 'icon' => '👑', 'nextIcon' => '🏆']
    ];

    $current = $tiers[0];
    for ($i = count($tiers) - 1; $i >= 0; $i--) {
        if ($wagered >= $tiers[$i]['threshold']) {
            $current = $tiers[$i];
            break;
        }
    }

    $range = max(1, $current['next'] - $current['threshold']);
    $pct = min(100.0, max(0.0, (($wagered - $current['threshold']) / $range) * 100.0));

    $nextTierName = 'Max Level';
    foreach ($tiers as $t) {
        if ($t['threshold'] === $current['next']) {
            $nextTierName = $t['name'];
            break;
        }
    }

    return [
        'currentTier'      => $current['name'],
        'nextTier'         => $nextTierName,
        'tierIcon'         => $current['icon'],
        'nextTierIcon'     => $current['nextIcon'],
        'progressPercent'  => round($pct, 2),
        'progressFormatted'=> number_format($pct, 2) . '%',
        'wagered'          => $wagered,
        'nextThreshold'    => $current['next'],
        'currentThreshold' => $current['threshold']
    ];
}

$db = Database::getConnection();

if ($db) {
    // Live refresh from wallets table
    $wstmt = $db->prepare("SELECT * FROM wallets WHERE userId = :uid LIMIT 1");
    $wstmt->execute([':uid' => $user['id']]);
    $liveWallet = $wstmt->fetch() ?: $wallet;

    // Count approved deposits
    $dstmt = $db->prepare("SELECT COUNT(*) AS cnt FROM deposits WHERE userId = :uid AND status = 'APPROVED'");
    $dstmt->execute([':uid' => $user['id']]);
    $approvedCount = intval($dstmt->fetchColumn() ?: ($liveWallet['approvedDepositCount'] ?? 0));

    $unlockedBonusTier = min(4, max(1, $approvedCount + 1));
    $safeBalance = max(0.0, floatval($liveWallet['balance']));
    $totalWagered = max(0.0, floatval($liveWallet['totalWagered']));
    $totalDeposited = max(0.0, floatval($liveWallet['totalDeposited']));
    $totalWithdrawn = max(0.0, floatval($liveWallet['totalWithdrawn']));

    $vip = calculateVipInfo($totalWagered);

    // Fetch active gateway mode from system_settings
    $activeGateway = 'MANUAL';
    $gatewayMode = 'MANUAL';
    try {
        $gstmt = $db->prepare("SELECT value FROM system_settings WHERE `key` = 'SYSTEM_UPI' LIMIT 1");
        $gstmt->execute();
        $graw = $gstmt->fetchColumn();
        if ($graw) {
            $gparsed = json_decode($graw, true);
            $chan = strtoupper(trim($gparsed['paymentChannel'] ?? ''));
            $gmode = strtoupper(trim($gparsed['gatewayMode'] ?? ''));
            if ($chan === 'LGPAY' || $gmode === 'LGPAY' || $gmode === 'LGPAY_AUTO') {
                $activeGateway = 'LGPAY';
                $gatewayMode = 'LGPAY_AUTO';
            }
        }
    } catch (\Exception $e) {}

    Response::success([
        'balance'              => $safeBalance,
        'currency'             => $liveWallet['currency'] ?? 'INR',
        'gatewayMode'          => $gatewayMode,
        'activeGateway'        => $activeGateway,
        'totalDeposited'       => $totalDeposited,
        'totalWithdrawn'       => $totalWithdrawn,
        'totalWagered'         => $totalWagered,
        'approvedDepositCount' => $approvedCount,
        'unlockedBonusTier'    => $unlockedBonusTier,
        'vip'                  => $vip,
        'wallet' => [
            'id'                   => $liveWallet['id'],
            'currency'             => $liveWallet['currency'] ?? 'INR',
            'balance'              => $safeBalance,
            'totalDeposited'       => $totalDeposited,
            'totalWithdrawn'       => $totalWithdrawn,
            'totalWagered'         => $totalWagered,
            'depositCount'         => $approvedCount,
            'approvedDepositCount' => $approvedCount,
            'unlockedBonusTier'    => $unlockedBonusTier
        ],
        'user' => [
            'id'       => $user['id'],
            'username' => $user['username'],
            'email'    => $user['email'] ?? ($user['username'] . '@stake.internal'),
            'role'     => $user['role'] ?? 'USER',
            'luckMode' => $user['luckMode'] ?? 'FAIR'
        ]
    ]);
} else {
    // Demo session mode
    $safeBalance = floatval($_SESSION['demo_balance'] ?? DEFAULT_INITIAL_BALANCE);
    $totalWagered = floatval($_SESSION['demo_wagered'] ?? 0.0);
    $vip = calculateVipInfo($totalWagered);

    $demoDepositCount = intval($_SESSION['demo_deposit_count'] ?? 0);
    $demoTier = min(4, max(1, $demoDepositCount + 1));

    Response::success([
        'balance'              => $safeBalance,
        'currency'             => 'INR',
        'totalDeposited'       => $safeBalance,
        'totalWithdrawn'       => 0.0,
        'totalWagered'         => $totalWagered,
        'approvedDepositCount' => $demoDepositCount,
        'unlockedBonusTier'    => $demoTier,
        'vip'                  => $vip,
        'wallet' => [
            'id'                   => 'wal_demo',
            'currency'             => 'INR',
            'balance'              => $safeBalance,
            'totalDeposited'       => $safeBalance,
            'totalWithdrawn'       => 0.0,
            'totalWagered'         => $totalWagered,
            'depositCount'         => $demoDepositCount,
            'approvedDepositCount' => $demoDepositCount,
            'unlockedBonusTier'    => $demoTier
        ],
        'user' => [
            'id'       => $user['id'],
            'username' => $user['username'],
            'role'     => 'USER',
            'luckMode' => 'FAIR'
        ]
    ]);
}
