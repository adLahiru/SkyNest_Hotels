# Service Management Update - Quick Reference

## What Changed?

### 1. Database: Added 2 columns to `service_types` table
- `branch_id` (CHAR(36), nullable) - Links service to specific branch
- `photo` (LONGBLOB, nullable) - Stores service image

### 2. Backend: Updated service controller
- Changed table name from `service_catalogue` to `service_types`
- Changed `unit_price` to `price`
- Changed `service_id` to `service_type_id`
- Added branch_id and photo support in createService
- Added branch name join in getServices
- Added branch_id filter option

### 3. Frontend: Enhanced Admin Dashboard
- Added branch dropdown (required field)
- Added photo upload with drag & drop
- Added photo preview and remove functionality
- Updated services table to show photo thumbnail and branch name
- Added photo validation (type, size)

## Migration Required

**IMPORTANT**: Run this SQL before using the new features:

```sql
ALTER TABLE service_types 
ADD COLUMN branch_id CHAR(36) NULL AFTER service_type_id,
ADD CONSTRAINT fk_service_type_branch 
FOREIGN KEY (branch_id) REFERENCES branch(branch_id) 
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE service_types 
ADD COLUMN photo LONGBLOB NULL AFTER description;

CREATE INDEX idx_service_type_branch ON service_types(branch_id);
CREATE INDEX idx_service_type_branch_active ON service_types(branch_id, is_active);
```

## How to Use

### Add Service with Photo and Branch:

1. Go to Admin Dashboard → Services tab
2. Click "+ Add Service"
3. Fill in:
   - Service Name: "Spa Massage"
   - Category: Select "Spa"
   - **Branch: Select from dropdown** (NEW - REQUIRED)
   - Price: 75.00
   - **Photo: Drag image or click "Choose File"** (NEW - OPTIONAL)
   - Description: "Relaxing 60-minute massage"
   - Is Active: ✓ (checked)
4. Click "Add Service"

### Photo Upload:
- Drag & drop image onto upload area, OR
- Click "Choose File" button
- Supported: JPEG, PNG, GIF, WebP
- Max size: 5MB
- Preview shows after upload
- Click X to remove and choose another

### Services Table Now Shows:
- 📷 Photo thumbnail (or placeholder icon)
- 🏢 Branch name (or "All Branches")
- All other existing fields

## Files Changed

1. ✅ `backend/src/controllers/serviceCatalogueController.ts` - Updated interface and functions
2. ✅ `frontend/src/components/AdminDashboard.js` - Added branch select & photo upload
3. ✅ `frontend/src/services/serviceCatalogueService.js` - Fixed data path
4. ✅ `backend/database_migrations/add_branch_photo_to_service_types.sql` - Migration script
5. ✅ `SERVICE_BRANCH_PHOTO_ENHANCEMENT.md` - Full documentation

## Testing Steps

1. Run migration SQL
2. Restart backend: `cd backend; npm start`
3. Frontend auto-reloads
4. Login as admin
5. Go to Services tab
6. Try adding service with photo and branch
7. Verify table shows photo and branch

## Important Notes

- **Branch is now REQUIRED** when creating services
- Photo is optional but recommended
- Photos are stored as base64 in database
- Services can be branch-specific (better management)
- Backend now uses `service_types` table (not `service_catalogue`)

## Next Steps

After migration:
1. Test creating a service with photo
2. Test creating a service without photo  
3. Verify photos display in table
4. Verify branch names display correctly
5. Test search/filter still works

