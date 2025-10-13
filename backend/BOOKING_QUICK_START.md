# Booking System - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Server running on `http://localhost:8084`
- Valid access token (from login)

---

## 📝 Basic Workflow

### 1️⃣ Register/Login as Guest

```bash
# Register new user
curl -X POST http://localhost:8084/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "guest@example.com",
    "password": "password123",
    "fname": "John",
    "lname": "Doe",
    "phone": "1234567890"
  }'

# Login
curl -X POST http://localhost:8084/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "guest@example.com",
    "password": "password123"
  }'
```

**Save the `access_token` from the response!**

---

### 2️⃣ Find Available Rooms

```bash
curl -X GET http://localhost:8084/api/rooms/available \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Pick a `room_id` from the list**

---

### 3️⃣ Create Your Booking

```bash
curl -X POST http://localhost:8084/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "room_id": 1,
    "checking_datetime": "2025-02-01T14:00:00",
    "checkout_datetime": "2025-02-03T11:00:00"
  }'
```

**Response includes**:
- `booking_id`: Your booking reference
- `total_cost`: Automatic calculation
- `booking_status`: "confirmed"

---

### 4️⃣ View Your Bookings

```bash
curl -X GET http://localhost:8084/api/bookings/my-bookings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 5️⃣ Modify Your Booking (Optional)

```bash
# Change dates
curl -X PUT http://localhost:8084/api/bookings/YOUR_BOOKING_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "checkout_datetime": "2025-02-04T11:00:00"
  }'
```

---

### 6️⃣ Cancel Your Booking (Optional)

```bash
curl -X DELETE http://localhost:8084/api/bookings/YOUR_BOOKING_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Staff Operations

### Check-In Guest

```bash
curl -X PUT http://localhost:8084/api/bookings/BOOKING_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STAFF_TOKEN" \
  -d '{
    "booking_status": "checked_in",
    "staff_id": "YOUR_STAFF_ID"
  }'
```

**Result**: Room state changes to "occupied"

---

### Check-Out Guest

```bash
curl -X PUT http://localhost:8084/api/bookings/BOOKING_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STAFF_TOKEN" \
  -d '{
    "booking_status": "checked_out"
  }'
```

**Result**: Room state changes to "available"

---

### View Branch Bookings

```bash
# All bookings in your branch
curl -X GET http://localhost:8084/api/bookings \
  -H "Authorization: Bearer STAFF_TOKEN"

# Filter by status
curl -X GET "http://localhost:8084/api/bookings?status=confirmed" \
  -H "Authorization: Bearer STAFF_TOKEN"
```

---

## ⚡ Quick Reference

### Booking Statuses
- `confirmed` → Booking created, waiting for guest
- `checked_in` → Guest has arrived
- `checked_out` → Guest has left
- `cancelled` → Booking cancelled

### Date Format
Always use ISO 8601: `YYYY-MM-DDTHH:MM:SS`

Example: `2025-02-01T14:00:00`

### Validation Rules
- ✅ Check-in must be in the future
- ✅ Check-out must be after check-in
- ✅ Maximum 30 days per booking
- ✅ Room must be available
- ✅ No overlapping bookings

### Access Control
- **Guests**: Own bookings only
- **Staff**: Branch bookings
- **Admin**: All bookings

---

## ❌ Common Errors

### "Check-in date must be in the future"
➡️ Use a future date for `checking_datetime`

### "Room is already booked for the selected dates"
➡️ Choose different dates or another room

### "Access denied"
➡️ You can only view/modify your own bookings

### "Cannot update booking after check-in"
➡️ Guests cannot modify after check-in. Contact reception.

---

## 📚 Full Documentation

For complete details, see:
- **BOOKING_SYSTEM_GUIDE.md** - Complete documentation
- **SYSTEM_STATUS.md** - System overview

---

## 💡 Pro Tips

1. **Check availability first** before creating a booking
2. **Save your booking_id** for future reference
3. **Guests cannot modify** bookings after check-in
4. **Cancel early** if plans change
5. **Total cost is automatic** based on room rate × days

---

## 🆘 Need Help?

**Check Server Status**:
```bash
curl http://localhost:8084/api/health
```

**View All Systems**:
```bash
curl http://localhost:8084
```

---

**Happy Booking! 🎉**

Every user in the database can now add bookings for their respective accounts!
