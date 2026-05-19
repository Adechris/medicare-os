<?php
// backend/api/suppliers.php — CRUD
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../lib/helpers.php';

$db = (new Database())->getConnection();
$id = query_param('id'); $m = method();

function map_supplier($r) {
    return [
        "id" => (string)$r['id'], "name" => $r['name'], "company" => $r['company'],
        "phone" => $r['phone'], "email" => $r['email'], "address" => $r['address'],
        "lastOrder" => $r['last_order'], "outstanding" => (float)$r['outstanding'],
        "status" => $r['status'],
    ];
}

if ($m === 'GET' && $id) {
    $s = $db->prepare("SELECT * FROM suppliers WHERE id = ?"); $s->execute([$id]);
    $r = $s->fetch(PDO::FETCH_ASSOC);
    if (!$r) json_response(["error" => "Not found"], 404);
    json_response(map_supplier($r));
}
if ($m === 'GET') {
    $rows = $db->query("SELECT * FROM suppliers ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);
    json_response(array_map('map_supplier', $rows));
}
if ($m === 'POST') {
    require_auth();
    $b = read_json_body();
    $db->prepare("INSERT INTO suppliers (name,company,phone,email,address,last_order,outstanding,status)
                  VALUES (?,?,?,?,?,NOW(),0,'Active')")
       ->execute([
           $b['name'] ?? '', $b['company'] ?? '', $b['phone'] ?? '',
           $b['email'] ?? '', $b['address'] ?? '',
       ]);
    $newId = $db->lastInsertId();
    $s = $db->prepare("SELECT * FROM suppliers WHERE id = ?"); $s->execute([$newId]);
    json_response(map_supplier($s->fetch(PDO::FETCH_ASSOC)), 201);
}
if ($m === 'PUT' && $id) {
    require_auth();
    $b = read_json_body();
    $db->prepare("UPDATE suppliers SET name=?,company=?,phone=?,email=?,address=?,status=? WHERE id=?")
       ->execute([
           $b['name'] ?? '', $b['company'] ?? '', $b['phone'] ?? '',
           $b['email'] ?? '', $b['address'] ?? '', $b['status'] ?? 'Active', $id,
       ]);
    $s = $db->prepare("SELECT * FROM suppliers WHERE id = ?"); $s->execute([$id]);
    json_response(map_supplier($s->fetch(PDO::FETCH_ASSOC)));
}
if ($m === 'DELETE' && $id) {
    require_auth();
    $db->prepare("DELETE FROM suppliers WHERE id = ?")->execute([$id]);
    json_response(["success" => true]);
}
json_response(["error" => "Bad request"], 400);
