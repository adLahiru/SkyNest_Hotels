-- =============================================
-- SEED DATA PART 2: USERS & STAFF
-- =============================================
-- Run Order: 2nd (after seed-1-branches-roomtypes.sql)
-- Creates: 5 managers + 10 receptionists + 25 housekeeping + 50 guests = 90 users
-- Password for all: 12345678
-- =============================================

START TRANSACTION;

SET @PWD_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.8Z5xqPqsVqWqQvqkPbTqJ7z.OaLi';

-- Helper temp tables
DROP TEMPORARY TABLE IF EXISTS tmp_first_names;
CREATE TEMPORARY TABLE tmp_first_names (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50));
INSERT INTO tmp_first_names (name) VALUES
('John'),('Sarah'),('Michael'),('Emma'),('David'),('Olivia'),('James'),('Sophia'),('Robert'),('Isabella'),
('William'),('Mia'),('Richard'),('Charlotte'),('Joseph'),('Amelia'),('Thomas'),('Harper'),('Christopher'),('Evelyn'),
('Daniel'),('Abigail'),('Matthew'),('Emily'),('Anthony'),('Elizabeth'),('Mark'),('Sofia'),('Donald'),('Avery'),
('Steven'),('Ella'),('Paul'),('Scarlett'),('Andrew'),('Grace'),('Joshua'),('Victoria'),('Kenneth'),('Aria'),
('Kevin'),('Chloe'),('Brian'),('Camila'),('George'),('Penelope'),('Timothy'),('Layla'),('Ronald'),('Riley');

DROP TEMPORARY TABLE IF EXISTS tmp_last_names;
CREATE TEMPORARY TABLE tmp_last_names (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50));
INSERT INTO tmp_last_names (name) VALUES
('Smith'),('Johnson'),('Williams'),('Brown'),('Jones'),('Garcia'),('Miller'),('Davis'),('Rodriguez'),('Martinez'),
('Hernandez'),('Lopez'),('Gonzalez'),('Wilson'),('Anderson'),('Thomas'),('Taylor'),('Moore'),('Jackson'),('Martin'),
('Lee'),('Perez'),('Thompson'),('White'),('Harris'),('Sanchez'),('Clark'),('Ramirez'),('Lewis'),('Robinson'),
('Walker'),('Young'),('Allen'),('King'),('Wright'),('Scott'),('Torres'),('Nguyen'),('Hill'),('Flores'),
('Green'),('Adams'),('Nelson'),('Baker'),('Hall'),('Rivera'),('Campbell'),('Mitchell'),('Carter'),('Roberts');

-- Branch IDs
SET @branch1 = 'b1111111-1111-1111-1111-111111111111';
SET @branch2 = 'b2222222-2222-2222-2222-222222222222';
SET @branch3 = 'b3333333-3333-3333-3333-333333333333';
SET @branch4 = 'b4444444-4444-4444-4444-444444444444';
SET @branch5 = 'b5555555-5555-5555-5555-555555555555';

-- =============== MANAGERS (5) ===============
INSERT INTO users (user_id, name, is_guest, email, phone, nic_no, username, password) VALUES
('m1111111-1111-1111-1111-111111111111', 'John Manager', 0, 'john.manager@skynest.lk', '+94 771234501', '198512345671V', 'john.manager', @PWD_HASH),
('m2222222-2222-2222-2222-222222222222', 'Sarah Manager', 0, 'sarah.manager@skynest.lk', '+94 771234502', '198612345672V', 'sarah.manager', @PWD_HASH),
('m3333333-3333-3333-3333-333333333333', 'Michael Manager', 0, 'michael.manager@skynest.lk', '+94 771234503', '198712345673V', 'michael.manager', @PWD_HASH),
('m4444444-4444-4444-4444-444444444444', 'Emma Manager', 0, 'emma.manager@skynest.lk', '+94 771234504', '198812345674V', 'emma.manager', @PWD_HASH),
('m5555555-5555-5555-5555-555555555555', 'David Manager', 0, 'david.manager@skynest.lk', '+94 771234505', '198912345675V', 'david.manager', @PWD_HASH);

