# 🏨 Booking.com Integration - Quick Start

## What You Need to Do

### 1️⃣ Get API Credentials from Booking.com

**Apply Here**: https://admin.booking.com (Partner Hub → Connectivity)

You'll receive:
- Hotel ID
- API Key  
- API Secret

⏰ **Note**: API approval can take 1-4 weeks

---

### 2️⃣ Set Up Database

Run the SQL file to create the room mapping table:

```bash
mysql -u root -p hotel_booking_sync < setup-room-mapping.sql
```

Or manually run the queries in your MySQL client.

---

### 3️⃣ Map Your Rooms

Find your Booking.com room IDs from their portal, then add mappings:

```sql
INSERT INTO room_mapping (external_room_id, local_room_id, channel_type)
VALUES 
    ('YOUR_BOOKING_COM_ROOM_ID', 1, 'booking_com'),
    ('ANOTHER_ROOM_ID', 2, 'booking_com');
```

---

### 4️⃣ Configure the Service

Edit `example-sync-usage.ts` and add your credentials:

```typescript
const bookingComConfig = {
    hotelId: 'YOUR_HOTEL_ID_HERE',
    apiKey: 'YOUR_API_KEY_HERE',
    apiSecret: 'YOUR_API_SECRET_HERE'
};
```

---

### 5️⃣ Run the Sync Service

```bash
# Build TypeScript
npm run build

# Start the sync service
node dist/example-sync-usage.js
```

This will:
- ✅ Fetch bookings from Booking.com every 15 minutes
- ✅ Import new bookings to your database
- ✅ Skip duplicates automatically
- ✅ Confirm reservations back to Booking.com

---

## Files Created

| File | Purpose |
|------|---------|
| `booking-com-api.ts` | API client for Booking.com |
| `booking-sync-service.ts` | Automatic sync service |
| `example-sync-usage.ts` | Example configuration |
| `setup-room-mapping.sql` | Database setup |
| `BOOKING_INTEGRATION_GUIDE.md` | Complete documentation |

---

## Testing

### Option A: Test with Sandbox
```typescript
const bookingComConfig = {
    baseUrl: 'https://supply-xml.booking.com/sandbox/api/v1'
};
```

### Option B: Manual Sync
```typescript
const stats = await syncService.syncBookings();
console.log(stats); // { success: 3, failed: 0, skipped: 1 }
```

---

## Integration with Your Server

Add to `server.ts`:

```typescript
import { createSyncService } from './booking-sync-service.js';

const syncService = createSyncService(
    { /* credentials */ },
    { /* config */ }
);

syncService.start();
```

---

## Common Issues

❌ **"Failed to fetch reservations: 401"**  
→ Check API credentials

❌ **"No mapping found for room"**  
→ Add room mappings in database

❌ **"Booking already exists"**  
→ Normal! It skips duplicates

---

## Production Checklist

- [ ] Applied for Booking.com API access
- [ ] Received API credentials
- [ ] Created `room_mapping` table
- [ ] Added room mappings for all rooms
- [ ] Tested in sandbox environment
- [ ] Added credentials to environment variables
- [ ] Integrated sync service with main server
- [ ] Set up monitoring/logging
- [ ] Configured appropriate sync interval

---

## Need Help?

Read the full guide: `BOOKING_INTEGRATION_GUIDE.md`

It covers:
- ✅ Direct API integration (what we implemented)
- ✅ Webhook integration (real-time push)
- ✅ Third-party channel managers (easiest but costs money)
