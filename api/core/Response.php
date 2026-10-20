<?php
/**
 * Stake Casino - Strict JSON Response Formatter
 * Matches exact Next.js NextResponse.json output structures
 */

namespace Stake\Core;

class Response {
    public static function json(array $data, int $statusCode = 200, array $headers = []): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id');

        foreach ($headers as $key => $val) {
            header("{$key}: {$val}");
        }

        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function success(array $data = [], ?string $message = null, int $statusCode = 200): void {
        $payload = array_merge(['success' => true], $data);
        if ($message !== null && !isset($payload['message'])) {
            $payload['message'] = $message;
        }
        self::json($payload, $statusCode);
    }

    public static function error(string $message, int $statusCode = 400, array $extra = []): void {
        $payload = array_merge([
            'success' => false,
            'error'   => $message
        ], $extra);
        self::json($payload, $statusCode);
    }

    public static function handleOptions(): void {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id');
            exit;
        }
    }
}
