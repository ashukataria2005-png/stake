<?php
/**
 * Stake Casino - /api/admin/users/balance Handler
 * Admin manual balance adjustment (Supports ADD, DEDUCT, and SET)
 */

use Stake\Config\Database;
use Stake\Core\Response;
use Stake\Core\Validator;

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/constants.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../core/Validator.php';

Response::handleOptions();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method not allowed", 405);
}

$input = Validator::getRequestData();
$userId = Validator::sanitizeString($input['userId'] ?? '');
$amount = Validator::toFloat($input['amount'] ?? $input['balance'] ?? 0);
$mode = strtoupper(trim($input['mode'] ?? 'SET'));
$remarks = Validator::sanitizeString($input['remarks'] ?? 'Admin direct adjustment');

if (empty($userId)) {
    Response::error("User ID is required", 400);
}

if ($amount < 0) {
    Response::error("Amount must be non-negative", 400);
}

$db = Database::getConnection();
$finalBalance = $amount;

if ($db) {
    try {
        $db->beginTransaction();

        $wstmt = $db->prepare("SELECT * FROM wallets WHERE userId = :uid FOR UPDATE");
        $wstmt->execute([':uid' => $userId]);
        $wallet = $wstmt->fetch();

        if (!$wallet) {
            // Create companion wallet if none exists
            $walId = 'wal_' . substr(md5(uniqid('', true)), 0, 14);
            $initial = ($mode === 'ADD' || $mode === 'SET') ? $amount : 0.0;
            $wins = $db->prepare("INSERT INTO wallets (id, userId, balance, currency, totalDeposited, totalWithdrawn, totalWagered, approvedDepositCount, unlockedBonusTier, createdAt, updatedAt) VALUES (:wid, :uid, :bal, 'INR', 0, 0, 0, 0, 1, NOW(3), NOW(3))");
            $wins->execute([':wid' => $walId, ':uid' => $userId, ':bal' => $initial]);
            $finalBalance = $initial;
        } else {
            $currBal = floatval($wallet['balance']);
            if ($mode === 'ADD') {
                $finalBalance = round($currBal + $amount, 2);
            } elseif ($mode === 'DEDUCT') {
                $finalBalance = max(0.0, round($currBal - $amount, 2));
            } else {
                $finalBalance = round($amount, 2);
            }

            $upd = $db->prepare("UPDATE wallets SET balance = :bal, updatedAt = NOW(3) WHERE userId = :uid");
            $upd->execute([':bal' => $finalBalance, ':uid' => $userId]);
        }

        $db->commit();
    } catch (\Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        error_log("[Admin Balance Adjustment Error] " . $e->getMessage());
        Response::error("Failed to update user balance: " . $e->getMessage(), 500);
    }
}

Response::success([
    'balance' => $finalBalance,
    'userId'  => $userId,
    'mode'    => $mode
], "Wallet balance updated to ₹" . number_format($finalBalance, 2));
