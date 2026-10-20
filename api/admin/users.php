<?php
/**
 * Stake Casino - /api/admin/users Handler
 * Lists all registered platform users with companion wallet balances and luck status
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

if ($db) {
    try {
        $sql = "SELECT u.id, u.username, u.email, u.role, u.isBanned, u.createdAt,
                       COALESCE(w.balance, 0) AS balance,
                       COALESCE(w.totalWagered, 0) AS totalWagered,
                       COALESCE(w.totalDeposited, 0) AS totalDeposited,
                       COALESCE(w.totalWithdrawn, 0) AS totalWithdrawn,
                       COALESCE(w.currency, 'INR') AS currency
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
            $usersList[] = [
                'id'             => $r['id'],
                'username'       => $r['username'],
                'email'          => $r['email'],
                'role'           => $r['role'],
                'isBanned'       => boolval($r['isBanned']),
                'balance'        => floatval($r['balance']),
                'totalWagered'   => floatval($r['totalWagered']),
                'totalDeposited' => floatval($r['totalDeposited']),
                'totalWithdrawn' => floatval($r['totalWithdrawn']),
                'currency'       => $r['currency'],
                'luckMode'       => 'FAIR',
                'createdAt'      => $r['createdAt']
            ];
        }
    } catch (\Exception $e) {
        error_log("[Admin Users Fetch Error] " . $e->getMessage());
    }
}

Response::success(['users' => $usersList]);
