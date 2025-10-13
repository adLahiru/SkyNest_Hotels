# Booking System - Complete Guide

## 🎯 Overview
The **Booking System** allows all authenticated users to create and manage hotel room bookings for their own accounts. This is a fully functional booking platform with date conflict detection, automatic cost calculation, and role-based access control.

**Base URL**: `http://localhost:8084/api/bookings`

---

## 🔐 Access Control

### All Authenticated Users
- ✅ Create bookings for themselves
- ✅ View their own bookings
- ✅ Update their own bookings (before check-in)
- ✅ Cancel their own bookings

### Staff (Manager/Receptionist)
- ✅ All user capabilities
- ✅ View bookings in their branch
- ✅ Update bookings in their branch
- ✅ Assign staff to bookings
- ✅ Check-in/Check-out guests

### Admin
- ✅ Full access to all bookings
- ✅ View bookings from all branches
- ✅ Update any booking
- ✅ Cancel any booking

---

## 📋 Booking Statuses

| Status | Description | User Can Modify | Staff Can Modify |
|--------|-------------|-----------------|------------------|
| `confirmed` | Booking is confirmed, waiting for check-in | ✅ Yes | ✅ Yes |
| `checked_in` | Guest has checked in | ❌ No | ✅ Yes |
| `checked_out` | Guest has checked out | ❌ No | ❌ No |
| `cancelled` | Booking has been cancelled | ❌ No | ❌ No |

---

## 🗄️ Database Schema

```sql
CREATE TABLE booking (
  booking_id CHAR(36) PRIMARY KEY DEFAULT (uuid()),
  user_id CHAR(36),
  room_id INT,
  staff_id CHAR(36),
  checking_datetime DATETIME,
  checkout_datetime DATETIME,
  booking_status ENUM('confirmed','cancelled','checked_in','checked_out'),
  booking_date DATE,
  branch_id CHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (room_id) REFERENCES rooms(room_id),
  FOREIGN KEY (staff_id) REFERENCES staff(staff_id),
  FOREIGN KEY (branch_id) REFERENCES hotel_branches(branch_id)
);
```

---

## 📡 API Endpoints

### 1. Create Booking

**Endpoint**: `POST /api/bookings`

**Description**: Create a new booking for the authenticated user

**Authorization**: All authenticated users

#### Request Headers
```json
{
  "Authorization": "Bearer <access_token>"
}
```

#### Request Body
```json
{
  "room_id": 1,
  "checking_datetime": "2025-01-25T14:00:00",
  "checkout_datetime": "2025-01-27T11:00:00",
  "staff_id": "staff-uuid" // Optional
}
```

#### Field Validations
- `room_id`: Required, must exist and be available
- `checking_datetime`: Required, ISO 8601 format, must be in the future
- `checkout_datetime`: Required, ISO 8601 format, must be after check-in
- `staff_id`: Optional, must exist if provided
- Maximum booking duration: 30 days
- Room must not have conflicting bookings

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Booking created successfully.",
  "data": {
    "booking": {
      "booking_id": "booking-uuid",
      "user_id": "user-uuid",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "room_id": 1,
      "room_no": "101",
      "room_type": "Deluxe Suite",
      "branch_id": "branch-uuid",
      "branch_name": "Colombo Main",
      "checking_datetime": "2025-01-25T14:00:00.000Z",
      "checkout_datetime": "2025-01-27T11:00:00.000Z",
      "booking_status": "confirmed",
      "booking_date": "2025-01-24",
      "staff_id": null,
      "staff_name": null,
      "daily_rate": 15000.00,
      "total_days": 2,
      "total_cost": 30000.00,
      "created_at": "2025-01-24T10:30:00.000Z",
      "updated_at": "2025-01-24T10:30:00.000Z"
    }
  }
}
```

#### Error Responses

**400 Bad Request - Check-in in the past**
```json
{
  "success": false,
  "message": "Check-in date must be in the future."
}
```

**409 Conflict - Room already booked**
```json
{
  "success": false,
  "message": "Room is already booked for the selected dates. Please choose different dates."
}
```

**409 Conflict - Room unavailable**
```json
{
  "success": false,
  "message": "Room is currently occupied. Please choose an available room."
}
```

#### cURL Example
```bash
curl -X POST http://localhost:8084/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "room_id": 1,
    "checking_datetime": "2025-01-25T14:00:00",
    "checkout_datetime": "2025-01-27T11:00:00"
  }'
