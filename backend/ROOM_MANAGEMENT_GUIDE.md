# Room Management System - Complete Documentation

## Overview
The Room Management System provides comprehensive room inventory management with **branch-based access control**. Administrators have full access to all branches, while managers are restricted to their assigned branch.

## Access Control

### Administrator (ADMIN)
- ✅ Create rooms in **any branch**
- ✅ Update rooms in **any branch**
- ✅ Delete rooms from **any branch**
- ✅ View rooms from **all branches**

### Manager (MANAGER)
- ✅ Create rooms **only in their own branch**
- ✅ Update rooms **only in their own branch**
- ✅ Delete rooms **only from their own branch**
- ✅ View rooms **only from their own branch**

### Other Roles (RECEPTIONIST, HOUSEKEEPING, GUEST)
- ✅ View all available rooms
- ❌ Cannot create, update, or delete rooms

---

## Database Schema

### Rooms Table
```sql
CREATE TABLE rooms (
  room_id INT AUTO_INCREMENT PRIMARY KEY,
  room_type_id CHAR(36) NOT NULL,
  branch_id CHAR(36) NOT NULL,
  room_no VARCHAR(20) NOT NULL,
  floor_no INT NOT NULL,
  state ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (room_type_id) REFERENCES room_types(room_type_id),
  FOREIGN KEY (branch_id) REFERENCES hotel_branches(branch_id),
  UNIQUE KEY unique_room_per_branch (branch_id, room_no)
);
```

### Room States
- **available** - Room is ready for booking
- **occupied** - Room is currently occupied by a guest
- **maintenance** - Room is under maintenance/cleaning

---

## API Endpoints

### Base URL
```
http://localhost:8084/api/rooms
```

All endpoints require authentication via Bearer token in the Authorization header.

---

## 1. Create Room

### Endpoint
```
POST /api/rooms
```

### Authorization
- **ADMIN**: Can add rooms to any branch
- **MANAGER**: Can only add rooms to their own branch

### Request Headers
```json
{
  "Authorization": "Bearer <access_token>"
}
```

### Request Body
```json
{
  "room_type_id": "uuid-of-room-type",
  "branch_id": "uuid-of-branch",
  "room_no": "101",
  "floor_no": 1,
  "state": "available"
}
```

### Field Validations
- `room_type_id`: Required, must exist in `room_types` table
- `branch_id`: Required, must exist in `hotel_branches` table
- `room_no`: Required, max 20 characters, must be unique within the branch
- `floor_no`: Required, must be non-negative integer (≥ 0)
- `state`: Optional, defaults to `available`, must be one of: `available`, `occupied`, `maintenance`

### Response (201 Created)
```json
{
  "success": true,
  "message": "Room created successfully.",
  "data": {
    "room": {
      "room_id": 1,
      "room_type_id": "abc123...",
      "room_type": "Deluxe Suite",
      "branch_id": "xyz789...",
      "branch_name": "Colombo Main",
      "room_no": "101",
      "floor_no": 1,
      "state": "available",
      "capacity": 2,
      "daily_rate": 15000.00,
      "created_at": "2025-01-24T10:30:00.000Z",
      "updated_at": "2025-01-24T10:30:00.000Z"
    }
  }
}
```

### Error Responses

**403 Forbidden - Manager trying to add to another branch**
```json
{
  "success": false,
  "message": "Access denied. Managers can only add rooms to their own branch."
}
```

**404 Not Found - Invalid room_type_id**
```json
{
  "success": false,
  "message": "Room type not found."
}
```

**404 Not Found - Invalid branch_id**
```json
{
  "success": false,
  "message": "Branch not found."
}
```

**409 Conflict - Duplicate room_no**
```json
{
  "success": false,
  "message": "Room number \"101\" already exists in this branch."
}
```

### cURL Examples

**Admin - Add room to any branch**
```bash
curl -X POST http://localhost:8084/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "room_type_id": "abc123-...",
    "branch_id": "xyz789-...",
    "room_no": "101",
    "floor_no": 1,
    "state": "available"
  }'
```

**Manager - Add room to own branch**
```bash
curl -X POST http://localhost:8084/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MANAGER_TOKEN" \
  -d '{
    "room_type_id": "abc123-...",
    "branch_id": "YOUR_BRANCH_ID",
    "room_no": "201",
    "floor_no": 2,
    "state": "available"
  }'
```

---

## 2. Get All Rooms

### Endpoint
```
GET /api/rooms
```

### Authorization
- **ADMIN**: Returns all rooms from all branches
- **MANAGER**: Returns only rooms from their branch
- **Others**: Returns all available rooms

