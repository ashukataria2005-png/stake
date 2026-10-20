<?php
/**
 * Stake Casino - /api/promotions Handler
 * Validates promo coupons and calculates bonus credits
 */

use Stake\Core\Response;
use Stake\Core\Validator;

require_once __DIR__ . '/config/constants.php';
require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/core/Validator.php';

Response::handleOptions();

$input = Validator::getRequestData();
$code = strtoupper(Validator::sanitizeString($input['code'] ?? ''));
$amount = Validator::toFloat($input['amount'] ?? 100);

$validCoupons = [
    'STAKE200' => ['discount' => 50, 'bonusPercent' => 100],
    'BONUS100' => ['discount' => 20, 'bonusPercent' => 50],
    'VIPDEPOSIT' => ['discount' => 15, 'bonusPercent' => 30],
    'WELCOME'  => ['discount' => 25, 'bonusPercent' => 50]
];

if (empty($code) || !isset($validCoupons[$code])) {
    Response::error("Invalid or expired promotional coupon code", 400);
}

$promo = $validCoupons[$code];
$discount = $promo['discount'];
$bonus = $promo['bonusPercent'];

$payable = max(10, round($amount * (1 - ($discount / 100)), 2));
$credited = round($amount * (1 + ($bonus / 100)), 2);

Response::success([
    'valid'           => true,
    'code'            => $code,
    'discountPercent' => $discount,
    'bonusPercent'    => $bonus,
    'payableAmount'   => $payable,
    'creditedAmount'  => $credited
], "Promo code {$code} applied successfully!");
