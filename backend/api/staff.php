<?php
// backend/api/staff.php — CRUD (no password returned)
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../lib/helpers.php';

$db = (new Database())->getConnection();
$id = query_param('id'); $m = method();

function map_staff($r) {
    return [
        "id" => (string)$r['id'], "name" => $r['name'], "role" => $r['role_label'],
        "roleKey" => $r['role'], "phone" => $r['phone'], "email" => $r['email'],
        "shift" => $r['shift'], "lastLogin" => $r['last_login'], "status" => $r['status'],
        "salary" => (float)$r['salary'], "employmentDate" => $r['employment_date'],
    ];
}

if ($m === 'GET' && $id) {
    $s = $db->prepare("SELECT * FROM staff WHERE id = ?"); $s->execute([$id]);
    $r = $s->fetch(PDO::FETCH_ASSOC);
    if (!$r) json_response(["error" => "Not found"], 404);
    json_response(map_staff($r));
}
if ($m === 'GET') {
    $rows = $db->query("SELECT * FROM staff ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
    json_response(array_map('map_staff', $rows));
}
if ($m === 'POST') {
    require_role(['admin']);
    $b = read_json_body();
    foreach (['name','email','role'] as $f) {
        if (empty($b[$f])) json_response(["error" => "$f required"], 400);
    }
    $hash = password_hash($b['password'] ?? 'changeme123', PASSWORD_BCRYPT);
    $db->prepare("INSERT INTO staff (name,email,password_hash,role,role_label,phone,shift,salary,employment_date,status)
                  VALUES (?,?,?,?,?,?,?,?,?,'Active')")
       ->execute([
           $b['name'], $b['email'], $hash, $b['role'],
           $b['roleLabel'] ?? ucfirst($b['role']),
           $b['phone'] ?? '', $b['shift'] ?? 'Morning',
           $b['salary'] ?? 0, $b['employmentDate'] ?? date('Y-m-d'),
       ]);
    $newId = $db->lastInsertId();
    $s = $db->prepare("SELECT * FROM staff WHERE id = ?"); $s->execute([$newId]);
    json_response(map_staff($s->fetch(PDO::FETCH_ASSOC)), 201);
}
if ($m === 'PUT' && $id) {
    require_role(['admin']);
    $b = read_json_body();
    $db->prepare("UPDATE staff SET name=?,email=?,role=?,role_label=?,phone=?,shift=?,salary=?,employment_date=?,status=? WHERE id=?")
       ->execute([
           $b['name'] ?? '', $b['email'] ?? '', $b['role'] ?? 'cashier',
           $b['roleLabel'] ?? 'Cashier', $b['phone'] ?? '', $b['shift'] ?? 'Morning',
           $b['salary'] ?? 0, $b['employmentDate'] ?? date('Y-m-d'),
           $b['status'] ?? 'Active', $id,
       ]);
    $s = $db->prepare("SELECT * FROM staff WHERE id = ?"); $s->execute([$id]);
    json_response(map_staff($s->fetch(PDO::FETCH_ASSOC)));
}
if ($m === 'DELETE' && $id) {
    require_role(['admin']);
    $db->prepare("DELETE FROM staff WHERE id = ?")->execute([$id]);
    json_response(["success" => true]);
}
json_response(["error" => "Bad request"], 400);
