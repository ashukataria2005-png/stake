<?php
/**
 * Stake Casino - /api/games/luck-settings Handler
 * Provides luck control settings for games with persistent database fallback
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
$userId = Validator::sanitizeString($input['userId'] ?? 'demo_player');

$effectiveMode = $_SESSION["luck_{$userId}"] ?? null;

if (!$effectiveMode) {
    $db = Database::getConnection();
    if ($db) {
        try {
            $stmt = $db->prepare("SELECT value FROM system_settings WHERE `key` = 'USER_LUCK_MODES' LIMIT 1");
            $stmt->execute();
            $raw = $stmt->fetchColumn();
            if ($raw) {
                $map = json_decode($raw, true);
                if (isset($map[$userId])) {
                    $effectiveMode = $map[$userId];
                }
            }
        } catch (\Exception $e) {}
    }
}

if (!$effectiveMode) {
    $effectiveMode = 'FAIR';
}

Response::success([
    'userId'        => $userId,
    'effectiveMode' => $effectiveMode,
    'luckMode'      => $effectiveMode
]);
