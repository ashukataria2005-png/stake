<?php
/**
 * Stake Casino - /api/admin/metrics Handler
 * Computes platform KPIs, pending counts, revenue, and recent transaction feeds
 */

use Stake\Config\Database;
use Stake\Core\Response;

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../core/Response.php';

Response::handleOptions();

$db = Database::getConnection();

$defaultMetrics = [
    'totalUsers'              => 0,
    'todayUsers'              => 0,
    'pendingDepositsCount'    => 0,
    'pendingWithdrawalsCount' => 0,
    'pendingTotalCount'       => 0,
    'totalDepositsVolume'     => 0.0,
    'todayDepositsVolume'     => 0.0,
    'totalWithdrawalsVolume'  => 0.0,
    'todayWithdrawalsVolume'  => 0.0,
    'totalWalletsBalance'     => 0.0,
    'totalTurnover'           => 0.0,
    'totalRevenue'            => 0.0,
    'todayRevenue'            => 0.0,
    'totalBetsCount'          => 0,
    'activeGamesCount'        => 32
];

$recentTransactions = [];

if ($db) {
    try {
        // 1. Users count
        $uTotal = intval($db->query("SELECT COUNT(*) FROM users")->fetchColumn() ?: 0);
        $uToday = intval($db->query("SELECT COUNT(*) FROM users WHERE DATE(createdAt) = CURDATE()")->fetchColumn() ?: 0);

        // 2. Pending deposits and withdrawals
        $pDep = intval($db->query("SELECT COUNT(*) FROM deposits WHERE status = 'PENDING'")->fetchColumn() ?: 0);
        $pWd = intval($db->query("SELECT COUNT(*) FROM withdrawals WHERE status = 'PENDING'")->fetchColumn() ?: 0);

        // 3. Approved deposits volume
        $totDep = floatval($db->query("SELECT COALESCE(SUM(amount), 0) FROM deposits WHERE status = 'APPROVED'")->fetchColumn() ?: 0.0);
        $todayDep = floatval($db->query("SELECT COALESCE(SUM(amount), 0) FROM deposits WHERE status = 'APPROVED' AND DATE(createdAt) = CURDATE()")->fetchColumn() ?: 0.0);

        // 4. Approved withdrawals volume
        $totWd = floatval($db->query("SELECT COALESCE(SUM(amount), 0) FROM withdrawals WHERE status = 'APPROVED'")->fetchColumn() ?: 0.0);
        $todayWd = floatval($db->query("SELECT COALESCE(SUM(amount), 0) FROM withdrawals WHERE status = 'APPROVED' AND DATE(createdAt) = CURDATE()")->fetchColumn() ?: 0.0);

        // 5. Total Wallets Balance, Platform Turnover & House Net (GGR)
        $walData = $db->query("SELECT COALESCE(SUM(balance), 0) AS totalBal, COALESCE(SUM(totalWagered), 0) AS totalWag FROM wallets")->fetch();
        $totBal = floatval($walData['totalBal'] ?? 0.0);

        // 6. Platform Turnover & GGR from game_history
        $ghStats = $db->query("SELECT COALESCE(SUM(wager), 0) AS totalWag, COALESCE(SUM(payout), 0) AS totalPay, COUNT(*) AS betsCnt FROM game_history")->fetch();
        $ghWagered = floatval($ghStats['totalWag'] ?? 0.0);
        $ghPayout = floatval($ghStats['totalPay'] ?? 0.0);
        $totTurnover = max($ghWagered, floatval($walData['totalWag'] ?? 0.0));
        $totalGGR = round($ghWagered - $ghPayout, 2);
        $betsCount = intval($ghStats['betsCnt'] ?? 0);

        $defaultMetrics = [
            'totalUsers'              => $uTotal,
            'todayUsers'              => $uToday,
            'pendingDepositsCount'    => $pDep,
            'pendingWithdrawalsCount' => $pWd,
            'pendingTotalCount'       => $pDep + $pWd,
            'totalDepositsVolume'     => $totDep,
            'todayDepositsVolume'     => $todayDep,
            'totalWithdrawalsVolume'  => $totWd,
            'todayWithdrawalsVolume'  => $todayWd,
            'totalWalletsBalance'     => $totBal,
            'totalTurnover'           => $totTurnover,
            'totalRevenue'            => round($totDep - $totWd, 2),
            'todayRevenue'            => round($todayDep - $todayWd, 2),
            'totalGGR'                => $totalGGR,
            'houseNet'                => $totalGGR,
            'totalBetsCount'          => $betsCount,
            'activeGamesCount'        => 32
        ];

        // 7. Recent Transactions Feed (Top 10)
        $depTx = $db->query("SELECT d.id, d.userId, d.amount, d.currency, d.status, d.method, d.utr, d.createdAt, u.username, u.email FROM deposits d LEFT JOIN users u ON d.userId = u.id ORDER BY d.createdAt DESC LIMIT 10")->fetchAll();
        foreach ($depTx as $tx) {
            $recentTransactions[] = [
                'id'        => $tx['id'],
                'username'  => $tx['username'] ?: 'Player',
                'email'     => $tx['email'] ?: null,
                'phone'     => null,
                'type'      => 'DEPOSIT',
                'amount'    => floatval($tx['amount']),
                'currency'  => $tx['currency'],
                'utrNumber' => $tx['utr'],
                'status'    => $tx['status'],
                'method'    => $tx['method'],
                'isLateSubmission' => false,
                'createdAt' => $tx['createdAt']
            ];
        }

        $wdTx = $db->query("SELECT w.id, w.userId, w.amount, w.currency, w.status, w.payoutMethod, w.createdAt, u.username, u.email FROM withdrawals w LEFT JOIN users u ON w.userId = u.id ORDER BY w.createdAt DESC LIMIT 10")->fetchAll();
        foreach ($wdTx as $tx) {
            $recentTransactions[] = [
                'id'        => $tx['id'],
                'username'  => $tx['username'] ?: 'Player',
                'email'     => $tx['email'] ?: null,
                'phone'     => null,
                'type'      => 'WITHDRAWAL',
                'amount'    => floatval($tx['amount']),
                'currency'  => $tx['currency'],
                'utrNumber' => null,
                'status'    => $tx['status'],
                'method'    => $tx['payoutMethod'],
                'isLateSubmission' => false,
                'createdAt' => $tx['createdAt']
            ];
        }

        usort($recentTransactions, function($a, $b) {
            return strcmp($b['createdAt'], $a['createdAt']);
        });
        $recentTransactions = array_slice($recentTransactions, 0, 10);
    } catch (\Exception $e) {
        error_log("[Metrics Fetch Error] " . $e->getMessage());
    }
}

Response::success([
    'metrics'            => $defaultMetrics,
    'recentTransactions' => $recentTransactions
]);
