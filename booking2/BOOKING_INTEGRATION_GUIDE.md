# How to Get Bookings from Booking.com (and other OTAs)

## Overview
To get bookings from sites like Booking.com, you have **3 main options**:

### **Option 1: Direct API Integration** ⭐ RECOMMENDED
- Connect directly to Booking.com's API
- Pull bookings on a schedule (e.g., every 15 minutes)
- Full control over the integration
- **Files created**: `booking-com-api.ts`, `booking-sync-service.ts`

### **Option 2: Webhook Integration** 
- Booking.com pushes bookings to your server in real-time
- Requires a public URL endpoint
- More immediate than polling
- Less control over timing

### **Option 3: Channel Manager Middleware**
- Use a third-party service (e.g., ChannelManager.com, SiteMinder, MyAllocator)
- They handle all OTA connections
- You integrate with their single API
- Costs money but saves development time

---

## ✅ SETUP: Option 1 - Direct API Integration

### Step 1: Register with Booking.com Connectivity

1. **Apply for API Access**
   - Go to [Booking.com Partner Hub](https://admin.booking.com)
   - Navigate to "Connectivity" section
   - Apply for API access (this can take several weeks)
   
2. **Get Your Credentials**
   - Hotel ID
   - API Key
   - API Secret

3. **Choose Environment**
   - Test/Sandbox: `https://supply-xml.booking.com/sandbox/api/v1`
   - Production: `https://supply-xml.booking.com/api/v1`

### Step 2: Set Up Room Mapping

Booking.com has their own room IDs that don't match your local database. You need a mapping table:

```sql
-- Run this SQL to create the mapping table
CREATE TABLE room_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_room_id VARCHAR(100) NOT NULL,
    local_room_id INT NOT NULL,
    channel_type ENUM('booking_com', 'expedia', 'airbnb') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_mapping (external_room_id, channel_type),
    FOREIGN KEY (local_room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Example: Map Booking.com room "BDC-ROOM-123" to your local room ID 1
INSERT INTO room_mapping (external_room_id, local_room_id, channel_type)
VALUES ('BDC-ROOM-123', 1, 'booking_com');
```

### Step 3: Configure and Run the Sync Service

1. **Edit `example-sync-usage.ts`**:
   ```typescript
   const bookingComConfig = {
       hotelId: 'YOUR_ACTUAL_HOTEL_ID',
       apiKey: 'YOUR_ACTUAL_API_KEY',
       apiSecret: 'YOUR_ACTUAL_API_SECRET',
       baseUrl: 'https://supply-xml.booking.com/api/v1'
   };
   ```

2. **Update your channel ID**:
   ```sql
   -- First, make sure Booking.com channel exists in your database
   INSERT INTO channels (name, type, enabled)
   VALUES ('Booking.com', 'booking_com', true);
   
   -- Get the ID (let's say it's 1)
   SELECT id FROM channels WHERE type = 'booking_com';
   ```

3. **Run the sync service**:
   ```bash
   npm run build
   node dist/example-sync-usage.js
   ```

### Step 4: Add to Your Main Server

Add this to your `server.ts`:

```typescript
import { createSyncService } from './booking-sync-service.js';

// Initialize sync service on server start
const syncService = createSyncService(
    {
        hotelId: process.env.BOOKING_COM_HOTEL_ID!,
        apiKey: process.env.BOOKING_COM_API_KEY!,
        apiSecret: process.env.BOOKING_COM_API_SECRET!
    },
    {
        intervalMinutes: 15,
        lookbackDays: 7,
        channelId: 1,
        defaultRoomId: 1
    }
);

syncService.start();
console.log('✓ Booking.com sync service started');
```

---

## 🔄 SETUP: Option 2 - Webhook Integration

### Step 1: Create Webhook Endpoint

Add this route to your `server.ts`:

```typescript
app.post('/webhook/booking-com', async (req, res) => {
    try {
        const reservation = req.body;
        
        // Validate webhook signature (important for security!)
        const signature = req.headers['x-booking-signature'];
        if (!validateSignature(signature, req.body)) {
            return res.status(401).json({ error: 'Invalid signature' });
        }
        
        // Convert to channel booking
        const channelBooking = convertBookingComReservation(reservation);
        
        // Process booking
        const result = await channelManager.processChannelBooking(channelBooking);
        
        res.json({ success: result.success, message: result.message });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Processing failed' });
    }
});
```

### Step 2: Configure in Booking.com Portal

1. Log into Booking.com Partner Hub
2. Go to Connectivity > Webhooks
3. Add your endpoint URL: `https://your-domain.com/webhook/booking-com`
4. Select events: `reservation.created`, `reservation.modified`, `reservation.cancelled`

---

## 🔌 SETUP: Option 3 - Channel Manager Service

Use a third-party channel manager like:

### Popular Options:
- **ChannelManager.com** - Good for small properties
- **SiteMinder** - Enterprise solution
- **MyAllocator** - Mid-market
- **Beds24** - Budget-friendly

### Steps:
1. Sign up with a channel manager service
2. They connect to Booking.com, Expedia, Airbnb, etc.
3. You integrate with their single API
4. They handle all the complexity

**Pros**: Save development time, support multiple OTAs  
**Cons**: Monthly fees ($50-500/month), less control

---

## 📊 API Endpoints Available in Your System

The files I created provide these capabilities:

### `BookingComAPI` class:
- `fetchReservations(fromDate, toDate)` - Get bookings in date range
- `getReservation(reservationId)` - Get specific booking
- `confirmReservation(reservationId)` - Confirm to Booking.com
- `convertToChannelBooking(reservation)` - Convert format

### `BookingSyncService` class:
- `start()` - Start auto-sync (runs every X minutes)
- `stop()` - Stop auto-sync
- `syncBookings()` - Manually trigger sync
- `getStatus()` - Check if sync is running

---

## 🔐 Security Best Practices

1. **Store credentials in environment variables**:
   ```bash
   # Create .env file
   BOOKING_COM_HOTEL_ID=your_hotel_id
   BOOKING_COM_API_KEY=your_api_key
   BOOKING_COM_API_SECRET=your_secret
   ```

2. **Install dotenv**:
   ```bash
   npm install dotenv
   ```

3. **Load in your code**:
   ```typescript
   import dotenv from 'dotenv';
   dotenv.config();
   ```

---

## 🧪 Testing

### Test Mode:
1. Use Booking.com's sandbox environment
2. Create test reservations in their portal
3. Verify they appear in your database

### Manual Sync Test:
```typescript
const stats = await syncService.syncBookings();
console.log(stats); // { success: 5, failed: 0, skipped: 2 }
```

---

## 📝 Next Steps

1. ✅ Apply for Booking.com API access
2. ✅ Create room mapping table
3. ✅ Add your credentials to config
4. ✅ Test with sandbox environment
5. ✅ Deploy to production
6. 🔄 Repeat for other OTAs (Expedia, Airbnb)

---

## 🆘 Troubleshooting

**Problem**: "Failed to fetch reservations: 401 Unauthorized"  
**Solution**: Check your API credentials

**Problem**: "No mapping found for room"  
**Solution**: Add room mappings to `room_mapping` table

**Problem**: Bookings not syncing  
**Solution**: Check sync service is running with `syncService.getStatus()`

---

## 📚 Additional Resources

- [Booking.com Connectivity API Docs](https://developers.booking.com)
- [Expedia Partner API](https://developers.expediagroup.com)
- [Airbnb API Documentation](https://www.airbnb.com/partner)
