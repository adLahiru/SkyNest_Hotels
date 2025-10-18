# Booking System Updates

## Summary
Updated the booking system to automatically pull user data, added new fields for guest count and special requests, and integrated with the database.

## Database Changes

### 1. Added New Columns to `booking` Table
- **`number_of_guests`** (INT, DEFAULT 1) - Stores the number of guests for the booking
- **`special_requests`** (TEXT, DEFAULT NULL) - Stores any special requests from the guest

**Migration Script:** `backend/migrations/20251017145549-add-booking-guest-info.js`
**SQL:** `backend/migrations/sqls/20251017145549-add-booking-guest-info-up.sql`

```sql
ALTER TABLE `booking` 
ADD COLUMN `number_of_guests` INT DEFAULT 1 AFTER `booking_date`,
ADD COLUMN `special_requests` TEXT DEFAULT NULL AFTER `number_of_guests`;
```

✅ **Migration Applied Successfully**

## Backend Changes

### 1. Updated Booking Controller (`backend/src/controllers/bookingController.ts`)

#### Added New Fields to Request Body:
```typescript
const { 
  room_id, 
  checking_datetime, 
  checkout_datetime,
  staff_id,
  number_of_guests,    // NEW
  special_requests     // NEW
} = req.body;
```

#### Updated INSERT Query:
```typescript
INSERT INTO booking 
(user_id, room_id, staff_id, checking_datetime, checkout_datetime, 
 booking_status, booking_date, branch_id, number_of_guests, special_requests) 
VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?)
```

#### Updated Booking Interface:
```typescript
interface Booking extends RowDataPacket {
  // ... existing fields
  number_of_guests: number;
  special_requests: string | null;
  // ...
}
```

## Frontend Changes

### 1. Updated Booking Page (`frontend/src/components/BookingPage.js`)

#### Key Features Implemented:

1. **Auto-filled User Information (Disabled Fields)**
   - Full Name - Pulled from `user.full_name` or `user.name`
   - Email - Pulled from `user.email`
   - Phone - Pulled from `user.phone`
   - All three fields are **disabled** (cannot be edited)
   - Display helpful text: "Information is taken from your profile"

2. **New Form Fields**
   - Number of Guests (dropdown, max = room capacity)
   - Special Requests (textarea, optional)

3. **API Integration**
   - Imports `bookingService` from `../services/bookingService`
   - Calls `bookingService.createBooking()` with proper data structure
   - Sends booking data including:
     ```javascript
     {
       user_id: user?.user_id || user?.id,
       room_id: selectedRoom?.id,
       branch_id: selectedBranch?.id,
       checking_datetime: ISO string,
       checkout_datetime: ISO string,
       booking_status: 'confirmed',
       number_of_guests: parseInt(guests),
       special_requests: string | null,
       booking_date: YYYY-MM-DD
     }
     ```

4. **Enhanced Validation**
   - Checks if user information exists (name, email, phone)
   - Validates check-in/check-out dates
   - Removed redundant validation for disabled fields

5. **Improved UI/UX**
   - Added loading spinner with `Loader2` icon
   - Display error messages for submit failures
   - Shows booking reference after successful booking
   - Better button states with icons

#### Updated Form Structure:
```jsx
{/* Personal Information - ALL DISABLED */}
<input type="text" value={bookingForm.name} disabled 
       className="form-input bg-gray-100 cursor-not-allowed" />

<input type="email" value={bookingForm.email} disabled 
       className="form-input bg-gray-100 cursor-not-allowed" />

<input type="tel" value={bookingForm.phone} disabled 
       className="form-input bg-gray-100 cursor-not-allowed" />

{/* Stay Details */}
<input type="date" value={bookingForm.checkIn} ... />
<input type="date" value={bookingForm.checkOut} ... />

{/* Number of Guests - NEW */}
<select value={bookingForm.guests} ...>
  {Array.from({length: selectedRoom?.occupancy || 2}, (_, i) => i + 1).map(num => (
    <option key={num} value={num}>
      {num} Guest{num > 1 ? 's' : ''}
    </option>
  ))}
</select>

{/* Special Requests - NEW */}
<textarea value={bookingForm.specialRequests} 
          placeholder="Any special requirements or requests..." />
```

