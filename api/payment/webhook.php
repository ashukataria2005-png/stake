<?php
/**
 * Stake Casino - /api/payment/webhook Handler
 * Instant wallet credit IPN for RupayEx & LG-Pay
 */

use Stake\Config\Database;

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/constants.php';

$rawBody = file_get_contents('php://input');
$params = json_decode($rawBody, true);
if (!is_array($params)) {
    parse_str($rawBody, $params);
}
if (empty($params)) {
    $params = array_merge($_GET, $_POST);
}

$orderId = trim($params['order_id'] ?? $params['order_sn'] ?? $params['orderId'] ?? $params['out_trade_no'] ?? '');
$status = strtoupper(trim(strval($params['status'] ?? '')));

if (empty($orderId)) {
    http_response_code(400);
    echo "fail - missing order identifier";
    exit;
}

$isSuccess = ($status === '1' || $status === 'SUCCESS' || $status === 'PAID');

$db = Database::getConnection();

if ($db && $isSuccess) {
    try {
        $db->beginTransaction();

        $stmt = $db->prepare("SELECT * FROM deposits WHERE order_sn = :oid OR id = :oid LIMIT 1 FOR UPDATE");
        $stmt->execute([':oid' => $orderId]);
        $deposit = $stmt->fetch();

        if ($deposit && $deposit['status'] === 'PENDING') {
            $amount = floatval($deposit['amount']);
            $userId = $deposit['userId'];

            // 1. Mark deposit as APPROVED
            $updDep = $db->prepare("UPDATE deposits SET status = 'APPROVED', updatedAt = NOW(3) WHERE id = :id");
            $updDep->execute([':id' => $deposit['id']]);

            // 2. Credit wallet
            $updWal = $db->prepare("UPDATE wallets SET balance = balance + :amt, totalDeposited = totalDeposited + :amt, approvedDepositCount = approvedDepositCount + 1, updatedAt = NOW(3) WHERE userId = :uid");
            $updWal->execute([':amt' => $amount, ':uid' => $userId]);

            $db->commit();
            http_response_code(200);
            echo "success";
            exit;
        }

        $db->commit();
    } catch (\Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        error_log("[Webhook Error] " . $e->getMessage());
    }
}

http_response_code(200);
echo "ok";
exit;
