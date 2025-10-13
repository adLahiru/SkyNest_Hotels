# Discount Management Implementation

## Overview
This document describes the **Discount Management** system for SkyNest Hotels. The discount system allows administrators to create and manage discounts that can be applied to three categories: **Services**, **Rooms**, or **Both** (Services and Rooms).

## Key Features
- ✅ **Admin-Only Access**: Only administrators can create, update, or delete discounts
- ✅ **Three Discount Categories**:
  - `SERVICES` - Discount applies only to hotel services
  - `ROOMS` - Discount applies only to room bookings
  - `SERVICES_AND_ROOMS` - Discount applies to both services and rooms
- ✅ **Two Discount Types**:
  - `rate` - Percentage discount (e.g., 10%, 25%)
  - `fixed` - Fixed amount discount (e.g., $50, $100)
- ✅ **Date-Based Validity**: Set start and end dates for seasonal/promotional discounts
- ✅ **Active Status Checking**: Automatically determine if discount is currently valid
- ✅ **Comprehensive Validation**: Input validation for all fields
- ✅ **Flexible Filtering**: Filter discounts by category, type, and active status

## Database Schema

### discount Table
```sql
CREATE TABLE `discount` (
  `discount_id` CHAR(36) PRIMARY KEY (UUID),
  `discount_name` VARCHAR(100) NOT NULL,
  `type` ENUM('rate','fixed') NOT NULL,
  `discount_value` DECIMAL(10,2) NOT NULL,
  `applies_to` VARCHAR(100) NOT NULL,
  `start_date` DATE NULL,
  `end_date` DATE NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Fields:**
- `discount_id`: Unique identifier (UUID)
- `discount_name`: Name of the discount (max 100 characters)
- `type`: `rate` (percentage) or `fixed` (amount)
- `discount_value`: Discount value (percentage or amount)
- `applies_to`: One of `SERVICES`, `ROOMS`, or `SERVICES_AND_ROOMS`
- `start_date`: Optional start date for the discount
- `end_date`: Optional end date for the discount
- `created_at`, `updated_at`: Timestamps

## API Endpoints

### Base URL
```
http://localhost:8084/api/discounts
```

### Authentication
All endpoints require JWT authentication via `Authorization` header:
```
Authorization: Bearer <access_token>
```

---

## 1. Create Discount (Admin Only)

**Endpoint:** `POST /api/discounts`

**Required Role:** ADMIN

**Request Body:**
```json
{
  "discount_name": "Summer Sale - 20% Off",
  "type": "rate",
  "discount_value": 20.00,
  "applies_to": "SERVICES_AND_ROOMS",
  "start_date": "2025-06-01",
  "end_date": "2025-08-31"
}
```

**Validation Rules:**
- `discount_name`: Required, 1-100 characters, must be unique
- `type`: Required, must be `rate` or `fixed`
- `discount_value`: Required, positive number
  - For `rate` type: must be between 0-100 (percentage)
  - For `fixed` type: any positive amount
  - Max 8 digits before decimal, 2 after
- `applies_to`: Required, must be one of: `SERVICES`, `ROOMS`, `SERVICES_AND_ROOMS`
- `start_date`: Optional, date format (YYYY-MM-DD)
- `end_date`: Optional, date format, must be after start_date

**Success Response (201):**
```json
{
  "success": true,
  "message": "Discount created successfully.",
  "data": {
    "discount": {
      "discount_id": "d1e2f3g4-h5i6-7890-jklm-nopqrstuvwxy",
      "discount_name": "Summer Sale - 20% Off",
      "type": "rate",
      "discount_value": 20.00,
      "applies_to": "SERVICES_AND_ROOMS",
      "start_date": "2025-06-01",
      "end_date": "2025-08-31",
      "is_active": false,
      "created_at": "2025-10-13T10:30:00.000Z",
      "updated_at": "2025-10-13T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- **403 Forbidden**: Non-admin users
- **400 Bad Request**: Missing required fields or invalid data
- **409 Conflict**: Discount name already exists

**cURL Examples:**

```bash
# Percentage discount for both services and rooms
curl -X POST http://localhost:8084/api/discounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "discount_name": "Summer Sale - 20% Off",
    "type": "rate",
    "discount_value": 20.00,
    "applies_to": "SERVICES_AND_ROOMS",
    "start_date": "2025-06-01",
    "end_date": "2025-08-31"
  }'

# Fixed amount discount for services only
curl -X POST http://localhost:8084/api/discounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "discount_name": "Spa Service - $50 Off",
    "type": "fixed",
    "discount_value": 50.00,
    "applies_to": "SERVICES"
  }'

# Percentage discount for rooms only
curl -X POST http://localhost:8084/api/discounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "discount_name": "Weekend Special - 15% Off Rooms",
    "type": "rate",
    "discount_value": 15.00,
    "applies_to": "ROOMS",
    "start_date": "2025-10-01",
    "end_date": "2025-12-31"
  }'
```

---

## 2. Get All Discounts

**Endpoint:** `GET /api/discounts`

**Required Role:** Any authenticated user

**Query Parameters:**
- `applies_to` (optional): Filter by category (`SERVICES`, `ROOMS`, `SERVICES_AND_ROOMS`)
- `type` (optional): Filter by type (`rate` or `fixed`)
- `active_only` (optional): Set to `true` to get only currently active discounts

**Success Response (200):**
```json
{
  "success": true,
  "message": "Discounts retrieved successfully.",
  "data": {
    "discounts": [
      {
        "discount_id": "d1e2f3g4-h5i6-7890-jklm-nopqrstuvwxy",
        "discount_name": "Summer Sale - 20% Off",
        "type": "rate",
        "discount_value": 20.00,
        "applies_to": "SERVICES_AND_ROOMS",
        "start_date": "2025-06-01",
        "end_date": "2025-08-31",
        "is_active": true,
        "created_at": "2025-10-13T10:30:00.000Z",
        "updated_at": "2025-10-13T10:30:00.000Z"
      },
      {
        "discount_id": "e2f3g4h5-i6j7-8901-klmn-opqrstuvwxyz",
        "discount_name": "Spa Service - $50 Off",
        "type": "fixed",
        "discount_value": 50.00,
        "applies_to": "SERVICES",
        "start_date": null,
        "end_date": null,
        "is_active": true,
        "created_at": "2025-10-13T11:00:00.000Z",
        "updated_at": "2025-10-13T11:00:00.000Z"
      }
    ],
    "count": 2
  }
}
```

**cURL Examples:**
```bash
# Get all discounts
curl -X GET http://localhost:8084/api/discounts \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get discounts for services only
curl -X GET "http://localhost:8084/api/discounts?applies_to=SERVICES" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get discounts for rooms only
curl -X GET "http://localhost:8084/api/discounts?applies_to=ROOMS" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get discounts for both services and rooms
curl -X GET "http://localhost:8084/api/discounts?applies_to=SERVICES_AND_ROOMS" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get only percentage discounts
curl -X GET "http://localhost:8084/api/discounts?type=rate" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get only currently active discounts
curl -X GET "http://localhost:8084/api/discounts?active_only=true" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get active service discounts
curl -X GET "http://localhost:8084/api/discounts?applies_to=SERVICES&active_only=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 3. Get Discount by ID

**Endpoint:** `GET /api/discounts/:discount_id`

**Required Role:** Any authenticated user

**Success Response (200):**
```json
{
  "success": true,
  "message": "Discount retrieved successfully.",
  "data": {
    "discount": {
      "discount_id": "d1e2f3g4-h5i6-7890-jklm-nopqrstuvwxy",
      "discount_name": "Summer Sale - 20% Off",
      "type": "rate",
      "discount_value": 20.00,
      "applies_to": "SERVICES_AND_ROOMS",
      "start_date": "2025-06-01",
      "end_date": "2025-08-31",
      "is_active": true,
      "created_at": "2025-10-13T10:30:00.000Z",
      "updated_at": "2025-10-13T10:30:00.000Z"
    }
  }
}
```

**Error Response:**
- **404 Not Found**: Discount doesn't exist

**cURL Example:**
```bash
curl -X GET http://localhost:8084/api/discounts/d1e2f3g4-h5i6-7890-jklm-nopqrstuvwxy \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 4. Get Active Discounts by Category

**Endpoint:** `GET /api/discounts/active/:category`

**Required Role:** Any authenticated user

**Path Parameters:**
- `category`: One of `SERVICES`, `ROOMS`, or `SERVICES_AND_ROOMS`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Active discounts for SERVICES retrieved successfully.",
  "data": {
    "discounts": [
      {
        "discount_id": "e2f3g4h5-i6j7-8901-klmn-opqrstuvwxyz",
        "discount_name": "Spa Service - $50 Off",
        "type": "fixed",
        "discount_value": 50.00,
        "applies_to": "SERVICES",
        "start_date": null,
        "end_date": null,
        "created_at": "2025-10-13T11:00:00.000Z",
        "updated_at": "2025-10-13T11:00:00.000Z"
      }
    ],
    "count": 1
  }
}
```

**cURL Examples:**
```bash
# Get active service discounts
curl -X GET http://localhost:8084/api/discounts/active/SERVICES \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get active room discounts
curl -X GET http://localhost:8084/api/discounts/active/ROOMS \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get active discounts for both
curl -X GET http://localhost:8084/api/discounts/active/SERVICES_AND_ROOMS \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 5. Update Discount (Admin Only)

**Endpoint:** `PUT /api/discounts/:discount_id`

**Required Role:** ADMIN

**Request Body:** (all fields optional)
```json
{
  "discount_name": "Summer Mega Sale - 25% Off",
  "discount_value": 25.00,
  "end_date": "2025-09-15"
}
```

**Validation Rules:**
- Same as create, but all fields are optional
- `end_date` must be after `start_date` if both are provided

**Success Response (200):**
```json
{
  "success": true,
  "message": "Discount updated successfully.",
  "data": {
    "discount": {
      "discount_id": "d1e2f3g4-h5i6-7890-jklm-nopqrstuvwxy",
      "discount_name": "Summer Mega Sale - 25% Off",
      "type": "rate",
      "discount_value": 25.00,
      "applies_to": "SERVICES_AND_ROOMS",
      "start_date": "2025-06-01",
      "end_date": "2025-09-15",
      "is_active": true,
      "created_at": "2025-10-13T10:30:00.000Z",
      "updated_at": "2025-10-13T14:20:00.000Z"
    }
  }
}
```

**Error Responses:**
- **403 Forbidden**: Non-admin users
- **404 Not Found**: Discount doesn't exist
- **400 Bad Request**: Invalid data
- **409 Conflict**: Discount name already exists

**cURL Example:**
```bash
curl -X PUT http://localhost:8084/api/discounts/d1e2f3g4-h5i6-7890-jklm-nopqrstuvwxy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "discount_value": 25.00,
    "end_date": "2025-09-15"
  }'
```

---

## 6. Delete Discount (Admin Only)

**Endpoint:** `DELETE /api/discounts/:discount_id`

**Required Role:** ADMIN

**Success Response (200):**
```json
{
  "success": true,
  "message": "Discount deleted successfully.",
  "data": {
    "deleted_discount_id": "d1e2f3g4-h5i6-7890-jklm-nopqrstuvwxy"
  }
}
```

**Error Responses:**
- **403 Forbidden**: Non-admin users
- **404 Not Found**: Discount doesn't exist

**cURL Example:**
```bash
curl -X DELETE http://localhost:8084/api/discounts/d1e2f3g4-h5i6-7890-jklm-nopqrstuvwxy \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Discount Categories Explained

### 1. SERVICES
Discount applies **only to hotel services** such as:
- Spa treatments
- Restaurant meals
- Bar drinks
- Laundry services
- Transportation services
- Fitness facilities
- Recreation activities

**Example:**
```json
{
  "discount_name": "Spa Weekday Special - 30% Off",
  "type": "rate",
  "discount_value": 30.00,
  "applies_to": "SERVICES"
}
```

### 2. ROOMS
Discount applies **only to room bookings**:
- Standard rooms
- Deluxe rooms
- Suites
- Any room type

**Example:**
```json
{
  "discount_name": "Long Stay - $100 Off Per Night",
  "type": "fixed",
  "discount_value": 100.00,
  "applies_to": "ROOMS"
}
```

### 3. SERVICES_AND_ROOMS
Discount applies to **both services and rooms**:
- Can be used for complete packages
- Holiday specials
- Seasonal promotions
- VIP member discounts

**Example:**
```json
{
  "discount_name": "Holiday Package - 25% Off Everything",
  "type": "rate",
  "discount_value": 25.00,
  "applies_to": "SERVICES_AND_ROOMS"
}
```

---

## Discount Types Explained

### 1. Rate (Percentage)
- Discount is a percentage of the total
- Value must be between 0-100
- Applied as: `final_price = original_price * (1 - discount_value / 100)`

**Examples:**
```json
// 10% off
{
  "type": "rate",
  "discount_value": 10.00
}

// 25% off
{
  "type": "rate",
  "discount_value": 25.00
}

// 50% off
{
  "type": "rate",
  "discount_value": 50.00
}
```

### 2. Fixed (Amount)
- Discount is a fixed dollar amount
- Value can be any positive number
- Applied as: `final_price = original_price - discount_value`

**Examples:**
```json
// $20 off
{
  "type": "fixed",
  "discount_value": 20.00
}

// $100 off
{
  "type": "fixed",
  "discount_value": 100.00
}

// $500 off
{
  "type": "fixed",
  "discount_value": 500.00
}
```

---

## Active Status Logic

A discount is considered **active** if:
1. Current date is >= `start_date` (if start_date is set)
2. Current date is <= `end_date` (if end_date is set)
3. If no dates are set, the discount is always active

**Examples:**

```javascript
// Always active (no dates)
{
  "start_date": null,
  "end_date": null,
  "is_active": true
}

// Not yet active (starts in future)
{
  "start_date": "2025-12-01",
  "end_date": "2025-12-31",
  "is_active": false  // Current date: Oct 13, 2025
}

// Currently active
{
  "start_date": "2025-10-01",
  "end_date": "2025-10-31",
  "is_active": true  // Current date: Oct 13, 2025
}

// Expired
{
  "start_date": "2025-08-01",
  "end_date": "2025-08-31",
  "is_active": false  // Current date: Oct 13, 2025
}
```

---

## Role-Based Access Control

### ADMIN (Full Access)
- ✅ Create discounts
- ✅ View all discounts
- ✅ Update any discount
- ✅ Delete discounts
- ✅ Change discount dates and values

### MANAGER, RECEPTIONIST, HOUSEKEEPING, GUEST (Read-Only)
- ✅ View all discounts
- ✅ Filter discounts by category/type/status
- ✅ View discount details
- ✅ Check active discounts
- ❌ Cannot create, update, or delete discounts

---

## Example Workflow

### 1. Admin Creates Seasonal Discounts
```bash
# Summer promotion (both services and rooms)
curl -X POST http://localhost:8084/api/discounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "discount_name": "Summer Vacation - 20% Off",
    "type": "rate",
    "discount_value": 20.00,
    "applies_to": "SERVICES_AND_ROOMS",
    "start_date": "2025-06-01",
    "end_date": "2025-08-31"
  }'

# Holiday room special
curl -X POST http://localhost:8084/api/discounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "discount_name": "Holiday Season - $150 Off Rooms",
    "type": "fixed",
    "discount_value": 150.00,
    "applies_to": "ROOMS",
    "start_date": "2025-12-01",
    "end_date": "2026-01-07"
  }'

