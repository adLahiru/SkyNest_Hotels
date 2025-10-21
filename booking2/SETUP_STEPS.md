# 🚀 Complete Setup Steps - Run This in Order

## ✅ Step 1: Start MySQL Server

**Check if MySQL is running:**
- Open **Services** (Windows key + R, type `services.msc`)
- Look for **MySQL** or **MySQL80** or **MySQL90**
- If Status is not "Running", right-click and click **Start**

**OR use XAMPP:**
- Open XAMPP Control Panel
- Click **Start** next to MySQL

---

## ✅ Step 2: Update Database Schema

### Option A: Using MySQL Workbench (EASIEST)

1. Open **MySQL Workbench**
2. Connect to localhost (user: root, password: @Hkbag2003)
3. Open the file: **File → Open SQL Script**
4. Select: `update-database-schema.sql`
5. Click the **⚡ Lightning bolt** button to execute
6. You should see: "Query executed successfully"

### Option B: Copy-Paste Method

1. Open `update-database-schema.sql` in VS Code
2. Copy ALL the SQL (Ctrl+A, Ctrl+C)
3. Open MySQL Workbench
4. Connect to `hotel_booking_sync` database
5. Paste the SQL in a new query tab
6. Execute (⚡ button)

### Option C: Command Line (if mysql is in PATH)

```powershell
# First, find where mysql.exe is installed
# Usually: C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe
# Or: C:\xampp\mysql\bin\mysql.exe

# Then run:
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p@Hkbag2003 hotel_booking_sync

# Inside MySQL prompt, run:
source update-database-schema.sql
```

---

## ✅ Step 3: Verify Database Schema

Run this in MySQL Workbench or MySQL prompt:

```sql
USE hotel_booking_sync;

-- Check if new columns were added
DESCRIBE bookings;

-- You should see these NEW columns:
-- guest_name
-- guest_email
-- guest_phone
-- total_price
-- currency
-- synced_to_booking_com
-- synced_at
-- cancellation_reason
-- cancelled_at
-- modified_at

-- Check if room_mapping table was created
SHOW TABLES LIKE 'room_mapping';
```

---

## ✅ Step 4: Add Room Mappings

In MySQL Workbench, run:

```sql
-- Example: Map your rooms to Booking.com room IDs
-- You need to get the actual Booking.com room IDs from their portal

INSERT INTO room_mapping (external_room_id, local_room_id, channel_type)
VALUES 
    ('BDC-ROOM-001', 1, 'booking_com'),
    ('BDC-ROOM-002', 2, 'booking_com'),
    ('BDC-ROOM-003', 3, 'booking_com');

-- Verify:
SELECT * FROM room_mapping;
```

---

## ✅ Step 5: Make Sure You Have Booking.com Channel

```sql
-- Check if Booking.com channel exists
SELECT * FROM booking_channels WHERE type = 'booking_com';

-- If it doesn't exist, add it:
INSERT INTO booking_channels (name, type, enabled)
VALUES ('Booking.com', 'booking_com', true);

-- Get the channel ID (you'll need this)
SELECT id FROM booking_channels WHERE type = 'booking_com';
```

---

## ✅ Step 6: Configure Credentials

Edit `example-two-way-sync.ts` and update these lines:

```typescript
const bookingComConfig: BookingComConfig = {
    hotelId: 'YOUR_HOTEL_ID',        // ← Replace with real ID
    apiKey: 'YOUR_API_KEY',          // ← Replace with real key
    apiSecret: 'YOUR_API_SECRET',    // ← Replace with real secret
    baseUrl: 'https://supply-xml.booking.com/api/v1'
};

const syncConfig: SyncConfig = {
    intervalMinutes: 15,
    lookbackDays: 7,
    channelId: 1,          // ← Use the ID from Step 5
    defaultRoomId: 1       // ← Your default room ID
};
```

---

## ✅ Step 7: Build TypeScript

```powershell
npm run build
```

This compiles all `.ts` files to `.js` files in the `dist` folder.

---

## ✅ Step 8: Test Database Connection

```powershell
node dist/test-db-connection.js
```

You should see:
```
✓ MySQL server connection successful!
✓ Database exists!
✓ Connected to hotel_booking_sync!
Found X tables:
  - booking_channels
  - bookings
  - hotel_branches
  - rooms
  - room_mapping
✅ All connection tests passed!
```

If you see errors, check:
- MySQL service is running
- Password is correct in `db.ts`
- Database `hotel_booking_sync` exists

---

## ✅ Step 9: Run the Two-Way Sync System

```powershell
node dist/example-two-way-sync.js
```

You should see:
```
✓ Booking pull service started (gets bookings FROM Booking.com)
✓ Availability push enabled (sends updates TO Booking.com)

📋 How Two-Way Sync Works:
...

✓ Two-way sync system ready!
Press Ctrl+C to stop
```

---

## ✅ Step 10: Test Creating a Booking

Open another terminal and run:

```powershell
node
```

Then paste this to test:

```javascript
const { createIntegratedBookingService } = require('./dist/integrated-booking-service.js');

const bookingService = createIntegratedBookingService({
    hotelId: 'YOUR_HOTEL_ID',
    apiKey: 'YOUR_API_KEY',
    apiSecret: 'YOUR_API_SECRET'
});

bookingService.createBooking({
    hotelBranchId: 1,
    roomId: 1,
    channelId: 4, // Direct channel
    startDate: '2025-10-25',
    endDate: '2025-10-27'
}).then(result => {
    console.log('Booking created:', result.bookingId);
    console.log('Synced to Booking.com:', result.syncedToBookingCom);
});
```

---

## 📋 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot connect to database" | Start MySQL service |
| "Access denied" | Check password in `db.ts` |
| "Database not found" | Create: `CREATE DATABASE hotel_booking_sync;` |
| "mysql command not found" | Use MySQL Workbench instead |
| "Room mapping not found" | Add mappings in Step 4 |
| "Channel not found" | Add channel in Step 5 |

---

## 🎯 Summary Checklist

- [ ] MySQL server is running
- [ ] Database schema updated (ran `update-database-schema.sql`)
- [ ] Room mappings added
- [ ] Booking.com channel exists
- [ ] Credentials configured in `example-two-way-sync.ts`
- [ ] TypeScript compiled (`npm run build`)
- [ ] Database connection tested
- [ ] Two-way sync running

---

## 🆘 Still Having Issues?

1. **Check MySQL is running**: Open Services → Find MySQL → Start it
2. **Test basic connection**: Open MySQL Workbench → Connect → Test
3. **Check credentials**: Make sure password in `db.ts` is correct
4. **Check database exists**: Run `SHOW DATABASES;` in MySQL Workbench

Once you complete these steps, your two-way sync system will be running! 🚀
