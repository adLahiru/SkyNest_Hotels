# Booking System - Quick Visual Guide

## 🎯 What Changed?

### 1. Room Selection Page - NEW Date Filter

```
┌─────────────────────────────────────────────────────────────┐
│  🏨 Sky Nest Kandy - Available Rooms                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📅 Filter by Availability                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────┐   │
│  │ Check-in Date  │  │ Check-out Date │  │   Search    │   │
│  │  2025-10-25    │  │  2025-10-27    │  │             │   │
│  └────────────────┘  └────────────────┘  └─────────────┘   │
│  ✅ Showing rooms available from Oct 25 to Oct 27          │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐              ┌─────────────┐              │
│  │ Room 101    │  ✅          │ Room 102    │  ❌          │
│  │ $150/night  │ Available    │ $150/night  │ Booked for   │
│  │             │              │             │ selected     │
│  │ [Book Now]  │              │             │ dates        │
│  └─────────────┘              └─────────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**How it works:**
- User enters check-in and check-out dates
- System queries backend for available rooms in that date range
- Rooms already booked for those dates show as "Booked for selected dates"
- Only truly available rooms can be booked

---

### 2. Booking Confirmation - Enhanced Display

**BEFORE:**
```
┌──────────────────────────────┐
│  Booking Confirmed! ✅       │
├──────────────────────────────┤
│ Guest Name: John Doe         │
│ Room: Deluxe - Room 101      │
│ Check-in: Oct 25, 2025       │
│ Check-out: Oct 27, 2025      │
│ Guests: 2                    │
│ Total (2 nights): $300       │
└──────────────────────────────┘
```

**AFTER:**
```
┌──────────────────────────────────────────┐
│  Booking Confirmed! ✅                   │
├──────────────────────────────────────────┤
│ Guest Name: John Doe                     │
│ Room: Deluxe - Room 101                  │
│ Check-in: Oct 25, 2025                   │
│ Check-out: Oct 27, 2025                  │
│ Guests: 2                                │
├──────────────────────────────────────────┤
│ Room Charges (2 nights × $150): $300    │
│ Total Amount: $300                       │
└──────────────────────────────────────────┘
```

**What's new:**
- Clear breakdown showing: nights × daily rate = total
- Room charges stored in database immediately
- Number of guests saved to database

---

### 3. Database Changes

**Booking Table - What gets stored NOW:**

```sql
INSERT INTO booking (
  booking_id,
  user_id,
  room_id,
  checking_datetime,      -- Reserved check-in: "2025-10-25"
  checkout_datetime,      -- Reserved check-out: "2025-10-27"
  number_of_guests,       -- NEW: Stores guest count
  room_charges,           -- NEW: $150 × 2 nights = $300
  total_amount,           -- NEW: Initially $300 (room only)
  booking_status          -- 'confirmed'
)
```

**When services are added later:**
```sql
UPDATE booking SET
  service_charges = 75.00,          -- Spa + Room Service
  total_amount = 375.00             -- $300 room + $75 services
WHERE booking_id = 'xxx'
```

---

## 🔄 Complete Workflow

### Customer Booking Journey

```
Step 1: Select Branch
   ↓
Step 2: Enter Dates (NEW!)
   📅 Check-in: Oct 25
   📅 Check-out: Oct 27
   ↓
Step 3: View Available Rooms (FILTERED!)
   ✅ Room 101 - Available
   ❌ Room 102 - Booked for selected dates
   ❌ Room 103 - Under Maintenance
   ↓
Step 4: Select Room + Number of Guests
   👥 Guests: 2
   ↓
Step 5: Booking Created
   💾 Database stores:
      - number_of_guests = 2
      - room_charges = $150 × 2 = $300
      - total_amount = $300
   ↓
Step 6: Confirmation
   ✅ "Your booking is confirmed!"
   📧 Email sent with details
```

### Staff Check-in Process (Admin Dashboard)

```
Staff clicks "Check In" button
   ↓
System Updates:
   ✓ booking_status = 'checked_in'
   ✓ check_in_time = NOW() (actual arrival)
   ✓ room.state = 'occupied'
   ✓ room_charges UNCHANGED ($300)
   ↓
Staff can add services:
   ✓ Add Spa Service ($50)
   ✓ Add Room Service ($25)
   ↓
Database Updates:
   ✓ service_charges = $75
   ✓ total_amount = $300 + $75 = $375
```

---

## 📊 API Changes

### NEW Endpoint: Check Room Availability

```http
GET /api/bookings/available-rooms
  ?branch_id=123
  &check_in=2025-10-25
  &check_out=2025-10-27

Response:
{
  "success": true,
  "availableRooms": [
    {
      "room_id": 1,
      "room_no": "101",
      "floor_no": 1,
      "state": "available",
      "room_type_id": 1
    }
  ],
  "count": 1,
  "dateRange": {
    "check_in": "2025-10-25",
    "check_out": "2025-10-27"
  }
}
```

### UPDATED Endpoint: Create Booking

```http
POST /api/bookings

Request:
{
  "room_id": 1,
  "checking_datetime": "2025-10-25T14:00:00",
  "checkout_datetime": "2025-10-27T11:00:00",
  "number_of_guests": 2,
  "special_requests": "Late check-in"
}

