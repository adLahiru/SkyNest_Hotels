-- =============================================
-- SEED DATA PART 3: ROOMS & SERVICES
-- =============================================
-- Run Order: 3rd (after seed-1 and seed-2)
-- Creates: 75 rooms (15 per branch, across 4 floors) + 15 services
-- =============================================

START TRANSACTION;

-- Branch IDs
SET @branch1 = 'b1111111-1111-1111-1111-111111111111';
SET @branch2 = 'b2222222-2222-2222-2222-222222222222';
SET @branch3 = 'b3333333-3333-3333-3333-333333333333';
SET @branch4 = 'b4444444-4444-4444-4444-444444444444';
SET @branch5 = 'b5555555-5555-5555-5555-555555555555';

-- Room Type IDs (we'll randomly distribute them)
SET @rt1 = 'rt11111111-1111-1111-1111-111111111111';
SET @rt2 = 'rt22222222-2222-2222-2222-222222222222';
SET @rt3 = 'rt33333333-3333-3333-3333-333333333333';
SET @rt4 = 'rt44444444-4444-4444-4444-444444444444';
SET @rt5 = 'rt55555555-5555-5555-5555-555555555555';
SET @rt6 = 'rt66666666-6666-6666-6666-666666666666';
SET @rt7 = 'rt77777777-7777-7777-7777-777777777777';
SET @rt8 = 'rt88888888-8888-8888-8888-888888888888';
SET @rt9 = 'rt99999999-9999-9999-9999-999999999999';
SET @rt10 = 'rta1111111-aaaa-1111-aaaa-111111111111';
SET @rt11 = 'rta2222222-aaaa-2222-aaaa-222222222222';
SET @rt12 = 'rta3333333-aaaa-3333-aaaa-333333333333';
SET @rt13 = 'rta4444444-aaaa-4444-aaaa-444444444444';
SET @rt14 = 'rta5555555-aaaa-5555-aaaa-555555555555';
SET @rt15 = 'rta6666666-aaaa-6666-aaaa-666666666666';
SET @rt16 = 'rta7777777-aaaa-7777-aaaa-777777777777';
SET @rt17 = 'rta8888888-aaaa-8888-aaaa-888888888888';
SET @rt18 = 'rta9999999-aaaa-9999-aaaa-999999999999';
SET @rt19 = 'rtb1111111-bbbb-1111-bbbb-111111111111';
SET @rt20 = 'rtb2222222-bbbb-2222-bbbb-222222222222';

-- =============== ROOMS FOR BRANCH 1 (15 rooms, floors 1-4) ===============
INSERT INTO rooms (room_no, floor_no, room_type_id, branch_id, state) VALUES
('101', 1, @rt1, @branch1, 'available'),
('102', 1, @rt2, @branch1, 'available'),
('103', 1, @rt3, @branch1, 'available'),
('104', 1, @rt5, @branch1, 'available'),
('201', 2, @rt2, @branch1, 'available'),
('202', 2, @rt3, @branch1, 'available'),
('203', 2, @rt6, @branch1, 'available'),
('204', 2, @rt12, @branch1, 'available'),
('301', 3, @rt4, @branch1, 'available'),
('302', 3, @rt7, @branch1, 'available'),
('303', 3, @rt13, @branch1, 'available'),
('304', 3, @rt17, @branch1, 'available'),
('401', 4, @rt8, @branch1, 'available'),
('402', 4, @rt9, @branch1, 'available'),
('403', 4, @rt20, @branch1, 'available');

-- =============== ROOMS FOR BRANCH 2 (15 rooms, floors 1-4) ===============
INSERT INTO rooms (room_no, floor_no, room_type_id, branch_id, state) VALUES
('101', 1, @rt10, @branch2, 'available'),
('102', 1, @rt11, @branch2, 'available'),
('103', 1, @rt2, @branch2, 'available'),
('104', 1, @rt5, @branch2, 'available'),
('201', 2, @rt3, @branch2, 'available'),
('202', 2, @rt6, @branch2, 'available'),
('203', 2, @rt12, @branch2, 'available'),
('204', 2, @rt16, @branch2, 'available'),
('301', 3, @rt4, @branch2, 'available'),
('302', 3, @rt7, @branch2, 'available'),
('303', 3, @rt13, @branch2, 'available'),
('304', 3, @rt19, @branch2, 'available'),
('401', 4, @rt8, @branch2, 'available'),
('402', 4, @rt14, @branch2, 'available'),
('403', 4, @rt20, @branch2, 'available');

-- =============== ROOMS FOR BRANCH 3 (15 rooms, floors 1-4) ===============
INSERT INTO rooms (room_no, floor_no, room_type_id, branch_id, state) VALUES
('101', 1, @rt1, @branch3, 'available'),
('102', 1, @rt2, @branch3, 'available'),
('103', 1, @rt10, @branch3, 'available'),
('104', 1, @rt11, @branch3, 'available'),
('201', 2, @rt3, @branch3, 'available'),
('202', 2, @rt6, @branch3, 'available'),
('203', 2, @rt17, @branch3, 'available'),
('204', 2, @rt19, @branch3, 'available'),
('301', 3, @rt7, @branch3, 'available'),
('302', 3, @rt12, @branch3, 'available'),
('303', 3, @rt13, @branch3, 'available'),
('304', 3, @rt18, @branch3, 'available'),
('401', 4, @rt8, @branch3, 'available'),
('402', 4, @rt9, @branch3, 'available'),
('403', 4, @rt15, @branch3, 'available');

-- =============== ROOMS FOR BRANCH 4 (15 rooms, floors 1-4) ===============
INSERT INTO rooms (room_no, floor_no, room_type_id, branch_id, state) VALUES
('101', 1, @rt1, @branch4, 'available'),
('102', 1, @rt2, @branch4, 'available'),
('103', 1, @rt10, @branch4, 'available'),
('104', 1, @rt16, @branch4, 'available'),
('201', 2, @rt3, @branch4, 'available'),
('202', 2, @rt5, @branch4, 'available'),
('203', 2, @rt6, @branch4, 'available'),
('204', 2, @rt18, @branch4, 'available'),
('301', 3, @rt4, @branch4, 'available'),
('302', 3, @rt12, @branch4, 'available'),
('303', 3, @rt13, @branch4, 'available'),
('304', 3, @rt17, @branch4, 'available'),
('401', 4, @rt8, @branch4, 'available'),
('402', 4, @rt14, @branch4, 'available'),
('403', 4, @rt20, @branch4, 'available');

-- =============== ROOMS FOR BRANCH 5 (15 rooms, floors 1-4) ===============
INSERT INTO rooms (room_no, floor_no, room_type_id, branch_id, state) VALUES
('101', 1, @rt1, @branch5, 'available'),
('102', 1, @rt2, @branch5, 'available'),
('103', 1, @rt11, @branch5, 'available'),
('104', 1, @rt5, @branch5, 'available'),
('201', 2, @rt3, @branch5, 'available'),
('202', 2, @rt6, @branch5, 'available'),
('203', 2, @rt16, @branch5, 'available'),
('204', 2, @rt19, @branch5, 'available'),
('301', 3, @rt4, @branch5, 'available'),
('302', 3, @rt7, @branch5, 'available'),
('303', 3, @rt12, @branch5, 'available'),
('304', 3, @rt13, @branch5, 'available'),
('401', 4, @rt8, @branch5, 'available'),
('402', 4, @rt9, @branch5, 'available'),
('403', 4, @rt15, @branch5, 'available');

-- =============== SERVICES (15 total) ===============
INSERT INTO service_catalogue (service_id, service_name, category, unit_price, is_active) VALUES
('s1111111-1111-1111-1111-111111111111', 'Room Service - Breakfast', 'Dining', 25.00, 1),
('s2222222-2222-2222-2222-222222222222', 'Room Service - Lunch', 'Dining', 35.00, 1),
('s3333333-3333-3333-3333-333333333333', 'Room Service - Dinner', 'Dining', 45.00, 1),
('s4444444-4444-4444-4444-444444444444', 'Laundry Service', 'Housekeeping', 15.00, 1),
('s5555555-5555-5555-5555-555555555555', 'Dry Cleaning', 'Housekeeping', 20.00, 1),
('s6666666-6666-6666-6666-666666666666', 'Airport Shuttle', 'Transport', 50.00, 1),
('s7777777-7777-7777-7777-777777777777', 'City Tour', 'Tours', 75.00, 1),
('s8888888-8888-8888-8888-888888888888', 'Spa Treatment', 'Wellness', 100.00, 1),
('s9999999-9999-9999-9999-999999999999', 'Massage Therapy', 'Wellness', 80.00, 1),
('sa111111-aaaa-1111-aaaa-111111111111', 'Mini Bar Restock', 'Room Amenities', 30.00, 1),
('sa222222-aaaa-2222-aaaa-222222222222', 'Late Checkout', 'Services', 40.00, 1),
('sa333333-aaaa-3333-aaaa-333333333333', 'Early Checkin', 'Services', 35.00, 1),
('sa444444-aaaa-4444-aaaa-444444444444', 'Pet Care Service', 'Special', 25.00, 1),
('sa555555-aaaa-5555-aaaa-555555555555', 'Extra Bedding', 'Room Amenities', 20.00, 1),
('sa666666-aaaa-6666-aaaa-666666666666', 'Conference Room Rental', 'Business', 150.00, 1);

COMMIT;

SELECT 
  '✅ Part 3 Complete!' AS Status,
  (SELECT COUNT(*) FROM rooms) AS Total_Rooms,
  (SELECT COUNT(*) FROM service_catalogue) AS Total_Services;
