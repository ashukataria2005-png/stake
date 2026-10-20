<?php
/**
 * Stake Casino - /api/admin/users/luck Handler
 * Supports single and bulk luck mode assignment (WIN, LOSE, NORMAL, FAIR, etc.)
 */

use Stake\Config\Database;
use Stake\Core\Response;
use Stake\Core\Validator;

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/constants.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../core/Validator.php';

Response::handleOptions();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method not allowed", 405);
}

$input = Validator::getRequestData();
$targetUserIds = [];

if (!empty($input['userIds']) && is_array($input['userIds'])) {
    foreach ($input['userIds'] as $uid) {
        $clean = Validator::sanitizeString($uid);
        if (!empty($clean)) $targetUserIds[] = $clean;
    }
} elseif (!empty($input['userId'])) {
    $targetUserIds[] = Validator::sanitizeString($input['userId']);
}

$luckMode = strtoupper(trim($input['luckMode'] ?? 'NORMAL'));
if (empty($targetUserIds)) {
    Response::error("At least one User ID is required", 400);
}

$db = Database::getConnection();

if ($db) {
    try {
        $stmt = $db->prepare("SELECT value FROM system_settings WHERE `key` = 'USER_LUCK_MODES' LIMIT 1");
        $stmt->execute();
        $raw = $stmt->fetchColumn();
        $luckMap = $raw ? (json_decode($raw, true) ?: []) : [];

        foreach ($targetUserIds as $uid) {
            $luckMap[$uid] = $luckMode;
            $_SESSION["luck_{$uid}"] = $luckMode;
        }

        $jsonStr = json_encode($luckMap, JSON_UNESCAPED_SLASHES);
        $upd = $db->prepare("INSERT INTO system_settings (`id`, `key`, `value`, `description`, `updatedAt`) VALUES ('setting_user_luck', 'USER_LUCK_MODES', :val, 'Per-user luck overrides map', NOW(3)) ON DUPLICATE KEY UPDATE `value` = :val2, `updatedAt` = NOW(3)");
        $upd->execute([':val' => $jsonStr, ':val2' => $jsonStr]);
    } catch (\Exception $e) {
        error_log("[Luck Mode Update Error] " . $e->getMessage());
    }
} else {
    foreach ($targetUserIds as $uid) {
        $_SESSION["luck_{$uid}"] = $luckMode;
    }
}

Response::success([
    'userIds'  => $targetUserIds,
    'luckMode' => $luckMode
], "Luck mode updated to {$luckMode} for " . count($targetUserIds) . " user(s)");
