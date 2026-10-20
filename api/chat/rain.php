<?php
/**
 * Stake Casino - /api/chat/rain Handler
 * Claims community chat rain drop and credits user wallet
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
$rawUserId = $input['userId'] ?? null;
$userId = Auth::resolveUserId($rawUserId);
$amount = floatval($input['amount'] ?? 0);
$rainId = Validator::sanitizeString($input['rainId'] ?? '');

if ($amount <= 0) {
    Response::error("Invalid rain amount", 400);
}

$db = Database::getConnection();

if ($db) {
    try {
        $db->beginTransaction();

        $account = Auth::getOrCreateUser(['userId' => $userId]);
        $targetUid = $account['user']['id'];

        $stmt = $db->prepare("UPDATE wallets SET balance = balance + :amt, updatedAt = NOW(3) WHERE userId = :uid");
        $stmt->execute([
            ':amt' => $amount,
            ':uid' => $targetUid
        ]);

        $db->commit();

        Response::success([
            'message' => 'Rain claimed successfully',
            'amount'  => $amount,
            'rainId'  => $rainId
        ]);
    } catch (\Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        error_log("[Chat Rain Error] " . $e->getMessage());
        Response::error("Failed to claim rain: " . $e->getMessage(), 500);
    }
} else {
    // Session fallback
    $_SESSION['demo_balance'] = floatval($_SESSION['demo_balance'] ?? 0) + $amount;
    Response::success([
        'message' => 'Rain claimed successfully (session)',
        'amount'  => $amount,
        'rainId'  => $rainId
    ]);
}
