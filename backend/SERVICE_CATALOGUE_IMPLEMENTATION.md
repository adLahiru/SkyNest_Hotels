# Service Catalogue Management Implementation

## Overview
This document describes the **Service Catalogue Management** system for SkyNest Hotels. The service catalogue allows administrators to manage additional services offered by the hotel, such as Spa, Bar, Restaurant, Laundry, Room Service, etc.

## Key Features
- ✅ **Admin-Only Access**: Only administrators can create, update, or delete services
- ✅ **Service Categories**: Organize services by categories (Spa, Bar, Restaurant, etc.)
- ✅ **Flexible Pricing**: Set unit prices for each service
- ✅ **Active/Inactive Status**: Enable or disable services without deleting them
- ✅ **Usage Protection**: Prevents deletion of services with existing usage records
- ✅ **Comprehensive Validation**: Input validation for all fields
- ✅ **Category Filtering**: Filter services by category and active status

## Database Schema

### service_catalogue Table
```sql
CREATE TABLE `service_catalogue` (
  `service_id` CHAR(36) PRIMARY KEY (UUID),
  `service_name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Fields:**
- `service_id`: Unique identifier (UUID)
- `service_name`: Name of the service (max 100 characters)
- `category`: Service category (max 50 characters) - e.g., Spa, Bar, Restaurant, Laundry
- `unit_price`: Price per unit (max 99999999.99)
- `is_active`: Whether the service is currently available (1 = active, 0 = inactive)
- `created_at`: Timestamp when service was created
- `updated_at`: Timestamp when service was last updated

## API Endpoints

### Base URL
```
http://localhost:8084/api/services
```

### Authentication
All endpoints require JWT authentication via `Authorization` header:
```
Authorization: Bearer <access_token>
```

---

## 1. Create Service (Admin Only)

**Endpoint:** `POST /api/services`

**Required Role:** ADMIN

**Request Body:**
```json
{
  "service_name": "Spa - Massage Therapy",
  "category": "Spa",
  "unit_price": 75.99,
  "is_active": true
}
```

