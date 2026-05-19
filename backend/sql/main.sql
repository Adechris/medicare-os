-- backend/sql/main.sql
-- MediCare Pharmacy — full schema and seed data.
-- Usage: mysql -u root -p < backend/sql/main.sql

CREATE DATABASE IF NOT EXISTS medicare_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE medicare_db;

-- ============================================================
--  USERS / STAFF (single source of truth for login + HR)
-- ============================================================
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS purchase_order_items;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS transaction_items;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS prescription_items;
DROP TABLE IF EXISTS prescriptions;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS medicines;
DROP TABLE IF EXISTS staff;

CREATE TABLE staff (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(150) NOT NULL,
  email           VARCHAR(150) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  role            ENUM('admin','pharmacist','cashier','inventory_manager') NOT NULL,
  role_label      VARCHAR(80) NOT NULL,
  phone           VARCHAR(40),
  shift           ENUM('Morning','Afternoon','Night','Rotating') DEFAULT 'Morning',
  salary          DECIMAL(12,2) DEFAULT 0,
  employment_date DATE,
  last_login      DATETIME NULL,
  status          ENUM('Active','Suspended') DEFAULT 'Active',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
--  MEDICINES
-- ============================================================
CREATE TABLE medicines (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  name                    VARCHAR(200) NOT NULL,
  generic                 VARCHAR(200),
  category                VARCHAR(100),
  brand                   VARCHAR(150),
  buying_price            DECIMAL(12,2) DEFAULT 0,
  selling_price           DECIMAL(12,2) DEFAULT 0,
  stock                   INT DEFAULT 0,
  unit                    VARCHAR(40),
  reorder_level           INT DEFAULT 0,
  expiry_date             DATE,
  manufacture_date        DATE,
  batch                   VARCHAR(80),
  requires_prescription   TINYINT(1) DEFAULT 0,
  status                  ENUM('Active','Inactive','Discontinued') DEFAULT 'Active',
  image                   VARCHAR(255),
  created_at              DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (category), INDEX (status), INDEX (expiry_date)
) ENGINE=InnoDB;

-- ============================================================
--  CUSTOMERS
-- ============================================================
CREATE TABLE customers (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(150) NOT NULL,
  phone             VARCHAR(40),
  email             VARCHAR(150),
  blood_group       VARCHAR(8),
  allergies         VARCHAR(255),
  address           VARCHAR(255),
  dob               DATE,
  total_purchases   DECIMAL(14,2) DEFAULT 0,
  outstanding_debt  DECIMAL(14,2) DEFAULT 0,
  loyalty_points    INT DEFAULT 0,
  last_visit        DATETIME NULL,
  status            ENUM('Active','Inactive') DEFAULT 'Active',
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
--  SUPPLIERS
-- ============================================================
CREATE TABLE suppliers (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(150) NOT NULL,
  company      VARCHAR(200),
  phone        VARCHAR(40),
  email        VARCHAR(150),
  address      VARCHAR(255),
  last_order   DATETIME NULL,
  outstanding  DECIMAL(14,2) DEFAULT 0,
  status       ENUM('Active','Inactive') DEFAULT 'Active',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
--  EXPENSES
-- ============================================================
CREATE TABLE expenses (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  date          DATE NOT NULL,
  category      VARCHAR(80),
  description   VARCHAR(255),
  amount        DECIMAL(14,2) NOT NULL,
  recorded_by   VARCHAR(150),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
--  PRESCRIPTIONS
-- ============================================================
CREATE TABLE prescriptions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  patient       VARCHAR(150) NOT NULL,
  doctor        VARCHAR(150),
  hospital      VARCHAR(200),
  date_issued   DATE NOT NULL,
  valid_until   DATE NOT NULL,
  status        ENUM('Pending','Partially Filled','Filled','Expired') DEFAULT 'Pending',
  filled_by     VARCHAR(150) NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE prescription_items (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  prescription_id INT NOT NULL,
  name            VARCHAR(200) NOT NULL,
  dosage          VARCHAR(80),
  frequency       VARCHAR(80),
  duration        VARCHAR(80),
  qty             INT DEFAULT 1,
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
--  TRANSACTIONS (POS sales)
-- ============================================================
CREATE TABLE transactions (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  receipt_no      VARCHAR(40) NOT NULL UNIQUE,
  date            DATETIME NOT NULL,
  customer_id     INT NULL,
  customer_name   VARCHAR(150),
  cashier         VARCHAR(150),
  items_count     INT DEFAULT 0,
  subtotal        DECIMAL(14,2) DEFAULT 0,
  discount        DECIMAL(14,2) DEFAULT 0,
  vat             DECIMAL(14,2) DEFAULT 0,
  total           DECIMAL(14,2) DEFAULT 0,
  payment_method  ENUM('Cash','Card','Transfer','Credit') DEFAULT 'Cash',
  status          ENUM('Completed','Refunded') DEFAULT 'Completed',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE transaction_items (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT NOT NULL,
  medicine_id    INT NULL,
  name           VARCHAR(200),
  qty            INT NOT NULL,
  price          DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id)    REFERENCES medicines(id)    ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
--  PURCHASE ORDERS
-- ============================================================
CREATE TABLE purchase_orders (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_no      VARCHAR(40) NOT NULL UNIQUE,
  supplier_id   INT NOT NULL,
  notes         TEXT,
  total         DECIMAL(14,2) DEFAULT 0,
  status        ENUM('Pending','Received','Cancelled') DEFAULT 'Pending',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE purchase_order_items (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  purchase_order_id INT NOT NULL,
  medicine_id       INT NULL,
  name              VARCHAR(200),
  qty               INT DEFAULT 1,
  unit_cost         DECIMAL(12,2) DEFAULT 0,
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id)       REFERENCES medicines(id)       ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
--  ATTENDANCE
-- ============================================================
CREATE TABLE attendance (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  staff_id    INT NOT NULL,
  staff_name  VARCHAR(150) NOT NULL,
  date        DATE NOT NULL,
  clock_in    TIME NULL,
  clock_out   TIME NULL,
  status      ENUM('Present','Late','Absent') DEFAULT 'Present',
  UNIQUE KEY uniq_staff_day (staff_id, date),
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
--  SEED DATA
-- ============================================================
-- Default passwords: admin123 / pharma123 / cashier123 / inventory123
-- Bcrypt hashes generated with PASSWORD_BCRYPT.
INSERT INTO staff (name,email,password_hash,role,role_label,phone,shift,salary,employment_date,status) VALUES
('Dr. Amara Okafor','admin@medicare.ng',       '$2y$10$LCb2cZb1JqUAzhT5lEr1aOoYwfYwfQAXz9b0sJk2D8GZbgK5x4uOC','admin','Admin','+234 802 000 0001','Rotating',550000,'2022-01-15','Active'),
('Tunde Adeyemi',   'pharmacist@medicare.ng',  '$2y$10$LCb2cZb1JqUAzhT5lEr1aOoYwfYwfQAXz9b0sJk2D8GZbgK5x4uOC','pharmacist','Pharmacist','+234 802 000 0002','Morning',380000,'2022-04-10','Active'),
('Chioma Eze',      'cashier@medicare.ng',     '$2y$10$LCb2cZb1JqUAzhT5lEr1aOoYwfYwfQAXz9b0sJk2D8GZbgK5x4uOC','cashier','Cashier','+234 802 000 0003','Afternoon',180000,'2023-02-01','Active'),
('Bola Ahmed',      'inventory@medicare.ng',   '$2y$10$LCb2cZb1JqUAzhT5lEr1aOoYwfYwfQAXz9b0sJk2D8GZbgK5x4uOC','inventory_manager','Inventory Manager','+234 802 000 0004','Morning',280000,'2022-09-20','Active'),
('Yusuf Garba',     'yusuf@medicare.ng',       '$2y$10$LCb2cZb1JqUAzhT5lEr1aOoYwfYwfQAXz9b0sJk2D8GZbgK5x4uOC','cashier','Cashier','+234 802 000 0005','Night',180000,'2024-03-12','Active');
-- NOTE: the bcrypt above is a placeholder for "password". Replace by registering or running:
--   php -r "echo password_hash('admin123', PASSWORD_BCRYPT);"
-- then UPDATE staff SET password_hash='...' WHERE email='admin@medicare.ng';

INSERT INTO medicines (name,generic,category,brand,buying_price,selling_price,stock,unit,reorder_level,expiry_date,manufacture_date,batch,requires_prescription,status) VALUES
('Amoxil 500mg','Amoxicillin','Antibiotics','GSK',800,1200,240,'capsules',50,DATE_ADD(CURDATE(),INTERVAL 420 DAY),DATE_SUB(CURDATE(),INTERVAL 120 DAY),'AMX2401',1,'Active'),
('Panadol Extra','Paracetamol + Caffeine','Analgesics','GSK',350,500,18,'tablets',40,DATE_ADD(CURDATE(),INTERVAL 5 DAY),DATE_SUB(CURDATE(),INTERVAL 200 DAY),'PND9920',0,'Active'),
('Vitamin C 1000mg','Ascorbic Acid','Vitamins','Emzor',1200,1800,120,'tablets',30,DATE_ADD(CURDATE(),INTERVAL 540 DAY),DATE_SUB(CURDATE(),INTERVAL 90 DAY),'VTC4410',0,'Active'),
('Coartem 80/480','Artemether/Lumefantrine','Antimalaria','Novartis',1800,2500,0,'strip',20,DATE_ADD(CURDATE(),INTERVAL 260 DAY),DATE_SUB(CURDATE(),INTERVAL 160 DAY),'COA7781',1,'Active'),
('Glucophage 500mg','Metformin','Diabetic','Merck',900,1400,65,'tablets',40,DATE_ADD(CURDATE(),INTERVAL 210 DAY),DATE_SUB(CURDATE(),INTERVAL 80 DAY),'GLP3320',1,'Active'),
('Lisinopril 10mg','Lisinopril','Cardiovascular','Pfizer',1400,2100,90,'tablets',25,DATE_ADD(CURDATE(),INTERVAL 330 DAY),DATE_SUB(CURDATE(),INTERVAL 150 DAY),'LSN5512',1,'Active'),
('Augmentin Syrup 312mg','Amoxicillin/Clavulanate','Syrup','GSK',3500,4800,8,'bottle',15,DATE_ADD(CURDATE(),INTERVAL 25 DAY),DATE_SUB(CURDATE(),INTERVAL 90 DAY),'AUG2210',1,'Active'),
('Loratadine 10mg','Loratadine','Other','Cipla',600,900,140,'tablets',30,DATE_ADD(CURDATE(),INTERVAL 610 DAY),DATE_SUB(CURDATE(),INTERVAL 40 DAY),'LRT0001',0,'Active'),
('Fluconazole 150mg','Fluconazole','Antifungal','Fidson',500,850,55,'capsules',25,DATE_ADD(CURDATE(),INTERVAL 180 DAY),DATE_SUB(CURDATE(),INTERVAL 200 DAY),'FLU7700',0,'Active'),
('Hydrocortisone Cream','Hydrocortisone 1%','Skincare','GSK',1100,1700,30,'tube',20,DATE_ADD(CURDATE(),INTERVAL 440 DAY),DATE_SUB(CURDATE(),INTERVAL 70 DAY),'HYD1010',0,'Active'),
('Vitamin B-Complex','B-Complex','Vitamins','Emzor',700,1100,200,'tablets',40,DATE_ADD(CURDATE(),INTERVAL 720 DAY),DATE_SUB(CURDATE(),INTERVAL 30 DAY),'VTB5520',0,'Active'),
('Ceftriaxone 1g Injection','Ceftriaxone','Injection','Sandoz',2200,3200,12,'vial',15,DATE_ADD(CURDATE(),INTERVAL 60 DAY),DATE_SUB(CURDATE(),INTERVAL 180 DAY),'CFT9090',1,'Active');

INSERT INTO customers (name,phone,email,blood_group,allergies,total_purchases,outstanding_debt,loyalty_points,last_visit,status) VALUES
('Walk-in Customer','-','-',NULL,NULL,0,0,0,NOW(),'Active'),
('Ngozi Adichie','+234 802 111 2233','ngozi@mail.com','O+','Penicillin',124500,0,124,DATE_SUB(NOW(),INTERVAL 2 DAY),'Active'),
('Femi Otedola','+234 803 444 5566','femi@mail.com','A+',NULL,88000,12000,88,DATE_SUB(NOW(),INTERVAL 5 DAY),'Active'),
('Aisha Bello','+234 805 777 8899','aisha@mail.com','B+','Sulfa drugs',45200,0,45,DATE_SUB(NOW(),INTERVAL 1 DAY),'Active'),
('Emeka Nwosu','+234 807 222 3344','emeka@mail.com','AB+',NULL,201300,8500,201,DATE_SUB(NOW(),INTERVAL 10 DAY),'Active'),
('Funke Akindele','+234 809 666 1010','funke@mail.com','O-',NULL,32000,0,32,DATE_SUB(NOW(),INTERVAL 30 DAY),'Inactive');

INSERT INTO suppliers (name,company,phone,email,address,last_order,outstanding,status) VALUES
('Mr. Adeola Bankole','PharmaCare Distributors Ltd','+234 800 111 2222','sales@pharmacare.ng','23 Allen Ave, Ikeja',DATE_SUB(NOW(),INTERVAL 5 DAY),250000,'Active'),
('Mrs. Funmi Lawal','MediSource Nigeria','+234 800 333 4444','orders@medisource.ng','15 Broad St, Lagos Island',DATE_SUB(NOW(),INTERVAL 12 DAY),0,'Active'),
('Mr. Ibrahim Sani','Northern Pharma Supplies','+234 800 555 6666','info@northpharma.ng','7 Ahmadu Bello Way, Abuja',DATE_SUB(NOW(),INTERVAL 30 DAY),75000,'Active');

INSERT INTO expenses (date,category,description,amount,recorded_by) VALUES
(DATE_SUB(CURDATE(),INTERVAL 1 DAY),'Restock','Restock from PharmaCare',480000,'Admin'),
(DATE_SUB(CURDATE(),INTERVAL 3 DAY),'Utilities','PHCN electricity',35000,'Admin'),
(DATE_SUB(CURDATE(),INTERVAL 5 DAY),'Salaries','Staff salaries Apr',920000,'Admin'),
(DATE_SUB(CURDATE(),INTERVAL 9 DAY),'Maintenance','Generator service',18500,'Admin'),
(DATE_SUB(CURDATE(),INTERVAL 15 DAY),'Equipment','New POS printer',62000,'Admin');

INSERT INTO prescriptions (patient,doctor,hospital,date_issued,valid_until,status,filled_by) VALUES
('Ngozi Adichie','Dr. Bello','Reddington Hospital',DATE_SUB(CURDATE(),INTERVAL 1 DAY),DATE_ADD(CURDATE(),INTERVAL 29 DAY),'Pending',NULL),
('Femi Otedola','Dr. Adewale','Lagoon Hospital',DATE_SUB(CURDATE(),INTERVAL 3 DAY),DATE_ADD(CURDATE(),INTERVAL 27 DAY),'Partially Filled','Tunde Adeyemi'),
('Aisha Bello','Dr. Eze','St. Nicholas',DATE_SUB(CURDATE(),INTERVAL 7 DAY),DATE_ADD(CURDATE(),INTERVAL 23 DAY),'Filled','Tunde Adeyemi');

INSERT INTO prescription_items (prescription_id,name,dosage,frequency,duration,qty) VALUES
(1,'Amoxil 500mg','500mg','TID','7 days',21),
(1,'Panadol Extra','500mg','PRN','5 days',10),
(2,'Lisinopril 10mg','10mg','OD','30 days',30),
(3,'Coartem 80/480','4 tabs','BID','3 days',24);

INSERT INTO attendance (staff_id,staff_name,date,clock_in,clock_out,status) VALUES
(2,'Tunde Adeyemi',CURDATE(),'08:02',NULL,'Present'),
(3,'Chioma Eze',CURDATE(),'09:14',NULL,'Late'),
(4,'Bola Ahmed',CURDATE(),'07:55',NULL,'Present'),
(5,'Yusuf Garba',CURDATE(),NULL,NULL,'Absent');