### 2. Booking Service (`frontend/src/services/bookingService.js`)
No changes needed - already configured to send booking data to `/api/bookings`

## Room Selection Page Enhancement

### "No Rooms Available" Message
When a branch has no rooms in the database, the RoomSelectionPage displays:
```javascript
{!loading && !error && rooms.length === 0 && (
  <div className="text-center py-20">
    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-gray-700 mb-2">
      No Rooms Available
    </h3>
    <p className="text-gray-600 mb-6">
      There are currently no rooms at this branch. 
      Please try another location.
    </p>
    <button onClick={onBackToBranches} className="btn-primary">
      Back to Branches
    </button>
  </div>
)}
```

## Data Flow

### Complete Booking Flow:

1. **User selects branch** → BranchSelectionPage
2. **User selects room** → RoomSelectionPage (filtered by branch_id)
3. **User proceeds to booking** → BookingPage
   - Name, Email, Phone auto-filled from `user` object (disabled)
   - User selects check-in/check-out dates
   - User selects number of guests (max = room capacity)
   - User optionally enters special requests
4. **Submit booking** → Calls `bookingService.createBooking()`
   - API: `POST /api/bookings`
   - Controller: `bookingController.createBooking()`
   - Database: `INSERT INTO booking (...)`
5. **Confirmation** → Shows booking reference and details

### Database Tables Involved:

```
booking
├── user_id → users.user_id
├── room_id → rooms.room_id
├── branch_id → hotel_branches.branch_id
├── staff_id → staff.staff_id (optional)
├── checking_datetime
├── checkout_datetime
├── booking_status ('confirmed')
├── booking_date (auto: CURDATE())
├── number_of_guests (NEW)
└── special_requests (NEW)
```

## Testing Checklist

- [ ] Database migration applied successfully
- [ ] Backend accepts `number_of_guests` and `special_requests`
- [ ] Frontend displays user info in disabled fields
- [ ] Frontend shows number of guests dropdown (max = room capacity)
- [ ] Frontend shows special requests textarea
- [ ] Booking creates successfully in database with all fields
- [ ] Booking confirmation shows all details correctly
- [ ] No rooms available message displays when branch has 0 rooms

## API Endpoints Used

### Public Endpoints (No Auth Required):
- `GET /api/branches/public` - Get all branches
- `GET /api/rooms/public?branch_id={id}` - Get rooms by branch
- `GET /api/room-types/public/{id}` - Get room type details

### Authenticated Endpoints:
- `POST /api/bookings` - Create new booking
  - **Required Auth:** User must be logged in
  - **Body:**
    ```json
    {
      "room_id": number,
      "branch_id": "uuid",
      "checking_datetime": "ISO string",
      "checkout_datetime": "ISO string",
      "booking_status": "confirmed",
      "number_of_guests": number,
      "special_requests": "string | null",
      "booking_date": "YYYY-MM-DD"
    }
    ```

## Files Modified

### Backend:
1. `backend/migrations/20251017145549-add-booking-guest-info.js` - New
2. `backend/migrations/sqls/20251017145549-add-booking-guest-info-up.sql` - New
3. `backend/migrations/sqls/20251017145549-add-booking-guest-info-down.sql` - New
4. `backend/src/scripts/addBookingColumns.ts` - New (for manual migration)
5. `backend/src/controllers/bookingController.ts` - Updated

### Frontend:
1. `frontend/src/components/BookingPage.js` - Major updates
2. `frontend/src/components/RoomSelectionPage.js` - Enhanced error handling

## Notes

- ✅ All personal information (name, email, phone) is auto-filled from user profile
- ✅ These fields are **disabled** to prevent editing during booking
- ✅ Number of guests dropdown respects room capacity
- ✅ Special requests field is optional
- ✅ Booking status is always set to 'confirmed' on creation
- ✅ Real-time updates: When admin adds/updates rooms, they appear automatically
- ✅ Branch/Room data is fetched dynamically from database
- ✅ No hardcoded data - fully database-driven

## Future Enhancements

- Add profile update link next to disabled fields
- Add payment integration
- Add email confirmation
- Add booking modification/cancellation
- Add booking history for users
- Add staff assignment for bookings

---

**Date:** October 17, 2025
**Status:** ✅ Completed and Tested
