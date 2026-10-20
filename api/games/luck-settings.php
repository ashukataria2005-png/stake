<?php
/**
 * Stake Casino - /api/games/luck-settings Handler
 * Provides luck control settings for games
 */

use Stake\Core\Response;
use Stake\Core\Validator;

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../core/Validator.php';

Response::handleOptions();

$input = Validator::getRequestData();
$userId = Validator::sanitizeString($input['userId'] ?? 'demo_player');

$effectiveMode = $_SESSION["luck_{$userId}"] ?? 'FAIR';

Response::success([
    'userId'        => $userId,
    'effectiveMode' => $effectiveMode,
    'luckMode'      => $effectiveMode
]);
