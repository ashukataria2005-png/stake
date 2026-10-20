<?php
/**
 * Stake Casino - /api/auth/logout Handler
 */

use Stake\Core\Response;
use Stake\Core\Auth;

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../core/Auth.php';

Response::handleOptions();

Auth::clearAuthSession();

Response::success([], "Successfully signed out");
