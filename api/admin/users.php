<?php
/**
 * Stake Casino - /api/admin/users Handler
 * Lists all registered platform users with companion wallet balances, wager volume, and luck status
 */

use Stake\Config\Database;
use Stake\Core\Response;
use Stake\Core\Validator;

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../core/Validator.php';

Response::handleOptions();

$input = Validator::getRequestData();
$search = Validator::sanitizeString($input['search'] ?? '');

$db = Database::getConnection();
$usersList = [];
$luckMap = [];

if ($db) {
    try {
        // Load persistent luck modes
        $lstmt = $db->prepare("SELECT value FROM system_settings WHERE `key` = 'USER_LUCK_MODES' LIMIT 1");
        $lstmt->execute();
        $rawLuck = $lstmt->fetchColumn();
        if ($rawLuck) {
            $parsed = json_decode($rawLuck, true);
            if (is_array($parsed)) $luckMap = $parsed;
        }

        $sql = "SELECT u.id, u.username, u.email, u.role, u.isBanned, u.createdAt, u.updatedAt,
                       COALESCE(w.balance, 0) AS balance,
                       COALESCE(w.totalWagered, 0) AS totalWagered,
                       COALESCE(w.totalDeposited, 0) AS totalDeposited,
                       COALESCE(w.totalWithdrawn, 0) AS totalWithdrawn,
                       COALESCE(w.currency, 'INR') AS currency,
                       (SELECT COUNT(*) FROM game_history gh WHERE gh.userId = u.id) AS betsCount,
                       ((SELECT COUNT(*) FROM deposits d WHERE d.userId = u.id) + (SELECT COUNT(*) FROM withdrawals wd WHERE wd.userId = u.id)) AS transactionsCount
                FROM users u
                LEFT JOIN wallets w ON u.id = w.userId";

        $params = [];
        if (!empty($search)) {
            $sql .= " WHERE u.username LIKE :q OR u.email LIKE :q OR u.id = :exact";
            $params[':q'] = "%{$search}%";
            $params[':exact'] = $search;
        }

        $sql .= " ORDER BY u.createdAt DESC LIMIT 100";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        foreach ($rows as $r) {
            $uid = $r['id'];
            $bal = floatval($r['balance']);
            $totDep = floatval($r['totalDeposited']);
            $totWd = floatval($r['totalWithdrawn']);
            $totWag = floatval($r['totalWagered']);
            $bets = intval($r['betsCount'] ?? 0);
            $txCount = intval($r['transactionsCount'] ?? 0);

            $luck = $luckMap[$uid] ?? ($_SESSION["luck_{$uid}"] ?? 'NO_CONTROL');
            if ($luck === 'FAIR' || $luck === 'NORMAL') $luck = 'NO_CONTROL';

            $usersList[] = [
                'id'                => $uid,
                'username'          => $r['username'],
                'email'             => $r['email'],
                'phone'             => null,
                'role'              => $r['isBanned'] ? 'BANNED' : ($r['role'] ?? 'USER'),
                'isBanned'          => boolval($r['isBanned']),
                'walletBalance'     => $bal,
                'balance'           => $bal,
                'totalWagered'      => $totWag,
                'totalDeposited'    => $totDep,
                'totalWithdrawn'    => $totWd,
                'netPL'             => round($totDep - $totWd - $bal, 2),
                'winRate'           => 48.5,
                'currency'          => $r['currency'],
                'luckMode'          => $luck,
                'betsCount'         => $bets,
                'transactionsCount' => $txCount,
                'lastActive'        => $r['updatedAt'] ?? $r['createdAt'],
                'createdAt'         => $r['createdAt']
            ];
        }
    } catch (\Exception $e) {
        error_log("[Admin Users Fetch Error] " . $e->getMessage());
    }
}

Response::success(['users' => $usersList]);
