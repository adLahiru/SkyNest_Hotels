# 🏨 SkyNest Hotels API Complete Guide

## 🔗 Base Information
- **Base URL**: `http://localhost:8080/api`
- **Server Port**: `8080` (configurable)
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token (JWT)

---

## 🔐 Authentication System

### 1. User Login
**Endpoint**: `POST /api/auth/login`
**Access**: Public
**Description**: Authenticate user and get access/refresh tokens

**Request Headers**:
```json
{
  "Content-Type": "application/json"
}
```

**Request Body**:
```json
{
  "username": "your-username",
  "password": "your-password"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Admin User",
      "email": "admin@skynest.com",
      "username": "admin",
      "role": "ADMIN",
      "branch_id": null,
      "is_guest": false
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
}
```

**Error Responses**:
- **401**: Invalid credentials
- **429**: Too many login attempts

---

### 2. Refresh Token
**Endpoint**: `POST /api/auth/refresh`
**Access**: Public (with valid refresh token)

**Request Body**:
```json
{
  "refreshToken": "your-refresh-token-here"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

### 3. Logout
**Endpoint**: `POST /api/auth/logout`
**Access**: Authenticated users

**Request Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

**Request Body**:
```json
{
  "refreshToken": "your-refresh-token-here"
}
```

---

### 4. Get User Profile
**Endpoint**: `GET /api/auth/profile`
**Access**: Authenticated users

**Request Headers**:
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:8080/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 👥 User Management System

### 1. Guest Registration (Public)
**Endpoint**: `POST /api/users/register`
**Access**: Public (no authentication required)
**Description**: Allow guests to self-register

**Request Headers**:
```json
{
  "Content-Type": "application/json"
}
```

**Request Body**:
```json
{
  "name": "John Guest",
  "email": "john.guest@email.com",
  "phone": "+94771234567",
  "nic_no": "199512345678",
  "username": "johnguest",
  "password": "SecurePassword123!"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Guest",
    "email": "john.guest@email.com",
    "phone": "+94771234567",
    "nic_no": "199512345678",
    "username": "johnguest",
    "password": "SecurePassword123!"
  }'
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Guest registration successful",
  "data": {
    "user_id": "456e7890-e89b-12d3-a456-426614174001",
    "name": "John Guest",
    "email": "john.guest@email.com",
    "username": "johnguest",
    "role": "GUEST",
    "is_guest": true,
    "created_at": "2024-01-20T10:30:00.000Z"
  }
}
```

---

### 2. Create Staff User (Admin/Manager)
**Endpoint**: `POST /api/users`
**Access**: ADMIN (all roles), MANAGER (RECEPTIONIST/HOUSEKEEPING in own branch)

**Request Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

#### Create Admin (ADMIN only):
**Request Body**:
```json
{
  "name": "Super Admin",
  "email": "super.admin@skynest.com",
  "phone": "+94771234567",
  "nic_no": "199512345678",
  "username": "superadmin",
  "password": "SuperSecure123!",
  "role": "ADMIN",
  "hire_date": "2024-01-15",
  "salary": 100000.00
}
```

#### Create Manager (ADMIN only):
**Request Body**:
```json
{
  "name": "Branch Manager",
  "email": "manager@skynest.com",
  "phone": "+94771234567",
  "nic_no": "199512345679",
  "username": "branchmanager",
  "password": "SecureManager123!",
  "role": "MANAGER",
  "branch_id": "your-branch-uuid-here",
  "hire_date": "2024-01-15",
  "salary": 75000.00
}
```

#### Create Receptionist (ADMIN/MANAGER):
**Request Body**:
```json
{
  "name": "Front Desk",
  "email": "frontdesk@skynest.com",
  "phone": "+94771234567",
  "nic_no": "199512345680",
  "username": "frontdesk",
  "password": "FrontDesk123!",
  "role": "RECEPTIONIST",
  "branch_id": "your-branch-uuid-here",
  "hire_date": "2024-01-15",
  "salary": 45000.00
}
```

#### Create Housekeeping (ADMIN/MANAGER):
**Request Body**:
```json
{
  "name": "House Keeper",
  "email": "housekeeper@skynest.com",
  "phone": "+94771234567",
  "nic_no": "199512345681",
  "username": "housekeeper",
  "password": "HouseKeep123!",
  "role": "HOUSEKEEPING",
  "branch_id": "your-branch-uuid-here",
  "hire_date": "2024-01-15",
  "salary": 35000.00
}
```

**cURL Examples**:
```bash
# Create Manager (ADMIN only)
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Branch Manager",
    "email": "manager@skynest.com",
    "phone": "+94771234567",
    "nic_no": "199512345679",
    "username": "branchmanager",
    "password": "SecureManager123!",
    "role": "MANAGER",
    "branch_id": "123e4567-e89b-12d3-a456-426614174000",
    "hire_date": "2024-01-15",
    "salary": 75000.00
  }'

