<?php
/**
 * Stake Casino - Global Platform Constants
 */

// Database Connection Credentials (Override via environment or edit directly)
if (!defined('DB_HOST')) define('DB_HOST', 'localhost');
if (!defined('DB_PORT')) define('DB_PORT', '3306');
if (!defined('DB_NAME')) define('DB_NAME', 'stake_casino');
if (!defined('DB_USER')) define('DB_USER', 'root');
if (!defined('DB_PASS')) define('DB_PASS', '');

// Session & Cookie Configuration
if (!defined('AUTH_COOKIE_NAME')) define('AUTH_COOKIE_NAME', 'stake_user_id');
if (!defined('AUTH_COOKIE_LIFETIME')) define('AUTH_COOKIE_LIFETIME', 2592000); // 30 days
if (!defined('JWT_SECRET')) define('JWT_SECRET', 'stake_production_jwt_secret_key_8829');

// Financial Constants
if (!defined('DEFAULT_CURRENCY')) define('DEFAULT_CURRENCY', 'INR');
if (!defined('USD_TO_INR_RATE')) define('USD_TO_INR_RATE', 86.5);
if (!defined('DEFAULT_INITIAL_BALANCE')) define('DEFAULT_INITIAL_BALANCE', 1000.0000);
if (!defined('MIN_DEPOSIT_AMOUNT')) define('MIN_DEPOSIT_AMOUNT', 100.00);
if (!defined('MIN_WITHDRAWAL_AMOUNT')) define('MIN_WITHDRAWAL_AMOUNT', 500.00);

// Start PHP Session cleanly if not started
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.gc_maxlifetime', AUTH_COOKIE_LIFETIME);
    session_set_cookie_params([
        'lifetime' => AUTH_COOKIE_LIFETIME,
        'path'     => '/',
        'secure'   => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}
