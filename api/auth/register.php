<?php
/**
 * Stake Casino - /api/auth/register Handler
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
$username = trim($input['username'] ?? '');
$email = trim($input['identifier'] ?? $input['email'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($username) || strlen($username) < 3) {
    Response::error("Username must be at least 3 characters", 400, ['field' => 'username']);
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Response::error("A valid email address is required", 400, ['field' => 'identifier']);
}

if (empty($password) || strlen($password) < 6) {
    Response::error("Password must be at least 6 characters", 400, ['field' => 'password']);
}

$db = Database::getConnection();

if ($db) {
    // Check duplicates
    $check = $db->prepare("SELECT id, username, email FROM users WHERE username = :uname OR email = :email LIMIT 1");
    $check->execute([':uname' => $username, ':email' => $email]);
    $existing = $check->fetch();

    if ($existing) {
        if (strtolower($existing['username']) === strtolower($username)) {
            Response::error("Username already taken", 409, ['field' => 'username']);
        }
        Response::error("An account with this email already exists", 409, ['field' => 'identifier']);
    }

    $newId = 'usr_' . substr(md5(uniqid('', true)), 0, 14);
    $passHash = password_hash($password, PASSWORD_BCRYPT);

    $ins = $db->prepare("INSERT INTO users (id, username, email, password, role, isBanned, createdAt, updatedAt) VALUES (:id, :uname, :email, :pass, 'USER', 0, NOW(3), NOW(3))");
    $ins->execute([
        ':id'    => $newId,
        ':uname' => $username,
        ':email' => $email,
        ':pass'  => $passHash
    ]);

    // Create companion wallet with initial ₹1,000 balance
    $walId = 'wal_' . substr(md5(uniqid('', true)), 0, 14);
    $wins = $db->prepare("INSERT INTO wallets (id, userId, balance, currency, totalDeposited, totalWithdrawn, totalWagered, approvedDepositCount, unlockedBonusTier, createdAt, updatedAt) VALUES (:wid, :uid, :bal, :curr, :dep, 0, 0, 1, 2, NOW(3), NOW(3))");
    $wins->execute([
        ':wid'  => $walId,
        ':uid'  => $newId,
        ':bal'  => DEFAULT_INITIAL_BALANCE,
        ':curr' => DEFAULT_CURRENCY,
        ':dep'  => DEFAULT_INITIAL_BALANCE
    ]);

    // Set auth cookie
    Auth::setAuthSession($newId);

    Response::success([
        'user' => [
            'id'       => $newId,
            'username' => $username,
            'email'    => $email,
            'role'     => 'USER',
            'balance'  => DEFAULT_INITIAL_BALANCE,
            'currency' => DEFAULT_CURRENCY
        ],
        'token' => 'jwt_' . md5($newId . time())
    ], "Account successfully registered", 201);
} else {
    // Demo session mode fallback
    $demoId = 'usr_' . substr(md5(uniqid('', true)), 0, 14);
    Auth::setAuthSession($demoId);
    Response::success([
        'user' => [
            'id'       => $demoId,
            'username' => $username,
            'email'    => $email,
            'role'     => 'USER',
            'balance'  => DEFAULT_INITIAL_BALANCE
        ],
        'token' => 'jwt_demo_' . time()
    ], "Registered in demo mode", 201);
}
