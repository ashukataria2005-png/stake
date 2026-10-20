<?php
/**
 * Stake Casino - /api/admin/users/delete Handler
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

if (empty($userId)) {
    Response::error("User ID is required", 400);
}

$db = Database::getConnection();
if ($db) {
    try {
        $stmt = $db->prepare("DELETE FROM users WHERE id = :uid");
        $stmt->execute([':uid' => $userId]);
    } catch (\Exception $e) {
        Response::error("Failed to delete user: " . $e->getMessage(), 500);
    }
}

Response::success([], "User successfully deleted");
