<?php
/**
 * Stake Casino - /api/admin/finance Handler
 * Financial desk P&L, game statistics, and player risk analysis
 */

use Stake\Config\Database;
use Stake\Core\Response;

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../core/Response.php';

Response::handleOptions();

$db = Database::getConnection();

$totalGrossDeposits = 0.0;
$totalGrossWithdrawals = 0.0;
$totalWalletsBalance = 0.0;
$totalTurnover = 0.0;
$gameStats = [];
$playerRiskList = [];

if ($db) {
    try {
        $totDep = floatval($db->query("SELECT COALESCE(SUM(amount), 0) FROM deposits WHERE status = 'APPROVED'")->fetchColumn() ?: 0.0);
        $totWd = floatval($db->query("SELECT COALESCE(SUM(amount), 0) FROM withdrawals WHERE status = 'APPROVED'")->fetchColumn() ?: 0.0);

        $walData = $db->query("SELECT COALESCE(SUM(balance), 0) AS b, COALESCE(SUM(totalWagered), 0) AS w FROM wallets")->fetch();
        $totalGrossDeposits = $totDep;
        $totalGrossWithdrawals = $totWd;
        $totalWalletsBalance = floatval($walData['b'] ?? 0.0);
        $totalTurnover = floatval($walData['w'] ?? 0.0);

        // Game level stats
        $gstmt = $db->query("SELECT gameId, COUNT(*) AS bets, COALESCE(SUM(wager), 0) AS turnover, COALESCE(SUM(payout), 0) AS payout FROM game_history GROUP BY gameId ORDER BY turnover DESC LIMIT 10");
        $grows = $gstmt->fetchAll();
        foreach ($grows as $g) {
            $t = floatval($g['turnover']);
            $p = floatval($g['payout']);
            $profit = $t - $p;
            $margin = $t > 0 ? round(($profit / $t) * 100, 2) : 0.0;
            $gameStats[] = [
                'gameSlug'    => $g['gameId'],
                'turnover'    => $t,
                'payout'      => $p,
                'houseProfit' => $profit,
                'margin'      => $margin,
                'betsCount'   => intval($g['bets'])
            ];
        }

        // Player Risk List
        $ustmt = $db->query("SELECT u.id, u.username, COALESCE(w.balance, 0) AS bal, COALESCE(w.totalDeposited, 0) AS dep, COALESCE(w.totalWithdrawn, 0) AS wd FROM users u LEFT JOIN wallets w ON u.id = w.userId ORDER BY bal DESC LIMIT 10");
        $urows = $ustmt->fetchAll();
        foreach ($urows as $u) {
            $dep = floatval($u['dep']);
            $wd = floatval($u['wd']);
            $bal = floatval($u['bal']);
            $netGain = ($wd + $bal) - $dep;
            $playerRiskList[] = [
                'id'             => $u['id'],
                'username'       => $u['username'],
                'phone'          => null,
                'totalDeposited' => $dep,
                'totalWithdrawn' => $wd,
                'currentBalance' => $bal,
                'netGain'        => $netGain,
                'isFlagged'      => $netGain > 50000,
                'riskLevel'      => $netGain > 50000 ? 'HIGH' : ($netGain > 10000 ? 'MEDIUM' : 'LOW')
            ];
        }
    } catch (\Exception $e) {
        error_log("[Finance Error] " . $e->getMessage());
    }
}

$netPlatformProfit = $totalGrossDeposits - $totalGrossWithdrawals;
$netProfitMargin = $totalGrossDeposits > 0 ? round(($netPlatformProfit / $totalGrossDeposits) * 100, 2) : 0.0;

Response::success([
    'data' => [
        'totalGrossDeposits'    => $totalGrossDeposits,
        'totalGrossWithdrawals' => $totalGrossWithdrawals,
        'netPlatformProfit'     => $netPlatformProfit,
        'netProfitMargin'       => $netProfitMargin,
        'totalWalletsBalance'   => $totalWalletsBalance,
        'totalTurnover'         => $totalTurnover,
        'gameStats'             => $gameStats,
        'playerRiskList'        => $playerRiskList
    ]
]);
