<?php
/**
 * Stake Casino - /api/bets/history Handler
 * Returns paginated player bet history and aggregate statistics
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

$input = Validator::getRequestData();
$userData = Auth::getOrCreateUser($input);
$user = $userData['user'];

$limit = min(50, max(5, Validator::toInt($input['limit'] ?? 20)));
$gameFilter = Validator::sanitizeString($input['gameId'] ?? '');

$db = Database::getConnection();
$history = [];
$stats = [
    'totalBets'    => 0,
    'totalWagered' => 0.0,
    'totalProfit'  => 0.0,
    'winRate'      => 0.0
];

if ($db) {
    try {
        $sql = "SELECT id, gameId, wager, payout, multiplier, isWin, gameData, createdAt FROM game_history WHERE userId = :uid";
        $params = [':uid' => $user['id']];

        if (!empty($gameFilter)) {
            $sql .= " AND gameId = :gid";
            $params[':gid'] = $gameFilter;
        }

        $sql .= " ORDER BY createdAt DESC LIMIT {$limit}";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $totalWagered = 0.0;
        $totalPayout = 0.0;
        $winCount = 0;

        foreach ($rows as $r) {
            $w = floatval($r['wager']);
            $p = floatval($r['payout']);
            $isWin = boolval($r['isWin']);

            $totalWagered += $w;
            $totalPayout += $p;
            if ($isWin) $winCount++;

            $history[] = [
                'id'         => $r['id'],
                'gameId'     => $r['gameId'],
                'wager'      => $w,
                'payout'     => $p,
                'multiplier' => floatval($r['multiplier']),
                'isWin'      => $isWin,
                'gameData'   => is_string($r['gameData']) ? json_decode($r['gameData'], true) : $r['gameData'],
                'createdAt'  => $r['createdAt']
            ];
        }

        $totalCount = count($history);
        $stats['totalBets'] = $totalCount;
        $stats['totalWagered'] = $totalWagered;
        $stats['totalProfit'] = $totalPayout - $totalWagered;
        $stats['winRate'] = $totalCount > 0 ? round(($winCount / $totalCount) * 100, 2) : 0.0;
    } catch (\Exception $e) {
        error_log("[Bet History Fetch Error] " . $e->getMessage());
    }
}

Response::success([
    'history' => $history,
    'stats'   => $stats
]);