INSERT INTO staff (staff_id, branch_id, role, hire_date, salary) VALUES
('m1111111-1111-1111-1111-111111111111', @branch1, 'MANAGER', '2020-01-15', 85000.00),
('m2222222-2222-2222-2222-222222222222', @branch2, 'MANAGER', '2020-02-20', 85000.00),
('m3333333-3333-3333-3333-333333333333', @branch3, 'MANAGER', '2020-03-10', 85000.00),
('m4444444-4444-4444-4444-444444444444', @branch4, 'MANAGER', '2020-04-05', 85000.00),
('m5555555-5555-5555-5555-555555555555', @branch5, 'MANAGER', '2020-05-12', 85000.00);

-- Update branches with managers
UPDATE hotel_branches SET manager_id = 'm1111111-1111-1111-1111-111111111111' WHERE branch_id = @branch1;
UPDATE hotel_branches SET manager_id = 'm2222222-2222-2222-2222-222222222222' WHERE branch_id = @branch2;
UPDATE hotel_branches SET manager_id = 'm3333333-3333-3333-3333-333333333333' WHERE branch_id = @branch3;
UPDATE hotel_branches SET manager_id = 'm4444444-4444-4444-4444-444444444444' WHERE branch_id = @branch4;
UPDATE hotel_branches SET manager_id = 'm5555555-5555-5555-5555-555555555555' WHERE branch_id = @branch5;

-- =============== RECEPTIONISTS (10 = 2 per branch) ===============
INSERT INTO users (user_id, name, is_guest, email, phone, nic_no, username, password) VALUES
('r1111111-1111-1111-1111-111111111111', 'Olivia Reception', 0, 'olivia.r@skynest.lk', '+94 772345601', '199012345601V', 'olivia.r', @PWD_HASH),
('r1222222-1222-1222-1222-122222222222', 'James Reception', 0, 'james.r@skynest.lk', '+94 772345602', '199112345602V', 'james.r', @PWD_HASH),
('r2111111-2111-2111-2111-211111111111', 'Sophia Reception', 0, 'sophia.r@skynest.lk', '+94 772345603', '199212345603V', 'sophia.r', @PWD_HASH),
('r2222222-2222-2222-2222-222222222222', 'Robert Reception', 0, 'robert.r@skynest.lk', '+94 772345604', '199312345604V', 'robert.r', @PWD_HASH),
('r3111111-3111-3111-3111-311111111111', 'Isabella Reception', 0, 'isabella.r@skynest.lk', '+94 772345605', '199412345605V', 'isabella.r', @PWD_HASH),
('r3222222-3222-3222-3222-322222222222', 'William Reception', 0, 'william.r@skynest.lk', '+94 772345606', '199512345606V', 'william.r', @PWD_HASH),
('r4111111-4111-4111-4111-411111111111', 'Mia Reception', 0, 'mia.r@skynest.lk', '+94 772345607', '199612345607V', 'mia.r', @PWD_HASH),
('r4222222-4222-4222-4222-422222222222', 'Richard Reception', 0, 'richard.r@skynest.lk', '+94 772345608', '199712345608V', 'richard.r', @PWD_HASH),
('r5111111-5111-5111-5111-511111111111', 'Charlotte Reception', 0, 'charlotte.r@skynest.lk', '+94 772345609', '199812345609V', 'charlotte.r', @PWD_HASH),
('r5222222-5222-5222-5222-522222222222', 'Joseph Reception', 0, 'joseph.r@skynest.lk', '+94 772345610', '199912345610V', 'joseph.r', @PWD_HASH);

