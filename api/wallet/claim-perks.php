<?php
/**
 * Stake Casino - /api/wallet/claim-perks Handler
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
$perkType = $input['perkType'] ?? 'RAKEBACK';

$bonusAmount = rand(50, 250); // Generous VIP rakeback perk

$db = Database::getConnection();
if ($db) {
    $upd = $db->prepare("UPDATE wallets SET balance = balance + :amt, updatedAt = NOW(3) WHERE userId = :uid");
    $upd->execute([':amt' => $bonusAmount, ':uid' => $user['id']]);

    $wstmt = $db->prepare("SELECT balance FROM wallets WHERE userId = :uid LIMIT 1");
    $wstmt->execute([':uid' => $user['id']]);
    $newBal = floatval($wstmt->fetchColumn() ?: 0.0);

    Response::success([
        'message' => "Successfully claimed ₹{$bonusAmount} {$perkType} bonus!",
        'claimedAmount' => $bonusAmount,
        'balance' => $newBal
    ]);
} else {
    $_SESSION['demo_balance'] = floatval($_SESSION['demo_balance'] ?? DEFAULT_INITIAL_BALANCE) + $bonusAmount;
    Response::success([
        'message' => "Successfully claimed ₹{$bonusAmount} {$perkType} bonus in demo mode!",
        'claimedAmount' => $bonusAmount,
        'balance' => floatval($_SESSION['demo_balance'])
    ]);
}
