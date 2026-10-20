<?php
/**
 * Stake Casino - /api/admin/users/balance Handler
 * Admin manual balance adjustment
 */

use Stake\Config\Database;
use Stake\Core\Response;
use Stake\Core\Validator;

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/constants.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../core/Validator.php';

Response::handleOptions();

$input = Validator::getRequestData();
$userId = Validator::sanitizeString($input['userId'] ?? '');
$newBalance = Validator::toFloat($input['balance'] ?? $input['amount'] ?? 0);

if (empty($userId)) {
    Response::error("User ID is required", 400);
}

$db = Database::getConnection();
if ($db) {
    try {
        $upd = $db->prepare("UPDATE wallets SET balance = :bal, updatedAt = NOW(3) WHERE userId = :uid");
        $upd->execute([':bal' => $newBalance, ':uid' => $userId]);
    } catch (\Exception $e) {
        Response::error("Failed to update user balance: " . $e->getMessage(), 500);
    }
}

Response::success(['balance' => $newBalance], "Wallet balance updated to ₹" . number_format($newBalance, 2));
