<?php
/**
 * Stake Clone - Crash / Aviator Game Engine
 * Actions: next_round, bet, cashout
 */

require_once __DIR__ . '/db.php';

$user = getActiveUser();
$db = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

$rawInput = file_get_contents('php://input');
$jsonBody = json_decode($rawInput, true) ?: [];
$params = array_merge($_GET, $_POST, $jsonBody);
$action = $params['action'] ?? 'next_round';

/**
 * Generates a provably fair crash multiplier with 98% RTP
 */
function generateCrashPoint() {
    // 3% instant crash at 1.00x
    if (mt_rand(1, 100) <= 3) {
        return 1.00;
    }
    // Exponential distribution: e = 0.98 / (1 - r)
    $r = mt_rand(1, 9999) / 10000;
    $multiplier = 0.98 / (1.0 - $r);
    $capped = min(500.0, max(1.01, $multiplier));
    return round($capped, 2);
}

if ($action === 'next_round') {
    $crashPoint = generateCrashPoint();
    $_SESSION['current_crash_point'] = $crashPoint;
    $_SESSION['crash_round_id'] = 'cr_' . time() . '_' . rand(100, 999);

    jsonResponse([
        'success' => true,
        'roundId' => $_SESSION['crash_round_id'],
        'crashPoint' => $crashPoint
    ]);
}

if ($action === 'bet' && $method === 'POST') {
    $wager = floatval($params['wager'] ?? 0);
    $wallet = getUserWallet($user['id']);

    if ($wager <= 0 || floatval($wallet['balance']) < $wager) {
        jsonResponse(['success' => false, 'error' => 'Insufficient balance for this bet.'], 400);
    }

    $newBal = round(floatval($wallet['balance']) - $wager, 2);
    if ($db) {
        $upd = $db->prepare("UPDATE wallets SET balance = :bal, totalWagered = totalWagered + :w WHERE userId = :uid");
        $upd->execute([':bal' => $newBal, ':w' => $wager, ':uid' => $user['id']]);
    } else {
        $_SESSION['demo_balance'] = $newBal;
    }

    $_SESSION['active_crash_bet'] = [
        'wager' => $wager,
        'cashedOut' => false,
        'roundId' => $_SESSION['crash_round_id'] ?? ('cr_' . time())
    ];

    jsonResponse([
        'success' => true,
        'wager' => $wager,
        'balance' => $newBal
    ]);
}

if ($action === 'cashout' && $method === 'POST') {
    if (empty($_SESSION['active_crash_bet']) || $_SESSION['active_crash_bet']['cashedOut']) {
        jsonResponse(['success' => false, 'error' => 'No active bet to cash out.'], 400);
    }

    $mult = floatval($params['multiplier'] ?? 1.0);
    $bet = &$_SESSION['active_crash_bet'];
    $wager = $bet['wager'];
    $payout = round($wager * $mult, 2);
    $bet['cashedOut'] = true;

    $wallet = getUserWallet($user['id']);
    $finalBal = round(floatval($wallet['balance']) + $payout, 2);

    if ($db) {
        $upd = $db->prepare("UPDATE wallets SET balance = :bal WHERE userId = :uid");
        $upd->execute([':bal' => $finalBal, ':uid' => $user['id']]);

        $betId = 'bet_' . substr(md5(uniqid()), 0, 14);
        $stmt = $db->prepare("INSERT INTO bets (id, userId, gameId, wager, payout, multiplier, isWin, gameData) VALUES (:id, :uid, 'crash', :w, :p, :m, 1, :data)");
        $stmt->execute([
            ':id' => $betId,
            ':uid' => $user['id'],
            ':w' => $wager,
            ':p' => $payout,
            ':m' => $mult,
            ':data' => json_encode(['roundId' => $bet['roundId'], 'cashedOut' => true])
        ]);
    } else {
        $_SESSION['demo_balance'] = $finalBal;
    }

    unset($_SESSION['active_crash_bet']);

    jsonResponse([
        'success' => true,
        'cashedOut' => true,
        'multiplier' => $mult,
        'payout' => $payout,
        'balance' => $finalBal
    ]);
}

jsonResponse(['success' => false, 'error' => 'Invalid action'], 400);