INSERT INTO staff (staff_id, branch_id, role, hire_date, salary) VALUES
('r1111111-1111-1111-1111-111111111111', @branch1, 'RECEPTIONIST', '2021-01-10', 45000.00),
('r1222222-1222-1222-1222-122222222222', @branch1, 'RECEPTIONIST', '2021-02-15', 45000.00),
('r2111111-2111-2111-2111-211111111111', @branch2, 'RECEPTIONIST', '2021-03-20', 45000.00),
('r2222222-2222-2222-2222-222222222222', @branch2, 'RECEPTIONIST', '2021-04-10', 45000.00),
('r3111111-3111-3111-3111-311111111111', @branch3, 'RECEPTIONIST', '2021-05-05', 45000.00),
('r3222222-3222-3222-3222-322222222222', @branch3, 'RECEPTIONIST', '2021-06-12', 45000.00),
('r4111111-4111-4111-4111-411111111111', @branch4, 'RECEPTIONIST', '2021-07-18', 45000.00),
('r4222222-4222-4222-4222-422222222222', @branch4, 'RECEPTIONIST', '2021-08-22', 45000.00),
('r5111111-5111-5111-5111-511111111111', @branch5, 'RECEPTIONIST', '2021-09-14', 45000.00),
('r5222222-5222-5222-5222-522222222222', @branch5, 'RECEPTIONIST', '2021-10-20', 45000.00);

-- =============== HOUSEKEEPING (25 = 5 per branch) ===============
INSERT INTO users (user_id, name, is_guest, email, phone, nic_no, username, password) VALUES
('h1111111-1111-1111-1111-111111111111', 'Amelia House', 0, 'amelia.h1@skynest.lk', '+94 773456701', '200012345701V', 'amelia.h1', @PWD_HASH),
('h1222222-1222-1222-1222-122222222222', 'Thomas House', 0, 'thomas.h1@skynest.lk', '+94 773456702', '200112345702V', 'thomas.h1', @PWD_HASH),
('h1333333-1333-1333-1333-133333333333', 'Harper House', 0, 'harper.h1@skynest.lk', '+94 773456703', '200212345703V', 'harper.h1', @PWD_HASH),
('h1444444-1444-1444-1444-144444444444', 'Christopher House', 0, 'christopher.h1@skynest.lk', '+94 773456704', '200312345704V', 'christopher.h1', @PWD_HASH),
('h1555555-1555-1555-1555-155555555555', 'Evelyn House', 0, 'evelyn.h1@skynest.lk', '+94 773456705', '200412345705V', 'evelyn.h1', @PWD_HASH),
('h2111111-2111-2111-2111-211111111111', 'Daniel House', 0, 'daniel.h2@skynest.lk', '+94 773456706', '200012345706V', 'daniel.h2', @PWD_HASH),
('h2222222-2222-2222-2222-222222222222', 'Abigail House', 0, 'abigail.h2@skynest.lk', '+94 773456707', '200112345707V', 'abigail.h2', @PWD_HASH),
('h2333333-2333-2333-2333-233333333333', 'Matthew House', 0, 'matthew.h2@skynest.lk', '+94 773456708', '200212345708V', 'matthew.h2', @PWD_HASH),
('h2444444-2444-2444-2444-244444444444', 'Emily House', 0, 'emily.h2@skynest.lk', '+94 773456709', '200312345709V', 'emily.h2', @PWD_HASH),
('h2555555-2555-2555-2555-255555555555', 'Anthony House', 0, 'anthony.h2@skynest.lk', '+94 773456710', '200412345710V', 'anthony.h2', @PWD_HASH),
('h3111111-3111-3111-3111-311111111111', 'Elizabeth House', 0, 'elizabeth.h3@skynest.lk', '+94 773456711', '200012345711V', 'elizabeth.h3', @PWD_HASH),
('h3222222-3222-3222-3222-322222222222', 'Mark House', 0, 'mark.h3@skynest.lk', '+94 773456712', '200112345712V', 'mark.h3', @PWD_HASH),
('h3333333-3333-3333-3333-333333333333', 'Sofia House', 0, 'sofia.h3@skynest.lk', '+94 773456713', '200212345713V', 'sofia.h3', @PWD_HASH),
('h3444444-3444-3444-3444-344444444444', 'Donald House', 0, 'donald.h3@skynest.lk', '+94 773456714', '200312345714V', 'donald.h3', @PWD_HASH),
('h3555555-3555-3555-3555-355555555555', 'Avery House', 0, 'avery.h3@skynest.lk', '+94 773456715', '200412345715V', 'avery.h3', @PWD_HASH),
('h4111111-4111-4111-4111-411111111111', 'Steven House', 0, 'steven.h4@skynest.lk', '+94 773456716', '200012345716V', 'steven.h4', @PWD_HASH),
('h4222222-4222-4222-4222-422222222222', 'Ella House', 0, 'ella.h4@skynest.lk', '+94 773456717', '200112345717V', 'ella.h4', @PWD_HASH),
('h4333333-4333-4333-4333-433333333333', 'Paul House', 0, 'paul.h4@skynest.lk', '+94 773456718', '200212345718V', 'paul.h4', @PWD_HASH),
('h4444444-4444-4444-4444-444444444444', 'Scarlett House', 0, 'scarlett.h4@skynest.lk', '+94 773456719', '200312345719V', 'scarlett.h4', @PWD_HASH),
('h4555555-4555-4555-4555-455555555555', 'Andrew House', 0, 'andrew.h4@skynest.lk', '+94 773456720', '200412345720V', 'andrew.h4', @PWD_HASH),
('h5111111-5111-5111-5111-511111111111', 'Grace House', 0, 'grace.h5@skynest.lk', '+94 773456721', '200012345721V', 'grace.h5', @PWD_HASH),
('h5222222-5222-5222-5222-522222222222', 'Joshua House', 0, 'joshua.h5@skynest.lk', '+94 773456722', '200112345722V', 'joshua.h5', @PWD_HASH),
('h5333333-5333-5333-5333-533333333333', 'Victoria House', 0, 'victoria.h5@skynest.lk', '+94 773456723', '200212345723V', 'victoria.h5', @PWD_HASH),
('h5444444-5444-5444-5444-544444444444', 'Kenneth House', 0, 'kenneth.h5@skynest.lk', '+94 773456724', '200312345724V', 'kenneth.h5', @PWD_HASH),
('h5555555-5555-5555-5555-555555555555', 'Aria House', 0, 'aria.h5@skynest.lk', '+94 773456725', '200412345725V', 'aria.h5', @PWD_HASH);

