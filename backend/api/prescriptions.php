<?php
// backend/api/prescriptions.php — list, get, create (with items), update status
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../lib/helpers.php';

$db = (new Database())->getConnection();
$id = query_param('id'); $m = method();

function load_prescription(PDO $db, $pid) {
    $s = $db->prepare("SELECT * FROM prescriptions WHERE id = ?");
    $s->execute([$pid]);
    $p = $s->fetch(PDO::FETCH_ASSOC);
    if (!$p) return null;
    $s2 = $db->prepare("SELECT name,dosage,frequency,duration,qty FROM prescription_items WHERE prescription_id=?");
    $s2->execute([$pid]);
    return [
        "id" => (string)$p['id'], "patient" => $p['patient'], "doctor" => $p['doctor'],
        "hospital" => $p['hospital'], "dateIssued" => $p['date_issued'], "validUntil" => $p['valid_until'],
        "status" => $p['status'], "filledBy" => $p['filled_by'],
        "medicines" => array_map(function($r) {
            return ["name"=>$r['name'],"dosage"=>$r['dosage'],"frequency"=>$r['frequency'],
                    "duration"=>$r['duration'],"qty"=>(int)$r['qty']];
        }, $s2->fetchAll(PDO::FETCH_ASSOC)),
    ];
}

if ($m === 'GET' && $id) {
    $p = load_prescription($db, $id);
    if (!$p) json_response(["error" => "Not found"], 404);
    json_response($p);
}
if ($m === 'GET') {
    $rows = $db->query("SELECT id FROM prescriptions ORDER BY id DESC")->fetchAll(PDO::FETCH_COLUMN);
    json_response(array_map(fn($pid) => load_prescription($db, $pid), $rows));
}
if ($m === 'POST') {
    require_auth();
    $b = read_json_body();
    $db->beginTransaction();
    try {
        $db->prepare("INSERT INTO prescriptions (patient,doctor,hospital,date_issued,valid_until,status,filled_by)
                      VALUES (?,?,?,?,?,?,?)")
           ->execute([
               $b['patient'] ?? '', $b['doctor'] ?? '', $b['hospital'] ?? '',
               $b['dateIssued'] ?? date('Y-m-d'),
               $b['validUntil'] ?? date('Y-m-d', strtotime('+30 days')),
               $b['status'] ?? 'Pending', $b['filledBy'] ?? null,
           ]);
        $pid = $db->lastInsertId();
        $ins = $db->prepare("INSERT INTO prescription_items (prescription_id,name,dosage,frequency,duration,qty)
                             VALUES (?,?,?,?,?,?)");
        foreach (($b['medicines'] ?? []) as $it) {
            $ins->execute([$pid, $it['name'] ?? '', $it['dosage'] ?? '',
                           $it['frequency'] ?? '', $it['duration'] ?? '', (int)($it['qty'] ?? 1)]);
        }
        $db->commit();
        json_response(load_prescription($db, $pid), 201);
    } catch (Throwable $e) {
        $db->rollBack();
        json_response(["error" => $e->getMessage()], 500);
    }
}
if ($m === 'PUT' && $id) {
    require_auth();
    $b = read_json_body();
    $db->prepare("UPDATE prescriptions SET status=?, filled_by=? WHERE id=?")
       ->execute([$b['status'] ?? 'Pending', $b['filledBy'] ?? null, $id]);
    json_response(load_prescription($db, $id));
}
if ($m === 'DELETE' && $id) {
    require_auth();
    $db->prepare("DELETE FROM prescriptions WHERE id=?")->execute([$id]);
    json_response(["success" => true]);
}
json_response(["error" => "Bad request"], 400);
