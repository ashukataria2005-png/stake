<?php
/**
 * Stake Casino - /api/admin/users/luck Handler
 */

use Stake\Config\Database;
use Stake\Core\Response;
use Stake\Core\Validator;

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/constants.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../core/Validator.php';

Response::handleOptions();

$input = Validator::getRequestData();
$userId = Validator::sanitizeString($input['userId'] ?? '');
$luckMode = Validator::sanitizeString($input['luckMode'] ?? 'FAIR');

if (empty($userId)) {
    Response::error("User ID is required", 400);
}

$_SESSION["luck_{$userId}"] = $luckMode;

Response::success([
    'userId' => $userId,
    'luckMode' => $luckMode
], "Luck mode updated to {$luckMode}");
