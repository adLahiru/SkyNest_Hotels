# Room Management - Quick Reference Guide

## 🎯 Key Features

### Access Control
- **Admin**: Full access to all branches ✅
- **Manager**: Restricted to their own branch only ✅
- **Others**: Read-only access ✅

---

## 📋 API Endpoints Summary

| Method | Endpoint | Admin | Manager | Others | Description |
|--------|----------|-------|---------|--------|-------------|
| POST | `/api/rooms` | ✅ Any branch | ✅ Own branch | ❌ | Create room |
| GET | `/api/rooms` | ✅ All | ✅ Own branch | ✅ All | Get all rooms |
| GET | `/api/rooms/available` | ✅ | ✅ | ✅ | Get available rooms |
| GET | `/api/rooms/:id` | ✅ Any | ✅ Own branch | ✅ Any | Get specific room |
| PUT | `/api/rooms/:id` | ✅ Any | ✅ Own branch | ❌ | Update room |
| DELETE | `/api/rooms/:id` | ✅ Any | ✅ Own branch | ❌ | Delete room |

---

## 🚀 Quick Start Commands

### 1. Create Room (Admin - Any Branch)
```bash
curl -X POST http://localhost:8084/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "room_type_id": "room-type-uuid",
    "branch_id": "any-branch-uuid",
    "room_no": "101",
    "floor_no": 1,
    "state": "available"
  }'
```

### 2. Create Room (Manager - Own Branch)
```bash
curl -X POST http://localhost:8084/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -d '{
    "room_type_id": "room-type-uuid",
    "branch_id": "their-branch-uuid",
    "room_no": "201",
    "floor_no": 2
  }'
```

### 3. Get Available Rooms
```bash
curl -X GET "http://localhost:8084/api/rooms/available?branch_id=xyz" \
  -H "Authorization: Bearer TOKEN"
```

### 4. Update Room State
```bash
curl -X PUT http://localhost:8084/api/rooms/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"state": "maintenance"}'
```

### 5. Get All Rooms
```bash
curl -X GET http://localhost:8084/api/rooms \
  -H "Authorization: Bearer TOKEN"
```

---

## 🏗️ Room States

| State | Description | Use Case |
|-------|-------------|----------|
| `available` | Ready for booking | Default state |
| `occupied` | Currently in use | Active booking |
| `maintenance` | Under maintenance | Cleaning, repairs |

---

## 📝 Request Body Examples

### Create Room (Minimal)
```json
{
  "room_type_id": "uuid",
  "branch_id": "uuid",
  "room_no": "101",
  "floor_no": 1
}
```

### Create Room (With State)
```json
{
  "room_type_id": "uuid",
  "branch_id": "uuid",
  "room_no": "101",
  "floor_no": 1,
  "state": "maintenance"
}
```

### Update Room (Partial)
```json
{
  "state": "available"
}
```

### Update Room (Multiple Fields)
```json
{
  "room_no": "102A",
  "floor_no": 2,
  "state": "available"
}
```

---

## 🔍 Query Parameters

### GET /api/rooms
```
?branch_id=xyz          # Filter by branch
?room_type_id=abc       # Filter by room type
?state=available        # Filter by state
?floor_no=2             # Filter by floor
```

### GET /api/rooms/available
```
?branch_id=xyz          # Filter by branch
?room_type_id=abc       # Filter by room type
?floor_no=2             # Filter by floor
```

### Examples
```bash
# Available rooms in Colombo branch
GET /api/rooms/available?branch_id=colombo-id

# All rooms on floor 3
GET /api/rooms?floor_no=3

# Occupied rooms in Kandy branch
GET /api/rooms?branch_id=kandy-id&state=occupied

# Deluxe suites that are available
GET /api/rooms/available?room_type_id=deluxe-suite-id
```

---

## ✅ Validation Rules

### room_no
- ✅ Required
- ✅ Max 20 characters
- ✅ Must be unique per branch
- ✅ Can contain: letters, numbers, hyphens, etc.
- ✅ Examples: `101`, `201A`, `Executive-5`

### floor_no
- ✅ Required
- ✅ Must be ≥ 0
- ✅ Integer only
- ✅ Examples: `0`, `1`, `5`, `20`

### state
- ✅ Must be: `available`, `occupied`, or `maintenance`
- ✅ Defaults to `available`

### Branch Access (Managers)
- ❌ Cannot create in other branches
- ❌ Cannot update in other branches
- ❌ Cannot delete from other branches
- ❌ Cannot move rooms between branches

---

## 🔐 Authorization Headers

