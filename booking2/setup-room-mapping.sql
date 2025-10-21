-- =====================================================
-- Room Mapping Table Setup
-- =====================================================
-- This table maps external room IDs from OTAs (Booking.com, Expedia, etc.) 
-- to your local room IDs

CREATE TABLE IF NOT EXISTS room_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_room_id VARCHAR(100) NOT NULL COMMENT 'Room ID from the external channel (e.g., Booking.com room ID)',
    local_room_id INT NOT NULL COMMENT 'Your local room ID from the rooms table',
    channel_type ENUM('booking_com', 'expedia', 'airbnb', 'direct') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Ensure each external room is mapped only once per channel
    UNIQUE KEY unique_mapping (external_room_id, channel_type),
    
    -- Foreign key to ensure room exists
    FOREIGN KEY (local_room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    
    -- Index for faster lookups
    INDEX idx_channel_external (channel_type, external_room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Maps external OTA room IDs to local room IDs';

-- =====================================================
-- Example Data - REPLACE WITH YOUR ACTUAL ROOM IDs
-- =====================================================

-- Example 1: Map Booking.com room to your local room 1
INSERT INTO room_mapping (external_room_id, local_room_id, channel_type) 
VALUES ('BDC-DELUXE-001', 1, 'booking_com')
ON DUPLICATE KEY UPDATE local_room_id = 1;

-- Example 2: Map Expedia room to your local room 1
INSERT INTO room_mapping (external_room_id, local_room_id, channel_type) 
VALUES ('EXP-ROOM-12345', 1, 'expedia')
ON DUPLICATE KEY UPDATE local_room_id = 1;

-- Example 3: Map Airbnb listing to your local room 2
INSERT INTO room_mapping (external_room_id, local_room_id, channel_type) 
VALUES ('ABB-LISTING-789', 2, 'airbnb')
ON DUPLICATE KEY UPDATE local_room_id = 2;

-- =====================================================
-- Query to Check Your Current Rooms
-- =====================================================
-- Run this to see what rooms you have
SELECT 
    r.id AS local_room_id,
    r.room_number,
    r.room_type,
    hb.name AS hotel_branch_name
FROM rooms r
JOIN hotel_branches hb ON r.hotel_branch_id = hb.id
ORDER BY r.id;

-- =====================================================
-- Query to Check Your Mappings
-- =====================================================
SELECT 
    rm.id,
    rm.external_room_id,
    rm.channel_type,
    r.room_number AS local_room_number,
    r.room_type,
    hb.name AS hotel_branch
FROM room_mapping rm
JOIN rooms r ON rm.local_room_id = r.id
JOIN hotel_branches hb ON r.hotel_branch_id = hb.id
ORDER BY rm.channel_type, rm.external_room_id;

-- =====================================================
-- How to Get External Room IDs
-- =====================================================
/*
Booking.com:
  1. Log into Booking.com Extranet
  2. Go to "Property" > "Rooms & Rates"
  3. Each room has a unique ID (usually visible in the URL or room settings)

Expedia:
  1. Log into Expedia Partner Central
  2. Go to "Property" > "Rooms"
  3. Room IDs are listed next to each room type

Airbnb:
  1. Log into Airbnb Host Dashboard
  2. Each listing has a unique listing ID
  3. Found in the URL: airbnb.com/rooms/[LISTING_ID]

Note: These IDs are provided by the OTA and you need to map them manually
*/
