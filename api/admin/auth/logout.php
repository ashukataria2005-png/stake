<?php
/**
 * Stake Casino - /api/admin/auth/logout Handler
 * Logs out admin and clears token cookie
 */

use Stake\Core\Response;

require_once __DIR__ . '/../../config/constants.php';
require_once __DIR__ . '/../../core/Response.php';

Response::handleOptions();

unset($_SESSION['stake_admin_user']);
setcookie('stake_admin_token', '', [
    'expires'  => time() - 3600,
    'path'     => '/',
    'secure'   => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
    'httponly' => false,
    'samesite' => 'Lax'
]);

Response::success([], "Admin logged out successfully");
