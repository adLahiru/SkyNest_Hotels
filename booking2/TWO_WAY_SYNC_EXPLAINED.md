# Two-Way Sync with Booking.com

## The Complete Picture

```
┌─────────────────────────────────────────────────────────────────┐
│                     BOOKING.COM                                 │
│                                                                 │
│  Their Availability Calendar:                                  │
│  Oct 25: Room 101 - AVAILABLE                                  │
│  Oct 26: Room 101 - BLOCKED                                    │
│  Oct 27: Room 101 - AVAILABLE                                  │
└─────────────────────────────────────────────────────────────────┘
           ↑                                    ↓
           │                                    │
    (2) PUSH                              (1) PULL
    Availability                          Bookings
           │                                    │
           │                                    │
┌──────────┴────────────────────────────────────┴─────────────────┐
│                     YOUR SYSTEM                                 │
│                                                                 │
│  Database:                                                      │
│  - Room 101 booked Oct 25-26 (Direct booking)                  │
│  - Room 101 available Oct 27                                   │
└─────────────────────────────────────────────────────────────────┘
```

## What You Need To Implement

### 1️⃣ PULL Bookings (✅ DONE - what we built)

```typescript
// booking-sync-service.ts pulls bookings every 15 minutes
Booking.com → Your Database
```

**Status**: ✅ **Already implemented!**

### 2️⃣ PUSH Availability (❌ NOT YET DONE)

```typescript
// When a booking is made locally:
Your Database → Update Booking.com's availability
```

**Status**: ❌ **Still needed!**

## Why Two-Way Sync is Critical

### Without Availability Push (Current State):

| Event | Your Database | Booking.com Shows | Result |
|-------|---------------|-------------------|---------|
| Day 1: Guest books directly | Room 101 booked Oct 25-26 | Room 101 AVAILABLE ❌ | Risk! |
| Day 2: Guest books on Booking.com | Another booking arrives | Room 101 AVAILABLE ❌ | **DOUBLE BOOKED!** |

### With Availability Push (Needed):

| Event | Your Database | Booking.com Shows | Result |
|-------|---------------|-------------------|---------|
| Day 1: Guest books directly | Room 101 booked Oct 25-26 | Room 101 BLOCKED ✅ | Safe! |
| Day 2: Guest tries on Booking.com | Same booking | Room 101 BLOCKED ✅ | **Prevented!** |

## How Availability Push Works

### Method 1: **Real-time Push** (Recommended)

Every time a booking is created/cancelled in YOUR database:
1. Detect the change
2. Call Booking.com API
3. Update availability for those dates

```typescript
// Pseudo code
async function onBookingCreated(booking) {
    // 1. Save to your database
    await saveBooking(booking);
    
    // 2. Block dates on Booking.com
    await bookingComAPI.closeAvailability({
        room_id: booking.roomId,
        start_date: booking.startDate,
        end_date: booking.endDate
    });
}
```

### Method 2: **Batch Sync** (Alternative)

Every X minutes:
1. Calculate availability from your database
2. Push full availability calendar to Booking.com

```typescript
// Runs every 30 minutes
async function syncAvailability() {
    for (const room of rooms) {
        const availability = calculateAvailability(room);
        await bookingComAPI.updateAvailability(room.id, availability);
    }
}
```

## API Endpoints Needed

Booking.com provides these endpoints:

### **Close Dates (Block)**
```
POST /availability/close
{
    "hotel_id": "12345",
    "room_id": "BDC-DELUXE-001",
    "from_date": "2025-10-25",
    "to_date": "2025-10-26"
}
```

### **Open Dates (Unblock)**
```
POST /availability/open
{
    "hotel_id": "12345",
    "room_id": "BDC-DELUXE-001",
    "from_date": "2025-10-27",
    "to_date": "2025-10-28"
}
```

### **Update Inventory**
```
POST /availability/inventory
{
    "hotel_id": "12345",
    "room_id": "BDC-DELUXE-001",
    "date": "2025-10-25",
    "available_rooms": 0  // 0 = fully booked
}
```

## What Happens in Each Scenario

### Scenario 1: Guest Books Directly on Your Website

```
1. Guest books Room 101 for Oct 25-26 on YOUR website
   ↓
2. Your system saves to database
   ↓
3. ⭐ YOUR SYSTEM SHOULD:
   → Call Booking.com API
   → Close availability for Room 101 on Oct 25-26
   ↓
4. Booking.com now shows Room 101 as UNAVAILABLE for those dates
   ↓
5. Prevents double bookings!
```

### Scenario 2: Guest Books on Booking.com

```
1. Guest books Room 101 for Oct 27-28 on BOOKING.COM
   ↓
2. Booking.com's system accepts it (they control their availability)
   ↓
3. Your sync service pulls the booking (every 15 min)
   ↓
4. Saved to your database
   ↓
5. No action needed - Booking.com already knows it's booked
```

### Scenario 3: Booking Cancelled

```
1. Guest cancels booking in your system
   ↓
2. Update database status = 'cancelled'
   ↓
3. ⭐ YOUR SYSTEM SHOULD:
   → Call Booking.com API
   → OPEN availability for those dates
   ↓
4. Room becomes bookable again on Booking.com
```

## Current Implementation Status

| Feature | Status | Files |
|---------|--------|-------|
| Pull bookings FROM Booking.com | ✅ Done | `booking-com-api.ts`, `booking-sync-service.ts` |
| Push availability TO Booking.com | ❌ Not implemented | Need to create |
| Handle cancellations | ❌ Not implemented | Need to create |
| Handle modifications | ❌ Not implemented | Need to create |

## What You Need Next

I can create:

1. **`availability-sync.ts`** - Pushes availability to Booking.com
2. **Database triggers** - Automatically sync when bookings change
3. **Webhook handlers** - Real-time updates
4. **Cancellation handler** - Re-open dates when cancelled

Would you like me to implement the availability push system?
