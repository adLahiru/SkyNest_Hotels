-- Seed 45 Rooms: 9 per branch for 5 branches
-- Rules:
-- - Floors: 1, 2, 3 (3 rooms each floor per branch)
-- - Room numbers auto pattern per branch: 101-103, 201-203, 301-303
-- - State: 'available'
-- - Room type: chosen randomly from room_types
-- - Avoid duplicates if rooms already exist
--
-- Run with:
--   mysql -u root -p SkyNest_Hotels < scripts/seed-rooms.sql

START TRANSACTION;

-- Select exactly 5 branches to target
DROP TEMPORARY TABLE IF EXISTS tmp_branches;
CREATE TEMPORARY TABLE tmp_branches (
  branch_id CHAR(36) PRIMARY KEY
) ENGINE=MEMORY;

INSERT INTO tmp_branches (branch_id)
SELECT branch_id
FROM hotel_branches
ORDER BY created_at ASC
LIMIT 5;

-- Numbers helper (1..9) -> 9 rooms per branch
DROP TEMPORARY TABLE IF EXISTS tmp_nums;
CREATE TEMPORARY TABLE tmp_nums (n INT PRIMARY KEY) ENGINE=MEMORY;
INSERT INTO tmp_nums (n)
VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9);

-- Insert rooms: 9 per branch
INSERT INTO rooms (room_type_id, branch_id, room_no, floor_no, state)
SELECT
  -- Random room type for each room
  (SELECT rt.room_type_id FROM room_types rt ORDER BY RAND() LIMIT 1) AS room_type_id,
  tb.branch_id,
  -- Auto room number per floor and index on floor
  CONCAT(CEIL(tn.n/3), LPAD(((tn.n - 1) % 3) + 1, 2, '0')) AS room_no,
  CEIL(tn.n/3) AS floor_no,
  'available' AS state
FROM tmp_branches tb
CROSS JOIN tmp_nums tn
-- Avoid inserting duplicates for same branch and room_no
WHERE NOT EXISTS (
  SELECT 1 FROM rooms r
  WHERE r.branch_id = tb.branch_id
    AND r.room_no = CONCAT(CEIL(tn.n/3), LPAD(((tn.n - 1) % 3) + 1, 2, '0'))
);

COMMIT;

-- Cleanup temporary tables (auto-dropped at session end; explicit for clarity)
DROP TEMPORARY TABLE IF EXISTS tmp_nums;
DROP TEMPORARY TABLE IF EXISTS tmp_branches;
