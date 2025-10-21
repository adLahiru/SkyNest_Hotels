# How the Booking.com Integration Works

## 📊 Your Database Tables

You have **4 main tables**:
```
1. booking_channels - Stores channel configuration (Booking.com, Expedia, etc.)
2. bookings        - Stores all reservations
3. hotel_branches  - Your hotel properties
4. rooms           - Rooms in your hotels
```

## 🔄 The Integration Flow

### Step 1: Booking.com sends you a booking
```
Booking.com → booking-com-api.ts → booking-sync-service.ts → channels.ts → Database
```

### Step 2: How each file works

#### **1. `booking-com-api.ts`** (API Client)
- **Purpose**: Talks to Booking.com's API
- **What it does**:
  - `fetchReservations()` - Gets bookings from Booking.com
  - `getReservation()` - Gets a specific booking
  - `confirmReservation()` - Sends confirmation back
  - `convertToChannelBooking()` - Converts their format to yours

#### **2. `booking-sync-service.ts`** (Sync Service)
- **Purpose**: Automatically pulls bookings on a schedule
- **What it does**:
  - Runs every 15 minutes (configurable)
  - Fetches new bookings from last 7 days
  - Checks if booking already exists (no duplicates)
  - Maps Booking.com room IDs to your local room IDs
  - Passes to `channelManager` for processing

#### **3. `channels.ts`** ⭐ (Your existing file - ENHANCED)
- **Purpose**: Central booking processor
- **What it does**:
  - `processChannelBooking()` - Main entry point for ALL channel bookings
  - `handleBookingComReservation()` - Validates Booking.com bookings
  - `handleExpediaReservation()` - Validates Expedia bookings (future)
  - `handleAirbnbReservation()` - Validates Airbnb bookings (future)
  - Inserts bookings into your database
  - **NOW STORES**: Guest name, email, phone, price, currency

## 🎯 What I Changed in `channels.ts`

### **Before:**
```typescript
// Only stored basic booking info
INSERT INTO bookings (room_id, channel_id, booking_reference, start_date, end_date, status)
```

### **After:**
```typescript
// NOW stores guest details and pricing
INSERT INTO bookings (
    room_id, channel_id, booking_reference, 
    start_date, end_date, status,
    guest_name, guest_email, guest_phone,    // ← NEW
    total_price, currency                    // ← NEW
)
```

### **Enhanced Validation:**
- ✅ Validates Booking.com reference format (must start with "BDC-")
- ✅ Validates dates (end date must be after start date)
- ✅ Validates guest email format
- ✅ Warns if booking is in the past
- ✅ Better logging to track what's happening

## 🗄️ Database Updates Required

**Run this SQL to add the new columns:**

```bash
mysql -u root -p hotel_booking_sync < update-database-schema.sql
```

This will:
1. Add `guest_name`, `guest_email`, `guest_phone` to bookings table
2. Add `total_price`, `currency` to bookings table
3. Create `room_mapping` table (maps external room IDs)
4. Add API credential fields to `booking_channels` table

## 📋 Complete Data Flow Example

### Scenario: A guest books on Booking.com

```
1. Guest books "Deluxe Room" on Booking.com
   └─ Booking.com assigns: reservation ID "123456789"
   └─ Booking.com's room ID: "BDC-DELUXE-001"

2. booking-sync-service.ts (runs every 15 min)
   └─ Calls: bookingComAPI.fetchReservations()
   └─ Gets: reservation data from Booking.com API
   └─ Converts: to ChannelBooking format
   └─ Reference becomes: "BDC-123456789"

3. room_mapping table lookup
   └─ Searches: "BDC-DELUXE-001" → finds local room_id = 1

4. channels.ts receives booking
   └─ processChannelBooking() called
   └─ Checks: Booking doesn't already exist
   └─ Calls: handleBookingComReservation() for validation
   └─ Validates: dates, email, reference format
   └─ Inserts: into bookings table

5. Database Result
   ┌────────────────────────────────────────────────┐
   │ bookings table                                 │
   ├────────────────────────────────────────────────┤
   │ id: 42                                         │
   │ room_id: 1                                     │
   │ channel_id: 1 (Booking.com)                    │
   │ booking_reference: "BDC-123456789"             │
   │ start_date: "2025-10-25"                       │
   │ end_date: "2025-10-27"                         │
   │ status: "confirmed"                            │
   │ guest_name: "John Smith"           ← NEW       │
   │ guest_email: "john@example.com"    ← NEW       │
   │ guest_phone: "+1234567890"         ← NEW       │
   │ total_price: 250.00                ← NEW       │
   │ currency: "USD"                    ← NEW       │
   └────────────────────────────────────────────────┘

6. Confirmation sent back
   └─ bookingComAPI.confirmReservation("123456789")
   └─ Booking.com receives confirmation
```

## 🔗 How Files Connect

```
┌─────────────────────────────────────────────────────────┐
│                  Booking.com API                        │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────┐
│  booking-com-api.ts                                     │
│  - Fetches bookings from API                            │
│  - Converts format                                      │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────┐
│  booking-sync-service.ts                                │
│  - Runs every 15 minutes                                │
│  - Checks for duplicates                                │
│  - Maps room IDs                                        │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────┐
│  channels.ts  ⭐ YOUR CORE PROCESSOR                    │
│  - Validates bookings                                   │
│  - Processes by channel type                            │
│  - Inserts into database                                │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────┐
│  MySQL Database                                         │
│  - booking_channels                                     │
│  - bookings (with guest info & pricing)                 │
│  - hotel_branches                                       │
│  - rooms                                                │
│  - room_mapping (new)                                   │
└─────────────────────────────────────────────────────────┘
```

## ✅ What You Need To Do

1. **Update Database**
   ```bash
   mysql -u root -p hotel_booking_sync < update-database-schema.sql
   ```

2. **Add Room Mappings**
   - Find your Booking.com room IDs from their portal
   - Insert into `room_mapping` table
   ```sql
   INSERT INTO room_mapping (external_room_id, local_room_id, channel_type)
   VALUES ('BDC-YOUR-ROOM-ID', 1, 'booking_com');
   ```

3. **Get API Credentials**
   - Apply at: https://admin.booking.com
   - Wait for approval (1-4 weeks)

4. **Configure & Run**
   - Edit `example-sync-usage.ts` with your credentials
   - Run: `npm run build && node dist/example-sync-usage.js`

## 🎉 That's It!

Your **`channels.ts`** is the **core processor** that works with all the new files. It:
- ✅ Already had the structure (processChannelBooking, handlers)
- ✅ Now enhanced with better validation
- ✅ Now stores guest details and pricing
- ✅ Works seamlessly with the sync service

The sync service feeds bookings into `channels.ts`, which processes them and stores them in your database!
