<?php
/**
 * Stake Casino - /api/admin/subadmins Handler
 * Manages admin roster in admin_users table
 */

use Stake\Config\Database;
use Stake\Core\Response;
use Stake\Core\Validator;

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../core/Validator.php';

Response::handleOptions();

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getConnection();

if ($method === 'GET') {
    $admins = [];
    if ($db) {
        try {
            $stmt = $db->query("SELECT id, username, email, role, permissions, createdAt FROM admin_users ORDER BY createdAt DESC");
            $rows = $stmt->fetchAll();
            foreach ($rows as $r) {
                $perms = json_decode($r['permissions'] ?? '[]', true) ?: ['ALL'];
                $admins[] = [
                    'id'          => $r['id'],
                    'username'    => $r['username'],
                    'email'       => $r['email'],
                    'role'        => $r['role'],
                    'permissions' => $perms,
                    'createdAt'   => $r['createdAt']
                ];
            }
        } catch (\Exception $e) {
            error_log("[Subadmins Fetch Error] " . $e->getMessage());
        }
    }

    if (empty($admins)) {
        $admins[] = [
            'id'          => 'admin_super_01',
            'username'    => 'admin',
            'email'       => 'admin@stake.internal',
            'role'        => 'SUPER_ADMIN',
            'permissions' => ['ALL'],
            'createdAt'   => date('Y-m-d H:i:s')
        ];
    }

    Response::success(['admins' => $admins]);
}

if ($method === 'POST') {
    $input = Validator::getRequestData();
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');
    $role = strtoupper(trim($input['role'] ?? 'MODERATOR'));

    if (empty($username) || empty($password)) {
        Response::error("Username and password are required", 400);
    }

    if ($db) {
        try {
            $newId = 'adm_' . substr(md5(uniqid('', true)), 0, 14);
            $hash = password_hash($password, PASSWORD_BCRYPT);
            $email = $username . '@stake.internal';

            $ins = $db->prepare("INSERT INTO admin_users (id, username, email, password, role, permissions, createdAt) VALUES (:id, :uname, :email, :pass, :role, '[\"DASHBOARD\", \"USERS\", \"FINANCE\"]', NOW(3))");
            $ins->execute([
                ':id'    => $newId,
                ':uname' => $username,
                ':email' => $email,
                ':pass'  => $hash,
                ':role'  => $role
            ]);

            Response::success([
                'admin' => [
                    'id'       => $newId,
                    'username' => $username,
                    'role'     => $role
                ]
            ], "Sub-admin created successfully", 201);
        } catch (\Exception $e) {
            Response::error("Failed to create sub-admin: " . $e->getMessage(), 500);
        }
    } else {
        Response::success([], "Created in demo session", 201);
    }
}

if ($method === 'DELETE') {
    $input = Validator::getRequestData();
    $id = Validator::sanitizeString($input['id'] ?? '');

    if ($id === 'admin_super_01') {
        Response::error("Cannot delete master Super Admin", 403);
    }

    if ($db && !empty($id)) {
        try {
            $del = $db->prepare("DELETE FROM admin_users WHERE id = :id AND role != 'SUPER_ADMIN'");
            $del->execute([':id' => $id]);
        } catch (\Exception $e) {}
    }

    Response::success([], "Sub-admin removed successfully");
}
