# Booking API Fix - UUID Issue

## Problem Identified
**Error:** 500 Internal Server Error when creating booking

**Root Cause:** The `booking` table uses UUID (`CHAR(36)`) as primary key with `DEFAULT (uuid())`, but the controller was trying to use `result.insertId` (auto-increment ID) to fetch the created booking.

```sql
CREATE TABLE `booking` (
  `booking_id` CHAR(36) NOT NULL DEFAULT (uuid()),  -- UUID, not auto-increment!
  ...
)
```

## Solution Applied

### 1. Backend Fix (`bookingController.ts`)

**Before:**
```typescript
const [result] = await connection.query<ResultSetHeader>(
  `INSERT INTO booking (...) VALUES (?, ?, ...)`,
  [user_id, room_id, ...]
);

const [newBooking] = await connection.query<Booking[]>(
  `SELECT ... WHERE b.booking_id = ?`,
  [result.insertId]  // ❌ This doesn't work with UUID!
);
```

**After:**
```typescript
import { v4 as uuidv4 } from 'uuid';

// Generate UUID before inserting
const booking_id = uuidv4();

const [result] = await connection.query<ResultSetHeader>(
  `INSERT INTO booking (booking_id, user_id, room_id, ...) VALUES (?, ?, ?, ...)`,
  [booking_id, user_id, room_id, ...]  // ✅ Use generated UUID
);

const [newBooking] = await connection.query<Booking[]>(
  `SELECT ... WHERE b.booking_id = ?`,
  [booking_id]  // ✅ Use the same UUID
);
```

### 2. Enhanced Error Logging
Added detailed error logging to help debug future issues:
```typescript
console.error('Error details:', {
  message: error instanceof Error ? error.message : 'Unknown error',
  stack: error instanceof Error ? error.stack : undefined,
  error: error
});
```

### 3. Frontend Data Format Fix

**Before:**
```javascript
const bookingData = {
  user_id: user?.user_id,      // ❌ Backend gets this from JWT
  branch_id: selectedBranch?.id, // ❌ Backend gets this from room
  booking_status: 'confirmed',  // ❌ Backend sets this
  booking_date: new Date()...   // ❌ Backend uses CURDATE()
  ...
};
```

**After:**
```javascript
const bookingData = {
  room_id: selectedRoom?.id,
  checking_datetime: new Date(bookingForm.checkIn).toISOString(),
  checkout_datetime: new Date(bookingForm.checkOut).toISOString(),
  number_of_guests: parseInt(bookingForm.guests) || 1,
  special_requests: bookingForm.specialRequests?.trim() || null
};
// ✅ Only send what backend expects!
```

### 4. Service Response Handling
```javascript
booking: response.data.data?.booking || response.data.data,
// ✅ Handle both response.data.data.booking and response.data.data
```

## Files Modified

1. **backend/src/controllers/bookingController.ts**
   - Added `import { v4 as uuidv4 } from 'uuid'`
   - Generate UUID before INSERT
   - Use generated UUID in SELECT
   - Enhanced error logging

2. **frontend/src/components/BookingPage.js**
   - Removed unnecessary fields from bookingData
   - Added `setFormErrors({})` on submit start
   - Better error handling

3. **frontend/src/services/bookingService.js**
   - Added console.log for debugging
   - Better response data extraction
   - Enhanced error message

## Testing Steps

1. **Login** as a user
2. **Select a branch** (e.g., SkyNest Galle)
3. **Select a room** (e.g., Deluxe Room)
4. **Fill booking form:**
   - Name, Email, Phone: Auto-filled (disabled)
   - Check-in: Future date
   - Check-out: After check-in
   - Number of guests: Select from dropdown
   - Special requests: Optional text
5. **Click "Complete Booking"**
6. **Expected Result:**
   - ✅ Loading spinner appears
   - ✅ Booking created in database
   - ✅ Confirmation page shows with booking reference (UUID)
   - ✅ Database `booking` table has new row with all fields

## Database Query to Verify

```sql
SELECT * FROM booking 
ORDER BY created_at DESC 
LIMIT 1;
```

Should show:
- `booking_id`: UUID format (e.g., '123e4567-e89b-12d3-a456-426614174000')
- `number_of_guests`: Integer value
- `special_requests`: Text or NULL
- All other fields populated correctly

## Notes

- ✅ Backend automatically restarted with nodemon
- ✅ UUID package already installed (`uuid: ^13.0.0`)
- ✅ No database schema changes needed
- ✅ All validations still working
- ✅ User authentication required (JWT token)

---

**Status:** ✅ Fixed and Ready to Test
**Date:** October 17, 2025
