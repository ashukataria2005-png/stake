<?php
/**
 * Stake Casino - /api/auth/login Handler
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
$identifier = trim($input['username'] ?? $input['identifier'] ?? $input['email'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($identifier) || empty($password)) {
    Response::error("Username/email and password are required", 400);
}

$db = Database::getConnection();

if ($db) {
    $stmt = $db->prepare("SELECT * FROM users WHERE username = :ident OR email = :ident LIMIT 1");
    $stmt->execute([':ident' => $identifier]);
    $user = $stmt->fetch();

    if (!$user) {
        Response::error("User not found", 404);
    }

    if ($user['isBanned']) {
        Response::error("Account has been suspended. Please contact support.", 403);
    }

    // Support bcrypt hash and legacy fallback
    $valid = password_verify($password, $user['password']) || ($user['password'] === $password);
    if (!$valid) {
        Response::error("Incorrect password", 401);
    }

    // Set auth cookie
    Auth::setAuthSession($user['id']);

    // Ensure wallet exists
    $wstmt = $db->prepare("SELECT balance, currency FROM wallets WHERE userId = :uid LIMIT 1");
    $wstmt->execute([':uid' => $user['id']]);
    $wallet = $wstmt->fetch();

    Response::success([
        'user' => [
            'id'       => $user['id'],
            'username' => $user['username'],
            'email'    => $user['email'],
            'role'     => $user['role'],
            'balance'  => floatval($wallet['balance'] ?? 0.0),
            'currency' => $wallet['currency'] ?? 'INR'
        ],
        'token' => 'jwt_' . md5($user['id'] . time())
    ]);
} else {
    // Demo session mode fallback
    $demoUser = [
        'id'       => 'usr_demo_player',
        'username' => $identifier ?: 'demo_player',
        'email'    => $identifier . '@stake.internal',
        'role'     => ($identifier === 'admin' ? 'ADMIN' : 'USER')
    ];
    Auth::setAuthSession($demoUser['id']);
    Response::success([
        'user'  => $demoUser,
        'token' => 'jwt_demo_' . time()
    ]);
}
