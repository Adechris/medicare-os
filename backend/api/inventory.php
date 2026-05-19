<?php
// backend/api/inventory.php — stock adjustments + low-stock view
// GET  /api/inventory.php                   all stock levels
// GET  /api/inventory.php?low=1             only low/out-of-stock
// POST /api/inventory.php?action=adjust     { medicineId, delta, reason }

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../lib/helpers.php';

$db = (new Database())->getConnection();
$m  = method();
$action = query_param('action');

if ($m === 'GET') {
    $sql = "SELECT id, name, category, stock, reorder_level, unit, selling_price, expiry_date FROM medicines";
    if (query_param('low')) $sql .= " WHERE stock <= reorder_level";
    $sql .= " ORDER BY stock ASC";
    $rows = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    json_response(array_map(function($r) {
        return [
            "id" => (string)$r['id'], "name" => $r['name'], "category" => $r['category'],
            "stock" => (int)$r['stock'], "reorderLevel" => (int)$r['reorder_level'],
            "unit" => $r['unit'], "sellingPrice" => (float)$r['selling_price'],
            "expiryDate" => $r['expiry_date'],
        ];
    }, $rows));
}

if ($m === 'POST' && $action === 'adjust') {
    require_auth();
    $b = read_json_body();
    $id = $b['medicineId'] ?? null;
    $delta = (int)($b['delta'] ?? 0);
    if (!$id) json_response(["error" => "medicineId required"], 400);

    $s = $db->prepare("SELECT id, stock FROM medicines WHERE id = ?");
    $s->execute([$id]);
    $row = $s->fetch(PDO::FETCH_ASSOC);
    if (!$row) json_response(["error" => "Medicine not found"], 404);

    $newStock = max(0, (int)$row['stock'] + $delta);
    $db->prepare("UPDATE medicines SET stock = ? WHERE id = ?")->execute([$newStock, $id]);
    json_response(["id" => (string)$id, "stock" => $newStock]);
}

json_response(["error" => "Bad request"], 400);
