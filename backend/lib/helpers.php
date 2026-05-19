<?php
// backend/lib/helpers.php — shared helpers (JSON, auth, JWT-like token)

function json_response($data, int $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

function read_json_body(): array {
    $raw = file_get_contents("php://input");
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

// Tiny base64 JWT-style token (HS256-mock). Replace `SECRET` for production.
const JWT_SECRET = "medicare_secret_change_me";

function make_token(array $payload): string {
    $header  = rtrim(strtr(base64_encode(json_encode(["alg"=>"HS256","typ"=>"JWT"])), '+/', '-_'), '=');
    $payload['iat'] = time();
    $body    = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
    $sig     = rtrim(strtr(base64_encode(hash_hmac('sha256', "$header.$body", JWT_SECRET, true)), '+/', '-_'), '=');
    return "$header.$body.$sig";
}

function decode_token(?string $token): ?array {
    if (!$token) return null;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$h, $b, $s] = $parts;
    $expected = rtrim(strtr(base64_encode(hash_hmac('sha256', "$h.$b", JWT_SECRET, true)), '+/', '-_'), '=');
    if (!hash_equals($expected, $s)) return null;
    $payload = json_decode(base64_decode(strtr($b, '-_', '+/')), true);
    return is_array($payload) ? $payload : null;
}

function get_bearer_token(): ?string {
    $h = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['Authorization'] ?? '';
    if (!$h && function_exists('getallheaders')) {
        $headers = getallheaders();
        $h = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    if (preg_match('/Bearer\s+(.+)/i', $h, $m)) return trim($m[1]);
    return null;
}

function require_auth(): array {
    $user = decode_token(get_bearer_token());
    if (!$user) json_response(["error" => "Unauthorized"], 401);
    return $user;
}

function require_role(array $roles): array {
    $user = require_auth();
    if (!in_array($user['role'] ?? '', $roles, true)) {
        json_response(["error" => "Forbidden"], 403);
    }
    return $user;
}

function method(): string { return $_SERVER['REQUEST_METHOD']; }
function query_param(string $k, $default = null) { return $_GET[$k] ?? $default; }
?>
