<?php
// backend/api/reports.php — dashboard KPIs and charts
// GET ?type=revenue_30d | sales_by_category | top_selling | summary
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../lib/helpers.php';

$db = (new Database())->getConnection();
$type = query_param('type', 'summary');

if ($type === 'revenue_30d') {
    $s = $db->query("
        SELECT DATE(date) AS d, SUM(total) AS revenue
        FROM transactions
        WHERE date >= DATE_SUB(CURDATE(), INTERVAL 29 DAY) AND status='Completed'
        GROUP BY DATE(date) ORDER BY d ASC
    ");
    $byDay = [];
    foreach ($s->fetchAll(PDO::FETCH_ASSOC) as $r) $byDay[$r['d']] = (float)$r['revenue'];

    $exp = $db->query("
        SELECT date AS d, SUM(amount) AS amt FROM expenses
        WHERE date >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
        GROUP BY date
    ")->fetchAll(PDO::FETCH_ASSOC);
    $expByDay = [];
    foreach ($exp as $r) $expByDay[$r['d']] = (float)$r['amt'];

    $out = [];
    for ($i = 29; $i >= 0; $i--) {
        $d = date('Y-m-d', strtotime("-$i days"));
        $rev = $byDay[$d] ?? 0;
        $ex = $expByDay[$d] ?? 0;
        $out[] = [
            "date" => $d,
            "label" => date('j/n', strtotime($d)),
            "revenue" => $rev,
            "expenses" => $ex,
            "profit" => max(0, $rev - $ex),
        ];
    }
    json_response($out);
}

if ($type === 'sales_by_category') {
    $rows = $db->query("
        SELECT m.category, SUM(ti.qty * ti.price) AS sales
        FROM transaction_items ti
        JOIN medicines m ON m.id = ti.medicine_id
        JOIN transactions t ON t.id = ti.transaction_id
        WHERE t.status='Completed'
        GROUP BY m.category ORDER BY sales DESC
    ")->fetchAll(PDO::FETCH_ASSOC);
    json_response(array_map(fn($r) => ["category" => $r['category'], "sales" => (float)$r['sales']], $rows));
}

if ($type === 'top_selling') {
    $rows = $db->query("
        SELECT ti.name, m.category,
               SUM(ti.qty) AS units, SUM(ti.qty * ti.price) AS revenue
        FROM transaction_items ti
        LEFT JOIN medicines m ON m.id = ti.medicine_id
        JOIN transactions t ON t.id = ti.transaction_id
        WHERE t.status='Completed'
        GROUP BY ti.name, m.category
        ORDER BY units DESC LIMIT 10
    ")->fetchAll(PDO::FETCH_ASSOC);
    json_response(array_map(fn($r) => [
        "name" => $r['name'], "category" => $r['category'],
        "units" => (int)$r['units'], "revenue" => (float)$r['revenue'],
    ], $rows));
}

if ($type === 'summary') {
    $today = date('Y-m-d');
    $revToday = (float)$db->query("SELECT COALESCE(SUM(total),0) FROM transactions WHERE DATE(date)='$today' AND status='Completed'")->fetchColumn();
    $orders = (int)$db->query("SELECT COUNT(*) FROM transactions WHERE DATE(date)='$today'")->fetchColumn();
    $lowStock = (int)$db->query("SELECT COUNT(*) FROM medicines WHERE stock <= reorder_level")->fetchColumn();
    $expSoon = (int)$db->query("SELECT COUNT(*) FROM medicines WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)")->fetchColumn();
    $customers = (int)$db->query("SELECT COUNT(*) FROM customers")->fetchColumn();
    $staff = (int)$db->query("SELECT COUNT(*) FROM staff WHERE status='Active'")->fetchColumn();
    json_response([
        "revenueToday" => $revToday, "ordersToday" => $orders,
        "lowStock" => $lowStock, "expiringSoon" => $expSoon,
        "customers" => $customers, "activeStaff" => $staff,
    ]);
}

json_response(["error" => "Unknown report type"], 400);
