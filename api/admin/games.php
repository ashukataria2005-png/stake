<?php
/**
 * Stake Casino - /api/admin/games Handler
 * Manages game-level luck modes and controls
 */

use Stake\Config\Database;
use Stake\Core\Response;
use Stake\Core\Validator;

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../core/Validator.php';

Response::handleOptions();

$gamesList = [
    'mines', 'crash', 'plinko', 'dice', 'limbo', 'roulette', 
    'keno', 'hilo', 'pump', 'diamonds', 'cases', 'moles'
];

$db = Database::getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $controls = [];
    $savedModes = [];

    if ($db) {
        try {
            $stmt = $db->prepare("SELECT value FROM system_settings WHERE `key` = 'GAME_LUCK_MODES' LIMIT 1");
            $stmt->execute();
            $raw = $stmt->fetchColumn();
            if ($raw) {
                $savedModes = json_decode($raw, true) ?: [];
            }
        } catch (\Exception $e) {}
    }

    foreach ($gamesList as $g) {
        $controls[] = [
            'id'       => "ctrl_{$g}",
            'gameName' => $g,
            'mode'     => $savedModes[$g] ?? 'NORMAL',
            'isActive' => true
        ];
    }

    Response::success(['controls' => $controls]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = Validator::getRequestData();
    $gameName = strtolower(trim($input['gameName'] ?? 'all'));
    $mode = strtoupper(trim($input['mode'] ?? 'NORMAL'));

    if ($db) {
        try {
            $stmt = $db->prepare("SELECT value FROM system_settings WHERE `key` = 'GAME_LUCK_MODES' LIMIT 1");
            $stmt->execute();
            $raw = $stmt->fetchColumn();
            $savedModes = $raw ? (json_decode($raw, true) ?: []) : [];

            if ($gameName === 'all') {
                foreach ($gamesList as $g) {
                    $savedModes[$g] = $mode;
                }
            } else {
                $savedModes[$gameName] = $mode;
            }

            $jsonStr = json_encode($savedModes, JSON_UNESCAPED_SLASHES);
            $upd = $db->prepare("INSERT INTO system_settings (`id`, `key`, `value`, `description`, `updatedAt`) VALUES ('setting_game_luck', 'GAME_LUCK_MODES', :val, 'Game level luck modes', NOW(3)) ON DUPLICATE KEY UPDATE `value` = :val2, `updatedAt` = NOW(3)");
            $upd->execute([':val' => $jsonStr, ':val2' => $jsonStr]);
        } catch (\Exception $e) {
            error_log("[Game Luck Update Error] " . $e->getMessage());
        }
    }

    Response::success([
        'gameName' => $gameName,
        'mode'     => $mode
    ], "Luck mode updated successfully");
}
