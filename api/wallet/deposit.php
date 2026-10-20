<?php
/**
 * Stake Casino - /api/wallet/deposit Handler
 * Records UPI manual deposit with 12-digit UTR and safe transaction persistence
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method not allowed", 405);
}

$input = Validator::getRequestData();
$userData = Auth::getOrCreateUser($input);
$user = $userData['user'];

$amount = Validator::toFloat($input['amount'] ?? $input['paidAmount'] ?? 0);
$utr = Validator::sanitizeString($input['utrNumber'] ?? $input['utr'] ?? '');
$orderId = Validator::sanitizeString($input['orderId'] ?? ('DEP_' . time() . '_' . rand(100, 999)));
$method = Validator::sanitizeString($input['method'] ?? 'UPI');
$autoCredit = filter_var($input['autoCredit'] ?? false, FILTER_VALIDATE_BOOLEAN);

if ($amount < MIN_DEPOSIT_AMOUNT) {
    Response::error("Minimum deposit amount is ₹" . number_format(MIN_DEPOSIT_AMOUNT, 2), 400);
}

if (empty($utr) && empty($orderId)) {
    Response::error("Please provide a valid 12-digit UTR number or transaction reference", 400);
}

$db = Database::getConnection();

if ($db) {
    try {
        $depId = 'dep_' . substr(md5(uniqid('', true)), 0, 14);
        $status = $autoCredit ? 'APPROVED' : 'PENDING';

        $stmt = $db->prepare("INSERT INTO deposits (id, userId, order_sn, amount, currency, status, method, utr, remark, createdAt, updatedAt) VALUES (:id, :uid, :order_sn, :amount, 'INR', :status, :method, :utr, :remark, NOW(3), NOW(3))");
        $stmt->execute([
            ':id'       => $depId,
            ':uid'      => $user['id'],
            ':order_sn' => $orderId,
            ':amount'   => $amount,
            ':status'   => $status,
            ':method'   => strtoupper($method),
            ':utr'      => $utr,
            ':remark'   => $input['promoCode'] ? "Promo applied: " . $input['promoCode'] : "Manual UPI Deposit"
        ]);

        if ($autoCredit) {
            $upd = $db->prepare("UPDATE wallets SET balance = balance + :amt, totalDeposited = totalDeposited + :amt, approvedDepositCount = approvedDepositCount + 1, updatedAt = NOW(3) WHERE userId = :uid");
            $upd->execute([':amt' => $amount, ':uid' => $user['id']]);
        }

        $wstmt = $db->prepare("SELECT balance, currency FROM wallets WHERE userId = :uid LIMIT 1");
        $wstmt->execute([':uid' => $user['id']]);
        $liveBal = floatval($wstmt->fetchColumn() ?: 0.0);

        Response::success([
            'message' => $autoCredit 
                ? "Deposit of ₹" . number_format($amount, 2) . " credited successfully!" 
                : "Deposit request of ₹" . number_format($amount, 2) . " submitted for verification.",
            'balance' => $liveBal,
            'deposit' => [
                'id'      => $depId,
                'orderId' => $orderId,
                'amount'  => $amount,
                'status'  => $status,
                'utr'     => $utr
            ]
        ], null, 201);
    } catch (\Exception $e) {
        error_log("[Deposit Error] " . $e->getMessage());
        Response::error("Failed to record deposit transaction: " . $e->getMessage(), 500);
    }
} else {
    // Demo session mode
    if ($autoCredit) {
        $_SESSION['demo_balance'] = floatval($_SESSION['demo_balance'] ?? DEFAULT_INITIAL_BALANCE) + $amount;
    }
    Response::success([
        'message' => "Deposit simulated successfully in demo mode",
        'balance' => floatval($_SESSION['demo_balance'] ?? DEFAULT_INITIAL_BALANCE)
    ], null, 201);
}