# Create Receptionist (ADMIN or MANAGER)
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Front Desk",
    "email": "frontdesk@skynest.com",
    "phone": "+94771234567",
    "nic_no": "199512345680",
    "username": "frontdesk",
    "password": "FrontDesk123!",
    "role": "RECEPTIONIST",
    "branch_id": "123e4567-e89b-12d3-a456-426614174000",
    "salary": 45000.00
  }'
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user_id": "456e7890-e89b-12d3-a456-426614174001",
    "name": "Branch Manager",
    "email": "manager@skynest.com",
    "username": "branchmanager",
    "role": "MANAGER",
    "branch_id": "123e4567-e89b-12d3-a456-426614174000",
    "is_guest": false,
    "hire_date": "2024-01-15",
    "salary": 75000.00,
    "created_at": "2024-01-20T10:30:00.000Z"
  }
}
```

**Error Responses**:
- **400**: Missing required fields
- **403**: Insufficient permissions
- **409**: Username/email/NIC already exists, or branch already has manager

---

### 3. Get All Users
**Endpoint**: `GET /api/users`
**Access**: ADMIN (all users), MANAGER (own branch + guests)

**Request Headers**:
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Admin User",
      "email": "admin@skynest.com",
      "username": "admin",
      "role": "ADMIN",
      "branch_id": null,
      "branch_name": null,
      "is_guest": false,
      "phone": "+94112345678",
      "nic_no": "199012345678",
      "hire_date": "2024-01-01",
      "salary": 100000.00,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "user_id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "Branch Manager",
      "email": "manager@skynest.com",
      "username": "branchmanager",
      "role": "MANAGER",
      "branch_id": "123e4567-e89b-12d3-a456-426614174000",
      "branch_name": "Downtown Branch",
      "is_guest": false,
      "salary": 75000.00,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 4. Get User by ID
**Endpoint**: `GET /api/users/:userId`
**Access**: ADMIN (any user), MANAGER (own branch users), Users (own profile)

**Request Headers**:
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:8080/api/users/456e7890-e89b-12d3-a456-426614174001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user_id": "456e7890-e89b-12d3-a456-426614174001",
    "name": "Branch Manager",
    "email": "manager@skynest.com",
    "username": "branchmanager",
    "role": "MANAGER",
    "branch_id": "123e4567-e89b-12d3-a456-426614174000",
    "branch_name": "Downtown Branch",
    "is_guest": false,
    "phone": "+94771234567",
    "nic_no": "199512345679",
    "hire_date": "2024-01-15",
    "salary": 75000.00,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 🏢 Branch Management System

### 1. Create Branch
**Endpoint**: `POST /api/branches`
**Access**: ADMIN only

**Request Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_ADMIN_TOKEN"
}
```

**Request Body**:
```json
{
  "branch_name": "Downtown Branch",
  "address": "123 Main St, Colombo 01",
  "email": "downtown@skynest.com",
  "phone": "+94112345678",
  "manager_id": "456e7890-e89b-12d3-a456-426614174001"
}
```

**Required Fields**: `branch_name`, `address`
**Optional Fields**: `email`, `phone`, `manager_id`

**cURL Example**:
```bash
curl -X POST http://localhost:8080/api/branches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "branch_name": "Downtown Branch",
    "address": "123 Main St, Colombo 01",
    "email": "downtown@skynest.com",
    "phone": "+94112345678"
  }'
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Branch created successfully",
  "data": {
    "branch_id": "789e0123-e89b-12d3-a456-426614174002",
    "branch_name": "Downtown Branch",
    "address": "123 Main St, Colombo 01",
    "email": "downtown@skynest.com",
    "phone": "+94112345678",
    "manager_id": null,
    "manager_name": null,
    "manager_username": null,
    "created_at": "2024-01-20T10:30:00.000Z",
    "updated_at": "2024-01-20T10:30:00.000Z"
  }
}
```

---

### 2. Get All Branches
**Endpoint**: `GET /api/branches`
**Access**: MANAGER and above

