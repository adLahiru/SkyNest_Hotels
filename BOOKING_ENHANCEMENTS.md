# Booking System Enhancements

## Summary
Enhanced the booking system to properly handle number of guests, calculate and store room charges, and filter rooms by date availability.

## Changes Implemented

### 1. Backend - Room Charges Calculation
**File:** `backend/src/controllers/bookingController.ts`

#### createBooking Function Updates:
- **Room Charges Calculation**: Now calculates `room_charges = daily_rate × total_days`
- **Database Storage**: Stores both `room_charges` and `total_amount` in the booking table during creation
- **Response Update**: Returns `room_charges`, `total_amount`, and `number_of_guests` in the API response

```typescript
// Calculate room charges (daily_rate × number of days)
const dailyRate = room.daily_rate ? parseFloat(room.daily_rate.toString()) : 0;
const roomCharges = dailyRate * totalDays;

// Insert with room_charges and total_amount
INSERT INTO booking 
(booking_id, user_id, room_id, ..., room_charges, total_amount) 
VALUES (?, ?, ?, ..., ?, ?)
```

### 2. Backend - Room Availability Endpoint
**File:** `backend/src/controllers/bookingController.ts`

#### New Function: `getAvailableRooms`
- **Purpose**: Check which rooms are available for a specific date range
- **Endpoint**: `GET /api/bookings/available-rooms?branch_id=X&check_in=YYYY-MM-DD&check_out=YYYY-MM-DD`
- **Logic**: 
  - Finds all rooms with state='available'
  - Excludes rooms with conflicting bookings (not cancelled or checked-out)
  - Checks for date overlaps in the booking table
- **Returns**: List of available room IDs and details

```typescript
// Query excludes rooms with conflicting bookings
AND r.room_id NOT IN (
  SELECT b.room_id 
  FROM booking b
  WHERE b.booking_status NOT IN ('cancelled', 'checked_out')
  AND (date range overlap conditions)
)
```

**File:** `backend/src/routes/bookingRoutes.ts`
- Added route: `router.get('/available-rooms', getAvailableRooms)`
- **Public endpoint** - No authentication required

### 3. Frontend - Booking Page Updates
**File:** `frontend/src/components/BookingPage.js`

#### Enhancements:
- **Number of Guests**: Already sends `number_of_guests` to backend (was already implemented)
- **Confirmation Display**: Updated to show detailed breakdown:
  ```
  Room Charges (X nights × $Y): $Z
  Total Amount: $Z
  ```
- **Response Handling**: Updates form state with `room_charges` and `total_amount` from API response

### 4. Frontend - Room Selection Page
**File:** `frontend/src/components/RoomSelectionPage.js`

#### Major Changes:

**New State Variables:**
```javascript
const [checkInDate, setCheckInDate] = useState('');
const [checkOutDate, setCheckOutDate] = useState('');
const [dateFilterApplied, setDateFilterApplied] = useState(false);
```

**Date Filter UI Section:**
- Added date picker inputs for check-in and check-out dates
- Search button to apply date filters
- Clear button to reset filters
- Visual indicator showing active date range

**Smart Room Filtering:**
```javascript
// Step 1: Fetch all rooms for branch
const roomsResponse = await roomService.getAllRoomsPublic({ branch_id });

// Step 2: If dates selected, get available room IDs
if (checkInDate && checkOutDate) {
  const availabilityResponse = await bookingService.getAvailableRooms({
    branch_id, check_in, check_out
  });
  availableRoomIds = new Set(availabilityResponse.availableRooms.map(r => r.room_id));
}

// Step 3: Mark rooms as available/unavailable based on both state and booking status
isAvailable = room.state === 'available' && 
              (availableRoomIds === null || availableRoomIds.has(room.room_id));
```

**Status Messages:**
- "Available" - Room is available
- "Booked for selected dates" - Room exists but is booked for the date range
- "Currently Occupied" - Room is occupied
- "Under Maintenance" - Room is being serviced

### 5. Frontend - Booking Service
**File:** `frontend/src/services/bookingService.js`

#### New Method:
```javascript
getAvailableRooms: async ({ branch_id, check_in, check_out }) => {
  const response = await apiClient.get(`/bookings/available-rooms?${params}`);
  return {
    success: response.data.success,
    availableRooms: response.data.availableRooms || [],
    count: response.data.count || 0,
    dateRange: response.data.dateRange
  };
}
```

## Database Schema
The booking table now properly stores:
- `number_of_guests` - Number of guests for the booking
- `room_charges` - Calculated as (daily_rate × number_of_days)
- `total_amount` - Initially equals room_charges, updated later when services are added
- `checking_datetime` - Reserved check-in date
- `checkout_datetime` - Reserved check-out date

## User Flow