All requests require Bearer token:
```bash
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Get token from login:
```bash
curl -X POST http://localhost:8084/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'
```

---

## 📊 Response Format

### Success (201 Created)
```json
{
  "success": true,
  "message": "Room created successfully.",
  "data": {
    "room": {
      "room_id": 1,
      "room_type": "Deluxe Suite",
      "branch_name": "Colombo Main",
      "room_no": "101",
      "floor_no": 1,
      "state": "available",
      "capacity": 2,
      "daily_rate": 15000.00,
      "created_at": "2025-01-24T10:30:00.000Z"
    }
  }
}
```

### Error (403 Forbidden)
```json
{
  "success": false,
  "message": "Access denied. Managers can only add rooms to their own branch."
}
```

---

## 🎯 Common Workflows

### 1. Admin Setup - Add 10 Rooms to Colombo Branch
```bash
for i in {101..110}; do
  curl -X POST http://localhost:8084/api/rooms \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ADMIN_TOKEN" \
    -d "{
      \"room_type_id\": \"deluxe-suite-id\",
      \"branch_id\": \"colombo-id\",
      \"room_no\": \"$i\",
      \"floor_no\": 1
    }"
done
```

### 2. Manager Daily Operations
```bash
# Check available rooms in my branch
curl -X GET "http://localhost:8084/api/rooms/available" \
  -H "Authorization: Bearer MANAGER_TOKEN"

# Mark room as under maintenance
curl -X PUT http://localhost:8084/api/rooms/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -d '{"state": "maintenance"}'

# Mark room as available again
curl -X PUT http://localhost:8084/api/rooms/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -d '{"state": "available"}'
```

### 3. Receptionist - Check Availability
```bash
# Find available Deluxe Suites
curl -X GET "http://localhost:8084/api/rooms/available?room_type_id=deluxe-id" \
  -H "Authorization: Bearer RECEPTIONIST_TOKEN"

# Check specific room details
curl -X GET http://localhost:8084/api/rooms/5 \
  -H "Authorization: Bearer RECEPTIONIST_TOKEN"
```

---

## ⚠️ Common Errors

### 403 - Manager Creating in Wrong Branch
```bash
# ❌ This will fail for managers
curl -X POST http://localhost:8084/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -d '{
    "branch_id": "different-branch-id",  # Not their branch!
    "room_no": "101",
    "floor_no": 1
  }'

# Response: "Access denied. Managers can only add rooms to their own branch."
```

### 409 - Duplicate Room Number
```bash
# ❌ Creating room 101 when it already exists in branch
curl -X POST http://localhost:8084/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "room_no": "101",  # Already exists!
    "branch_id": "same-branch-id",
    "floor_no": 1
  }'

# Response: "Room number \"101\" already exists in this branch."
```

### 404 - Invalid Room Type or Branch
```bash
# ❌ Non-existent room_type_id
curl -X POST http://localhost:8084/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "room_type_id": "invalid-uuid",  # Doesn't exist!
    "branch_id": "valid-branch-id",
    "room_no": "101",
    "floor_no": 1
  }'

# Response: "Room type not found."
```

---

## 🔗 Prerequisites

Before creating rooms, ensure:

1. **Branch exists** - Create via `/api/branches`
2. **Room type exists** - Create via `/api/room-types`
3. **Manager assigned to branch** (for managers)
4. **Valid authentication token**

---

## 📞 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check if token is valid and not expired |
| 403 Forbidden (Manager) | Verify branch_id matches manager's branch |
| 404 Room Type Not Found | Create room type first via `/api/room-types` |
| 404 Branch Not Found | Create branch first via `/api/branches` |
| 409 Duplicate Room | Change room_no or check existing rooms |
| Can't delete room | Room has bookings - use maintenance state instead |

---

## 🎓 Testing Checklist

- [ ] Admin can create room in any branch
- [ ] Manager can create room in their branch
- [ ] Manager CANNOT create room in other branch
- [ ] Get all rooms returns correct data
- [ ] Get available rooms filters correctly
- [ ] Update room state works
- [ ] Manager cannot update other branch rooms
- [ ] Duplicate room_no is rejected
- [ ] Invalid room_type_id is rejected
- [ ] Invalid branch_id is rejected
- [ ] Floor numbers accept 0 and positive integers
- [ ] Room states validate correctly

---

## 📚 Related Documentation

- **Full Guide**: `ROOM_MANAGEMENT_GUIDE.md`
- **API Overview**: `API_COMPLETE_GUIDE.md`
- **Room Types**: `/api/room-types` endpoints
- **Branches**: `/api/branches` endpoints
- **Authentication**: `/api/auth` endpoints

---

**Base URL**: `http://localhost:8084`  
**API Version**: 1.0.0  
**Status**: ✅ Production Ready