**Validation Rules:**
- `service_name`: Required, 1-100 characters, must be unique
- `category`: Required, 1-50 characters
- `unit_price`: Required, positive number, max 8 digits before decimal, 2 after
- `is_active`: Optional, boolean (default: true)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Service added to catalogue successfully.",
  "data": {
    "service": {
      "service_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "service_name": "Spa - Massage Therapy",
      "category": "Spa",
      "unit_price": 75.99,
      "is_active": true,
      "created_at": "2025-10-13T10:30:00.000Z",
      "updated_at": "2025-10-13T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- **403 Forbidden**: Non-admin users
- **400 Bad Request**: Missing required fields or invalid data
- **409 Conflict**: Service name already exists

**cURL Example:**
```bash
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Spa - Massage Therapy",
    "category": "Spa",
    "unit_price": 75.99,
    "is_active": true
  }'
```

---

## 2. Get All Services

**Endpoint:** `GET /api/services`

**Required Role:** Any authenticated user

**Query Parameters:**
- `category` (optional): Filter by category (case-insensitive)
- `is_active` (optional): Filter by active status ("true" or "false")

**Success Response (200):**
```json
{
  "success": true,
  "message": "Services retrieved successfully.",
  "data": {
    "services": [
      {
        "service_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "service_name": "Spa - Massage Therapy",
        "category": "Spa",
        "unit_price": 75.99,
        "is_active": true,
        "created_at": "2025-10-13T10:30:00.000Z",
        "updated_at": "2025-10-13T10:30:00.000Z"
      },
      {
        "service_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "service_name": "Bar - Cocktail Service",
        "category": "Bar",
        "unit_price": 15.50,
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
# Get all services
curl -X GET http://localhost:8084/api/services \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get services in Spa category
curl -X GET "http://localhost:8084/api/services?category=Spa" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get only active services
curl -X GET "http://localhost:8084/api/services?is_active=true" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get active Spa services
curl -X GET "http://localhost:8084/api/services?category=Spa&is_active=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 3. Get Service by ID

**Endpoint:** `GET /api/services/:service_id`

**Required Role:** Any authenticated user

**Success Response (200):**
```json
{
  "success": true,
  "message": "Service retrieved successfully.",
  "data": {
    "service": {
      "service_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "service_name": "Spa - Massage Therapy",
      "category": "Spa",
      "unit_price": 75.99,
      "is_active": true,
      "created_at": "2025-10-13T10:30:00.000Z",
      "updated_at": "2025-10-13T10:30:00.000Z"
    }
  }
}
```

**Error Response:**
- **404 Not Found**: Service doesn't exist

**cURL Example:**
```bash
curl -X GET http://localhost:8084/api/services/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 4. Update Service (Admin Only)

**Endpoint:** `PUT /api/services/:service_id`

**Required Role:** ADMIN

**Request Body:** (all fields optional)
```json
{
  "service_name": "Spa - Premium Massage",
  "category": "Spa",
  "unit_price": 89.99,
  "is_active": true
}
```

**Validation Rules:**
- `service_name`: 1-100 characters, must be unique
- `category`: 1-50 characters
- `unit_price`: Positive number, max 8 digits before decimal, 2 after
- `is_active`: Boolean

**Success Response (200):**
```json
{
  "success": true,
  "message": "Service updated successfully.",
  "data": {
    "service": {
      "service_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "service_name": "Spa - Premium Massage",
      "category": "Spa",
      "unit_price": 89.99,
      "is_active": true,
      "created_at": "2025-10-13T10:30:00.000Z",
      "updated_at": "2025-10-13T12:45:00.000Z"
    }
  }
}
```

**Error Responses:**
- **403 Forbidden**: Non-admin users
- **404 Not Found**: Service doesn't exist
- **400 Bad Request**: Invalid data
- **409 Conflict**: Service name already exists

**cURL Example:**
```bash
curl -X PUT http://localhost:8084/api/services/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "unit_price": 89.99,
    "is_active": false
  }'
```

---

## 5. Delete Service (Admin Only)

**Endpoint:** `DELETE /api/services/:service_id`

**Required Role:** ADMIN

**Success Response (200):**
```json
{
  "success": true,
  "message": "Service deleted successfully.",
  "data": {
    "deleted_service_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

**Error Responses:**
- **403 Forbidden**: Non-admin users
- **404 Not Found**: Service doesn't exist
- **409 Conflict**: Service has usage records (cannot delete)

**Important Note:** Services with existing usage records in the `service_usage` table cannot be deleted. Consider deactivating them instead using the update endpoint with `"is_active": false`.

**cURL Example:**
```bash
curl -X DELETE http://localhost:8084/api/services/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 6. Get Service Categories

**Endpoint:** `GET /api/services/categories/list`

**Required Role:** Any authenticated user

**Success Response (200):**
```json
{
  "success": true,
  "message": "Service categories retrieved successfully.",
  "data": {
    "categories": [
      "Bar",
      "Laundry",
      "Restaurant",
      "Room Service",
      "Spa"
    ],
    "count": 5
  }
}
```

**Description:** Returns a list of distinct categories currently in use in the service catalogue.

**cURL Example:**
```bash
curl -X GET http://localhost:8084/api/services/categories/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Common Service Categories

Here are some common service categories for hotel management:

### Wellness & Relaxation
- **Spa**: Massages, facials, body treatments
- **Fitness Center**: Gym access, personal training
- **Pool**: Pool access, swimming lessons

### Food & Beverage
- **Restaurant**: Breakfast, lunch, dinner services
- **Bar**: Cocktails, beverages, snacks
- **Room Service**: In-room dining
- **Minibar**: In-room beverages and snacks

### Guest Services
- **Laundry**: Dry cleaning, ironing, washing
- **Concierge**: Tour booking, recommendations
- **Transportation**: Airport shuttle, car rental
- **Valet Parking**: Vehicle parking service

### Business Services
- **Meeting Rooms**: Conference room rental
- **Business Center**: Printing, faxing, computers
- **Event Services**: Catering, audio-visual equipment

### Recreation
- **Entertainment**: Movies, gaming, activities
- **Tours**: City tours, excursions
- **Sports**: Tennis, golf, water sports

---

## Role-Based Access Control

### ADMIN (Full Access)
- ✅ Create services
- ✅ View all services
- ✅ Update any service
- ✅ Delete services (if no usage records)
- ✅ Activate/deactivate services

### MANAGER, RECEPTIONIST, HOUSEKEEPING, GUEST (Read-Only)
- ✅ View all services
- ✅ Filter services by category/status
- ✅ View service details
- ❌ Cannot create, update, or delete services

---

## Example Workflow

### 1. Admin Creates Services
```bash
# Create Spa service
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"service_name": "Spa - Swedish Massage", "category": "Spa", "unit_price": 85.00}'

# Create Bar service
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"service_name": "Bar - Signature Cocktail", "category": "Bar", "unit_price": 12.50}'