### 1. Room Selection with Date Filter
```
1. User selects branch → Sees all available rooms
2. User enters check-in date (e.g., 2025-10-25)
3. User enters check-out date (e.g., 2025-10-27)
4. User clicks "Search"
5. System queries available rooms for that date range
6. Only rooms that are:
   - state = 'available' AND
   - Not booked for those dates
   are shown as bookable
```

### 2. Booking Creation
```
1. User selects room and number of guests
2. Backend calculates:
   - total_days = checkout - checkin (in days)
   - room_charges = daily_rate × total_days
3. Database stores:
   - booking_status = 'confirmed'
   - number_of_guests = selected count
   - room_charges = calculated amount
   - total_amount = room_charges (initially)
4. Confirmation shows detailed breakdown
```

### 3. Check-in Process (Staff)
```
1. Staff clicks "Check In" in Admin Dashboard
2. System sets:
   - booking_status = 'checked_in'
   - check_in_time = NOW() (actual arrival time)
   - room.state = 'occupied'
3. Room charges remain unchanged from booking
```

## Benefits

✅ **Accurate Pricing**: Room charges calculated at booking time based on reserved dates
✅ **Guest Information**: Number of guests properly stored and tracked
✅ **Smart Filtering**: Users only see rooms that are actually available for their dates
✅ **Better UX**: Clear indication of why a room is unavailable (maintenance vs booked)
✅ **Conflict Prevention**: Backend validates date overlaps to prevent double-booking
✅ **Transparency**: Booking confirmation shows detailed pricing breakdown

## Testing Checklist

### Room Availability Filter
- [ ] Select check-in and check-out dates
- [ ] Verify only available rooms show "Available" status
- [ ] Verify booked rooms show "Booked for selected dates"
- [ ] Clear filters and verify all rooms appear again
- [ ] Try selecting invalid date ranges (e.g., checkout before checkin)

### Booking Creation
- [ ] Create a booking with 2 guests for 3 nights
- [ ] Verify database stores:
  - number_of_guests = 2
  - room_charges = daily_rate × 3
  - total_amount = room_charges
- [ ] Check confirmation page shows correct breakdown
- [ ] Verify room is no longer available for overlapping dates

### Admin Dashboard
- [ ] Check-in a booking
- [ ] Verify room_charges remains unchanged
- [ ] Add services to booking
- [ ] Verify total_amount updates (room_charges + service_charges)
- [ ] Check-out and verify payment processing

## Files Modified

### Backend (3 files)
1. `backend/src/controllers/bookingController.ts` - Added room_charges calculation and getAvailableRooms endpoint
2. `backend/src/routes/bookingRoutes.ts` - Added /available-rooms route

### Frontend (3 files)
1. `frontend/src/components/BookingPage.js` - Enhanced confirmation display
2. `frontend/src/components/RoomSelectionPage.js` - Added date filter UI and availability checking
3. `frontend/src/services/bookingService.js` - Added getAvailableRooms method

## API Endpoints

### New Endpoint
```
GET /api/bookings/available-rooms
Query Params:
  - branch_id (optional): Filter by branch
  - check_in (required): Check-in date (YYYY-MM-DD)
  - check_out (required): Check-out date (YYYY-MM-DD)

Response:
{
  "success": true,
  "availableRooms": [
    { "room_id": 1, "room_no": "101", "floor_no": 1, ... },
    ...
  ],
  "count": 5,
  "dateRange": {
    "check_in": "2025-10-25",
    "check_out": "2025-10-27"
  }
}
```

### Updated Endpoint
```
POST /api/bookings
Request Body:
{
  "room_id": 1,
  "checking_datetime": "2025-10-25T14:00:00",
  "checkout_datetime": "2025-10-27T11:00:00",
  "number_of_guests": 2,
  "special_requests": "Late check-in"
}

Response:
{
  "success": true,
  "data": {
    "booking": {
      "booking_id": "uuid",
      "number_of_guests": 2,
      "room_charges": 450.00,  // NEW
      "total_amount": 450.00,  // NEW
      "total_days": 3,
      "daily_rate": 150.00,
      ...
    }
  }
}
```

## Notes

- Room charges are calculated ONCE at booking creation based on reserved dates
- The date filter is smart - it shows rooms but marks them as unavailable if booked
- Backend prevents double-booking through date overlap checking
- Frontend provides clear visual feedback on why rooms are unavailable
- All monetary calculations use the room's daily_rate from room_types table

## Next Steps (Optional Enhancements)

1. **Price Calendar**: Show room rates for different dates
2. **Flexible Pricing**: Implement weekend/seasonal pricing
3. **Minimum Stay**: Add minimum night requirements
4. **Advance Booking**: Limit how far in advance bookings can be made
5. **Cancellation Policy**: Add cancellation deadlines and fees
6. **Email Notifications**: Send booking confirmations with room charges breakdown
