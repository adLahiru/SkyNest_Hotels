-- Seed 20 Different Room Types
-- Run this with: mysql -u root -p SkyNest_Hotels < scripts/seed-room-types.sql

INSERT INTO room_types (type, capacity, daily_rate, amenities, description) VALUES
-- Budget Rooms
('Standard Single', 1, 50.00, 'Wi-Fi, TV, Air Conditioning, Mini Fridge', 'Cozy single room perfect for solo travelers on a budget.'),
('Standard Double', 2, 75.00, 'Wi-Fi, TV, Air Conditioning, Coffee Maker, Mini Fridge', 'Comfortable double room with modern amenities.'),
('Twin Room', 2, 80.00, 'Wi-Fi, TV, Air Conditioning, Coffee Maker, Work Desk', 'Two single beds ideal for friends or colleagues.'),

-- Mid-Range Rooms
('Deluxe Queen', 2, 120.00, 'Wi-Fi, Smart TV, Air Conditioning, Coffee Maker, Mini Bar, Safe', 'Spacious room with queen bed and city view.'),
('Deluxe King', 2, 135.00, 'Wi-Fi, Smart TV, Air Conditioning, Coffee Maker, Mini Bar, Safe, Balcony', 'Elegant king room with private balcony.'),
('Superior Double', 2, 145.00, 'Wi-Fi, Smart TV, Air Conditioning, Coffee Maker, Mini Bar, Safe, Sofa', 'Enhanced double room with sitting area.'),
('Triple Room', 3, 160.00, 'Wi-Fi, Smart TV, Air Conditioning, Coffee Maker, Mini Bar, Work Desk', 'Perfect for small families or groups of three.'),

-- Family & Group Rooms
('Family Suite', 4, 220.00, 'Wi-Fi, Smart TV, Air Conditioning, Kitchenette, Mini Bar, Safe, Two Bathrooms', 'Spacious suite ideal for families with children.'),
('Quad Room', 4, 200.00, 'Wi-Fi, Smart TV, Air Conditioning, Coffee Maker, Mini Bar, Large Closet', 'Four-bed room perfect for group travelers.'),
('Connecting Rooms', 4, 240.00, 'Wi-Fi, Smart TV, Air Conditioning, Coffee Maker, Mini Bar, Two Separate Rooms', 'Two adjoining rooms with connecting door.'),

-- Premium Rooms
('Executive Suite', 2, 280.00, 'Wi-Fi, Smart TV, Air Conditioning, Mini Bar, Safe, Workspace, Bathtub, Balcony', 'Luxurious suite with separate living area for business travelers.'),
('Junior Suite', 2, 250.00, 'Wi-Fi, Smart TV, Air Conditioning, Mini Bar, Safe, Sofa Bed, Premium Toiletries', 'Elegant suite with enhanced comfort and space.'),
('Studio Apartment', 2, 260.00, 'Wi-Fi, Smart TV, Air Conditioning, Full Kitchen, Washing Machine, Work Desk', 'Self-contained apartment for extended stays.'),

-- Luxury Rooms
('Presidential Suite', 4, 500.00, 'Wi-Fi, Smart TV, Air Conditioning, Full Kitchen, Mini Bar, Safe, Jacuzzi, Multiple Bathrooms, Balcony, Butler Service', 'Ultimate luxury suite with panoramic views and premium amenities.'),
('Honeymoon Suite', 2, 350.00, 'Wi-Fi, Smart TV, Air Conditioning, Mini Bar, Safe, Jacuzzi, Rose Petals, Champagne, Balcony', 'Romantic suite perfect for newlyweds.'),
('Penthouse Suite', 3, 450.00, 'Wi-Fi, Smart TV, Air Conditioning, Full Kitchen, Mini Bar, Safe, Jacuzzi, Terrace, Premium View', 'Top-floor luxury suite with exclusive terrace access.'),

-- Specialty Rooms
('Accessible Room', 2, 90.00, 'Wi-Fi, TV, Air Conditioning, Wheelchair Access, Grab Bars, Roll-in Shower, Lower Fixtures', 'Fully accessible room designed for guests with mobility needs.'),
('Pet-Friendly Room', 2, 110.00, 'Wi-Fi, TV, Air Conditioning, Pet Bed, Food Bowls, Easy-Clean Flooring', 'Welcome room for guests traveling with pets.'),
('Business Class', 1, 140.00, 'Wi-Fi, Smart TV, Air Conditioning, Large Work Desk, Ergonomic Chair, Printer Access, Coffee Maker', 'Designed for business travelers with work-focused amenities.'),
('Garden View Suite', 2, 180.00, 'Wi-Fi, Smart TV, Air Conditioning, Mini Bar, Safe, Garden Access, Patio Furniture', 'Serene room with direct garden access and peaceful views.');
