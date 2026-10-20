<?php
/**
 * Stake Casino - /api/wallet/transactions Handler
 * Returns merged deposits and withdrawals history for user
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

$db = Database::getConnection();
$transactions = [];

if ($db) {
    try {
        // Fetch deposits
        $dstmt = $db->prepare("SELECT id, amount, currency, status, method, utr, createdAt FROM deposits WHERE userId = :uid ORDER BY createdAt DESC LIMIT 30");
        $dstmt->execute([':uid' => $user['id']]);
        $deposits = $dstmt->fetchAll();
        foreach ($deposits as $d) {
            $transactions[] = [
                'id'        => $d['id'],
                'type'      => 'DEPOSIT',
                'amount'    => floatval($d['amount']),
                'currency'  => $d['currency'],
                'status'    => $d['status'],
                'method'    => $d['method'],
                'txHash'    => $d['utr'] ?: $d['id'],
                'createdAt' => $d['createdAt']
            ];
        }

        // Fetch withdrawals
        $wstmt = $db->prepare("SELECT id, amount, currency, status, payoutMethod, accountDetails, createdAt FROM withdrawals WHERE userId = :uid ORDER BY createdAt DESC LIMIT 30");
        $wstmt->execute([':uid' => $user['id']]);
        $withdrawals = $wstmt->fetchAll();
        foreach ($withdrawals as $w) {
            $transactions[] = [
                'id'        => $w['id'],
                'type'      => 'WITHDRAWAL',
                'amount'    => floatval($w['amount']),
                'currency'  => $w['currency'],
                'status'    => $w['status'],
                'method'    => $w['payoutMethod'],
                'txHash'    => $w['id'],
                'createdAt' => $w['createdAt']
            ];
        }

        // Sort by createdAt desc
        usort($transactions, function($a, $b) {
            return strcmp($b['createdAt'], $a['createdAt']);
        });
    } catch (\Exception $e) {
        error_log("[Transactions Fetch Error] " . $e->getMessage());
    }
}

Response::success([
    'transactions' => $transactions
]);