Response (NEW fields marked with ⭐):
{
  "success": true,
  "data": {
    "booking": {
      "booking_id": "abc-123-xyz",
      "room_no": "101",
      "checking_datetime": "2025-10-25T14:00:00",
      "checkout_datetime": "2025-10-27T11:00:00",
      "number_of_guests": 2,              ⭐ NEW
      "daily_rate": 150.00,
      "total_days": 2,
      "room_charges": 300.00,             ⭐ NEW
      "total_amount": 300.00,             ⭐ NEW
      "booking_status": "confirmed"
    }
  }
}
```

---

## 🎨 UI Examples

### Room Card - Available
```
┌─────────────────────────────────┐
│ 🖼️ [Room Photo]                 │
│ 17% OFF         ✅ Available Now│
│                                  │
│ Deluxe - Room 101                │
│ ⭐ 4.8 rating                    │
│                                  │
│ ❌ $180  →  ✅ $150 per night   │
│                                  │
│ 👥 2 Guests  🛏️ Queen Bed       │
│                                  │
│ ✓ Free WiFi  ✓ Smart TV         │
│ ✓ AC  ✓ Mini Bar                │
│                                  │
│  [ 📅 Book This Room ]          │
└─────────────────────────────────┘
```

### Room Card - Booked for Selected Dates
```
┌─────────────────────────────────┐
│ 🖼️ [Room Photo - Greyed out]   │
│ 17% OFF      ❌ Unavailable     │
│                                  │
│ Deluxe - Room 102                │
│ ⭐ 4.6 rating                    │
│                                  │
│ ❌ $180  →  ✅ $150 per night   │
│                                  │
│ 🚫 Booked for selected dates    │
│ (Oct 25 - Oct 27)                │
│                                  │
│  [ Room Unavailable ] (Disabled)│
└─────────────────────────────────┘
```

---

## 🔍 Backend Logic

### Room Availability Check

```sql
-- Find rooms that are NOT booked for the date range
SELECT r.* FROM rooms r
WHERE r.state = 'available'
  AND r.branch_id = ?
  AND r.room_id NOT IN (
    -- Exclude rooms with conflicting bookings
    SELECT b.room_id FROM booking b
    WHERE b.booking_status NOT IN ('cancelled', 'checked_out')
      AND (
        -- Check for any date overlap
        (b.checking_datetime <= checkout AND b.checkout_datetime > checkin)
        OR (b.checking_datetime < checkout AND b.checkout_datetime >= checkin)
        OR (b.checking_datetime >= checkin AND b.checkout_datetime <= checkout)
      )
  )
```

**Date Overlap Examples:**

```
Scenario 1: Existing booking OVERLAPS new request
Existing:  [====Oct 24 to Oct 26====]
Requested:      [====Oct 25 to Oct 27====]
Result: ❌ CONFLICT - Room NOT available

Scenario 2: Existing booking ENDS before new request
Existing:  [====Oct 22 to Oct 24====]
Requested:                        [====Oct 25 to Oct 27====]
Result: ✅ OK - Room IS available

Scenario 3: Exact same dates
Existing:  [====Oct 25 to Oct 27====]
Requested: [====Oct 25 to Oct 27====]
Result: ❌ CONFLICT - Room NOT available
```

---

## ✅ Testing Scenarios

### Test 1: Date Filter
1. Go to Room Selection page
2. Enter Check-in: Oct 25, Check-out: Oct 27
3. Click "Search"
4. ✅ Only rooms not booked for Oct 25-27 show as "Available"
5. ✅ Booked rooms show "Booked for selected dates"

### Test 2: Booking with Guests
1. Select an available room
2. Choose "2 guests"
3. Complete booking
4. ✅ Check database: `number_of_guests = 2`
5. ✅ Check database: `room_charges = daily_rate × 2`

### Test 3: Room Charges Calculation
1. Room daily rate: $150
2. Booking dates: Oct 25 to Oct 27 (2 nights)
3. ✅ room_charges should be: $150 × 2 = $300
4. ✅ total_amount should be: $300

### Test 4: Prevent Double Booking
1. Create booking for Room 101: Oct 25-27
2. Try to book same room for Oct 25-27
3. ✅ Room should show as "Booked for selected dates"
4. Try to book for Oct 26-28 (overlaps)
5. ✅ Room should still be unavailable

---

## 📁 Files Changed

```
Backend:
├── src/controllers/bookingController.ts  (+ room_charges calc, + getAvailableRooms)
└── src/routes/bookingRoutes.ts          (+ /available-rooms route)

Frontend:
├── components/BookingPage.js            (+ room charges display)
├── components/RoomSelectionPage.js      (+ date filter UI, + availability check)
└── services/bookingService.js           (+ getAvailableRooms method)
```

---

## 🎉 Key Benefits

1. **💰 Transparent Pricing**: Customers see exact breakdown
2. **📅 Smart Filtering**: Only shows actually available rooms
3. **🚫 Prevents Overbooking**: Backend validates date conflicts
4. **💾 Complete Data**: Stores guest count and charges
5. **👥 Better Tracking**: Number of guests recorded
6. **🎯 Accurate Calculations**: Room charges computed at booking time