### Query Parameters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `branch_id` | string | Filter by branch ID (ignored for managers) | `?branch_id=xyz789...` |
| `room_type_id` | string | Filter by room type | `?room_type_id=abc123...` |
| `state` | string | Filter by state (available/occupied/maintenance) | `?state=available` |
| `floor_no` | number | Filter by floor number | `?floor_no=2` |

### Request Headers
```json
{
  "Authorization": "Bearer <access_token>"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Rooms retrieved successfully.",
  "data": {
    "rooms": [
      {
        "room_id": 1,
        "room_type_id": "abc123...",
        "room_type": "Deluxe Suite",
        "branch_id": "xyz789...",
        "branch_name": "Colombo Main",
        "room_no": "101",
        "floor_no": 1,
        "state": "available",
        "capacity": 2,
        "daily_rate": 15000.00,
        "created_at": "2025-01-24T10:30:00.000Z",
        "updated_at": "2025-01-24T10:30:00.000Z"
      },
      {
        "room_id": 2,
        "room_type_id": "def456...",
        "room_type": "Standard Room",
        "branch_id": "xyz789...",
        "branch_name": "Colombo Main",
        "room_no": "102",
        "floor_no": 1,
        "state": "occupied",
        "capacity": 2,
        "daily_rate": 8000.00,
        "created_at": "2025-01-24T10:35:00.000Z",
        "updated_at": "2025-01-24T11:00:00.000Z"
      }
    ],
    "count": 2
  }
}
```

### cURL Examples

**Get all rooms (Admin)**
```bash
curl -X GET http://localhost:8084/api/rooms \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Get available rooms in specific branch**
```bash
curl -X GET "http://localhost:8084/api/rooms?branch_id=xyz789...&state=available" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get rooms on floor 2**
```bash
curl -X GET "http://localhost:8084/api/rooms?floor_no=2" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 3. Get Available Rooms

### Endpoint
```
GET /api/rooms/available
```

### Description
Returns only rooms with `state='available'`. Useful for booking systems.

### Authorization
All authenticated users can access this endpoint.

### Query Parameters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `branch_id` | string | Filter by branch ID | `?branch_id=xyz789...` |
| `room_type_id` | string | Filter by room type | `?room_type_id=abc123...` |
| `floor_no` | number | Filter by floor number | `?floor_no=3` |

### Request Headers
```json
{
  "Authorization": "Bearer <access_token>"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Available rooms retrieved successfully.",
  "data": {
    "rooms": [
      {
        "room_id": 5,
        "room_type_id": "abc123...",
        "room_type": "Deluxe Suite",
        "branch_id": "xyz789...",
        "branch_name": "Colombo Main",
        "room_no": "105",
        "floor_no": 1,
        "capacity": 2,
        "daily_rate": 15000.00,
        "created_at": "2025-01-24T10:30:00.000Z",
        "updated_at": "2025-01-24T10:30:00.000Z"
      }
    ],
    "count": 1
  }
}
```

### cURL Example
```bash
curl -X GET "http://localhost:8084/api/rooms/available?branch_id=xyz789..." \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 4. Get Room by ID

### Endpoint
```
GET /api/rooms/:room_id
```

### Authorization
- **ADMIN**: Can view any room
- **MANAGER**: Can only view rooms in their branch
- **Others**: Can view any room

### Request Headers
```json
{
  "Authorization": "Bearer <access_token>"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Room retrieved successfully.",
  "data": {
    "room": {
      "room_id": 1,
      "room_type_id": "abc123...",
      "room_type": "Deluxe Suite",
      "branch_id": "xyz789...",
      "branch_name": "Colombo Main",
      "room_no": "101",
      "floor_no": 1,
      "state": "available",
      "capacity": 2,
      "daily_rate": 15000.00,
      "created_at": "2025-01-24T10:30:00.000Z",
      "updated_at": "2025-01-24T10:30:00.000Z"
    }
  }
}
```

### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "message": "Room not found."
}
```

**403 Forbidden - Manager viewing another branch's room**
```json
{
  "success": false,
  "message": "Access denied. You can only view rooms in your branch."
}
```

### cURL Example
```bash
curl -X GET http://localhost:8084/api/rooms/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 5. Update Room

### Endpoint
```
PUT /api/rooms/:room_id
```

### Authorization
- **ADMIN**: Can update any room
- **MANAGER**: Can only update rooms in their own branch

### Request Headers
```json
{
  "Authorization": "Bearer <access_token>"
}
```

### Request Body
All fields are optional. Only include fields you want to update.

