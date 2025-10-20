-- =============================================
-- SEED DATA PART 1: BRANCHES & ROOM TYPES
-- =============================================
-- Run Order: 1st
-- Description: Creates 5 branches (including Head Office) and 20 room types
-- =============================================

START TRANSACTION;

-- Password hash for '12345678' (bcrypt with salt rounds=10)
SET @PWD_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.8Z5xqPqsVqWqQvqkPbTqJ7z.OaLi';

-- =============================================
-- BRANCHES (5 total including Head Office)
-- =============================================

INSERT INTO hotel_branches (branch_id, branch_name, address, email, phone, created_at) VALUES
('b1111111-1111-1111-1111-111111111111', 'Head Office', '123 Main Street, Colombo 01', 'headoffice@skynest.lk', '+94 112 345 001', NOW()),
('b2222222-2222-2222-2222-222222222222', 'Airport Branch', '456 Airport Road, Katunayake', 'airport@skynest.lk', '+94 112 345 002', NOW()),
('b3333333-3333-3333-3333-333333333333', 'Beach Resort', '789 Beach Road, Galle', 'beach@skynest.lk', '+94 112 345 003', NOW()),
('b4444444-4444-4444-4444-444444444444', 'Hill Country Lodge', '321 Hill View, Nuwara Eliya', 'hillcountry@skynest.lk', '+94 112 345 004', NOW()),
('b5555555-5555-5555-5555-555555555555', 'City Center Hotel', '654 City Plaza, Kandy', 'citycenter@skynest.lk', '+94 112 345 005', NOW());

-- =============================================
-- ROOM TYPES (20 total)
-- =============================================

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
('rta2222222-aaaa-2222-aaaa-222222222222', 'Budget Double', 2, 85.00, 'WiFi, TV, Fan, Shared Bathroom', 'Economical double room', NOW()),
('rta3333333-aaaa-3333-aaaa-333333333333', 'Superior Double', 2, 150.00, 'WiFi, TV, AC, Mini Bar, Coffee Maker, Premium Bedding', 'Enhanced double room with premium features', NOW()),
('rta4444444-aaaa-4444-aaaa-444444444444', 'Studio Apartment', 2, 220.00, 'WiFi, TV, AC, Kitchenette, Dining Area, Balcony', 'Self-contained studio with cooking facilities', NOW()),
('rta5555555-aaaa-5555-aaaa-555555555555', 'One Bedroom Apartment', 4, 280.00, 'WiFi, TV, AC, Full Kitchen, Living Room, Balcony', 'Spacious apartment for extended stays', NOW()),
('rta6666666-aaaa-6666-aaaa-666666666666', 'Penthouse', 6, 600.00, 'WiFi, TV, AC, Full Kitchen, Multiple Balconies, Rooftop Access, Premium Everything', 'Top-floor luxury penthouse', NOW()),
('rta7777777-aaaa-7777-aaaa-777777777777', 'Accessible Room', 2, 100.00, 'WiFi, TV, AC, Wheelchair Access, Grab Bars, Wide Doorways', 'Fully accessible room for guests with mobility needs', NOW()),
('rta8888888-aaaa-8888-aaaa-888888888888', 'Garden View Room', 2, 140.00, 'WiFi, TV, AC, Mini Bar, Garden View Balcony', 'Serene room overlooking lush gardens', NOW()),
('rta9999999-aaaa-9999-aaaa-999999999999', 'Mountain View Suite', 2, 280.00, 'WiFi, TV, AC, Mini Bar, Coffee Maker, Mountain View Balcony, Fireplace', 'Cozy suite with breathtaking mountain views', NOW()),
('rtb1111111-bbbb-1111-bbbb-111111111111', 'Pool View Room', 2, 160.00, 'WiFi, TV, AC, Mini Bar, Pool View Balcony', 'Relaxing room with pool access', NOW()),
('rtb2222222-bbbb-2222-bbbb-222222222222', 'Corner Suite', 3, 300.00, 'WiFi, TV, AC, Mini Bar, Coffee Maker, Multiple Windows, Extra Space', 'Spacious corner suite with abundant natural light', NOW());

COMMIT;

SELECT 'Part 1 Complete: 5 Branches and 20 Room Types created successfully!' AS Status;
