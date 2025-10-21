# 🚀 Quick Start: Two-Way Sync

## What You Have Now

✅ **PULL** - Get bookings FROM Booking.com every 15 minutes  
✅ **PUSH** - Send availability TO Booking.com automatically  
✅ **NO DOUBLE BOOKINGS** - Real-time sync prevents conflicts  

---

## 3 Steps to Get Running

### 1️⃣ Update Database (2 minutes)

```bash
mysql -u root -p hotel_booking_sync < update-database-schema.sql
```

This adds:
- Guest details columns
- Price tracking
- Sync status tracking
- Room mapping table

### 2️⃣ Add Room Mappings (5 minutes)

Find your Booking.com room IDs, then:

```sql
INSERT INTO room_mapping (external_room_id, local_room_id, channel_type)
VALUES 
    ('YOUR_BOOKING_COM_ROOM_ID', 1, 'booking_com'),
    ('ANOTHER_ROOM_ID', 2, 'booking_com');
```

### 3️⃣ Run It (1 minute)

```bash
# Edit example-two-way-sync.ts with your credentials
# Then:
npm run build
node dist/example-two-way-sync.js
```

**That's it! Two-way sync is now active! 🎉**

---

## Files You Need to Know

| File | What It Does |
|------|--------------|
| `example-two-way-sync.ts` | **START HERE** - Complete working example |
| `integrated-booking-service.ts` | Use this in your code for bookings |
| `TWO_WAY_SYNC_IMPLEMENTATION.md` | Full documentation |
| `update-database-schema.sql` | Run this first |

---

## How to Use in Your Code

### Creating a Booking

**Old way (one-way):**
```typescript
import { createBooking } from './db.js';
await createBooking(data); // ❌ Doesn't sync to Booking.com
```

**New way (two-way):**
```typescript
import { createIntegratedBookingService } from './integrated-booking-service.js';

const bookingService = createIntegratedBookingService(bookingComConfig);
const result = await bookingService.createBooking(data); 
// ✅ Automatically syncs to Booking.com!

console.log(result.syncedToBookingCom); // true
```

### Cancelling a Booking

```typescript
const result = await bookingService.cancelBooking(bookingId, 'reason');
// ✅ Automatically opens dates on Booking.com
```

---

## What Happens Behind the Scenes

```
Guest books on YOUR site
    ↓
Save to database ✅
    ↓
Push to Booking.com ✅
    ↓
Booking.com blocks dates ✅
    ↓
Other guests see "UNAVAILABLE" ✅
    ↓
NO DOUBLE BOOKING! 🎉
```

---

## Testing

### Test 1: Create a booking
```typescript
const result = await bookingService.createBooking({
    hotelBranchId: 1,
    roomId: 1,
    channelId: 4,
    startDate: '2025-10-25',
    endDate: '2025-10-27'
});

console.log('Synced?', result.syncedToBookingCom); // Should be true
```

### Test 2: Check sync status
```typescript
console.log('Two-way enabled?', bookingService.isTwoWaySyncEnabled()); // true
```

### Test 3: View logs
Look for these in console:
```
[Booking.com] Closing availability for room...
[Booking.com] ✓ Successfully closed availability
[IntegratedBooking] ✓ Booking 42 created AND synced to Booking.com
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "No room mapping found" | Add mapping in `room_mapping` table |
| "401 Unauthorized" | Check API credentials |
| "Booking not synced" | Check logs, run `syncUnsyncedBookings()` |

---

## Next Steps

1. ✅ Get Booking.com API credentials (apply at admin.booking.com)
2. ✅ Run database update SQL
3. ✅ Add room mappings
4. ✅ Test with sandbox environment
5. ✅ Integrate with your booking flow
6. ✅ Deploy to production

---

## Full Documentation

- **`TWO_WAY_SYNC_IMPLEMENTATION.md`** - Complete guide with all details
- **`example-two-way-sync.ts`** - Working code examples
- **`HOW_IT_WORKS.md`** - Technical architecture

---

## Questions?

**Q: What if I already have bookings?**  
A: Run `syncRoomAvailability(roomId, 90)` to sync existing bookings

**Q: What if Booking.com is down?**  
A: Bookings still save, marked as unsynced. Run `syncUnsyncedBookings()` later

**Q: Does it work with Expedia/Airbnb?**  
A: Same pattern can be extended. Create `ExpediaAPI` and `AirbnbAPI` classes

**Q: Is it safe?**  
A: Yes! Prevents circular updates, tracks sync status, has recovery mechanisms

---

**You're all set! 🚀 Two-way sync prevents double bookings automatically!**