```json
{
  "room_type_id": "new-room-type-id",
  "branch_id": "new-branch-id",
  "room_no": "102",
  "floor_no": 2,
  "state": "maintenance"
}
```

### Field Validations
- `room_type_id`: Optional, must exist in `room_types` table
- `branch_id`: Optional, must exist in `hotel_branches` table, manager cannot move room to another branch
- `room_no`: Optional, 1-20 characters, must be unique within the branch
- `floor_no`: Optional, must be non-negative integer
- `state`: Optional, must be one of: `available`, `occupied`, `maintenance`

### Response (200 OK)
```json
{
  "success": true,
  "message": "Room updated successfully.",
  "data": {
    "room": {
      "room_id": 1,
      "room_type_id": "abc123...",
      "room_type": "Deluxe Suite",
      "branch_id": "xyz789...",
      "branch_name": "Colombo Main",
      "room_no": "102",
      "floor_no": 2,
      "state": "maintenance",
      "capacity": 2,
      "daily_rate": 15000.00,
      "created_at": "2025-01-24T10:30:00.000Z",
      "updated_at": "2025-01-24T11:45:00.000Z"
    }
  }
}
```

### Error Responses

**403 Forbidden - Manager updating another branch's room**
```json
{
  "success": false,
  "message": "Access denied. Managers can only update rooms in their own branch."
}
```

**403 Forbidden - Manager trying to move room to another branch**
```json
{
  "success": false,
  "message": "Access denied. You cannot move rooms to a branch you do not manage."
}
```

**409 Conflict - Duplicate room_no**
```json
{
  "success": false,
  "message": "Room number \"102\" already exists in this branch."
}
```

### cURL Examples

**Update room state**
```bash
curl -X PUT http://localhost:8084/api/rooms/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "state": "maintenance"
  }'
```

**Update multiple fields**
```bash
curl -X PUT http://localhost:8084/api/rooms/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "room_no": "102A",
    "floor_no": 2,
    "state": "available"
  }'
```

---

## 6. Delete Room

### Endpoint
```
DELETE /api/rooms/:room_id
```

### Authorization
- **ADMIN**: Can delete any room
- **MANAGER**: Can only delete rooms in their own branch

### Protection Rules
- ❌ Cannot delete rooms with associated bookings
- ✅ Suggests changing state to `maintenance` instead

### Request Headers
```json
{
  "Authorization": "Bearer <access_token>"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Room deleted successfully.",
  "data": {
    "deleted_room_id": 1
  }
}
```

### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "message": "Room not found."
}
```

**403 Forbidden - Manager deleting another branch's room**
```json
{
  "success": false,
  "message": "Access denied. Managers can only delete rooms in their own branch."
}
```

**409 Conflict - Room has bookings**
```json
{
  "success": false,
  "message": "Cannot delete room. It has associated bookings. Consider changing its state to maintenance instead."
}
```

### cURL Example
```bash
curl -X DELETE http://localhost:8084/api/rooms/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Common Use Cases

### 1. Admin Creates Rooms in Multiple Branches
```bash
# Colombo branch room
curl -X POST http://localhost:8084/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "room_type_id": "deluxe-suite-id",
    "branch_id": "colombo-branch-id",
    "room_no": "101",
    "floor_no": 1
  }'

# Kandy branch room
curl -X POST http://localhost:8084/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "room_type_id": "standard-room-id",
    "branch_id": "kandy-branch-id",
    "room_no": "201",
    "floor_no": 2
  }'
```

### 2. Manager Creates Room in Their Branch
```bash
curl -X POST http://localhost:8084/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -d '{
    "room_type_id": "executive-suite-id",
    "branch_id": "THEIR_BRANCH_ID",
    "room_no": "301",
    "floor_no": 3,
    "state": "available"
  }'
```

### 3. Mark Room as Under Maintenance
```bash
curl -X PUT http://localhost:8084/api/rooms/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "state": "maintenance"
  }'
```

### 4. Mark Room as Available After Maintenance
```bash
curl -X PUT http://localhost:8084/api/rooms/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "state": "available"
  }'
```

### 5. Find Available Deluxe Suites in Colombo
```bash
curl -X GET "http://localhost:8084/api/rooms/available?branch_id=colombo-id&room_type_id=deluxe-suite-id" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Get All Rooms on Floor 3
```bash
curl -X GET "http://localhost:8084/api/rooms?floor_no=3" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Validation Rules Summary

### Room Number (room_no)
- ✅ Required for creation
- ✅ Max 20 characters
- ✅ Must be unique within a branch
- ✅ Can contain letters, numbers, special characters
- ✅ Examples: `101`, `201A`, `Executive-Suite-5`

