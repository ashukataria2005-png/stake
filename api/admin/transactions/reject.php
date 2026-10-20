<?php
/**
 * Stake Casino - /api/admin/transactions/reject Handler
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
    Response::success([], "Simulated rejection in demo mode");
}

try {
    $db->beginTransaction();

    // Check deposits
    $dstmt = $db->prepare("SELECT * FROM deposits WHERE id = :id FOR UPDATE");
    $dstmt->execute([':id' => $txId]);
    $deposit = $dstmt->fetch();

    if ($deposit) {
        $upd = $db->prepare("UPDATE deposits SET status = 'REJECTED', updatedAt = NOW(3) WHERE id = :id");
        $upd->execute([':id' => $txId]);

        $db->commit();
        Response::success([], "Deposit rejected");
    }

    // Check withdrawals (refund if rejected from pending)
    $wstmt = $db->prepare("SELECT * FROM withdrawals WHERE id = :id FOR UPDATE");
    $wstmt->execute([':id' => $txId]);
    $withdrawal = $wstmt->fetch();

    if ($withdrawal) {
        if ($withdrawal['status'] === 'PENDING') {
            $upd = $db->prepare("UPDATE withdrawals SET status = 'REJECTED', updatedAt = NOW(3) WHERE id = :id");
            $upd->execute([':id' => $txId]);

            // Refund balance back to user
            $wupd = $db->prepare("UPDATE wallets SET balance = balance + :amt, totalWithdrawn = GREATEST(0, totalWithdrawn - :amt), updatedAt = NOW(3) WHERE userId = :uid");
            $wupd->execute([':amt' => $withdrawal['amount'], ':uid' => $withdrawal['userId']]);
        }
        $db->commit();
        Response::success([], "Withdrawal rejected and amount refunded to player wallet");
    }

    $db->rollBack();
    Response::error("Transaction not found", 404);
} catch (\Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    error_log("[Transaction Reject Error] " . $e->getMessage());
    Response::error("Failed to reject transaction: " . $e->getMessage(), 500);
}
