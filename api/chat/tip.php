<?php
/**
 * Stake Casino - /api/chat/tip Handler
 * Transfers tip between community chat users
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
$rawSenderId = $input['senderId'] ?? null;
$senderId = Auth::resolveUserId($rawSenderId);
$recipientUsername = Validator::sanitizeString($input['recipientUsername'] ?? '');
$amount = floatval($input['amount'] ?? 0);

if ($amount <= 0) {
    Response::error("Tip amount must be greater than zero", 400);
}

if (empty($recipientUsername)) {
    Response::error("Recipient username is required", 400);
}

$db = Database::getConnection();

if ($db) {
    try {
        $db->beginTransaction();

        // 1. Resolve sender
        $senderAcc = Auth::getOrCreateUser(['userId' => $senderId]);
        $sUid = $senderAcc['user']['id'];

        $wstmt = $db->prepare("SELECT balance FROM wallets WHERE userId = :uid FOR UPDATE");
        $wstmt->execute([':uid' => $sUid]);
        $senderBalance = floatval($wstmt->fetchColumn() ?: 0);

        if ($senderBalance < $amount) {
            $db->rollBack();
            Response::error("Insufficient balance. Available: ₹" . number_format($senderBalance, 2), 400);
        }

        // 2. Resolve recipient
        $rstmt = $db->prepare("SELECT id, username FROM users WHERE username = :uname LIMIT 1");
        $rstmt->execute([':uname' => $recipientUsername]);
        $recipient = $rstmt->fetch();

        if (!$recipient) {
            $db->rollBack();
            Response::error("User '@{$recipientUsername}' not found", 404);
        }

        $rUid = $recipient['id'];

        if ($sUid === $rUid) {
            $db->rollBack();
            Response::error("You cannot tip yourself", 400);
        }

        // 3. Deduct from sender
        $deduct = $db->prepare("UPDATE wallets SET balance = balance - :amt, updatedAt = NOW(3) WHERE userId = :uid");
        $deduct->execute([':amt' => $amount, ':uid' => $sUid]);

        // 4. Credit recipient
        $credit = $db->prepare("UPDATE wallets SET balance = balance + :amt, updatedAt = NOW(3) WHERE userId = :uid");
        $credit->execute([':amt' => $amount, ':uid' => $rUid]);

        $db->commit();

        Response::success([
            'message'           => "Successfully sent ₹" . number_format($amount, 2) . " tip to @{$recipientUsername}",
            'amount'            => $amount,
            'recipientUsername' => $recipientUsername
        ]);
    } catch (\Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        error_log("[Chat Tip Error] " . $e->getMessage());
        Response::error("Failed to send tip: " . $e->getMessage(), 500);
    }
} else {
    // Session demo mode
    Response::success([
        'message'           => "Tip sent to @{$recipientUsername} (session mode)",
        'amount'            => $amount,
        'recipientUsername' => $recipientUsername
    ]);
}
