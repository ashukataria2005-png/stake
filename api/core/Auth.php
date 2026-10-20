<?php
/**
 * Stake Casino - Authentication, Session & User Resolution
 */

namespace Stake\Core;

use Stake\Config\Database;
use PDO;

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/constants.php';

class Auth {
    public static function resolveUserId(?string $paramId = null): string {
        if (!empty($paramId) && $paramId !== 'undefined' && $paramId !== 'null') {
            return trim($paramId);
        }

        if (!empty($_COOKIE[AUTH_COOKIE_NAME])) {
            return trim($_COOKIE[AUTH_COOKIE_NAME]);
        }

        if (!empty($_SESSION[AUTH_COOKIE_NAME])) {
            return trim($_SESSION[AUTH_COOKIE_NAME]);
        }

        if (!empty($_SERVER['HTTP_X_USER_ID'])) {
            return trim($_SERVER['HTTP_X_USER_ID']);
        }

        return 'guest_player';
    }

    public static function getOrCreateUser(array $criteria = []): array {
        $db = Database::getConnection();

        $rawId = $criteria['userId'] ?? $criteria['id'] ?? null;
        $username = $criteria['username'] ?? null;
        $email = $criteria['email'] ?? null;

        $userId = self::resolveUserId($rawId);

        if (!$db) {
            // Demo Session Mode fallback when MySQL is disconnected
            $demoBalance = floatval($_SESSION['demo_balance'] ?? DEFAULT_INITIAL_BALANCE);
            $demoWagered = floatval($_SESSION['demo_wagered'] ?? 0.0);
            return [
                'user' => [
                    'id'       => $userId ?: 'usr_demo_player',
                    'username' => $username ?: ($userId ?: 'demo_player'),
                    'email'    => $email ?: 'demo@stake.internal',
                    'role'     => 'USER',
                    'isBanned' => false,
                    'luckMode' => $_SESSION['demo_luck_mode'] ?? 'FAIR'
                ],
                'wallet' => [
                    'id'                   => 'wal_demo_session',
                    'userId'               => $userId ?: 'usr_demo_player',
                    'balance'              => $demoBalance,
                    'currency'             => DEFAULT_CURRENCY,
                    'totalDeposited'       => $demoBalance,
                    'totalWithdrawn'       => 0.0000,
                    'totalWagered'         => $demoWagered,
                    'approvedDepositCount' => 1,
                    'unlockedBonusTier'    => 2
                ]
            ];
        }

        // 1. Locate user in MySQL
        $user = null;
        $stmt = $db->prepare("SELECT * FROM users WHERE id = :id OR username = :uname OR email = :email LIMIT 1");
        $stmt->execute([
            ':id'    => $userId,
            ':uname' => $username ?: $userId,
            ':email' => $email ?: ($userId . '@stake.internal')
        ]);
        $user = $stmt->fetch();

        // 2. If not found, create user
        if (!$user) {
            $newId = (!empty($userId) && $userId !== 'guest_player') 
                ? $userId 
                : ('usr_' . substr(md5(uniqid('', true)), 0, 14));
            
            $uname = $username ?: ($userId !== 'guest_player' ? $userId : ('player_' . substr(md5(uniqid()), 0, 6)));
            $uemail = $email ?: ($uname . '@stake.internal');
            $passHash = password_hash('stake_default_pwd', PASSWORD_BCRYPT);

            $ins = $db->prepare("INSERT INTO users (id, username, email, password, role, isBanned, createdAt, updatedAt) VALUES (:id, :uname, :email, :pass, 'USER', 0, NOW(3), NOW(3))");
            $ins->execute([
                ':id'    => $newId,
                ':uname' => $uname,
                ':email' => $uemail,
                ':pass'  => $passHash
            ]);

            $stmt->execute([':id' => $newId, ':uname' => $uname, ':email' => $uemail]);
            $user = $stmt->fetch();
        }

        // 3. Locate or create companion wallet
        $wstmt = $db->prepare("SELECT * FROM wallets WHERE userId = :uid LIMIT 1");
        $wstmt->execute([':uid' => $user['id']]);
        $wallet = $wstmt->fetch();

        if (!$wallet) {
            $walId = 'wal_' . substr(md5(uniqid('', true)), 0, 14);
            $wins = $db->prepare("INSERT INTO wallets (id, userId, balance, currency, totalDeposited, totalWithdrawn, totalWagered, approvedDepositCount, unlockedBonusTier, createdAt, updatedAt) VALUES (:wid, :uid, :bal, :curr, :dep, 0, 0, 1, 2, NOW(3), NOW(3))");
            $wins->execute([
                ':wid'  => $walId,
                ':uid'  => $user['id'],
                ':bal'  => DEFAULT_INITIAL_BALANCE,
                ':curr' => DEFAULT_CURRENCY,
                ':dep'  => DEFAULT_INITIAL_BALANCE
            ]);

            $wstmt->execute([':uid' => $user['id']]);
            $wallet = $wstmt->fetch();
        }

        return ['user' => $user, 'wallet' => $wallet];
    }

    public static function setAuthSession(string $userId): void {
        $_SESSION[AUTH_COOKIE_NAME] = $userId;
        setcookie(AUTH_COOKIE_NAME, $userId, [
            'expires'  => time() + AUTH_COOKIE_LIFETIME,
            'path'     => '/',
            'secure'   => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
            'httponly' => false,
            'samesite' => 'Lax'
        ]);
    }

    public static function clearAuthSession(): void {
        unset($_SESSION[AUTH_COOKIE_NAME]);
        setcookie(AUTH_COOKIE_NAME, '', [
            'expires'  => time() - 3600,
            'path'     => '/',
            'secure'   => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
            'httponly' => false,
            'samesite' => 'Lax'
        ]);
    }
}
