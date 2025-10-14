# User Management Workflow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     SKYNEST HOTELS SYSTEM                        │
│                    User Management Module                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│   ADMIN USER    │────────▶│  ADMIN DASHBOARD │────────▶│  USER MANAGEMENT│
│                 │         │                  │         │       TAB       │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                                                   │
                                                                   │
                    ┌──────────────────────────────────────────────┴──────┐
                    │                                                     │
                    ▼                                                     ▼
         ┌──────────────────┐                              ┌─────────────────────┐
         │   ADD USER       │                              │  SEARCH & FILTER    │
         │   FUNCTIONALITY  │                              │   FUNCTIONALITY     │
         └──────────────────┘                              └─────────────────────┘
                    │                                                     │
                    │                                                     │
                    ▼                                                     ▼
         ┌──────────────────┐                              ┌─────────────────────┐
         │  User Form Modal │                              │  Filter Controls    │
         │  - Name          │                              │  - Search Box       │
         │  - Email         │                              │  - Role Dropdown    │
         │  - Username      │                              │  - Clear Filters    │
         │  - Password      │                              └─────────────────────┘
         │  - Role          │                                         │
         │  - Branch        │                                         │
         │  - etc...        │                                         ▼
         └──────────────────┘                              ┌─────────────────────┐
                    │                                      │   Users Table       │
                    │                                      │   - Filtered List   │
                    ▼                                      │   - Role Badges     │
         ┌──────────────────┐                              │   - Actions         │
         │  Form Validation │                              └─────────────────────┘
         │  - Required      │
         │  - Email format  │
         │  - Password 8+   │
         │  - Unique fields │
         └──────────────────┘
                    │
                    │
                    ▼
         ┌──────────────────────────────────────────────────────┐
         │              FRONTEND SERVICE LAYER                  │
         │            (userService.js)                          │
         │  - createUser()                                      │
         │  - getAllUsers(filters)                              │
         │  - searchUsers()                                     │
         │  - filterUsersByRole()                               │
         └──────────────────────────────────────────────────────┘
                    │                              │
                    │                              │
                    ▼                              ▼
         ┌─────────────────┐          ┌─────────────────────┐
         │  POST /api/users│          │  GET /api/users     │
         │                 │          │  ?search=...        │
         │  Create User    │          │  ?role=...          │
         │  Request        │          │  ?branch_id=...     │
         └─────────────────┘          └─────────────────────┘
                    │                              │
                    │                              │
                    ▼                              ▼
         ┌──────────────────────────────────────────────────────┐
         │              BACKEND API ROUTES                      │
         │            (userRoutes.ts)                           │
         │  - Authentication Middleware                         │
         │  - Authorization Middleware                          │
         │  - Route Handlers                                    │
         └──────────────────────────────────────────────────────┘
                    │                              │
                    │                              │
                    ▼                              ▼
         ┌──────────────────────────────────────────────────────┐
         │            USER CONTROLLER                           │
         │         (userController.ts)                          │
         │                                                      │
         │  createUser()           getUsers()                   │
         │  - Validate input       - Apply role filter         │
         │  - Check permissions    - Apply search filter       │
         │  - Hash password        - Apply branch filter       │
         │  - Create user          - Return filtered list      │
         │  - Create staff record  - Include metadata          │
         │  - Return user data                                  │
         └──────────────────────────────────────────────────────┘
                    │                              │
                    │                              │
                    ▼                              ▼
         ┌──────────────────────────────────────────────────────┐
         │                   DATABASE                           │
         │                   (MySQL)                            │
         │                                                      │
         │  ┌────────────────┐       ┌────────────────┐        │
         │  │  users table   │       │  staff table   │        │
         │  │  - user_id     │       │  - staff_id    │        │
         │  │  - name        │◄─────▶│  - role        │        │
         │  │  - email       │       │  - branch_id   │        │
         │  │  - username    │       │  - hire_date   │        │
         │  │  - password    │       │  - salary      │        │
         │  │  - nic_no      │       └────────────────┘        │
         │  │  - is_guest    │                                 │
         │  └────────────────┘       ┌────────────────┐        │
         │                           │hotel_branches  │        │
         │                           │  - branch_id   │        │
         │                           │  - branch_name │        │
         │                           │  - manager_id  │        │
         │                           └────────────────┘        │
         └──────────────────────────────────────────────────────┘
```

## Feature Flow Diagrams

### 1. Add User Flow

```
USER CLICKS "ADD USER" BUTTON
         ↓
MODAL OPENS WITH EMPTY FORM
         ↓
