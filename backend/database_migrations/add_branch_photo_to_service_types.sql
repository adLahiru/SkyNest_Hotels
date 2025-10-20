-- Migration: Add branch_id and photo columns to service_types table
-- Date: 2025-10-20
-- Description: Adds branch association and image storage to services

-- Add branch_id column (can be NULL for global services)
ALTER TABLE service_types 
ADD COLUMN branch_id CHAR(36) NULL AFTER service_type_id,
ADD CONSTRAINT fk_service_type_branch 
FOREIGN KEY (branch_id) REFERENCES branch(branch_id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Add photo column for service images (LONGBLOB for base64 images)
ALTER TABLE service_types 
ADD COLUMN photo LONGBLOB NULL AFTER description;

-- Add index on branch_id for faster queries
CREATE INDEX idx_service_type_branch ON service_types(branch_id);

-- Add index on branch_id and is_active for common queries
CREATE INDEX idx_service_type_branch_active ON service_types(branch_id, is_active);

-- Comment on columns
-- branch_id: Links service to specific branch (NULL = available at all branches)
-- photo: Stores base64 encoded image of the service
