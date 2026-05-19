<?php
// backend/api/attendance.php
// GET  /api/attendance.php                   today's records
// GET  /api/attendance.php?date=YYYY-MM-DD   specific date
// GET  /api/attendance.php?staffId=2&today=1 my today
// POST /api/attendance.php?action=clock_in   { staffId, staffName }
// POST /api/attendance.php?action=clock_out  { staffId }

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../lib/helpers.php';

$db = (new Database())->getConnection();
$m = method();
$action = query_param('action');

function map_attendance($r) {
    return [
        "id" => (string)$r['id'], "staffId" => (string)$r['staff_id'], "staffName" => $r['staff_name'],
        "date" => $r['date'], "clockIn" => $r['clock_in'], "clockOut" => $r['clock_out'],
        "status" => $r['status'],
    ];
}

if ($m === 'GET') {
    $date = query_param('date', date('Y-m-d'));
    $staffId = query_param('staffId');
    if ($staffId && query_param('today')) {
        $s = $db->prepare("SELECT * FROM attendance WHERE staff_id=? AND date=?");
        $s->execute([$staffId, $date]);
        $r = $s->fetch(PDO::FETCH_ASSOC);
        json_response($r ? map_attendance($r) : null);
    }
    $s = $db->prepare("SELECT * FROM attendance WHERE date = ?");
    $s->execute([$date]);
    json_response(array_map('map_attendance', $s->fetchAll(PDO::FETCH_ASSOC)));
}

if ($m === 'POST' && $action === 'clock_in') {
    $user = require_auth();
    $b = read_json_body();
    $staffId = $b['staffId'] ?? $user['id'] ?? null;
    $staffName = $b['staffName'] ?? $user['name'] ?? '';
    if (!$staffId) json_response(["error" => "staffId required"], 400);

    $now = new DateTime();
    $status = ((int)$now->format('H') >= 9) ? 'Late' : 'Present';
    $time = $now->format('H:i');
    $date = $now->format('Y-m-d');

    $s = $db->prepare("SELECT id FROM attendance WHERE staff_id=? AND date=?");
    $s->execute([$staffId, $date]);
    $existing = $s->fetch(PDO::FETCH_ASSOC);
    if ($existing) {
        $db->prepare("UPDATE attendance SET clock_in=?, clock_out=NULL, status=? WHERE id=?")
           ->execute([$time, $status, $existing['id']]);
        $id = $existing['id'];
    } else {
        $db->prepare("INSERT INTO attendance (staff_id,staff_name,date,clock_in,status) VALUES (?,?,?,?,?)")
           ->execute([$staffId, $staffName, $date, $time, $status]);
        $id = $db->lastInsertId();
    }
    $s = $db->prepare("SELECT * FROM attendance WHERE id=?"); $s->execute([$id]);
    json_response(map_attendance($s->fetch(PDO::FETCH_ASSOC)));
}

if ($m === 'POST' && $action === 'clock_out') {
    $user = require_auth();
    $b = read_json_body();
    $staffId = $b['staffId'] ?? $user['id'] ?? null;
    if (!$staffId) json_response(["error" => "staffId required"], 400);
    $date = date('Y-m-d');
    $time = date('H:i');
    $s = $db->prepare("SELECT id, clock_in FROM attendance WHERE staff_id=? AND date=?");
    $s->execute([$staffId, $date]);
    $rec = $s->fetch(PDO::FETCH_ASSOC);
    if (!$rec || !$rec['clock_in']) json_response(["error" => "Not clocked in"], 400);
    $db->prepare("UPDATE attendance SET clock_out=? WHERE id=?")->execute([$time, $rec['id']]);
    $s = $db->prepare("SELECT * FROM attendance WHERE id=?"); $s->execute([$rec['id']]);
    json_response(map_attendance($s->fetch(PDO::FETCH_ASSOC)));
}

json_response(["error" => "Bad request"], 400);
