<?php
// backend/api/purchase_orders.php — list, get, create
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../lib/helpers.php';

$db = (new Database())->getConnection();
$id = query_param('id'); $m = method();

function load_po(PDO $db, $poid) {
    $s = $db->prepare("SELECT po.*, s.company AS supplier_name FROM purchase_orders po
                       LEFT JOIN suppliers s ON s.id = po.supplier_id WHERE po.id=?");
    $s->execute([$poid]);
    $p = $s->fetch(PDO::FETCH_ASSOC);
    if (!$p) return null;
    $s2 = $db->prepare("SELECT medicine_id,name,qty,unit_cost FROM purchase_order_items WHERE purchase_order_id=?");
    $s2->execute([$poid]);
    return [
        "id" => (string)$p['id'], "orderNo" => $p['order_no'],
        "supplierId" => (string)$p['supplier_id'], "supplierName" => $p['supplier_name'],
        "notes" => $p['notes'], "total" => (float)$p['total'], "status" => $p['status'],
        "createdAt" => $p['created_at'],
        "items" => array_map(function($r) {
            return ["medicineId" => $r['medicine_id'] ? (string)$r['medicine_id'] : null,
                    "name" => $r['name'], "qty" => (int)$r['qty'], "unitCost" => (float)$r['unit_cost']];
        }, $s2->fetchAll(PDO::FETCH_ASSOC)),
    ];
}

if ($m === 'GET' && $id) {
    $p = load_po($db, $id);
    if (!$p) json_response(["error" => "Not found"], 404);
    json_response($p);
}
if ($m === 'GET') {
    $rows = $db->query("SELECT id FROM purchase_orders ORDER BY id DESC")->fetchAll(PDO::FETCH_COLUMN);
    json_response(array_map(fn($pid) => load_po($db, $pid), $rows));
}
if ($m === 'POST') {
    require_auth();
    $b = read_json_body();
    $items = $b['items'] ?? [];
    $total = 0;
    foreach ($items as $it) $total += ($it['qty'] ?? 0) * ($it['unitCost'] ?? 0);
    $orderNo = "PO-" . random_int(10000, 99999);

    $db->beginTransaction();
    try {
        $db->prepare("INSERT INTO purchase_orders (order_no,supplier_id,notes,total,status)
                      VALUES (?,?,?,?, 'Pending')")
           ->execute([$orderNo, $b['supplierId'] ?? null, $b['notes'] ?? '', $total]);
        $poid = $db->lastInsertId();
        $ins = $db->prepare("INSERT INTO purchase_order_items (purchase_order_id,medicine_id,name,qty,unit_cost)
                             VALUES (?,?,?,?,?)");
        foreach ($items as $it) {
            $ins->execute([$poid, $it['medicineId'] ?? null, $it['name'] ?? '',
                           (int)($it['qty'] ?? 1), (float)($it['unitCost'] ?? 0)]);
        }
        if (!empty($b['supplierId'])) {
            $db->prepare("UPDATE suppliers SET last_order = NOW() WHERE id = ?")->execute([$b['supplierId']]);
        }
        $db->commit();
        json_response(load_po($db, $poid), 201);
    } catch (Throwable $e) {
        $db->rollBack();
        json_response(["error" => $e->getMessage()], 500);
    }
}
if ($m === 'PUT' && $id) {
    require_auth();
    $b = read_json_body();
    $db->prepare("UPDATE purchase_orders SET status=? WHERE id=?")
       ->execute([$b['status'] ?? 'Pending', $id]);
    // If marked received, add quantities to medicine stock.
    if (($b['status'] ?? '') === 'Received') {
        $s = $db->prepare("SELECT medicine_id, qty FROM purchase_order_items WHERE purchase_order_id=?");
        $s->execute([$id]);
        $up = $db->prepare("UPDATE medicines SET stock = stock + ? WHERE id = ?");
        foreach ($s->fetchAll(PDO::FETCH_ASSOC) as $row) {
            if ($row['medicine_id']) $up->execute([(int)$row['qty'], $row['medicine_id']]);
        }
    }
    json_response(load_po($db, $id));
}
json_response(["error" => "Bad request"], 400);