**Request Headers**:
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:8080/api/branches \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Branches retrieved successfully",
  "data": [
    {
      "branch_id": "789e0123-e89b-12d3-a456-426614174002",
      "branch_name": "Downtown Branch",
      "address": "123 Main St, Colombo 01",
      "email": "downtown@skynest.com",
      "phone": "+94112345678",
      "manager_id": "456e7890-e89b-12d3-a456-426614174001",
      "manager_name": "Branch Manager",
      "manager_username": "branchmanager",
      "created_at": "2024-01-20T10:30:00.000Z",
      "updated_at": "2024-01-20T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Branch by ID
**Endpoint**: `GET /api/branches/:branchId`
**Access**: MANAGER and above

**cURL Example**:
```bash
curl -X GET http://localhost:8080/api/branches/789e0123-e89b-12d3-a456-426614174002 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Update Branch
**Endpoint**: `PUT /api/branches/:branchId`
**Access**: ADMIN only

**Request Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_ADMIN_TOKEN"
}
```

**Request Body** (all fields optional):
```json
{
  "branch_name": "Updated Branch Name",
  "address": "456 New Address, Colombo 02",
  "email": "updated@skynest.com",
  "phone": "+94112345679",
  "manager_id": "new-manager-user-id"
}
```

**cURL Example**:
```bash
curl -X PUT http://localhost:8080/api/branches/789e0123-e89b-12d3-a456-426614174002 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "branch_name": "Updated Downtown Branch",
    "email": "new.downtown@skynest.com"
  }'
```

---

### 5. Delete Branch
**Endpoint**: `DELETE /api/branches/:branchId`
**Access**: ADMIN only

**Request Headers**:
```json
{
  "Authorization": "Bearer YOUR_ADMIN_TOKEN"
}
```

**cURL Example**:
```bash
curl -X DELETE http://localhost:8080/api/branches/789e0123-e89b-12d3-a456-426614174002 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Branch deleted successfully"
}
```

**Error Responses**:
- **400**: Cannot delete branch with active staff

---

## 🔒 Role Hierarchy & Permissions

### Role Levels:
1. **ADMIN** (Level 4) - Full system access
2. **MANAGER** (Level 3) - Branch management
3. **RECEPTIONIST** (Level 2) - Front desk operations
4. **HOUSEKEEPING** (Level 1) - Cleaning operations
5. **GUEST** (Level 0) - Limited access

### Permission Matrix:

| Action | ADMIN | MANAGER | RECEPTIONIST | HOUSEKEEPING | GUEST |
|--------|--------|---------|--------------|---------------|-------|
| Create ADMIN | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create MANAGER | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create RECEPTIONIST | ✅ | ✅* | ❌ | ❌ | ❌ |
| Create HOUSEKEEPING | ✅ | ✅* | ❌ | ❌ | ❌ |
| Create GUEST | ✅ | ✅ | ❌ | ❌ | ✅** |
| Manage Branches | ✅ | ❌ | ❌ | ❌ | ❌ |
| View All Users | ✅ | ✅*** | ❌ | ❌ | ❌ |
| View Own Profile | ✅ | ✅ | ✅ | ✅ | ✅ |

\* Only in their own branch
\** Self-registration only
\*** Own branch + guests only

---

## 📊 Health & Status

### Health Check
**Endpoint**: `GET /api/health`
**Access**: Public

**cURL Example**:
```bash
curl -X GET http://localhost:8080/api/health
```

**Response**:
```json
{
  "success": true,
  "message": "SkyNest Hotels API is running",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "version": "1.0.0",
  "services": {
    "auth": "Available at /api/auth",
    "users": "Available at /api/users",
    "branches": "Available at /api/branches"
  }
}
```

---

## ❌ Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: name, email, username"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions to create user with this role"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Username already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🔧 Development Tools

### Create Admin User (Development Script)
```bash
cd /path/to/backend
pnpm create-admin
```

### Database Migrations
```bash
# Run migrations
pnpm migrate:up

# Rollback migrations  
pnpm migrate:down
```

### Start Development Server
```bash
pnpm dev
```

---

## 🌐 Postman Collection

Import this collection for easy testing:

### Environment Variables:
- `baseUrl`: `http://localhost:8080/api`
- `adminToken`: `YOUR_ADMIN_ACCESS_TOKEN`
- `userToken`: `YOUR_USER_ACCESS_TOKEN`

### Test Sequence:
1. **Login as Admin** → Get admin token
2. **Create Branch** → Get branch_id
3. **Create Manager** → Assign to branch
4. **Login as Manager** → Get manager token
5. **Create Staff** → In manager's branch
6. **Test Permissions** → Try unauthorized actions

---

## 🚀 Quick Start Guide

### 1. Setup & Start Server
```bash
cd backend
pnpm install
pnpm dev
```

### 2. Create Admin User
```bash
pnpm create-admin
```

### 3. Test API
```bash
# Login as admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Use the access token for other requests
```

### 4. Create Your First Branch
```bash
curl -X POST http://localhost:8080/api/branches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "branch_name": "Main Branch",
    "address": "123 Hotel Street"
  }'
```

### 5. Create Manager for Branch
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Manager Name",
    "email": "manager@hotel.com",
    "username": "manager",
    "password": "manager123",
    "role": "MANAGER",
    "branch_id": "YOUR_BRANCH_ID"
  }'
```

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- UUIDs are version 4 format
- Passwords are hashed with bcrypt (12 rounds)
- Access tokens expire in 1 hour
- Refresh tokens expire in 7 days
- Database transactions ensure data consistency
- All sensitive operations are logged for audit

**🎉 Your SkyNest Hotels API is ready to use!**