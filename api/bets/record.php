<?php
/**
 * Stake Casino - /api/bets/record Handler
 * Writes round outcomes into game_history, increments totalWagered, syncs wallet
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
$wallet = $userData['wallet'];

$gameId = Validator::sanitizeString($input['gameId'] ?? $input['gameName'] ?? $input['gameSlug'] ?? 'general');
$wager = Validator::toFloat($input['wager'] ?? $input['betAmount'] ?? 0);
$payout = Validator::toFloat($input['payout'] ?? $input['payoutAmount'] ?? 0);

if (empty($gameId) || $wager <= 0) {
    Response::error("Invalid bet parameters: gameId and positive wager required", 400);
}

$multiplier = Validator::toFloat($input['multiplier'] ?? $input['payoutMultiplier'] ?? ($wager > 0 ? round($payout / $wager, 2) : 0));
$isWin = isset($input['isWin']) ? filter_var($input['isWin'], FILTER_VALIDATE_BOOLEAN) : ($payout > $wager);
$gameData = $input['gameData'] ?? [];
$gameDataJson = is_string($gameData) ? $gameData : json_encode($gameData, JSON_UNESCAPED_SLASHES);

$updateWallet = isset($input['updateWallet']) ? filter_var($input['updateWallet'], FILTER_VALIDATE_BOOLEAN) : true;
$directBalance = isset($input['balance']) && is_numeric($input['balance']) ? floatval($input['balance']) : null;

$db = Database::getConnection();

if ($db) {
    try {
        $db->beginTransaction();

        $betId = 'bet_' . substr(md5(uniqid('', true)), 0, 14);

        // 1. Insert into game_history
        $hstmt = $db->prepare("INSERT INTO game_history (id, userId, gameId, wager, payout, multiplier, isWin, gameData, createdAt) VALUES (:id, :uid, :gid, :w, :p, :m, :win, :data, NOW(3))");
        $hstmt->execute([
            ':id'   => $betId,
            ':uid'  => $user['id'],
            ':gid'  => $gameId,
            ':w'    => $wager,
            ':p'    => $payout,
            ':m'    => $multiplier,
            ':win'  => $isWin ? 1 : 0,
            ':data' => $gameDataJson
        ]);

        // Also insert into bets table if present for multi-table compatibility
        try {
            $bcheck = $db->query("SHOW TABLES LIKE 'bets'")->fetch();
            if ($bcheck) {
                $bstmt = $db->prepare("INSERT INTO bets (id, userId, gameId, wager, payout, multiplier, isWin, gameData, createdAt) VALUES (:id, :uid, :gid, :w, :p, :m, :win, :data, NOW(3))");
                $bstmt->execute([
                    ':id'   => $betId,
                    ':uid'  => $user['id'],
                    ':gid'  => $gameId,
                    ':w'    => $wager,
                    ':p'    => $payout,
                    ':m'    => $multiplier,
                    ':win'  => $isWin ? 1 : 0,
                    ':data' => $gameDataJson
                ]);
            }
        } catch (\Exception $e) {}

        // 2. Lock & update wallet
        $wstmt = $db->prepare("SELECT * FROM wallets WHERE userId = :uid FOR UPDATE");
        $wstmt->execute([':uid' => $user['id']]);
        $currWallet = $wstmt->fetch() ?: $wallet;

        $currentBal = floatval($currWallet['balance']);
        $newBal = $currentBal;

        if ($updateWallet) {
            if ($directBalance !== null) {
                $newBal = max(0.0, round($directBalance, 2));
            } else {
                $netDelta = $payout - $wager;
                $newBal = max(0.0, round($currentBal + $netDelta, 2));
            }

            $upd = $db->prepare("UPDATE wallets SET balance = :bal, totalWagered = totalWagered + :w, updatedAt = NOW(3) WHERE userId = :uid");
            $upd->execute([
                ':bal' => $newBal,
                ':w'   => $wager,
                ':uid' => $user['id']
            ]);
        } else {
            // Only increment totalWagered
            $upd = $db->prepare("UPDATE wallets SET totalWagered = totalWagered + :w, updatedAt = NOW(3) WHERE userId = :uid");
            $upd->execute([':w' => $wager, ':uid' => $user['id']]);
        }

        $wstmt->execute([':uid' => $user['id']]);
        $refreshedWallet = $wstmt->fetch();
        $totalWagered = floatval($refreshedWallet['totalWagered'] ?? 0.0);
        $finalBalance = floatval($refreshedWallet['balance'] ?? $newBal);

        $db->commit();

        Response::success([
            'bet' => [
                'id'         => $betId,
                'gameId'     => $gameId,
                'wager'      => $wager,
                'payout'     => $payout,
                'multiplier' => $multiplier,
                'isWin'      => $isWin
            ],
            'balance'      => $finalBalance,
            'totalWagered' => $totalWagered
        ]);
    } catch (\Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        error_log("[Bet Record Error] " . $e->getMessage());
        Response::error("Failed to record bet: " . $e->getMessage(), 500);
    }
} else {
    // Demo session mode
    $demoBal = floatval($_SESSION['demo_balance'] ?? DEFAULT_INITIAL_BALANCE);
    $demoWagered = floatval($_SESSION['demo_wagered'] ?? 0.0) + $wager;
    if ($updateWallet) {
        $demoBal = max(0.0, round($demoBal - $wager + $payout, 2));
        $_SESSION['demo_balance'] = $demoBal;
    }
    $_SESSION['demo_wagered'] = $demoWagered;

    Response::success([
        'bet' => [
            'id'         => 'bet_demo_' . time(),
            'gameId'     => $gameId,
            'wager'      => $wager,
            'payout'     => $payout,
            'multiplier' => $multiplier,
            'isWin'      => $isWin
        ],
        'balance'      => $demoBal,
        'totalWagered' => $demoWagered
    ]);
}
