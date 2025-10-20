# Offer Management Implementation - Room Types & Service Types

## Overview
This implementation adds the ability to create offers/discounts that can be linked to specific room types and service types from the admin dashboard. Admins can now create targeted offers for specific rooms or services instead of applying them broadly.

## Features Implemented

### 1. **Database Schema**
Created two new association tables:

#### `discount_room_type` Table
Links discounts to specific room types.
```sql
- discount_room_type_id (PK, UUID)
- discount_id (FK to discount table)
- room_type_id (FK to room_types table)
- created_at (timestamp)
- Unique constraint on (discount_id, room_type_id)
```

#### `discount_service` Table
Links discounts to specific services.
```sql
- discount_service_id (PK, UUID)
- discount_id (FK to discount table)
- service_id (FK to service_catalogue table)
- created_at (timestamp)
- Unique constraint on (discount_id, service_id)
```

### 2. **Backend API Updates**

#### Updated Endpoints

**POST /api/discounts** - Create Discount
- Now accepts `room_type_ids` (array) and `service_ids` (array)
- Creates associations in the junction tables
- Returns the created discount with associated IDs

**PUT /api/discounts/:discount_id** - Update Discount
- Accepts `room_type_ids` and `service_ids` for updates
- Replaces existing associations with new ones
- Returns updated discount with associated IDs

**GET /api/discounts/:discount_id** - Get Discount by ID
- Returns discount with `room_type_ids` and `service_ids` arrays
- Shows which specific room types and services the discount applies to

#### Request Body Example
```json
{
  "discount_name": "Summer Special - Deluxe Rooms",
  "type": "rate",
  "discount_value": 25.00,
  "applies_to": "ROOMS",
  "start_date": "2025-06-01",
  "end_date": "2025-08-31",
  "room_type_ids": ["uuid-1", "uuid-2"],
  "service_ids": []
}
```

### 3. **Frontend Admin Dashboard Updates**

#### Add/Edit Offer Modal Enhancements
- **Conditional Display**: Room types and services selection only shows based on "Applies To" field
  - If "Rooms Only" → Shows room types selection only
  - If "Services Only" → Shows services selection only
  - If "Services & Rooms" → Shows both selections

- **Multi-Select Checkboxes**: 
  - Scrollable list of all available room types with details (type, price, capacity)
  - Scrollable list of all available services with details (name, price, category)
  - Visual feedback on hover
  - Checkbox state persists during editing

- **Optional Selection**: 
  - If no specific items are selected, the offer applies to ALL items in that category
  - This maintains backward compatibility with existing broad offers

#### UI Features
- Clean, modern checkbox interface
- Max height with scroll for long lists
- Hover effects for better UX
- Clear labeling: "Optional - leave empty for all"
- Shows relevant details for each option

### 4. **How It Works**

#### Creating a New Offer
1. Admin clicks "Add Offer" in the Offers tab
2. Fills in basic offer details (name, type, value, dates)
3. Selects "Applies To" category
4. Conditionally sees room types and/or services checkboxes
5. Selects specific items (optional)
6. Submits form
7. Backend creates discount and associations
8. Frontend refreshes the offers list

#### Editing an Existing Offer
1. Admin clicks edit icon on an offer
2. Modal pre-populates with existing data including selected room types/services
3. Admin can modify selections
4. On submit, backend replaces old associations with new ones
5. Frontend updates the display

#### Offer Application Logic
- **No specific items selected**: Offer applies to ALL items in the category
- **Specific items selected**: Offer only applies to those specific room types or services
- **Mixed selection**: Can select some room types and some services when "Services & Rooms" is chosen

## Installation & Setup

### Step 1: Run Database Migration
Execute the SQL script to create the association tables:

```bash
# Option 1: Using MySQL command line
mysql -u skynestadmin -p SkyNest_Hotels < backend/scripts/create-discount-associations.sql

# Option 2: Using the application
# The script is located at: backend/scripts/create-discount-associations.sql
# Run it manually in your MySQL client
```

