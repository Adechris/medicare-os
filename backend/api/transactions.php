<?php
// backend/api/transactions.php — list, get, create POS sale (deducts stock)
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../lib/helpers.php';

$db = (new Database())->getConnection();
$id = query_param('id'); $m = method();

function load_transaction(PDO $db, $tid) {
    $s = $db->prepare("SELECT * FROM transactions WHERE id=?"); $s->execute([$tid]);
    $t = $s->fetch(PDO::FETCH_ASSOC);
    if (!$t) return null;
    $s2 = $db->prepare("SELECT medicine_id,name,qty,price FROM transaction_items WHERE transaction_id=?");
    $s2->execute([$tid]);
    return [
        "id" => (string)$t['id'], "receiptNo" => $t['receipt_no'], "date" => $t['date'],
        "customerName" => $t['customer_name'], "cashier" => $t['cashier'],
        "itemsCount" => (int)$t['items_count'], "subtotal" => (float)$t['subtotal'],
        "discount" => (float)$t['discount'], "vat" => (float)$t['vat'], "total" => (float)$t['total'],
        "paymentMethod" => $t['payment_method'], "status" => $t['status'],
        "items" => array_map(function($r) {
            return ["medicineId" => (string)$r['medicine_id'], "name" => $r['name'],
                    "qty" => (int)$r['qty'], "price" => (float)$r['price']];
        }, $s2->fetchAll(PDO::FETCH_ASSOC)),
    ];
}

if ($m === 'GET' && $id) {
    $t = load_transaction($db, $id);
    if (!$t) json_response(["error" => "Not found"], 404);
    json_response($t);
}
if ($m === 'GET') {
    $rows = $db->query("SELECT id FROM transactions ORDER BY date DESC, id DESC")->fetchAll(PDO::FETCH_COLUMN);
    json_response(array_map(fn($tid) => load_transaction($db, $tid), $rows));
}
if ($m === 'POST') {
    $user = require_auth();
    $b = read_json_body();
    $items = $b['items'] ?? [];
    if (!count($items)) json_response(["error" => "Cart is empty"], 400);

    $subtotal = 0; $count = 0;
    foreach ($items as $it) { $subtotal += $it['qty'] * $it['price']; $count += $it['qty']; }
    $discount = (float)($b['discount'] ?? 0);
    $vat = round(($subtotal - $discount) * 0.075, 2);
    $total = $subtotal - $discount + $vat;
    $receiptNo = "RCT-" . random_int(10000, 99999);

    $db->beginTransaction();
    try {
        $db->prepare("INSERT INTO transactions
            (receipt_no,date,customer_id,customer_name,cashier,items_count,subtotal,discount,vat,total,payment_method,status)
            VALUES (?,NOW(),?,?,?,?,?,?,?,?,?,'Completed')")
           ->execute([
               $receiptNo,
               $b['customerId'] ?? null,
               $b['customerName'] ?? 'Walk-in Customer',
               $b['cashier'] ?? ($user['name'] ?? 'System'),
               $count, $subtotal, $discount, $vat, $total,
               $b['paymentMethod'] ?? 'Cash',
           ]);
        $tid = $db->lastInsertId();
        $ins = $db->prepare("INSERT INTO transaction_items (transaction_id,medicine_id,name,qty,price) VALUES (?,?,?,?,?)");
        $dec = $db->prepare("UPDATE medicines SET stock = GREATEST(0, stock - ?) WHERE id = ?");
        foreach ($items as $it) {
            $ins->execute([$tid, $it['medicineId'] ?? null, $it['name'] ?? '', (int)$it['qty'], (float)$it['price']]);
            if (!empty($it['medicineId'])) $dec->execute([(int)$it['qty'], $it['medicineId']]);
        }
        if (!empty($b['customerId'])) {
            $db->prepare("UPDATE customers SET total_purchases = total_purchases + ?, loyalty_points = loyalty_points + ?, last_visit = NOW() WHERE id = ?")
               ->execute([$total, (int)floor($total / 1000), $b['customerId']]);
        }
        $db->commit();
        json_response(load_transaction($db, $tid), 201);
    } catch (Throwable $e) {
        $db->rollBack();
        json_response(["error" => $e->getMessage()], 500);
    }
}
json_response(["error" => "Bad request"], 400);