```

---

### 2. Get My Bookings

**Endpoint**: `GET /api/bookings/my-bookings`

**Description**: Get all bookings for the authenticated user

**Authorization**: All authenticated users

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by booking status (optional) |

#### Request Headers
```json
{
  "Authorization": "Bearer <access_token>"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Your bookings retrieved successfully.",
  "data": {
    "bookings": [
      {
        "booking_id": "booking-uuid",
        "room_id": 1,
        "room_no": "101",
        "room_type": "Deluxe Suite",
        "branch_id": "branch-uuid",
        "branch_name": "Colombo Main",
        "checking_datetime": "2025-01-25T14:00:00.000Z",
        "checkout_datetime": "2025-01-27T11:00:00.000Z",
        "booking_status": "confirmed",
        "booking_date": "2025-01-24",
        "staff_id": null,
        "staff_name": null,
        "daily_rate": 15000.00,
        "total_days": 2,
        "total_cost": 30000.00,
        "created_at": "2025-01-24T10:30:00.000Z",
        "updated_at": "2025-01-24T10:30:00.000Z"
      }
    ],
    "count": 1
  }
}
```

#### cURL Examples
```bash
# Get all my bookings
curl -X GET http://localhost:8084/api/bookings/my-bookings \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get only confirmed bookings
curl -X GET "http://localhost:8084/api/bookings/my-bookings?status=confirmed" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Get All Bookings (Access-Controlled)

**Endpoint**: `GET /api/bookings`

**Description**: Get bookings based on user role
- Users: See only their own bookings
- Staff: See bookings in their branch
- Admins: See all bookings

**Authorization**: All authenticated users

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by booking status |
| `room_id` | number | Filter by room ID |
| `branch_id` | string | Filter by branch ID (admin only) |
| `user_id` | string | Filter by user ID (staff/admin only) |

#### Request Headers
```json
{
  "Authorization": "Bearer <access_token>"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Bookings retrieved successfully.",
  "data": {
    "bookings": [
      {
        "booking_id": "booking-uuid",
        "user_id": "user-uuid",
        "user_name": "John Doe",
        "user_email": "john@example.com",
        "room_id": 1,
        "room_no": "101",
        "room_type": "Deluxe Suite",
        "branch_id": "branch-uuid",
        "branch_name": "Colombo Main",
        "checking_datetime": "2025-01-25T14:00:00.000Z",
        "checkout_datetime": "2025-01-27T11:00:00.000Z",
        "booking_status": "confirmed",
        "booking_date": "2025-01-24",
        "staff_id": null,
        "staff_name": null,
        "daily_rate": 15000.00,
        "total_days": 2,
        "total_cost": 30000.00,
        "created_at": "2025-01-24T10:30:00.000Z",
        "updated_at": "2025-01-24T10:30:00.000Z"
      }
    ],
    "count": 1
  }
}
```

#### cURL Examples
```bash
# Get all accessible bookings
curl -X GET http://localhost:8084/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by status
curl -X GET "http://localhost:8084/api/bookings?status=confirmed" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Admin: Filter by branch
curl -X GET "http://localhost:8084/api/bookings?branch_id=branch-uuid" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

### 4. Get Booking by ID

**Endpoint**: `GET /api/bookings/:booking_id`

**Description**: Get specific booking details

**Authorization**: Users can view their own bookings, staff can view branch bookings, admins can view all

#### Request Headers
```json
{
  "Authorization": "Bearer <access_token>"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Booking retrieved successfully.",
  "data": {
    "booking": {
      "booking_id": "booking-uuid",
      "user_id": "user-uuid",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "room_id": 1,
      "room_no": "101",
      "room_type": "Deluxe Suite",
      "branch_id": "branch-uuid",
      "branch_name": "Colombo Main",
      "checking_datetime": "2025-01-25T14:00:00.000Z",
      "checkout_datetime": "2025-01-27T11:00:00.000Z",
      "booking_status": "confirmed",
      "booking_date": "2025-01-24",
      "staff_id": null,
      "staff_name": null,
      "daily_rate": 15000.00,
      "total_days": 2,
      "total_cost": 30000.00,
      "created_at": "2025-01-24T10:30:00.000Z",
      "updated_at": "2025-01-24T10:30:00.000Z"
    }
  }
}
```

#### Error Responses

**403 Forbidden**
```json
{
  "success": false,
  "message": "Access denied. You can only view your own bookings."
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Booking not found."
}
```

#### cURL Example
```bash
curl -X GET http://localhost:8084/api/bookings/booking-uuid \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 5. Update Booking

**Endpoint**: `PUT /api/bookings/:booking_id`

**Description**: Update booking details

**Authorization**: 
- Users: Can update their own bookings (before check-in)
- Staff: Can update bookings in their branch
- Admins: Can update any booking

#### Request Headers
```json
{
  "Authorization": "Bearer <access_token>"
}
```