# Create Laundry service
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"service_name": "Laundry - Express Service", "category": "Laundry", "unit_price": 25.00}'
```

### 2. Receptionist Views Available Services
```bash
# View all active services
curl -X GET "http://localhost:8084/api/services?is_active=true" \
  -H "Authorization: Bearer RECEPTIONIST_TOKEN"
```

### 3. Admin Updates Service Price
```bash
# Update Spa service price
curl -X PUT http://localhost:8084/api/services/SERVICE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"unit_price": 95.00}'
```

### 4. Admin Deactivates Service
```bash
# Temporarily disable a service
curl -X PUT http://localhost:8084/api/services/SERVICE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"is_active": false}'
```

---

## Error Handling

### Common Error Codes
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Insufficient permissions (non-admin trying to modify)
- **404 Not Found**: Service doesn't exist
- **409 Conflict**: Duplicate service name or service in use (cannot delete)
- **500 Internal Server Error**: Server-side error

### Example Error Response
```json
{
  "success": false,
  "message": "Access denied. Only administrators can add services to the catalogue."
}
```

---

## Security Features

1. **JWT Authentication**: All endpoints require valid JWT token
2. **Role-Based Authorization**: Admin-only access for write operations
3. **Input Validation**: Comprehensive validation for all fields
4. **SQL Injection Prevention**: Parameterized queries
5. **Transaction Safety**: Database transactions for data integrity
6. **Unique Constraints**: Prevents duplicate service names
7. **Referential Integrity**: Prevents deletion of services in use

---

## Database Relationships

The `service_catalogue` table connects to:
- **service_usage**: Tracks when guests use services (foreign key: service_id)

---

## Git Commit Messages

```bash
# After implementing this feature:
git add src/controllers/serviceCatalogueController.ts
git add src/routes/serviceCatalogueRoutes.ts
git add src/routes/index.ts
git add src/index.ts
git add SERVICE_CATALOGUE_IMPLEMENTATION.md

git commit -m "feat: implement service catalogue management system

- Add serviceCatalogueController with full CRUD operations
- Create serviceCatalogueRoutes with admin-only write access
- Implement service category filtering and listing
- Add comprehensive validation for service data
- Prevent deletion of services with usage records
- Support active/inactive service status
- Include service categories endpoint
- Add documentation with API examples
- Common categories: Spa, Bar, Restaurant, Laundry, etc.
- Admin-only access for create/update/delete operations
- Read access for all authenticated users"
```

---

## Testing Checklist

### Admin Operations
- [ ] Create service with valid data
- [ ] Create service with duplicate name (should fail)
- [ ] Create service with invalid price (should fail)
- [ ] Update service details
- [ ] Update service to inactive status
- [ ] Delete service without usage records
- [ ] Try to delete service with usage records (should fail)

### Read Operations (All Roles)
- [ ] Get all services
- [ ] Get services filtered by category
- [ ] Get services filtered by active status
- [ ] Get service by ID
- [ ] Get service categories list

### Authorization Tests
- [ ] Non-admin cannot create service
- [ ] Non-admin cannot update service
- [ ] Non-admin cannot delete service
- [ ] Unauthenticated user cannot access any endpoint

---

## Future Enhancements

1. **Service Images**: Add image URLs for services
2. **Service Descriptions**: Detailed descriptions for each service
3. **Service Duration**: Track how long each service takes
4. **Service Availability**: Schedule-based availability
5. **Service Packages**: Bundle multiple services together
6. **Discount Support**: Link services with discount policies
7. **Tax Integration**: Automatic tax calculation for services
8. **Multi-language Support**: Service names in multiple languages
9. **Service Ratings**: Guest reviews and ratings for services
10. **Inventory Tracking**: Track consumables for services (spa products, etc.)

---

## Summary

The Service Catalogue Management system provides a robust foundation for managing hotel services with proper security, validation, and role-based access control. Administrators have full control over the service catalog, while other staff members and guests can view available services for booking and usage tracking.

**Key Benefits:**
- ✅ Centralized service management
- ✅ Flexible pricing and categories
- ✅ Protected data integrity
- ✅ Easy service activation/deactivation
- ✅ Comprehensive access control
- ✅ Ready for service usage tracking integration
