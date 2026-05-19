<?php
// backend/api/medicines.php — CRUD
// GET    /api/medicines.php           list
// GET    /api/medicines.php?id=1      one
// POST   /api/medicines.php           create
// PUT    /api/medicines.php?id=1      update
// DELETE /api/medicines.php?id=1      remove

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../lib/helpers.php';

$db = (new Database())->getConnection();
$id = query_param('id');
$m  = method();

function map_medicine($r) {
    return [
        "id" => (string)$r['id'],
        "name" => $r['name'], "generic" => $r['generic'], "category" => $r['category'],
        "brand" => $r['brand'],
        "buyingPrice" => (float)$r['buying_price'], "sellingPrice" => (float)$r['selling_price'],
        "stock" => (int)$r['stock'], "unit" => $r['unit'], "reorderLevel" => (int)$r['reorder_level'],
        "expiryDate" => $r['expiry_date'], "manufactureDate" => $r['manufacture_date'],
        "batch" => $r['batch'], "requiresPrescription" => (bool)$r['requires_prescription'],
        "status" => $r['status'], "image" => $r['image'],
    ];
}

if ($m === 'GET' && $id) {
    $s = $db->prepare("SELECT * FROM medicines WHERE id = ?");
    $s->execute([$id]);
    $r = $s->fetch(PDO::FETCH_ASSOC);
    if (!$r) json_response(["error" => "Not found"], 404);
    json_response(map_medicine($r));
}

if ($m === 'GET') {
    $rows = $db->query("SELECT * FROM medicines ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);
    json_response(array_map('map_medicine', $rows));
}

if ($m === 'POST') {
    require_auth();
    $b = read_json_body();
    $sql = "INSERT INTO medicines
        (name,generic,category,brand,buying_price,selling_price,stock,unit,reorder_level,expiry_date,manufacture_date,batch,requires_prescription,status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    $db->prepare($sql)->execute([
        $b['name'] ?? '', $b['generic'] ?? '', $b['category'] ?? '', $b['brand'] ?? '',
        $b['buyingPrice'] ?? 0, $b['sellingPrice'] ?? 0, $b['stock'] ?? 0,
        $b['unit'] ?? '', $b['reorderLevel'] ?? 0,
        $b['expiryDate'] ?? null, $b['manufactureDate'] ?? null,
        $b['batch'] ?? '', !empty($b['requiresPrescription']) ? 1 : 0,
        $b['status'] ?? 'Active',
    ]);
    $newId = $db->lastInsertId();
    $s = $db->prepare("SELECT * FROM medicines WHERE id = ?"); $s->execute([$newId]);
    json_response(map_medicine($s->fetch(PDO::FETCH_ASSOC)), 201);
}

if ($m === 'PUT' && $id) {
    require_auth();
    $b = read_json_body();
    $sql = "UPDATE medicines SET
        name=?, generic=?, category=?, brand=?, buying_price=?, selling_price=?, stock=?,
        unit=?, reorder_level=?, expiry_date=?, manufacture_date=?, batch=?,
        requires_prescription=?, status=? WHERE id=?";
    $db->prepare($sql)->execute([
        $b['name'] ?? '', $b['generic'] ?? '', $b['category'] ?? '', $b['brand'] ?? '',
        $b['buyingPrice'] ?? 0, $b['sellingPrice'] ?? 0, $b['stock'] ?? 0,
        $b['unit'] ?? '', $b['reorderLevel'] ?? 0,
        $b['expiryDate'] ?? null, $b['manufactureDate'] ?? null,
        $b['batch'] ?? '', !empty($b['requiresPrescription']) ? 1 : 0,
        $b['status'] ?? 'Active', $id,
    ]);
    $s = $db->prepare("SELECT * FROM medicines WHERE id = ?"); $s->execute([$id]);
    json_response(map_medicine($s->fetch(PDO::FETCH_ASSOC)));
}

if ($m === 'DELETE' && $id) {
    require_auth();
    $db->prepare("DELETE FROM medicines WHERE id = ?")->execute([$id]);
    json_response(["success" => true]);
}

json_response(["error" => "Bad request"], 400);