INSERT INTO staff (staff_id, branch_id, role, hire_date, salary) VALUES
('h1111111-1111-1111-1111-111111111111', @branch1, 'HOUSEKEEPING', '2022-01-10', 35000.00),
('h1222222-1222-1222-1222-122222222222', @branch1, 'HOUSEKEEPING', '2022-01-15', 35000.00),
('h1333333-1333-1333-1333-133333333333', @branch1, 'HOUSEKEEPING', '2022-02-01', 35000.00),
('h1444444-1444-1444-1444-144444444444', @branch1, 'HOUSEKEEPING', '2022-02-10', 35000.00),
('h1555555-1555-1555-1555-155555555555', @branch1, 'HOUSEKEEPING', '2022-03-05', 35000.00),
('h2111111-2111-2111-2111-211111111111', @branch2, 'HOUSEKEEPING', '2022-01-12', 35000.00),
('h2222222-2222-2222-2222-222222222222', @branch2, 'HOUSEKEEPING', '2022-01-20', 35000.00),
('h2333333-2333-2333-2333-233333333333', @branch2, 'HOUSEKEEPING', '2022-02-08', 35000.00),
('h2444444-2444-2444-2444-244444444444', @branch2, 'HOUSEKEEPING', '2022-02-18', 35000.00),
('h2555555-2555-2555-2555-255555555555', @branch2, 'HOUSEKEEPING', '2022-03-10', 35000.00),
('h3111111-3111-3111-3111-311111111111', @branch3, 'HOUSEKEEPING', '2022-01-15', 35000.00),
('h3222222-3222-3222-3222-322222222222', @branch3, 'HOUSEKEEPING', '2022-01-25', 35000.00),
('h3333333-3333-3333-3333-333333333333', @branch3, 'HOUSEKEEPING', '2022-02-12', 35000.00),
('h3444444-3444-3444-3444-344444444444', @branch3, 'HOUSEKEEPING', '2022-02-22', 35000.00),
('h3555555-3555-3555-3555-355555555555', @branch3, 'HOUSEKEEPING', '2022-03-15', 35000.00),
('h4111111-4111-4111-4111-411111111111', @branch4, 'HOUSEKEEPING', '2022-01-18', 35000.00),
('h4222222-4222-4222-4222-422222222222', @branch4, 'HOUSEKEEPING', '2022-01-28', 35000.00),
('h4333333-4333-4333-4333-433333333333', @branch4, 'HOUSEKEEPING', '2022-02-15', 35000.00),
('h4444444-4444-4444-4444-444444444444', @branch4, 'HOUSEKEEPING', '2022-02-25', 35000.00),
('h4555555-4555-4555-4555-455555555555', @branch4, 'HOUSEKEEPING', '2022-03-18', 35000.00),
('h5111111-5111-5111-5111-511111111111', @branch5, 'HOUSEKEEPING', '2022-01-20', 35000.00),
('h5222222-5222-5222-5222-522222222222', @branch5, 'HOUSEKEEPING', '2022-02-02', 35000.00),
('h5333333-5333-5333-5333-533333333333', @branch5, 'HOUSEKEEPING', '2022-02-18', 35000.00),
('h5444444-5444-5444-5444-544444444444', @branch5, 'HOUSEKEEPING', '2022-02-28', 35000.00),
('h5555555-5555-5555-5555-555555555555', @branch5, 'HOUSEKEEPING', '2022-03-20', 35000.00);

