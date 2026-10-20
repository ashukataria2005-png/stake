<?php
/**
 * Stake Casino - /api/wallet/withdraw Handler
 * Atomic transaction strictly preserving remaining wallet balance
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
$method = Validator::sanitizeString($input['method'] ?? 'UPI');
$details = $input['details'] ?? [];

$db = Database::getConnection();

// Check system limit for minimum withdrawal
$minWithdrawal = MIN_WITHDRAWAL_AMOUNT;
if ($db) {
    try {
        $sstmt = $db->prepare("SELECT value FROM system_settings WHERE `key` = 'LIMITS' OR `key` = 'SYSTEM_UPI' LIMIT 1");
        $sstmt->execute();
        $rawSetting = $sstmt->fetchColumn();
        if ($rawSetting) {
            $parsed = json_decode($rawSetting, true);
            if (isset($parsed['minWithdrawalAmount']) && is_numeric($parsed['minWithdrawalAmount'])) {
                $minWithdrawal = max(1.0, floatval($parsed['minWithdrawalAmount']));
            }
        }
    } catch (\Exception $e) {}
}

if ($amount < $minWithdrawal) {
    Response::error("Minimum withdrawal amount is ₹" . number_format($minWithdrawal, 2), 400);
}

if ($db) {
    try {
        $db->beginTransaction();

        // 1. Lock and fetch current balance
        $stmt = $db->prepare("SELECT * FROM wallets WHERE userId = :uid FOR UPDATE");
        $stmt->execute([':uid' => $user['id']]);
        $wallet = $stmt->fetch();

        if (!$wallet) {
            $db->rollBack();
            Response::error("Wallet not found", 404);
        }

        $currentBal = floatval($wallet['balance']);
        if ($currentBal < $amount) {
            $db->rollBack();
            Response::error("Insufficient balance. Current balance: ₹" . number_format($currentBal, 2), 400);
        }

        // 2. Compute exact remaining balance (PRESERVE REMAINING BALANCE)
        $remainingBal = max(0.0, round($currentBal - $amount, 2));

        // 3. Update wallet balance to remaining balance & increment totalWithdrawn
        $upd = $db->prepare("UPDATE wallets SET balance = :rem, totalWithdrawn = totalWithdrawn + :amt, updatedAt = NOW(3) WHERE userId = :uid");
        $upd->execute([
            ':rem' => $remainingBal,
            ':amt' => $amount,
            ':uid' => $user['id']
        ]);

        // 4. Record in withdrawals table with status PENDING
        $wdId = 'wd_' . substr(md5(uniqid('', true)), 0, 14);
        $wdetails = is_string($details) ? $details : json_encode($details, JSON_UNESCAPED_SLASHES);

        $wstmt = $db->prepare("INSERT INTO withdrawals (id, userId, amount, currency, status, payoutMethod, accountDetails, remark, createdAt, updatedAt) VALUES (:id, :uid, :amount, 'INR', 'PENDING', :method, :details, 'User requested withdrawal', NOW(3), NOW(3))");
        $wstmt->execute([
            ':id'      => $wdId,
            ':uid'     => $user['id'],
            ':amount'  => $amount,
            ':method'  => strtoupper($method),
            ':details' => $wdetails
        ]);

        $db->commit();

        Response::success([
            'message' => "Withdrawal request of ₹" . number_format($amount, 2) . " submitted successfully!",
            'balance' => $remainingBal,
            'wallet'  => [
                'id'       => $wallet['id'],
                'currency' => $wallet['currency'] ?? 'INR',
                'balance'  => $remainingBal
            ]
        ]);
    } catch (\Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        error_log("[Withdrawal Error] " . $e->getMessage());
        Response::error("Failed to process withdrawal request: " . $e->getMessage(), 500);
    }
} else {
    // Demo session mode fallback
    $currentBal = floatval($_SESSION['demo_balance'] ?? DEFAULT_INITIAL_BALANCE);
    if ($currentBal < $amount) {
        Response::error("Insufficient balance in demo session", 400);
    }
    $remainingBal = max(0.0, round($currentBal - $amount, 2));
    $_SESSION['demo_balance'] = $remainingBal;

    Response::success([
        'message' => "Demo withdrawal completed successfully",
        'balance' => $remainingBal,
        'wallet'  => [
            'balance' => $remainingBal
        ]
    ]);
}
