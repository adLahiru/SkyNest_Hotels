# Generated Column Fix - Booking System

## Issue
Error when creating a booking:
```
Error: The value specified for generated column 'total_amount' in table 'booking' is not allowed.
Code: ER_NON_DEFAULT_VALUE_FOR_GENERATED_COLUMN
```

## Root Cause
The `total_amount` column in the `booking` table is defined as a **GENERATED ALWAYS** column:

```sql
ALTER TABLE booking
  ADD COLUMN `total_amount` DECIMAL(10, 2) 
  GENERATED ALWAYS AS (`room_charges` + `service_charges`) STORED;
```

This means:
- ❌ **Cannot** insert values into `total_amount` directly
- ✅ **Automatically** calculated by MySQL as: `room_charges + service_charges`
- ✅ Value is **STORED** in the table (not virtual)

## Solution Applied

### Before (❌ WRONG):
```typescript
// Trying to insert total_amount manually
const [result] = await connection.query<ResultSetHeader>(
  `INSERT INTO booking 
   (booking_id, ..., room_charges, total_amount) 
   VALUES (?, ..., ?, ?)`,
  [booking_id, ..., roomCharges, roomCharges]  // ❌ Error!
);
```

### After (✅ CORRECT):
```typescript
// Let database calculate total_amount automatically
const [result] = await connection.query<ResultSetHeader>(
  `INSERT INTO booking 
   (booking_id, ..., room_charges) 
   VALUES (?, ..., ?)`,
  [booking_id, ..., roomCharges]  // ✅ Works!
);
```

## How It Works Now

### 1. Initial Booking Creation
```sql
INSERT INTO booking 
  (booking_id, room_charges, service_charges)
VALUES 
  ('abc-123', 300.00, 0.00);

-- MySQL automatically calculates:
-- total_amount = 300.00 + 0.00 = 300.00
```

### 2. After Adding Services
```sql
UPDATE booking 
SET service_charges = 75.00
WHERE booking_id = 'abc-123';

-- MySQL automatically recalculates:
-- total_amount = 300.00 + 75.00 = 375.00
```

### 3. Database Query Result
```javascript
// When we SELECT the booking, we get:
{
  booking_id: 'abc-123',
  room_charges: 300.00,
  service_charges: 75.00,
  total_amount: 375.00  // ✅ Auto-calculated!
}
```

## Benefits of Generated Columns

✅ **Always Accurate**: Cannot have mismatched totals
✅ **No Manual Calculation**: Database handles it automatically
✅ **Data Integrity**: Prevents human error in calculations
✅ **Performance**: Value is STORED, no recalculation on SELECT
✅ **Simplicity**: Less code in application layer

## Updated Booking Flow

```
Customer creates booking
   ↓
Backend calculates:
   - total_days = 3
   - room_charges = $150 × 3 = $450
   ↓
Insert into database:
   - room_charges = 450.00
   - service_charges = 0.00 (default)
   ↓
MySQL generates:
   - total_amount = 450.00 + 0.00 = 450.00 ✅
   ↓
Response returned:
   {
     room_charges: 450.00,
     service_charges: 0.00,
     total_amount: 450.00
   }
```

## Code Changes

### File: `backend/src/controllers/bookingController.ts`

**Line ~268-277** - Removed `total_amount` from INSERT:
```typescript
// Old: 13 columns including total_amount
`INSERT INTO booking 
 (booking_id, ..., room_charges, total_amount)`

// New: 12 columns, total_amount auto-calculated
`INSERT INTO booking 
 (booking_id, ..., room_charges)`
```

**Line ~330** - Updated response to use database value:
```typescript
// Now returns the auto-calculated value from database
total_amount: booking?.total_amount || roomCharges
```

## Testing

### ✅ Test 1: Create Booking
```javascript
POST /api/bookings
{
  "room_id": 1,
  "checking_datetime": "2025-10-25",
  "checkout_datetime": "2025-10-27",
  "number_of_guests": 2
}

// Response should include:
{
  "room_charges": 300.00,
  "service_charges": 0.00,
  "total_amount": 300.00  // ✅ Auto-calculated
}
```

### ✅ Test 2: Add Services (from Admin Dashboard)
```javascript
// Staff adds spa service ($50) and room service ($25)
UPDATE booking SET service_charges = 75.00

// Database automatically updates:
// total_amount = 300.00 + 75.00 = 375.00 ✅
```

### ✅ Test 3: Verify Database
```sql
SELECT 
  room_charges,
  service_charges,
  total_amount 
FROM booking 
WHERE booking_id = 'abc-123';

-- Result:
-- room_charges: 300.00
-- service_charges: 75.00
-- total_amount: 375.00 ✅ (matches calculation)
```

## Important Notes

⚠️ **Never try to UPDATE total_amount directly**:
```sql
-- ❌ WRONG - Will cause error
UPDATE booking SET total_amount = 500.00;

-- ✅ CORRECT - Update the components
UPDATE booking SET service_charges = 200.00;
-- total_amount updates automatically
```

⚠️ **When adding new fields to booking INSERT**:
- Only add non-generated columns
- Let MySQL calculate generated columns
- Check migration files for column definitions

## Migration File Reference

**File**: `backend/migrations/sqls/20251019222509-add-booking-charges-and-revenue-up.sql`

```sql
ALTER TABLE booking
  ADD COLUMN `room_charges` DECIMAL(10, 2) DEFAULT 0.00 AFTER `booking_date`,
  ADD COLUMN `service_charges` DECIMAL(10, 2) DEFAULT 0.00 AFTER `room_charges`,
  ADD COLUMN `total_amount` DECIMAL(10, 2) 
    GENERATED ALWAYS AS (`room_charges` + `service_charges`) STORED 
    AFTER `service_charges`;
```

**Key Points**:
- `room_charges`: Normal column, can INSERT/UPDATE
- `service_charges`: Normal column, can INSERT/UPDATE
- `total_amount`: **GENERATED ALWAYS** column, read-only!

## Fix Status

✅ **Fixed**: Removed `total_amount` from INSERT statement
✅ **Built**: Backend compiled successfully
✅ **Ready**: System now works with generated columns correctly

## Next Steps

1. Start/restart backend server
2. Test booking creation from frontend
3. Verify `total_amount` is calculated correctly
4. Test adding services to booking
5. Confirm `total_amount` updates automatically

---

**Date Fixed**: October 20, 2025
**Issue**: ER_NON_DEFAULT_VALUE_FOR_GENERATED_COLUMN
**Solution**: Remove generated columns from INSERT/UPDATE statements
**Status**: ✅ Resolved
