-- =============================================
-- INSERT ROOM TYPES ONLY
-- =============================================

START TRANSACTION;

INSERT INTO room_types (room_type_id, type, capacity, daily_rate, amenities, description, created_at) VALUES
('rt11111111-1111-1111-1111-111111111111', 'Standard Single', 1, 75.00, 'WiFi, TV, AC, Mini Bar', 'Cozy single room perfect for solo travelers', NOW()),
('rt22222222-2222-2222-2222-222222222222', 'Standard Double', 2, 120.00, 'WiFi, TV, AC, Mini Bar, Coffee Maker', 'Comfortable double room with modern amenities', NOW()),
('rt33333333-3333-3333-3333-333333333333', 'Deluxe Double', 2, 180.00, 'WiFi, TV, AC, Mini Bar, Coffee Maker, Balcony', 'Spacious deluxe room with beautiful views', NOW()),
('rt44444444-4444-4444-4444-444444444444', 'Executive Suite', 2, 250.00, 'WiFi, TV, AC, Mini Bar, Coffee Maker, Balcony, Work Desk, Premium Bedding', 'Elegant suite for business travelers', NOW()),
('rt55555555-5555-5555-5555-555555555555', 'Family Room', 4, 200.00, 'WiFi, TV, AC, Mini Bar, Coffee Maker, Extra Beds', 'Spacious room perfect for families', NOW()),
('rt66666666-6666-6666-6666-666666666666', 'Twin Room', 2, 130.00, 'WiFi, TV, AC, Mini Bar, Twin Beds', 'Comfortable twin bed configuration', NOW()),
('rt77777777-7777-7777-7777-777777777777', 'Ocean View Suite', 2, 320.00, 'WiFi, TV, AC, Mini Bar, Coffee Maker, Ocean View Balcony, Jacuzzi', 'Luxurious suite with stunning ocean views', NOW()),
('rt88888888-8888-8888-8888-888888888888', 'Honeymoon Suite', 2, 350.00, 'WiFi, TV, AC, Mini Bar, Coffee Maker, King Bed, Jacuzzi, Champagne', 'Romantic suite for newlyweds', NOW()),
('rt99999999-9999-9999-9999-999999999999', 'Presidential Suite', 4, 500.00, 'WiFi, TV, AC, Mini Bar, Coffee Maker, Living Room, Dining Area, Jacuzzi, Premium Everything', 'Ultimate luxury accommodation', NOW()),
('rta1111111-aaaa-1111-aaaa-111111111111', 'Budget Single', 1, 50.00, 'WiFi, TV, Fan', 'Affordable single room for budget travelers', NOW()),
('rta2222222-aaaa-2222-aaaa-222222222222', 'Budget Double', 2, 85.00, 'WiFi, TV, Fan', 'Affordable double room for budget travelers', NOW()),
('rta3333333-aaaa-3333-aaaa-333333333333', 'Premium Single', 1, 150.00, 'WiFi, TV, AC, Mini Bar, Work Desk, Premium Bedding', 'Upscale single room with premium amenities', NOW()),
('rta4444444-aaaa-4444-aaaa-444444444444', 'Premium Double', 2, 220.00, 'WiFi, TV, AC, Mini Bar, Coffee Maker, Balcony, Work Desk', 'Upscale double room with premium features', NOW()),
('rta5555555-aaaa-5555-aaaa-555555555555', 'Junior Suite', 2, 280.00, 'WiFi, TV, AC, Mini Bar, Coffee Maker, Seating Area, Balcony', 'Compact suite with sitting area', NOW()),
('rta6666666-aaaa-6666-aaaa-666666666666', 'Garden View Room', 2, 160.00, 'WiFi, TV, AC, Mini Bar, Garden View', 'Peaceful room overlooking gardens', NOW()),
('rta7777777-aaaa-7777-aaaa-777777777777', 'Mountain View Suite', 2, 300.00, 'WiFi, TV, AC, Mini Bar, Coffee Maker, Mountain View Balcony', 'Scenic mountain views from private balcony', NOW()),
('rta8888888-aaaa-8888-aaaa-888888888888', 'Accessible Room', 2, 125.00, 'WiFi, TV, AC, Wheelchair Accessible, Grab Bars', 'Fully accessible room with mobility features', NOW()),
('rta9999999-aaaa-9999-aaaa-999999999999', 'Studio Suite', 2, 190.00, 'WiFi, TV, AC, Mini Bar, Kitchenette, Work Space', 'Self-contained studio with kitchenette', NOW()),
('rtb1111111-bbbb-1111-bbbb-111111111111', 'Business Suite', 2, 270.00, 'WiFi, TV, AC, Mini Bar, Large Work Desk, Meeting Space, Printer', 'Professional suite for business needs', NOW()),
('rtb2222222-bbbb-2222-bbbb-222222222222', 'Penthouse', 4, 600.00, 'WiFi, TV, AC, Full Kitchen, Living Room, Dining Room, Multiple Bathrooms, Private Terrace', 'Top-floor luxury penthouse', NOW());

COMMIT;

SELECT '✓ 20 room types inserted successfully' AS status;