# Spa weekday discount
curl -X POST http://localhost:8084/api/discounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "discount_name": "Spa Weekday - 30% Off",
    "type": "rate",
    "discount_value": 30.00,
    "applies_to": "SERVICES"
  }'
```

### 2. Receptionist Checks Active Discounts for Booking
```bash
# Check active room discounts
curl -X GET http://localhost:8084/api/discounts/active/ROOMS \
  -H "Authorization: Bearer RECEPTIONIST_TOKEN"

# Check active service discounts
curl -X GET http://localhost:8084/api/discounts/active/SERVICES \
  -H "Authorization: Bearer RECEPTIONIST_TOKEN"
```

### 3. Admin Updates Discount Value
```bash
# Increase discount value
curl -X PUT http://localhost:8084/api/discounts/DISCOUNT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "discount_value": 35.00
  }'
```

### 4. Admin Extends Discount Period
```bash
# Extend end date
curl -X PUT http://localhost:8084/api/discounts/DISCOUNT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "end_date": "2025-09-30"
  }'
```

---

## Sample Discount Scenarios

### Early Bird Booking Discount
```json
{
  "discount_name": "Early Bird - Book 30 Days Ahead",
  "type": "rate",
  "discount_value": 15.00,
  "applies_to": "ROOMS"
}
```

### VIP Member Discount
```json
{
  "discount_name": "VIP Member - 20% Off Everything",
  "type": "rate",
  "discount_value": 20.00,
  "applies_to": "SERVICES_AND_ROOMS"
}
```

### Weekend Spa Special
```json
{
  "discount_name": "Weekend Spa - $25 Off",
  "type": "fixed",
  "discount_value": 25.00,
  "applies_to": "SERVICES",
  "start_date": "2025-10-18",
  "end_date": "2025-10-19"
}
```

### Long Stay Discount
```json
{
  "discount_name": "7+ Nights - $50 Off Per Night",
  "type": "fixed",
  "discount_value": 50.00,
  "applies_to": "ROOMS"
}
```

### Black Friday Sale
```json
{
  "discount_name": "Black Friday - 40% Off All Services",
  "type": "rate",
  "discount_value": 40.00,
  "applies_to": "SERVICES",
  "start_date": "2025-11-29",
  "end_date": "2025-11-29"
}
```

---

## Error Handling

### Common Error Codes
- **400 Bad Request**: Invalid input data or missing required fields
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Insufficient permissions (non-admin trying to modify)
- **404 Not Found**: Discount doesn't exist
- **409 Conflict**: Duplicate discount name
- **500 Internal Server Error**: Server-side error

### Example Error Response
```json
{
  "success": false,
  "message": "Access denied. Only administrators can create discounts."
}
```

---

## Security Features

1. **JWT Authentication**: All endpoints require valid JWT token
2. **Role-Based Authorization**: Admin-only access for write operations
3. **Input Validation**: Comprehensive validation for all fields
4. **SQL Injection Prevention**: Parameterized queries
5. **Transaction Safety**: Database transactions for data integrity
6. **Unique Constraints**: Prevents duplicate discount names
7. **Date Validation**: Ensures end_date is after start_date

---

## Integration Notes

### For Booking System
When creating a booking:
1. Check active room discounts: `GET /api/discounts/active/ROOMS` or `GET /api/discounts/active/SERVICES_AND_ROOMS`
2. Apply highest applicable discount
3. Calculate final price with discount

### For Service Usage
When recording service usage:
1. Check active service discounts: `GET /api/discounts/active/SERVICES` or `GET /api/discounts/active/SERVICES_AND_ROOMS`
2. Apply applicable discount
3. Store original and discounted prices

---

## Git Commit Messages

```bash
# After implementing this feature:
git add src/controllers/discountController.ts
git add src/routes/discountRoutes.ts
git add src/routes/index.ts
git add src/index.ts
git add DISCOUNT_MANAGEMENT_IMPLEMENTATION.md

