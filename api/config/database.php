<?php
/**
 * Stake Casino - Database Connection via PDO
 * High performance, UTF-8mb4, strict exceptions, connection pooling via static instance
 */

namespace Stake\Config;

use PDO;
use PDOException;

require_once __DIR__ . '/constants.php';

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): ?PDO {
        if (self::$instance !== null) {
            return self::$instance;
        }

        $host = getenv('DB_HOST') ?: (defined('DB_HOST') ? DB_HOST : 'localhost');
        $port = getenv('DB_PORT') ?: (defined('DB_PORT') ? DB_PORT : '3306');
        $name = getenv('DB_NAME') ?: (defined('DB_NAME') ? DB_NAME : 'stake_casino');
        $user = getenv('DB_USER') ?: (defined('DB_USER') ? DB_USER : 'root');
        $pass = getenv('DB_PASS') ?: (defined('DB_PASS') ? DB_PASS : '');

        try {
            $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";
            self::$instance = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ]);
            return self::$instance;
        } catch (PDOException $e) {
            error_log("[Database Connection Error] " . $e->getMessage());
            return null;
        }
    }

    public static function hasConnection(): bool {
        return self::getConnection() !== null;
    }
}