-- =============== GUESTS (50) - Using temp tables for variety ===============
INSERT INTO users (user_id, name, is_guest, email, phone, nic_no, username, password)
SELECT 
  UUID() AS user_id,
  CONCAT(f.name, ' ', l.name) AS name,
  1 AS is_guest,
  CONCAT(LOWER(REPLACE(f.name, ' ', '')), '.', LOWER(REPLACE(l.name, ' ', '')), n.id, '@guest.com') AS email,
  CONCAT('+94 7', LPAD(70000000 + n.id, 8, '0')) AS phone,
  CONCAT('19', LPAD(85 + (n.id % 10), 2, '0'), LPAD(n.id, 7, '0'), 'V') AS nic_no,
  CONCAT('guest', n.id) AS username,
  @PWD_HASH AS password
FROM 
  (SELECT 1 AS id UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION 
   SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
   SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
   SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION
   SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION
   SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30 UNION
   SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35 UNION
   SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40 UNION
   SELECT 41 UNION SELECT 42 UNION SELECT 43 UNION SELECT 44 UNION SELECT 45 UNION
   SELECT 46 UNION SELECT 47 UNION SELECT 48 UNION SELECT 49 UNION SELECT 50) n
JOIN tmp_first_names f ON f.id = ((n.id - 1) % 50) + 1
JOIN tmp_last_names l ON l.id = ((n.id + 17) % 50) + 1
WHERE NOT EXISTS (
  SELECT 1 FROM users u 
  WHERE u.email = CONCAT(LOWER(REPLACE(f.name, ' ', '')), '.', LOWER(REPLACE(l.name, ' ', '')), n.id, '@guest.com')
);

DROP TEMPORARY TABLE tmp_first_names;
DROP TEMPORARY TABLE tmp_last_names;

COMMIT;

SELECT 'Part 2 Complete: 5 Managers + 10 Receptionists + 25 Housekeeping + 50 Guests created!' AS Status;
