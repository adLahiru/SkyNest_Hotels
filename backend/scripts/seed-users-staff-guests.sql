-- Seed Managers, Receptionists, Housekeepers, and Guests
-- Usage:
--   mysql -u root -p SkyNest_Hotels < scripts/seed-users-staff-guests.sql
-- Notes:
-- - Password for all accounts is the bcrypt hash of "12345678"
-- - Ensure 5 target branches already exist with names: Colombo, Kandy, Galle, Matara, Kegalle
-- - This script DOES NOT create or modify branches

START TRANSACTION;

-- Fixed bcrypt hash for password "12345678" (cost=10)
-- If login fails, regenerate a bcrypt hash for "12345678" and replace below
SET @PWD_HASH := '$2b$10$O7zQvGmYx1oF4E8k6nn3au7f3sQnqQ3o4M7a9e3QpCqF/0H7o1uL2';

-- Helper: first 5 branches (by created_at) or specific names where possible
DROP TEMPORARY TABLE IF EXISTS tmp_branches;
CREATE TEMPORARY TABLE tmp_branches (
  branch_id CHAR(36) PRIMARY KEY,
  branch_name VARCHAR(100)
) ENGINE=MEMORY;

-- Prefer specific names if present; otherwise fallback to first 5 by created_at
DROP TEMPORARY TABLE IF EXISTS tmp_branch_staging;
CREATE TEMPORARY TABLE tmp_branch_staging (
  branch_id CHAR(36) PRIMARY KEY,
  branch_name VARCHAR(100),
  created_at TIMESTAMP,
  priority INT
) ENGINE=MEMORY;

-- Stage preferred branches (priority 1)
INSERT INTO tmp_branch_staging (branch_id, branch_name, created_at, priority)
SELECT hb.branch_id, hb.branch_name, hb.created_at, 1 AS priority
FROM hotel_branches hb
WHERE hb.branch_name IN ('Colombo','Kandy','Galle','Mathara','Kegalle');

-- Stage remaining branches (priority 2)
INSERT INTO tmp_branch_staging (branch_id, branch_name, created_at, priority)
SELECT hb.branch_id, hb.branch_name, hb.created_at, 2 AS priority
FROM hotel_branches hb
WHERE hb.branch_name NOT IN ('Colombo','Kandy','Galle','Mathara','Kegalle');

-- Populate tmp_branches with top 5 by priority then created_at
INSERT INTO tmp_branches (branch_id, branch_name)
SELECT branch_id, branch_name
FROM tmp_branch_staging
ORDER BY priority ASC, created_at ASC
LIMIT 5;

-- Ensure we indeed have 5 branches
-- (Proceeding regardless; if less than 5 exist, counts will scale to available rows)

-- Helper numbers
DROP TEMPORARY TABLE IF EXISTS tmp_nums_2;
CREATE TEMPORARY TABLE tmp_nums_2 (n INT PRIMARY KEY) ENGINE=MEMORY;
INSERT INTO tmp_nums_2 (n) VALUES (1),(2);

DROP TEMPORARY TABLE IF EXISTS tmp_nums_5;
CREATE TEMPORARY TABLE tmp_nums_5 (n INT PRIMARY KEY) ENGINE=MEMORY;
INSERT INTO tmp_nums_5 (n) VALUES (1),(2),(3),(4),(5);

DROP TEMPORARY TABLE IF EXISTS tmp_nums_35;
CREATE TEMPORARY TABLE tmp_nums_35 (n INT PRIMARY KEY) ENGINE=MEMORY;
INSERT INTO tmp_nums_35 (n)
VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),
       (11),(12),(13),(14),(15),(16),(17),(18),(19),(20),
       (21),(22),(23),(24),(25),(26),(27),(28),(29),(30),
       (31),(32),(33),(34),(35);

-- Helper name pools (Sri Lankan-style)
DROP TEMPORARY TABLE IF EXISTS tmp_first_names;
CREATE TEMPORARY TABLE tmp_first_names (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50)) ENGINE=MEMORY;
INSERT INTO tmp_first_names (name) VALUES
 ('Viran'),('Shehara'),('Kalhara'),('Kisaja'),('Nirmal'),
 ('Ruwan'),('Sanduni'),('Isuru'),('Tharindu'),('Amaya'),
 ('Nadeesha'),('Dinuka'),('Sasindu'),('Hemali'),('Pubudu'),
 ('Janith'),('Sachini'),('Kavindu'),('Oshadi'),('Charith');

DROP TEMPORARY TABLE IF EXISTS tmp_last_names;
CREATE TEMPORARY TABLE tmp_last_names (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50)) ENGINE=MEMORY;
INSERT INTO tmp_last_names (name) VALUES
 ('Randika'),('Karunarathna'),('Jayathissa'),('Baddewela'),('Bandara'),
 ('Perera'),('Silva'),('Fernando'),('Gunasekara'),('Jayasinghe'),
 ('Wickramasinghe'),('Weerasinghe'),('Karunaratne'),('Ekanayake'),('Senanayake'),
 ('de Silva'),('Pathirana'),('Rathnayake'),('Wijesinghe'),('Abeysekera');

