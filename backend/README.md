# MediCare Pharmacy — PHP Backend

A plain PHP + MySQL REST API that powers the React frontend.
No frameworks. Each file under `api/` is a self-contained controller.

## Folder structure

```
backend/
├── api/                  # REST endpoints (one file per resource)
│   ├── auth.php
│   ├── medicines.php
│   ├── inventory.php
│   ├── customers.php
│   ├── suppliers.php
│   ├── expenses.php
│   ├── staff.php
│   ├── attendance.php
│   ├── prescriptions.php
│   ├── transactions.php
│   ├── purchase_orders.php
│   └── reports.php
├── config/
│   ├── db.php            # PDO connection (edit credentials here)
│   └── cors.php          # CORS + JSON headers
├── lib/
│   └── helpers.php       # json_response, JWT-style token, auth guards
└── sql/
    └── main.sql          # full schema + seed data
```

## Setup

1. **Create the database**
   ```bash
   mysql -u root -p < backend/sql/main.sql
   ```
2. **Update credentials** in `backend/config/db.php` (local: root/no password by default).
3. **Set real bcrypt passwords** for the seeded users. The seed has a placeholder
   hash; replace via:
   ```bash
   php -r "echo password_hash('admin123', PASSWORD_BCRYPT);"
   ```
   Then `UPDATE staff SET password_hash='...' WHERE email='admin@medicare.ng';`

   (The login endpoint also accepts the original demo passwords as a fallback —
   `admin123`, `pharma123`, `cashier123`, `inventory123` — so you can log in
   immediately without rehashing.)
4. **Start the server**
   ```bash
   cd backend
   php -S localhost:8000
   ```
5. The API is now live at `http://localhost:8000/api/...`

## Endpoint cheatsheet

| Resource | Method & path |
|----------|---------------|
| Login | `POST /api/auth.php?action=login` |
| Current user | `GET /api/auth.php?action=me` |
| Medicines | `GET/POST /api/medicines.php`, `GET/PUT/DELETE /api/medicines.php?id=` |
| Inventory list | `GET /api/inventory.php` (add `?low=1` for low-stock) |
| Adjust stock | `POST /api/inventory.php?action=adjust` |
| Customers | `GET/POST /api/customers.php`, `GET/PUT/DELETE /api/customers.php?id=` |
| Suppliers | `GET/POST /api/suppliers.php`, `GET/PUT/DELETE /api/suppliers.php?id=` |
| Expenses | `GET/POST /api/expenses.php`, `DELETE /api/expenses.php?id=` |
| Staff | `GET/POST /api/staff.php`, `GET/PUT/DELETE /api/staff.php?id=` |
| Attendance | `GET /api/attendance.php`, `POST /api/attendance.php?action=clock_in|clock_out` |
| Prescriptions | `GET/POST /api/prescriptions.php`, `GET/PUT/DELETE /api/prescriptions.php?id=` |
| Transactions (POS) | `GET/POST /api/transactions.php` |
| Purchase orders | `GET/POST /api/purchase_orders.php`, `PUT /api/purchase_orders.php?id=` |
| Reports | `GET /api/reports.php?type=summary|revenue_30d|sales_by_category|top_selling` |

## Auth

`POST /api/auth.php?action=login` returns:
```json
{ "token": "<base64.base64.hmac>", "user": { "id":"1","name":"...","email":"...","role":"admin" } }
```

Send the token on subsequent requests as `Authorization: Bearer <token>`.
Mutating endpoints require auth; staff CRUD requires `role=admin`.

## Connecting the React frontend

Set `VITE_API_BASE_URL=http://localhost:8000/api` in your frontend `.env`,
then in `src/services/api.ts` replace each `delay([...])` mock call with
`fetch(\`${API_BASE_URL}/medicines.php\`).then(r => r.json())`, attaching
the bearer token from `localStorage` in an Authorization header.
