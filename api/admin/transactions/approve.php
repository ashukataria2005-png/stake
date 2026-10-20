<?php
/**
 * Stake Casino - /api/admin/transactions/approve Handler
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
$txId = Validator::sanitizeString($input['transactionId'] ?? $input['id'] ?? '');

if (empty($txId)) {
    Response::error("Transaction ID is required", 400);
}

$db = Database::getConnection();
if (!$db) {
    Response::success([], "Simulated approval in demo mode");
}

try {
    $db->beginTransaction();

    // Check deposits first
    $dstmt = $db->prepare("SELECT * FROM deposits WHERE id = :id FOR UPDATE");
    $dstmt->execute([':id' => $txId]);
    $deposit = $dstmt->fetch();

    if ($deposit) {
        if ($deposit['status'] === 'PENDING') {
            $upd = $db->prepare("UPDATE deposits SET status = 'APPROVED', updatedAt = NOW(3) WHERE id = :id");
            $upd->execute([':id' => $txId]);

            // Credit wallet
            $wupd = $db->prepare("UPDATE wallets SET balance = balance + :amt, totalDeposited = totalDeposited + :amt, approvedDepositCount = approvedDepositCount + 1, updatedAt = NOW(3) WHERE userId = :uid");
            $wupd->execute([':amt' => $deposit['amount'], ':uid' => $deposit['userId']]);
        }
        $db->commit();
        Response::success([], "Deposit approved and credited successfully");
    }

    // Check withdrawals
    $wstmt = $db->prepare("SELECT * FROM withdrawals WHERE id = :id FOR UPDATE");
    $wstmt->execute([':id' => $txId]);
    $withdrawal = $wstmt->fetch();

    if ($withdrawal) {
        $upd = $db->prepare("UPDATE withdrawals SET status = 'APPROVED', updatedAt = NOW(3) WHERE id = :id");
        $upd->execute([':id' => $txId]);

        $db->commit();
        Response::success([], "Withdrawal approved successfully");
    }

    $db->rollBack();
    Response::error("Transaction not found", 404);
} catch (\Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    error_log("[Transaction Approve Error] " . $e->getMessage());
    Response::error("Failed to approve transaction: " . $e->getMessage(), 500);
}