### Step 2: Restart Backend Server
The backend changes are already in place. Just restart:

```bash
cd backend
pnpm dev
```

### Step 3: Restart Frontend (if running)
```bash
cd frontend
npm start
```

## Files Modified

### Backend
1. **`backend/src/controllers/discountController.ts`**
   - Updated `createDiscount()` to handle room_type_ids and service_ids
   - Updated `updateDiscount()` to replace associations
   - Updated `getDiscountById()` to return associations

2. **`backend/migrations/sqls/20251020130938-add-discount-associations-up.sql`**
   - Migration to create association tables

3. **`backend/scripts/create-discount-associations.sql`**
   - Manual migration script (use this if db-migrate fails)

### Frontend
1. **`frontend/src/components/AdminDashboard.js`**
   - Updated discount form state to include arrays
   - Added `handleRoomTypeToggle()` and `handleServiceToggle()` functions
   - Updated Add Offer modal with multi-select UI
   - Updated Edit Offer modal with multi-select UI
   - Conditional rendering based on "Applies To" selection

## Usage Examples

### Example 1: Weekend Special for Deluxe Rooms
```json
{
  "discount_name": "Weekend Deluxe Special",
  "type": "rate",
  "discount_value": 20,
  "applies_to": "ROOMS",
  "room_type_ids": ["deluxe-room-uuid", "executive-suite-uuid"],
  "service_ids": []
}
```

### Example 2: Spa Services Discount
```json
{
  "discount_name": "Spa Package Deal",
  "type": "fixed",
  "discount_value": 50,
  "applies_to": "SERVICES",
  "room_type_ids": [],
  "service_ids": ["massage-uuid", "facial-uuid", "sauna-uuid"]
}
```

### Example 3: Complete Package Offer
```json
{
  "discount_name": "Luxury Experience Package",
  "type": "rate",
  "discount_value": 15,
  "applies_to": "SERVICES_AND_ROOMS",
  "room_type_ids": ["presidential-suite-uuid"],
  "service_ids": ["room-service-uuid", "spa-uuid", "dining-uuid"]
}
```

## Testing Checklist

- [ ] Create offer with specific room types only
- [ ] Create offer with specific services only
- [ ] Create offer with both room types and services
- [ ] Create offer with no specific selections (applies to all)
- [ ] Edit existing offer and change selections
- [ ] Edit offer and remove all selections
- [ ] Verify associations are saved correctly in database
- [ ] Verify associations are loaded correctly when editing
- [ ] Test with different "Applies To" categories
- [ ] Verify UI shows/hides selections based on category

## API Response Example

```json
{
  "success": true,
  "message": "Discount created successfully.",
  "data": {
    "discount": {
      "discount_id": "abc-123-def-456",
      "discount_name": "Summer Special",
      "type": "rate",
      "discount_value": 25.00,
      "applies_to": "ROOMS",
      "start_date": "2025-06-01",
      "end_date": "2025-08-31",
      "is_active": false,
      "room_type_ids": ["uuid-1", "uuid-2"],
      "service_ids": [],
      "created_at": "2025-10-20T12:00:00.000Z",
      "updated_at": "2025-10-20T12:00:00.000Z"
    }
  }
}
```

## Benefits

1. **Targeted Marketing**: Create specific offers for premium rooms or popular services
2. **Flexibility**: Mix and match room types and services in a single offer
3. **Backward Compatible**: Existing broad offers continue to work
4. **User-Friendly**: Intuitive checkbox interface for admins
5. **Scalable**: Easy to add more room types or services without code changes

## Future Enhancements

- Add bulk selection (Select All / Deselect All buttons)
- Add search/filter for long lists of room types or services
- Show offer preview with selected items
- Add offer usage analytics per room type/service
- Create offer templates for common combinations

## Support

For issues or questions:
1. Check the browser console for frontend errors
2. Check backend logs for API errors
3. Verify database tables were created correctly
4. Ensure all dependencies are installed

---

**Implementation Date**: October 20, 2025  
**Status**: ✅ Complete and Ready for Testing
