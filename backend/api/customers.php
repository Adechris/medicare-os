<?php
// backend/api/customers.php — CRUD
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../lib/helpers.php';

$db = (new Database())->getConnection();
$id = query_param('id'); $m = method();

function map_customer($r) {
    return [
        "id" => (string)$r['id'], "name" => $r['name'], "phone" => $r['phone'], "email" => $r['email'],
        "totalPurchases" => (float)$r['total_purchases'], "outstandingDebt" => (float)$r['outstanding_debt'],
        "lastVisit" => $r['last_visit'], "loyaltyPoints" => (int)$r['loyalty_points'], "status" => $r['status'],
        "bloodGroup" => $r['blood_group'], "allergies" => $r['allergies'], "address" => $r['address'],
        "dob" => $r['dob'],
    ];
}

if ($m === 'GET' && $id) {
    $s = $db->prepare("SELECT * FROM customers WHERE id = ?"); $s->execute([$id]);
    $r = $s->fetch(PDO::FETCH_ASSOC);
    if (!$r) json_response(["error" => "Not found"], 404);
    json_response(map_customer($r));
}
if ($m === 'GET') {
    $rows = $db->query("SELECT * FROM customers ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);
    json_response(array_map('map_customer', $rows));
}
if ($m === 'POST') {
    require_auth();
    $b = read_json_body();
    $db->prepare("INSERT INTO customers (name,phone,email,blood_group,allergies,address,dob,last_visit,status)
                  VALUES (?,?,?,?,?,?,?,NOW(),'Active')")
        ->execute([
            $b['name'] ?? '', $b['phone'] ?? '', $b['email'] ?? '',
            $b['bloodGroup'] ?? null, $b['allergies'] ?? null,
            $b['address'] ?? null, $b['dob'] ?? null,
        ]);
    $newId = $db->lastInsertId();
    $s = $db->prepare("SELECT * FROM customers WHERE id = ?"); $s->execute([$newId]);
    json_response(map_customer($s->fetch(PDO::FETCH_ASSOC)), 201);
}
if ($m === 'PUT' && $id) {
    require_auth();
    $b = read_json_body();
    $db->prepare("UPDATE customers SET name=?,phone=?,email=?,blood_group=?,allergies=?,address=?,dob=?,status=? WHERE id=?")
       ->execute([
           $b['name'] ?? '', $b['phone'] ?? '', $b['email'] ?? '',
           $b['bloodGroup'] ?? null, $b['allergies'] ?? null,
           $b['address'] ?? null, $b['dob'] ?? null,
           $b['status'] ?? 'Active', $id,
       ]);
    $s = $db->prepare("SELECT * FROM customers WHERE id = ?"); $s->execute([$id]);
    json_response(map_customer($s->fetch(PDO::FETCH_ASSOC)));
}
if ($m === 'DELETE' && $id) {
    require_auth();
    $db->prepare("DELETE FROM customers WHERE id = ?")->execute([$id]);
    json_response(["success" => true]);
}
json_response(["error" => "Bad request"], 400);
