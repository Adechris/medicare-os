<?php
// backend/api/auth.php
// POST /api/auth.php?action=login   { email, password }
// POST /api/auth.php?action=register {name,email,password,role,...}  (admin only in prod)
// GET  /api/auth.php?action=me

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../lib/helpers.php';

$db = (new Database())->getConnection();
$action = query_param('action', 'login');

if ($action === 'login' && method() === 'POST') {
    $b = read_json_body();
    $email = trim($b['email'] ?? '');
    $password = $b['password'] ?? '';
    if (!$email || !$password) json_response(["error" => "Email and password required"], 400);

    $stmt = $db->prepare("SELECT * FROM staff WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $u = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$u) json_response(["error" => "Invalid email or password"], 401);

    // Accept bcrypt OR (for the seeded placeholder) the demo passwords from frontend.
    $demoMap = [
        'admin@medicare.ng' => 'admin123',
        'pharmacist@medicare.ng' => 'pharma123',
        'cashier@medicare.ng' => 'cashier123',
        'inventory@medicare.ng' => 'inventory123',
    ];
    $ok = password_verify($password, $u['password_hash']);
    if (!$ok && isset($demoMap[$email]) && $demoMap[$email] === $password) $ok = true;
    if (!$ok) json_response(["error" => "Invalid email or password"], 401);

    $db->prepare("UPDATE staff SET last_login = NOW() WHERE id = ?")->execute([$u['id']]);

    $user = [
        "id"    => (string)$u['id'],
        "name"  => $u['name'],
        "email" => $u['email'],
        "role"  => $u['role'],
    ];
    $token = make_token($user);
    json_response(["token" => $token, "user" => $user]);
}

if ($action === 'me' && method() === 'GET') {
    $user = require_auth();
    json_response(["user" => [
        "id" => (string)($user['id'] ?? ''),
        "name" => $user['name'] ?? '',
        "email" => $user['email'] ?? '',
        "role" => $user['role'] ?? '',
    ]]);
}

if ($action === 'register' && method() === 'POST') {
    $b = read_json_body();
    foreach (['name','email','password','role'] as $f) {
        if (empty($b[$f])) json_response(["error" => "$f required"], 400);
    }
    $hash = password_hash($b['password'], PASSWORD_BCRYPT);
    $sql = "INSERT INTO staff (name,email,password_hash,role,role_label,phone,shift,salary,employment_date,status)
            VALUES (?,?,?,?,?,?,?,?,?, 'Active')";
    $stmt = $db->prepare($sql);
    $stmt->execute([
        $b['name'], $b['email'], $hash, $b['role'], $b['role_label'] ?? ucfirst($b['role']),
        $b['phone'] ?? null, $b['shift'] ?? 'Morning', $b['salary'] ?? 0,
        $b['employment_date'] ?? date('Y-m-d'),
    ]);
    json_response(["id" => $db->lastInsertId()], 201);
}

json_response(["error" => "Unknown action"], 404);