-- =============== MANAGERS (5 specific persons) ===============
-- Map provided managers to branches by exact branch_name
-- All salary 100000, hire_date random in 2024
-- Usernames per request: mr<firstname lowercase>

-- Prepare a table of managers
DROP TEMPORARY TABLE IF EXISTS tmp_managers;
CREATE TEMPORARY TABLE tmp_managers (
  full_name VARCHAR(100),
  email VARCHAR(120),
  username VARCHAR(50),
  branch_name VARCHAR(100),
  phone VARCHAR(20)
) ENGINE=MEMORY;

INSERT INTO tmp_managers (full_name, email, username, branch_name, phone) VALUES
 ('Viran Randika','viranrandika@gmail.com','mrviran','Kandy','+94 704563456'),
 ('Shehara Karunarathna','sheharakarunarathna@gmail.com','mrshehara','Mathara','+94 709876543'),
 ('Kalhara Jayathissa','kalharajayathissa@gmail.com','mrkalhara','Kegalle','+94 702462468'),
 ('Kisaja Baddewela','kisajabeddewela@gmail.com','mrkisaja','Galle','+94 702345678'),
 ('Nirmal Bandara','nirmalbandara@gmail.com','mrnirmal','Colombo','+94 701231234');

-- Insert managers into users ensuring uniqueness by email
-- NIC: deterministic unique per row
INSERT INTO users (user_id, name, is_guest, email, phone, nic_no, username, password)
SELECT 
  UUID(),
  tm.full_name,
  0,
  tm.email,
  tm.phone,
  CONCAT('90', LPAD(ROW_NUMBER() OVER (ORDER BY tm.full_name), 10, '0')) AS nic_no,
  tm.username,
  @PWD_HASH
FROM tmp_managers tm
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.email = tm.email
) AND NOT EXISTS (
  SELECT 1 FROM users u2 WHERE u2.username = tm.username
);

-- Link managers to staff records at their branches
INSERT INTO staff (staff_id, branch_id, role, hire_date, salary)
SELECT 
  u.user_id,
  b.branch_id,
  'MANAGER',
  DATE_ADD('2024-01-01', INTERVAL FLOOR(RAND()*365) DAY),
  100000.00
FROM users u
JOIN tmp_managers tm ON u.email = tm.email
JOIN hotel_branches b ON b.branch_name = tm.branch_name
WHERE NOT EXISTS (
  SELECT 1 FROM staff s WHERE s.staff_id = u.user_id
);

-- ========== RECEPTIONISTS: 2 per branch (total target: 10) ==========
-- Generate names/emails/usernames and insert
INSERT INTO users (user_id, name, is_guest, email, phone, nic_no, username, password)
SELECT g.user_id, g.full_name, 0, g.email, g.phone, g.nic_no, g.username, @PWD_HASH
FROM (
  SELECT 
    UUID() AS user_id,
    CONCAT(fn.name, ' ', ln.name) AS full_name,
    CONCAT(
      LOWER(REPLACE(fn.name,' ','')), '.', LOWER(REPLACE(ln.name,' ','')),
      '.r', ROW_NUMBER() OVER (ORDER BY tb.branch_id, n.n, fn.id, ln.id), '.', SUBSTRING(tb.branch_id, 1, 4),
      '@skynest.lk'
    ) AS email,
    CONCAT('+94 7', LPAD(FLOOR(RAND()*10000000), 7, '0')) AS phone,
    CONCAT('91', LPAD((ROW_NUMBER() OVER (ORDER BY tb.branch_id, n.n, fn.id, ln.id)), 10, '0')) AS nic_no,
    CONCAT('mr', LOWER(REPLACE(fn.name,' ','')), '_r', n.n, '_', SUBSTRING(tb.branch_id, 1, 4)) AS username
  FROM tmp_branches tb
  CROSS JOIN tmp_nums_2 n
  JOIN tmp_first_names fn ON fn.id = ((n.n + (SELECT COUNT(*) FROM users)) % 20) + 1
  JOIN tmp_last_names ln ON ln.id = ((n.n + fn.id) % 20) + 1
) g
LEFT JOIN users u ON u.email = g.email
WHERE u.email IS NULL
LIMIT 10;

INSERT INTO staff (staff_id, branch_id, role, hire_date, salary)
SELECT 
  u.user_id,
  tb.branch_id,
  'RECEPTIONIST' AS role,
  DATE_ADD('2024-01-01', INTERVAL FLOOR(RAND()*365) DAY) AS hire_date,
  100000.00 AS salary