USER FILLS IN FORM FIELDS
    - Name, Email, Username
    - Password, NIC, Role
    - Branch (if staff)
    - Optional: Phone, Hire Date, Salary
         ↓
USER CLICKS "CREATE USER"
         ↓
FRONTEND VALIDATION
    ├─ Valid → Continue
    └─ Invalid → Show errors, Stop
         ↓
API CALL: POST /api/users
         ↓
BACKEND VALIDATION
    ├─ Check authentication
    ├─ Check permissions (Admin/Manager)
    ├─ Validate required fields
    ├─ Check unique constraints
    └─ Validate role & branch
         ↓
    Valid? ──No──→ Return error
         │
        Yes
         ↓
HASH PASSWORD (bcrypt)
         ↓
BEGIN TRANSACTION
         ↓
INSERT INTO users TABLE
         ↓
INSERT INTO staff TABLE (if not guest)
         ↓
UPDATE branch.manager_id (if manager role)
         ↓
COMMIT TRANSACTION
         ↓
RETURN SUCCESS + USER DATA
         ↓
FRONTEND RECEIVES RESPONSE
         ↓
SHOW SUCCESS MESSAGE
         ↓
CLOSE MODAL AFTER 1.5s
         ↓
REFRESH USER LIST
         ↓
UPDATE DASHBOARD STATS
         ↓
DONE ✓
```

### 2. Search User Flow

```
USER TYPES IN SEARCH BOX
         ↓
SEARCH QUERY UPDATES (React State)
         ↓
useEffect TRIGGERS
         ↓
API CALL: GET /api/users?search=query
         ↓
BACKEND PROCESSES REQUEST
    ├─ Check authentication
    ├─ Check permissions
    └─ Apply role-based access
         ↓
BUILD SQL QUERY
    WHERE (
        name LIKE '%query%' OR
        email LIKE '%query%' OR
        username LIKE '%query%' OR
        nic_no LIKE '%query%'
    )
         ↓
EXECUTE QUERY
         ↓
RETURN FILTERED USERS + METADATA
         ↓
FRONTEND RECEIVES DATA
         ↓
UPDATE users STATE
         ↓
RENDER FILTERED TABLE
         ↓
SHOW ACTIVE FILTER BADGE
         ↓
DISPLAY USER COUNT
         ↓
DONE ✓
```

### 3. Filter by Role Flow

```
USER SELECTS ROLE FROM DROPDOWN
         ↓
ROLE FILTER UPDATES (React State)
         ↓
useEffect TRIGGERS
         ↓
API CALL: GET /api/users?role=MANAGER
         ↓
BACKEND PROCESSES REQUEST
    ├─ Check authentication
    ├─ Check permissions
    └─ Apply role-based access
         ↓
BUILD SQL QUERY
    WHERE (
        role = 'MANAGER'
        OR is_guest = 1 (if role is GUEST)
    )
         ↓
EXECUTE QUERY
         ↓
RETURN FILTERED USERS + METADATA
         ↓
FRONTEND RECEIVES DATA
         ↓
UPDATE users STATE
         ↓
RENDER FILTERED TABLE
         ↓
SHOW ACTIVE FILTER BADGE
         ↓
DISPLAY USER COUNT
         ↓
DONE ✓
```

### 4. Combined Search + Filter Flow

```
USER HAS BOTH SEARCH AND ROLE FILTER ACTIVE
         ↓
API CALL: GET /api/users?search=john&role=MANAGER
         ↓
BACKEND PROCESSES REQUEST
         ↓
BUILD SQL QUERY
    WHERE (
        (name LIKE '%john%' OR email LIKE '%john%' OR ...)
        AND
        role = 'MANAGER'
    )
         ↓
EXECUTE QUERY
         ↓
RETURN USERS MATCHING BOTH CRITERIA
         ↓
FRONTEND RENDERS RESULTS
         ↓
SHOWS BOTH FILTER BADGES
         ↓
USER CAN CLICK "CLEAR ALL" TO RESET
         ↓
