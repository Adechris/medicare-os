<?php
// backend/api/expenses.php — CRUD
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../lib/helpers.php';

$db = (new Database())->getConnection();
$id = query_param('id'); $m = method();

function map_expense($r) {
    return [
        "id" => (string)$r['id'], "date" => $r['date'], "category" => $r['category'],
        "description" => $r['description'], "amount" => (float)$r['amount'],
        "recordedBy" => $r['recorded_by'],
    ];
}

if ($m === 'GET') {
    $rows = $db->query("SELECT * FROM expenses ORDER BY date DESC, id DESC")->fetchAll(PDO::FETCH_ASSOC);
    json_response(array_map('map_expense', $rows));
}
if ($m === 'POST') {
    $user = require_auth();
    $b = read_json_body();
    $db->prepare("INSERT INTO expenses (date,category,description,amount,recorded_by) VALUES (?,?,?,?,?)")
       ->execute([
           $b['date'] ?? date('Y-m-d'),
           $b['category'] ?? 'Other',
           $b['description'] ?? '',
           $b['amount'] ?? 0,
           $b['recordedBy'] ?? ($user['name'] ?? 'System'),
       ]);
    $newId = $db->lastInsertId();
    $s = $db->prepare("SELECT * FROM expenses WHERE id = ?"); $s->execute([$newId]);
    json_response(map_expense($s->fetch(PDO::FETCH_ASSOC)), 201);
}
if ($m === 'DELETE' && $id) {
    require_auth();
    $db->prepare("DELETE FROM expenses WHERE id = ?")->execute([$id]);
    json_response(["success" => true]);
}
json_response(["error" => "Bad request"], 400);