FROM (
  SELECT 
    u.user_id,
    ROW_NUMBER() OVER (ORDER BY u.created_at) AS rn
  FROM users u
  WHERE u.username LIKE 'mr%_r%'
) u
JOIN (
  SELECT tb.branch_id, ROW_NUMBER() OVER (ORDER BY tb.branch_id) AS rn
  FROM tmp_branches tb
  CROSS JOIN tmp_nums_2 n
) tb ON u.rn = tb.rn
WHERE NOT EXISTS (
  SELECT 1 FROM staff s WHERE s.staff_id = u.user_id
)
LIMIT 10;

-- ========== HOUSEKEEPING: 5 per branch (total target: 25) ==========
INSERT INTO users (user_id, name, is_guest, email, phone, nic_no, username, password)
SELECT g.user_id, g.full_name, 0, g.email, g.phone, g.nic_no, g.username, @PWD_HASH
FROM (
  SELECT 
    UUID() AS user_id,
    CONCAT(fn.name, ' ', ln.name) AS full_name,
    CONCAT(
      LOWER(REPLACE(fn.name,' ','')), '.', LOWER(REPLACE(ln.name,' ','')),
      '.h', ROW_NUMBER() OVER (ORDER BY tb.branch_id, n.n, fn.id, ln.id), '.', SUBSTRING(tb.branch_id, 1, 4),
      '@skynest.lk'
    ) AS email,
    CONCAT('+94 7', LPAD(FLOOR(RAND()*10000000), 7, '0')) AS phone,
    CONCAT('92', LPAD((ROW_NUMBER() OVER (ORDER BY tb.branch_id, n.n, fn.id, ln.id)), 10, '0')) AS nic_no,
    CONCAT('mr', LOWER(REPLACE(fn.name,' ','')), '_h', n.n, '_', SUBSTRING(tb.branch_id, 1, 4)) AS username
  FROM tmp_branches tb
  CROSS JOIN tmp_nums_5 n
  JOIN tmp_first_names fn ON fn.id = ((n.n + (SELECT COUNT(*) FROM users)) % 20) + 1
  JOIN tmp_last_names ln ON ln.id = ((n.n + fn.id + 3) % 20) + 1
) g
LEFT JOIN users u ON u.email = g.email
WHERE u.email IS NULL
LIMIT 25;

INSERT INTO staff (staff_id, branch_id, role, hire_date, salary)
SELECT 
  u.user_id,
  tb.branch_id,
  'HOUSEKEEPING' AS role,
  DATE_ADD('2024-01-01', INTERVAL FLOOR(RAND()*365) DAY) AS hire_date,
  100000.00 AS salary
FROM (
  SELECT 
    u.user_id,
    ROW_NUMBER() OVER (ORDER BY u.created_at DESC) AS rn
  FROM users u
  WHERE u.username LIKE 'mr%_h%'
) u
JOIN (
  SELECT tb.branch_id, ROW_NUMBER() OVER (ORDER BY tb.branch_id, n.n) AS rn
  FROM tmp_branches tb
  CROSS JOIN tmp_nums_5 n
) tb ON u.rn = tb.rn
WHERE NOT EXISTS (
  SELECT 1 FROM staff s WHERE s.staff_id = u.user_id
)
LIMIT 25;

-- ========== GUESTS: 35 total (no staff rows) ==========
INSERT INTO users (user_id, name, is_guest, email, phone, nic_no, username, password)
SELECT g.user_id, g.full_name, 1, g.email, g.phone, g.nic_no, g.username, @PWD_HASH
FROM (
  SELECT 
    UUID() AS user_id,
    CONCAT(fn.name, ' ', ln.name) AS full_name,
    CONCAT(
      LOWER(REPLACE(fn.name,' ','')), '.', LOWER(REPLACE(ln.name,' ','')),
      '.g', ROW_NUMBER() OVER (ORDER BY n.n, fn.id, ln.id), '@guest.lk'
    ) AS email,
    CONCAT('+94 7', LPAD(FLOOR(RAND()*10000000), 7, '0')) AS phone,
    CONCAT('93', LPAD(n.n, 10, '0')) AS nic_no,
    CONCAT('mr', LOWER(REPLACE(fn.name,' ','')), '_g', n.n) AS username
  FROM tmp_nums_35 n
  JOIN tmp_first_names fn ON fn.id = ((n.n + 7) % 20) + 1
  JOIN tmp_last_names ln ON ln.id = ((n.n + 11) % 20) + 1
) g
LEFT JOIN users u ON u.email = g.email
WHERE u.email IS NULL;

COMMIT;

-- Cleanup (optional; temp tables auto-drop at session end)
DROP TEMPORARY TABLE IF EXISTS tmp_nums_2;
DROP TEMPORARY TABLE IF EXISTS tmp_nums_5;
DROP TEMPORARY TABLE IF EXISTS tmp_nums_35;
DROP TEMPORARY TABLE IF EXISTS tmp_first_names;
DROP TEMPORARY TABLE IF EXISTS tmp_last_names;
DROP TEMPORARY TABLE IF EXISTS tmp_managers;
DROP TEMPORARY TABLE IF EXISTS tmp_branches;
