<?php
/**
 * Stake Casino - Request Validator & Input Sanitizer
 */

namespace Stake\Core;

class Validator {
    public static function getRequestData(): array {
        $raw = file_get_contents('php://input');
        $json = json_decode($raw, true);
        if (!is_array($json)) {
            $json = [];
        }

        return array_merge($_GET, $_POST, $json);
    }

    public static function sanitizeString(?string $val): string {
        if ($val === null) return '';
        return trim(strip_tags($val));
    }

    public static function toFloat($val, float $default = 0.0): float {
        if ($val === null || $val === '') return $default;
        $num = floatval($val);
        return is_nan($num) ? $default : $num;
    }

    public static function toInt($val, int $default = 0): int {
        if ($val === null || $val === '') return $default;
        return intval($val);
    }
}
