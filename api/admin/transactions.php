<?php
/**
 * Stake Casino - /api/admin/transactions Handler
 * Returns all platform deposit & withdrawal transactions for admin inspection
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
$status = strtoupper(trim($input['status'] ?? 'ALL'));
$type = strtoupper(trim($input['type'] ?? 'ALL'));
$search = Validator::sanitizeString($input['search'] ?? '');

$db = Database::getConnection();
$transactions = [];

if ($db) {
    try {
        // Fetch deposits
        if ($type === 'ALL' || $type === 'DEPOSIT') {
            $sql = "SELECT d.id, d.userId, d.order_sn, d.amount, d.currency, d.status, d.method, d.utr, d.remark, d.createdAt, d.updatedAt,
                           u.username, u.email,
                           COALESCE(w.balance, 0) AS userBalance
                    FROM deposits d
                    LEFT JOIN users u ON d.userId = u.id
                    LEFT JOIN wallets w ON d.userId = w.userId";
            $where = [];
            $params = [];

            if ($status !== 'ALL') {
                $where[] = "d.status = :status";
                $params[':status'] = $status;
            }
            if (!empty($search)) {
                $where[] = "(u.username LIKE :q OR d.order_sn LIKE :q OR d.utr LIKE :q)";
                $params[':q'] = "%{$search}%";
            }
            if ($where) {
                $sql .= " WHERE " . implode(' AND ', $where);
            }
            $sql .= " ORDER BY d.createdAt DESC LIMIT 100";

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            foreach ($stmt->fetchAll() as $d) {
                $transactions[] = [
                    'id'               => $d['id'],
                    'userId'           => $d['userId'],
                    'type'             => 'DEPOSIT',
                    'amount'           => floatval($d['amount']),
                    'currency'         => $d['currency'],
                    'utrNumber'        => $d['utr'] ?: null,
                    'screenshotUrl'    => null,
                    'status'           => $d['status'],
                    'approvedBy'       => null,
                    'approvedAt'       => ($d['status'] === 'APPROVED' ? $d['updatedAt'] : null),
                    'rejectionReason'  => ($d['status'] === 'REJECTED' ? ($d['remark'] ?: 'Rejected by admin') : null),
                    'isLateSubmission' => false,
                    'method'           => $d['method'] ?: 'UPI',
                    'txHash'           => $d['utr'] ?: $d['order_sn'],
                    'createdAt'        => $d['createdAt'],
                    'updatedAt'        => $d['updatedAt'] ?? $d['createdAt'],
                    'user'             => [
                        'id'             => $d['userId'],
                        'username'       => $d['username'] ?: 'Unknown',
                        'email'          => $d['email'] ?: '',
                        'phone'          => null,
                        'currentBalance' => floatval($d['userBalance'] ?? 0),
                        'currency'       => $d['currency'] ?: 'INR'
                    ]
                ];
            }
        }

        // Fetch withdrawals
        if ($type === 'ALL' || $type === 'WITHDRAWAL') {
            $sql = "SELECT w.id, w.userId, w.amount, w.currency, w.status, w.payoutMethod, w.accountDetails, w.remark, w.createdAt, w.updatedAt,
                           u.username, u.email,
                           COALESCE(wal.balance, 0) AS userBalance
                    FROM withdrawals w
                    LEFT JOIN users u ON w.userId = u.id
                    LEFT JOIN wallets wal ON w.userId = wal.userId";
            $where = [];
            $params = [];

            if ($status !== 'ALL') {
                $where[] = "w.status = :status";
                $params[':status'] = $status;
            }
            if (!empty($search)) {
                $where[] = "(u.username LIKE :q OR w.id LIKE :q)";
                $params[':q'] = "%{$search}%";
            }
            if ($where) {
                $sql .= " WHERE " . implode(' AND ', $where);
            }
            $sql .= " ORDER BY w.createdAt DESC LIMIT 100";

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            foreach ($stmt->fetchAll() as $w) {
                $transactions[] = [
                    'id'               => $w['id'],
                    'userId'           => $w['userId'],
                    'type'             => 'WITHDRAWAL',
                    'amount'           => floatval($w['amount']),
                    'currency'         => $w['currency'],
                    'utrNumber'        => null,
                    'screenshotUrl'    => null,
                    'status'           => $w['status'],
                    'approvedBy'       => null,
                    'approvedAt'       => ($w['status'] === 'APPROVED' ? $w['updatedAt'] : null),
                    'rejectionReason'  => ($w['status'] === 'REJECTED' ? ($w['remark'] ?: 'Rejected by admin') : null),
                    'isLateSubmission' => false,
                    'method'           => $w['payoutMethod'] ?: 'UPI',
                    'txHash'           => $w['id'],
                    'createdAt'        => $w['createdAt'],
                    'updatedAt'        => $w['updatedAt'] ?? $w['createdAt'],
                    'user'             => [
                        'id'             => $w['userId'],
                        'username'       => $w['username'] ?: 'Unknown',
                        'email'          => $w['email'] ?: '',
                        'phone'          => null,
                        'currentBalance' => floatval($w['userBalance'] ?? 0),
                        'currency'       => $w['currency'] ?: 'INR'
                    ]
                ];
            }
        }

        usort($transactions, function($a, $b) {
            return strcmp($b['createdAt'], $a['createdAt']);
        });
    } catch (\Exception $e) {
        error_log("[Admin Transactions Error] " . $e->getMessage());
    }
}

Response::success([
    'transactions' => $transactions,
    'deposits'     => array_values(array_filter($transactions, fn($t) => $t['type'] === 'DEPOSIT')),
    'withdrawals'  => array_values(array_filter($transactions, fn($t) => $t['type'] === 'WITHDRAWAL'))
]);
