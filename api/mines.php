<?php
/**
 * Stake Clone - Server-Side Provably Fair Mines Game Engine
 * Actions: start, reveal, cashout, state
 */

require_once __DIR__ . '/db.php';

$user = getActiveUser();
$db = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

$rawInput = file_get_contents('php://input');
$jsonBody = json_decode($rawInput, true) ?: [];
$params = array_merge($_GET, $_POST, $jsonBody);
$action = $params['action'] ?? 'state';

function nCr($n, $r) {
    if ($r < 0 || $r > $n) return 0;
    if ($r === 0 || $r === $n) return 1;
    if ($r > $n / 2) $r = $n - $r;
    $res = 1;
    for ($i = 1; $i <= $r; $i++) {
        $res = $res * ($n - $i + 1) / $i;
    }
    return $res;
}

function calculateMinesMultiplier($minesCount, $diamondsRevealed) {
    if ($diamondsRevealed <= 0) return 1.0;
    $houseEdge = 0.01; // 1% house edge (99% RTP)
    $totalTiles = 25;
    $safeTiles = $totalTiles - $minesCount;

    // Multiplier = (1 - edge) * [ C(25, k) / C(safe, k) ]
    $totalCombos = nCr($totalTiles, $diamondsRevealed);
    $safeCombos = nCr($safeTiles, $diamondsRevealed);
    if ($safeCombos <= 0) return 0;
    $mult = (1.0 - $houseEdge) * ($totalCombos / $safeCombos);
    return round($mult, 2);
}

if ($action === 'start' && $method === 'POST') {
    $wager = floatval($params['wager'] ?? 0);
    $minesCount = intval($params['minesCount'] ?? $params['mines'] ?? 3);
    $minesCount = max(1, min(24, $minesCount));

    $wallet = getUserWallet($user['id']);
    if (floatval($wallet['balance']) < $wager || $wager <= 0) {
        jsonResponse(['success' => false, 'error' => 'Insufficient balance for this bet.'], 400);
    }

    // Deduct initial wager from wallet
    $newBal = round(floatval($wallet['balance']) - $wager, 2);
    if ($db) {
        $upd = $db->prepare("UPDATE wallets SET balance = :bal, totalWagered = totalWagered + :w WHERE userId = :uid");
        $upd->execute([':bal' => $newBal, ':w' => $wager, ':uid' => $user['id']]);
    } else {
        $_SESSION['demo_balance'] = $newBal;
    }

    // Generate random distinct mine indices (0 to 24)
    $allIndices = range(0, 24);
    shuffle($allIndices);
    $mineIndices = array_slice($allIndices, 0, $minesCount);

    $_SESSION['mines_game'] = [
        'active' => true,
        'userId' => $user['id'],
        'wager' => $wager,
        'minesCount' => $minesCount,
        'mines' => $mineIndices,
        'revealed' => [],
        'currentMultiplier' => 1.0,
        'currentPayout' => $wager
    ];

    jsonResponse([
        'success' => true,
        'active' => true,
        'wager' => $wager,
        'minesCount' => $minesCount,
        'revealed' => [],
        'currentMultiplier' => 1.0,
        'currentPayout' => $wager,
        'balance' => $newBal
    ]);
}

