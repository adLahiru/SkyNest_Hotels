-- =====================================================
-- Update Database Schema for Booking.com Integration
-- =====================================================

-- Add guest details and pricing columns to bookings table
-- (These are needed to store information from Booking.com)

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255) NULL AFTER status,
ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255) NULL AFTER guest_name,
ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50) NULL AFTER guest_email,
ADD COLUMN IF NOT EXISTS guest_nationality VARCHAR(3) NULL AFTER guest_phone COMMENT 'ISO country code',
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2) NULL AFTER guest_nationality,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NULL AFTER total_price COMMENT 'ISO currency code (USD, EUR, etc)',
ADD COLUMN IF NOT EXISTS synced_to_booking_com BOOLEAN DEFAULT FALSE AFTER currency COMMENT 'Whether availability has been pushed to Booking.com',
ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP NULL AFTER synced_to_booking_com COMMENT 'When the booking was synced',
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT NULL AFTER synced_at COMMENT 'Reason for cancellation',
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP NULL AFTER cancellation_reason COMMENT 'When the booking was cancelled',
ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP NULL AFTER cancelled_at COMMENT 'When the booking was last modified';

-- Add indexes for better query performance
ALTER TABLE bookings
ADD INDEX IF NOT EXISTS idx_guest_email (guest_email),
ADD INDEX IF NOT EXISTS idx_booking_dates (start_date, end_date);

-- =====================================================
-- Room Mapping Table (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS room_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_room_id VARCHAR(100) NOT NULL COMMENT 'Room ID from OTA',
    local_room_id INT NOT NULL COMMENT 'Local room ID',
    channel_type ENUM('booking_com', 'expedia', 'airbnb', 'direct') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_mapping (external_room_id, channel_type),
    FOREIGN KEY (local_room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    INDEX idx_channel_external (channel_type, external_room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Update channels table to support API credentials
-- =====================================================
ALTER TABLE booking_channels
ADD COLUMN IF NOT EXISTS api_key VARCHAR(500) NULL AFTER type,
ADD COLUMN IF NOT EXISTS api_secret VARCHAR(500) NULL AFTER api_key,
ADD COLUMN IF NOT EXISTS hotel_id VARCHAR(100) NULL AFTER api_secret COMMENT 'External hotel/property ID';

-- =====================================================
-- Verify the changes
-- =====================================================
SELECT 'Updated bookings table schema' AS status;
DESCRIBE bookings;

SELECT 'Updated booking_channels table schema' AS status;
DESCRIBE booking_channels;

SELECT 'Room mapping table' AS status;
DESCRIBE room_mapping;