git commit -m "feat: implement discount management system

- Add discountController with full CRUD operations
- Create discountRoutes with admin-only write access
- Implement three discount categories: SERVICES, ROOMS, SERVICES_AND_ROOMS
- Support two discount types: rate (percentage) and fixed (amount)
- Add date-based validity checking (start_date/end_date)
- Implement active status calculation based on current date
- Add comprehensive validation for discount data
- Support filtering by category, type, and active status
- Include active discounts by category endpoint
- Admin-only access for create/update/delete operations
- Read access for all authenticated users
- Add documentation with API examples and use cases"
```

---

## Testing Checklist

### Admin Operations
- [ ] Create discount with all fields
- [ ] Create discount with only required fields
- [ ] Create discount with duplicate name (should fail)
- [ ] Create percentage discount with value > 100 (should fail)
- [ ] Create discount with end_date before start_date (should fail)
- [ ] Update discount details
- [ ] Delete discount

### Read Operations (All Roles)
- [ ] Get all discounts
- [ ] Get discounts filtered by category (SERVICES)
- [ ] Get discounts filtered by category (ROOMS)
- [ ] Get discounts filtered by category (SERVICES_AND_ROOMS)
- [ ] Get discounts filtered by type (rate)
- [ ] Get discounts filtered by type (fixed)
- [ ] Get only active discounts
- [ ] Get discount by ID
- [ ] Get active discounts for specific category

### Active Status Logic
- [ ] Discount with no dates is always active
- [ ] Discount with future start_date is not active
- [ ] Discount with past end_date is not active
- [ ] Discount within date range is active

### Authorization Tests
- [ ] Non-admin cannot create discount
- [ ] Non-admin cannot update discount
- [ ] Non-admin cannot delete discount
- [ ] Unauthenticated user cannot access any endpoint

---

## Future Enhancements

1. **Usage Limits**: Maximum number of times a discount can be used
2. **User-Specific Discounts**: Link discounts to specific users/members
3. **Minimum Purchase Requirements**: Require minimum spend for discount
4. **Stackable Discounts**: Allow combining multiple discounts
5. **Discount Codes**: Generate unique codes for discounts (coupon codes)
6. **Auto-Application**: Automatically apply best discount at checkout
7. **Discount Analytics**: Track usage statistics and revenue impact
8. **Room Type Specific**: Apply discounts to specific room types only
9. **Service Specific**: Apply discounts to specific services only
10. **Multi-Currency Support**: Handle discounts in different currencies

---

## Summary

The Discount Management system provides a powerful and flexible way to manage promotional offers for SkyNest Hotels. With support for three categories (Services, Rooms, Both) and two types (percentage, fixed amount), administrators can create targeted promotions while maintaining proper access control and data integrity.

**Key Benefits:**
- ✅ Flexible discount categories and types
- ✅ Date-based promotional campaigns
- ✅ Automatic active status determination
- ✅ Protected admin-only management
- ✅ Easy integration with booking and service systems
- ✅ Comprehensive filtering and querying
- ✅ Ready for business rules implementation