if ($action === 'reveal' && $method === 'POST') {
    if (empty($_SESSION['mines_game']) || empty($_SESSION['mines_game']['active'])) {
        jsonResponse(['success' => false, 'error' => 'No active Mines game.'], 400);
    }

    $game = &$_SESSION['mines_game'];
    $tileIndex = intval($params['tileIndex'] ?? -1);

    if ($tileIndex < 0 || $tileIndex > 24) {
        jsonResponse(['success' => false, 'error' => 'Invalid tile index.'], 400);
    }

    if (in_array($tileIndex, $game['revealed'])) {
        jsonResponse(['success' => false, 'error' => 'Tile already revealed.'], 400);
    }

    // Check if mine was hit
    if (in_array($tileIndex, $game['mines'])) {
        // Mine hit! Game lost!
        $game['active'] = false;
        $revealedMines = $game['mines'];

        // Record loss in DB
        $betId = 'bet_' . substr(md5(uniqid()), 0, 14);
        if ($db) {
            $stmt = $db->prepare("INSERT INTO bets (id, userId, gameId, wager, payout, multiplier, isWin, gameData) VALUES (:id, :uid, 'mines', :w, 0, 0, 0, :data)");
            $stmt->execute([
                ':id' => $betId,
                ':uid' => $user['id'],
                ':w' => $game['wager'],
                ':data' => json_encode(['mines' => $game['minesCount'], 'revealedCount' => count($game['revealed']), 'hit' => $tileIndex])
            ]);
        }

        $response = [
            'success' => true,
            'isMine' => true,
            'tileIndex' => $tileIndex,
            'gameOver' => true,
            'won' => false,
            'allMines' => $revealedMines,
            'payout' => 0
        ];
        unset($_SESSION['mines_game']);
        jsonResponse($response);
    } else {
        // Safe diamond!
        $game['revealed'][] = $tileIndex;
        $revealedCount = count($game['revealed']);
        $maxSafe = 25 - $game['minesCount'];

        $nextMultiplier = calculateMinesMultiplier($game['minesCount'], $revealedCount);
        $nextPayout = round($game['wager'] * $nextMultiplier, 2);
        $game['currentMultiplier'] = $nextMultiplier;
        $game['currentPayout'] = $nextPayout;

        // Auto-cashout if all safe diamonds revealed
        if ($revealedCount >= $maxSafe) {
            $game['active'] = false;
            $allMines = $game['mines'];

            $wallet = getUserWallet($user['id']);
            $finalBal = round(floatval($wallet['balance']) + $nextPayout, 2);
            if ($db) {
                $upd = $db->prepare("UPDATE wallets SET balance = :bal WHERE userId = :uid");
                $upd->execute([':bal' => $finalBal, ':uid' => $user['id']]);

                $betId = 'bet_' . substr(md5(uniqid()), 0, 14);
                $stmt = $db->prepare("INSERT INTO bets (id, userId, gameId, wager, payout, multiplier, isWin, gameData) VALUES (:id, :uid, 'mines', :w, :p, :m, 1, :data)");
                $stmt->execute([
                    ':id' => $betId,
                    ':uid' => $user['id'],
                    ':w' => $game['wager'],
                    ':p' => $nextPayout,
                    ':m' => $nextMultiplier,
                    ':data' => json_encode(['mines' => $game['minesCount'], 'diamonds' => $revealedCount, 'allClean' => true])
                ]);
            } else {
                $_SESSION['demo_balance'] = $finalBal;
            }

            unset($_SESSION['mines_game']);
            jsonResponse([
                'success' => true,
                'isMine' => false,
                'tileIndex' => $tileIndex,
                'multiplier' => $nextMultiplier,
                'payout' => $nextPayout,
                'gameOver' => true,
                'won' => true,
                'allMines' => $allMines,
                'balance' => $finalBal
            ]);
        }

        jsonResponse([
            'success' => true,
            'isMine' => false,
            'tileIndex' => $tileIndex,
            'revealedCount' => $revealedCount,
            'multiplier' => $nextMultiplier,
            'payout' => $nextPayout,
            'gameOver' => false
        ]);
    }
}

if ($action === 'cashout' && $method === 'POST') {
    if (empty($_SESSION['mines_game']) || empty($_SESSION['mines_game']['active'])) {
        jsonResponse(['success' => false, 'error' => 'No active game to cash out.'], 400);
    }

    $game = &$_SESSION['mines_game'];
    if (count($game['revealed']) === 0) {
        jsonResponse(['success' => false, 'error' => 'Must reveal at least one diamond before cashing out.'], 400);
    }

    $payout = $game['currentPayout'];
    $multiplier = $game['currentMultiplier'];
    $allMines = $game['mines'];
    $wager = $game['wager'];

    $wallet = getUserWallet($user['id']);
    $finalBal = round(floatval($wallet['balance']) + $payout, 2);

    if ($db) {
        $upd = $db->prepare("UPDATE wallets SET balance = :bal WHERE userId = :uid");
        $upd->execute([':bal' => $finalBal, ':uid' => $user['id']]);

        $betId = 'bet_' . substr(md5(uniqid()), 0, 14);
        $stmt = $db->prepare("INSERT INTO bets (id, userId, gameId, wager, payout, multiplier, isWin, gameData) VALUES (:id, :uid, 'mines', :w, :p, :m, 1, :data)");
        $stmt->execute([
            ':id' => $betId,
            ':uid' => $user['id'],
            ':w' => $wager,
            ':p' => $payout,
            ':m' => $multiplier,
            ':data' => json_encode(['mines' => $game['minesCount'], 'diamonds' => count($game['revealed']), 'cashedOut' => true])
        ]);
    } else {
        $_SESSION['demo_balance'] = $finalBal;
    }

    unset($_SESSION['mines_game']);
    jsonResponse([
        'success' => true,
        'cashedOut' => true,
        'payout' => $payout,
        'multiplier' => $multiplier,
        'allMines' => $allMines,
        'balance' => $finalBal
    ]);
}

// Current active game state
if (!empty($_SESSION['mines_game']) && !empty($_SESSION['mines_game']['active'])) {
    $game = $_SESSION['mines_game'];
    jsonResponse([
        'success' => true,
        'hasActiveGame' => true,
        'wager' => $game['wager'],
        'minesCount' => $game['minesCount'],
        'revealed' => $game['revealed'],
        'currentMultiplier' => $game['currentMultiplier'],
        'currentPayout' => $game['currentPayout']
    ]);
}

jsonResponse(['success' => true, 'hasActiveGame' => false]);