#### Request Body (All fields optional)
```json
{
  "checking_datetime": "2025-01-26T14:00:00",
  "checkout_datetime": "2025-01-28T11:00:00",
  "booking_status": "checked_in",
  "staff_id": "staff-uuid"
}
```

#### Automatic Room State Management
- When `booking_status` = `checked_in`: Room state becomes `occupied`
- When `booking_status` = `checked_out`: Room state becomes `available`

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Booking updated successfully.",
  "data": {
    "booking": {
      "booking_id": "booking-uuid",
      "user_id": "user-uuid",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "room_id": 1,
      "room_no": "101",
      "room_type": "Deluxe Suite",
      "branch_id": "branch-uuid",
      "branch_name": "Colombo Main",
      "checking_datetime": "2025-01-26T14:00:00.000Z",
      "checkout_datetime": "2025-01-28T11:00:00.000Z",
      "booking_status": "checked_in",
      "booking_date": "2025-01-24",
      "staff_id": "staff-uuid",
      "staff_name": "Jane Staff",
      "daily_rate": 15000.00,
      "total_days": 2,
      "total_cost": 30000.00,
      "created_at": "2025-01-24T10:30:00.000Z",
      "updated_at": "2025-01-25T14:00:00.000Z"
    }
  }
}
```

#### Error Responses

**403 Forbidden - Guest updating after check-in**
```json
{
  "success": false,
  "message": "Cannot update booking after check-in. Please contact reception."
}
```

**409 Conflict - Date conflict**
```json
{
  "success": false,
  "message": "Room is already booked for the selected dates."
}
```

#### cURL Examples
```bash
# Check-in guest (staff only)
curl -X PUT http://localhost:8084/api/bookings/booking-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STAFF_TOKEN" \
  -d '{
    "booking_status": "checked_in",
    "staff_id": "staff-uuid"
  }'

# Update dates
curl -X PUT http://localhost:8084/api/bookings/booking-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "checking_datetime": "2025-01-26T14:00:00",
    "checkout_datetime": "2025-01-28T11:00:00"
  }'
```

---

### 6. Cancel Booking

**Endpoint**: `DELETE /api/bookings/:booking_id`

**Description**: Cancel a booking

**Authorization**: 
- Users: Can cancel their own bookings
- Staff: Can cancel bookings in their branch
- Admins: Can cancel any booking

#### Request Headers
```json
{
  "Authorization": "Bearer <access_token>"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Booking cancelled successfully.",
  "data": {
    "booking_id": "booking-uuid",
    "cancelled_at": "2025-01-24T12:00:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request - Already checked out**
```json
{
  "success": false,
  "message": "Cannot cancel a completed booking."
}
```

**400 Bad Request - Already cancelled**
```json
{
  "success": false,
  "message": "Booking is already cancelled."
}
```

#### cURL Example
```bash
curl -X DELETE http://localhost:8084/api/bookings/booking-uuid \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Common Use Cases

### 1. Guest Creates a Booking
```bash
# Step 1: Find available rooms
curl -X GET "http://localhost:8084/api/rooms/available?branch_id=colombo" \
  -H "Authorization: Bearer GUEST_TOKEN"

# Step 2: Create booking
curl -X POST http://localhost:8084/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer GUEST_TOKEN" \
  -d '{
    "room_id": 1,
    "checking_datetime": "2025-01-25T14:00:00",
    "checkout_datetime": "2025-01-27T11:00:00"
  }'

# Step 3: View my bookings
curl -X GET http://localhost:8084/api/bookings/my-bookings \
  -H "Authorization: Bearer GUEST_TOKEN"
```

### 2. Receptionist Checks In Guest
```bash
# Step 1: View today's confirmed bookings
curl -X GET "http://localhost:8084/api/bookings?status=confirmed" \
  -H "Authorization: Bearer RECEPTIONIST_TOKEN"

# Step 2: Check in the guest
curl -X PUT http://localhost:8084/api/bookings/booking-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer RECEPTIONIST_TOKEN" \
  -d '{
    "booking_status": "checked_in",
    "staff_id": "receptionist-staff-uuid"
  }'
```

### 3. Guest Modifies Booking Dates
```bash
curl -X PUT http://localhost:8084/api/bookings/booking-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer GUEST_TOKEN" \
  -d '{
    "checking_datetime": "2025-01-26T14:00:00",
    "checkout_datetime": "2025-01-29T11:00:00"
  }'
```

### 4. Guest Cancels Booking
```bash
curl -X DELETE http://localhost:8084/api/bookings/booking-uuid \
  -H "Authorization: Bearer GUEST_TOKEN"
