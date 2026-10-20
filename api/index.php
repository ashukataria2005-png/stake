<?php
/**
 * Stake Casino - /api Gateway & Status Root
 */

use Stake\Config\Database;
use Stake\Core\Response;

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/constants.php';
require_once __DIR__ . '/core/Response.php';

Response::handleOptions();

$db = Database::getConnection();
$dbConnected = false;

if ($db) {
    try {
        $stmt = $db->query("SELECT 1");
        $dbConnected = ($stmt !== false);
    } catch (\Exception $e) {
        $dbConnected = false;
    }
}

Response::success([
    'service'   => 'Stake Casino Pure-PHP Backend API',
    'status'    => 'ONLINE',
    'version'   => '1.0.0',
    'database'  => [
        'connected' => $dbConnected,
        'driver'    => 'MySQL PDO',
        'host'      => DB_HOST,
        'name'      => DB_NAME
    ],
    'timestamp' => date('Y-m-d H:i:s')
]);