DONE ✓
```

## State Management

```
AdminDashboard Component State:
┌────────────────────────────────────────┐
│ stats          → Dashboard statistics  │
│ loading        → Initial load state    │
│ activeTab      → Current tab           │
│ users          → User list array       │
│ branches       → Branch list array     │
│ loadingUsers   → Users loading state   │
│ searchQuery    → Search input value    │
│ roleFilter     → Selected role         │
│ showAddUserModal → Modal visibility    │
│ showPassword   → Password visibility   │
│ userFormData   → Form field values     │
│ formErrors     → Validation errors     │
│ submitMessage  → Success/error message │
└────────────────────────────────────────┘
```

## Component Hierarchy

```
AdminDashboard
├── Header Section
├── Stats Cards (4)
│   ├── Total Users
│   ├── Branches
│   ├── Revenue
│   └── Bookings
├── Tab Navigation
│   ├── Overview Tab
│   ├── Branches Tab
│   ├── Users Tab ← ENHANCED
│   └── Financial Tab
└── Tab Content
    └── Users Tab Content
        ├── Header with Add Button
        ├── Search & Filter Section
        │   ├── Search Input
        │   ├── Role Dropdown
        │   └── Active Filters Display
        ├── Users Table
        │   ├── Table Header
        │   └── Table Body (mapped users)
        │       └── User Row
        │           ├── User Data
        │           └── Action Buttons
        └── Add User Modal (conditional)
            ├── Modal Header
            ├── Success/Error Message
            └── User Form
                ├── Basic Info Fields
                ├── Credentials Fields
                ├── Role & Branch Fields
                ├── Staff Info Fields (conditional)
                └── Form Actions
```

## API Endpoint Details

```
Endpoint: GET /api/users
Method: GET
Auth: Required (JWT Bearer Token)

Query Parameters:
┌──────────────┬──────────────┬─────────────────────────┐
│ Parameter    │ Type         │ Example                 │
├──────────────┼──────────────┼─────────────────────────┤
│ search       │ string       │ ?search=john            │
│ role         │ enum         │ ?role=MANAGER           │
│ branch_id    │ uuid         │ ?branch_id=123-456-789  │
└──────────────┴──────────────┴─────────────────────────┘

Response Structure:
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [...users],
  "meta": {
    "total": 25,
    "filters": {
      "search": "john",
      "role": "MANAGER",
      "branch_id": null
    }
  }
}

─────────────────────────────────────────────────────────

Endpoint: POST /api/users
Method: POST
Auth: Required (JWT Bearer Token)

Request Body:
{
  "name": "string (required)",
  "email": "string (required, unique)",
  "phone": "string (optional)",
  "nic_no": "string (required, unique)",
  "username": "string (required, unique)",
  "password": "string (required, min 8)",
  "role": "enum (required)",
  "branch_id": "uuid (required for staff)",
  "hire_date": "date (optional)",
  "salary": "decimal (optional)"
}

Response Structure:
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user_id": "uuid",
    "name": "string",
    "email": "string",
    "username": "string",
    "role": "enum",
    "branch_id": "uuid",
    "is_guest": false,
    "created_at": "timestamp"
  }
}
```

## Security Flow

```
Request Received
      ↓
┌─────────────────────┐
│ CORS Middleware     │ → Validate origin
└─────────────────────┘
      ↓
┌─────────────────────┐
│ JWT Authentication  │ → Verify token
│                     │ → Extract user info
└─────────────────────┘
      ↓
┌─────────────────────┐
│ Authorization       │ → Check user role
│ Middleware          │ → Verify permissions
└─────────────────────┘
      ↓
┌─────────────────────┐
│ Input Validation    │ → Sanitize inputs
│                     │ → Check required fields
└─────────────────────┘
      ↓
┌─────────────────────┐
│ Business Logic      │ → Process request
│                     │ → Apply filters
└─────────────────────┘
      ↓
┌─────────────────────┐
│ Database Query      │ → Parameterized query
│                     │ → Prevent SQL injection
└─────────────────────┘
      ↓
Response Sent ✓
```

## Role-Based Access Control

```
┌──────────────┬────────────┬──────────────┬───────────────────┐
│ User Role    │ View Users │ Create Users │ Can Create Roles  │
├──────────────┼────────────┼──────────────┼───────────────────┤
│ ADMIN        │ All users  │ Yes          │ All roles         │
├──────────────┼────────────┼──────────────┼───────────────────┤
│ MANAGER      │ Branch +   │ Yes          │ Receptionist,     │
│              │ Guests     │              │ Housekeeping      │
├──────────────┼────────────┼──────────────┼───────────────────┤
│ RECEPTIONIST │ Self only  │ No           │ None              │
├──────────────┼────────────┼──────────────┼───────────────────┤
│ HOUSEKEEPING │ Self only  │ No           │ None              │
├──────────────┼────────────┼──────────────┼───────────────────┤
│ GUEST        │ Self only  │ No           │ None              │
└──────────────┴────────────┴──────────────┴───────────────────┘
```

---

**This diagram provides a visual representation of the complete user management workflow.**