### Floor Number (floor_no)
- ✅ Required for creation
- ✅ Must be non-negative integer (0, 1, 2, 3, ...)
- ✅ No maximum limit

### Room State
- ✅ Must be one of: `available`, `occupied`, `maintenance`
- ✅ Defaults to `available` on creation
- ✅ Can be updated at any time

### Branch Access (for Managers)
- ❌ Cannot create rooms in other branches
- ❌ Cannot update rooms in other branches
- ❌ Cannot delete rooms from other branches
- ❌ Cannot move rooms to other branches
- ✅ Can view only their branch rooms

---

## Error Handling

All endpoints return structured error responses:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "error": "Technical error details (in development mode)"
}
```

### HTTP Status Codes
- `200` - Success (GET, PUT, DELETE)
- `201` - Created successfully (POST)
- `400` - Bad request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `409` - Conflict (duplicate room number)
- `500` - Internal server error

---

## Testing Workflow

### Step 1: Get Authentication Token
```bash
# Login as admin
curl -X POST http://localhost:8084/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@skynest.com",
    "password": "admin123"
  }'

# Login as manager
curl -X POST http://localhost:8084/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@skynest.com",
    "password": "manager123"
  }'
```

### Step 2: Get Branch IDs
```bash
curl -X GET http://localhost:8084/api/branches \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 3: Get Room Type IDs
```bash
curl -X GET http://localhost:8084/api/room-types \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 4: Create Rooms
```bash
# Admin creates room in any branch
curl -X POST http://localhost:8084/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "room_type_id": "ROOM_TYPE_ID",
    "branch_id": "BRANCH_ID",
    "room_no": "101",
    "floor_no": 1
  }'

# Manager creates room in their branch
curl -X POST http://localhost:8084/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -d '{
    "room_type_id": "ROOM_TYPE_ID",
    "branch_id": "THEIR_BRANCH_ID",
    "room_no": "201",
    "floor_no": 2
  }'
```

### Step 5: View Rooms
```bash
# Admin views all rooms
curl -X GET http://localhost:8084/api/rooms \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Manager views only their branch rooms
curl -X GET http://localhost:8084/api/rooms \
  -H "Authorization: Bearer MANAGER_TOKEN"
```

### Step 6: Update Room
```bash
curl -X PUT http://localhost:8084/api/rooms/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "state": "maintenance"
  }'
```

### Step 7: Get Available Rooms
```bash
curl -X GET http://localhost:8084/api/rooms/available \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Integration with Other Systems

### Room Types Integration
Rooms reference `room_types` table for:
- Room classification (Deluxe, Standard, Suite, etc.)
- Capacity information
- Daily rate pricing
- Amenities list

### Branch Integration
Rooms are assigned to specific branches:
- Physical location
- Manager assignment
- Access control

### Bookings Integration (Future)
Rooms will be referenced by:
- `bookings` table for reservation tracking
- Automatic state management (available → occupied)
- Deletion protection for rooms with bookings

---

## Security Features

### Authentication
- ✅ JWT token required for all endpoints
- ✅ Token validation on every request
- ✅ Automatic token expiration

### Authorization
- ✅ Role-based access control (RBAC)
- ✅ Branch-level isolation for managers
- ✅ Hierarchical permission system

### Data Validation
- ✅ Input sanitization
- ✅ Foreign key validation
- ✅ Duplicate prevention
- ✅ SQL injection protection (parameterized queries)

### Transaction Safety
- ✅ Database transactions for multi-step operations
- ✅ Automatic rollback on errors
- ✅ Referential integrity enforcement

---

## Performance Considerations

### Database Indexes
- Primary key on `room_id` (auto-indexed)
- Foreign keys on `room_type_id` and `branch_id` (auto-indexed)
- Unique constraint on `(branch_id, room_no)` (creates index)

### Query Optimization
- JOIN operations for room type and branch details
- Filtered queries for manager access
- Efficient COUNT queries for availability

### Connection Pooling
- Reusable database connections
- Automatic connection release
- Error-resilient connection management

---

## Future Enhancements

### Planned Features
- [ ] Bulk room creation (import CSV)
- [ ] Room availability calendar
- [ ] Housekeeping status tracking
- [ ] Maintenance scheduling
- [ ] Room inspection reports
- [ ] Automated state transitions (booking integration)

### Integration Points
- Bookings system (automatic state management)
- Housekeeping assignments
- Maintenance tracking
- Revenue reporting
- Occupancy analytics

---

## Support & Contact

For technical support or feature requests, contact the development team.

**API Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: ✅ Production Ready