```

### 5. Manager Views Branch Bookings
```bash
# All bookings in manager's branch
curl -X GET http://localhost:8084/api/bookings \
  -H "Authorization: Bearer MANAGER_TOKEN"

# Filter by checked-in guests
curl -X GET "http://localhost:8084/api/bookings?status=checked_in" \
  -H "Authorization: Bearer MANAGER_TOKEN"
```

---

## ✅ Business Rules

### Date Validation
- ✅ Check-in must be in the future
- ✅ Check-out must be after check-in
- ✅ Maximum booking duration: 30 days
- ✅ Dates must be in ISO 8601 format

### Room Availability
- ✅ Room must exist
- ✅ Room must be in "available" state
- ✅ No conflicting bookings for the same room
- ✅ Overlapping date ranges are detected

### User Permissions
- ✅ Users can only book for themselves (user_id auto-set)
- ✅ Users cannot update bookings after check-in
- ✅ Staff can manage bookings in their branch
- ✅ Admins have full access

### Status Transitions
- ✅ `confirmed` → `checked_in`: Updates room state to occupied
- ✅ `checked_in` → `checked_out`: Updates room state to available
- ✅ `confirmed` → `cancelled`: Makes room available again if checked in
- ❌ Cannot cancel checked_out bookings

---

## 💰 Cost Calculation

### Automatic Calculation
The system automatically calculates:

1. **Total Days**: Difference between check-out and check-in (minimum 1 day)
2. **Daily Rate**: From the room type
3. **Total Cost**: `daily_rate * total_days`

### Example
```
Check-in: 2025-01-25 14:00:00
Check-out: 2025-01-27 11:00:00
Daily Rate: 15,000

Total Days: 2 days
Total Cost: 15,000 × 2 = 30,000
```

---

## 🔄 Booking Workflow

### Standard Booking Flow

```
1. Guest Registration
   ↓
2. Browse Available Rooms
   ↓
3. Create Booking (confirmed)
   ↓
4. Guest Arrives → Check-in (checked_in)
   ↓
5. Guest Stays
   ↓
6. Guest Leaves → Check-out (checked_out)
```

### Cancellation Flow

```
1. Create Booking (confirmed)
   ↓
2. Guest Cancels or Staff Cancels
   ↓
3. Booking Status → cancelled
   ↓
4. If was checked_in: Room becomes available
```

---

## 🛡️ Security Features

### Authentication
- ✅ JWT token required for all endpoints
- ✅ Token validation on every request
- ✅ User identity embedded in token

### Authorization
- ✅ Users can only access their own bookings
- ✅ Staff restricted to their branch
- ✅ Automatic user_id assignment (no spoofing)

### Data Validation
- ✅ Date format validation
- ✅ Foreign key validation
- ✅ Conflict detection
- ✅ Status transition rules

### Transaction Safety
- ✅ Database transactions for multi-step operations
- ✅ Automatic rollback on errors
- ✅ Room state synchronization

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful message",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical details (in development mode)"
}
```

### HTTP Status Codes
- `200` - Success (GET, PUT, DELETE)
- `201` - Created successfully (POST)
- `400` - Bad request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `409` - Conflict (date conflict, room unavailable)
- `500` - Internal server error

---

## 🎓 Testing Workflow

### Step 1: Register/Login
```bash
# Register as guest
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

### Step 2: Find Available Rooms
```bash
curl -X GET http://localhost:8084/api/rooms/available \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 3: Create Booking
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

### Step 4: View My Bookings
```bash
curl -X GET http://localhost:8084/api/bookings/my-bookings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 5: Update Booking
```bash
curl -X PUT http://localhost:8084/api/bookings/booking-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "checkout_datetime": "2025-02-04T11:00:00"
  }'
```

### Step 6: Cancel Booking
```bash
curl -X DELETE http://localhost:8084/api/bookings/booking-uuid \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔗 Integration Points

### Room Management
- Checks room availability
- Updates room state on check-in/check-out
- Validates room existence

### User Management
- Uses authenticated user's ID
- Validates staff assignments
- Enforces role-based permissions

### Branch Management
- Associates bookings with branches
- Enables branch-level filtering
- Supports manager branch restrictions

---

## 📈 Future Enhancements

### Planned Features
- [ ] Payment integration
- [ ] Email confirmations
- [ ] Booking modifications history
- [ ] Special requests field
- [ ] Loyalty program integration
- [ ] Group bookings
- [ ] Recurring bookings

---

**API Version**: 1.0.0  
**Last Updated**: October 2025  
**Status**: ✅ Production Ready

**Note**: All authenticated users can create bookings for their own accounts!
