# User Management Implementation Guide

## Overview
This document describes the complete user management functionality implemented in the Admin Dashboard, including the ability to add users, search users, and filter users by role.

## Implementation Date
October 15, 2025

## Features Implemented

### 1. Backend Enhancements

#### Updated Files:
- `/backend/src/controllers/userController.ts`

#### Changes Made:

##### Enhanced `getUsers` Method
- **Search Functionality**: Added search by name, email, username, or NIC number
  - Query parameter: `?search=query`
  - Uses SQL LIKE operator for partial matching
  - Case-insensitive search across multiple fields

- **Role Filtering**: Added filtering by user role
  - Query parameter: `?role=ROLE_NAME`
  - Supports all roles: ADMIN, MANAGER, RECEPTIONIST, HOUSEKEEPING, GUEST
  - Properly handles GUEST role (users with `is_guest = 1`)

- **Branch Filtering**: Added branch-based filtering (admin only)
  - Query parameter: `?branch_id=BRANCH_ID`
  - Only available for admin users

- **Combined Filtering**: All filters can be used together
  - Example: `?search=john&role=MANAGER&branch_id=123`

- **Response Enhancement**: Added metadata to response
  ```json
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
  ```

### 2. Frontend Service Updates

#### Updated Files:
- `/frontend/src/services/userService.js`

#### New Functions Added:

1. **Enhanced `getAllUsers(filters)`**
   - Accepts optional filters object
   - Supports search, role, and branch_id parameters
   - Returns users list with metadata

2. **`createUser(userData)`**
   - Creates new user with role-based validation
   - Supports all user roles
   - Handles branch assignment for staff roles
   - Returns created user data

3. **`searchUsers(searchQuery)`**
   - Dedicated search function
   - Searches across name, email, username, NIC
   - Returns filtered user list

4. **`filterUsersByRole(role)`**
   - Dedicated role filter function
   - Filters users by specific role
   - Returns filtered user list

### 3. Admin Dashboard UI

#### Updated Files:
- `/frontend/src/components/AdminDashboard.js`

#### New Features:

##### User Management Tab
Complete user management interface with:

1. **User List Table**
   - Displays all users with key information
   - Columns: Name, Email, Username, Role, Branch, Phone, Created Date, Actions
   - Role badges with color coding
   - Hover effects for better UX

2. **Search Functionality**
   - Real-time search input
   - Searches by: Name, Email, Username, NIC
   - Debounced search to reduce API calls
   - Clear visual feedback

3. **Role Filter**
   - Dropdown selector for all roles
   - Options: All Roles, ADMIN, MANAGER, RECEPTIONIST, HOUSEKEEPING, GUEST
   - Instant filtering on selection

4. **Active Filters Display**
   - Shows currently active filters
   - Individual badges for each filter
   - "Clear All" button to reset filters

5. **Add User Modal**
   - Comprehensive form for user creation
   - Fields:
     - Full Name (required)
     - Email (required, validated)
     - Phone Number (optional)
     - NIC Number (required)
     - Username (required)
     - Password (required, min 8 characters, toggle visibility)
     - Role (required, dropdown)
     - Branch (required for staff, dropdown)
     - Hire Date (optional for staff)
     - Salary (optional for staff)
   
   - Form Validation:
     - Real-time field validation
     - Email format validation
     - Password strength check
     - Role-based conditional fields
     - Error messages for each field
   
   - Conditional Fields:
     - Branch, Hire Date, and Salary fields only appear for staff roles
     - Hidden for GUEST role
   
   - User Feedback:
     - Success/error messages
     - Loading states
     - Disabled submit during processing
     - Auto-close on success

6. **Visual Enhancements**
   - Role badge colors:
     - ADMIN: Purple
     - MANAGER: Blue
     - RECEPTIONIST: Green
     - HOUSEKEEPING: Yellow
     - GUEST: Gray
   - Loading states with spinners
   - Empty states with icons
   - Responsive design for mobile

## API Endpoints

### Get All Users (with filters)
```
GET /api/users
GET /api/users?search=query
GET /api/users?role=MANAGER
GET /api/users?branch_id=123
GET /api/users?search=john&role=MANAGER
```

**Authentication**: Required (Bearer Token)

**Permissions**: 
- ADMIN: Can view all users
- MANAGER: Can view users in their branch + guests

**Response**:
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "user_id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "role": "MANAGER",
      "branch_id": "branch-uuid",
      "branch_name": "Main Branch",
      "is_guest": false,
      "phone": "+1234567890",
      "nic_no": "123456789V",
      "hire_date": "2024-01-01",
      "salary": 50000,
      "retired_date": null,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "filters": {
      "search": "john",
      "role": "MANAGER",
      "branch_id": null
    }
  }
}
```

### Create User
```
POST /api/users
```

**Authentication**: Required (Bearer Token)

**Permissions**:
- ADMIN: Can create any role
- MANAGER: Can create RECEPTIONIST and HOUSEKEEPING in their branch

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "nic_no": "123456789V",
  "username": "johndoe",
  "password": "SecurePass123",
  "role": "MANAGER",
  "branch_id": "branch-uuid",
  "hire_date": "2024-01-01",
  "salary": 50000
}
```

**Response**:
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user_id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "role": "MANAGER",
    "branch_id": "branch-uuid",
    "is_guest": false,
    "hire_date": "2024-01-01",
    "salary": 50000,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## User Roles

### Available Roles:
1. **ADMIN**
   - Full system access
   - Can create any user role
   - Can view all users
   - Can manage all branches

2. **MANAGER**
   - Branch-level access
   - Can create RECEPTIONIST and HOUSEKEEPING
   - Can view users in their branch
   - Can manage their branch

3. **RECEPTIONIST**
   - Front desk operations
   - Booking management
   - Guest check-in/check-out

4. **HOUSEKEEPING**
   - Room maintenance
   - Cleaning operations

5. **GUEST**
   - Public user role
   - No branch assignment
   - Booking capabilities

## Validation Rules

### User Creation:
- **Name**: Required, string
- **Email**: Required, valid email format, unique
- **Username**: Required, string, unique
- **Password**: Required, minimum 8 characters
- **NIC**: Required, unique
- **Role**: Required, valid enum value
- **Branch**: Required for staff roles, must exist
- **Phone**: Optional, string
- **Hire Date**: Optional for staff
- **Salary**: Optional for staff, decimal

### Search:
- Minimum 1 character
- Case-insensitive
- Searches across: name, email, username, nic_no

### Role Filter:
- Must be valid UserRole enum value
- ADMIN, MANAGER, RECEPTIONIST, HOUSEKEEPING, GUEST

## Security Features

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Role-based access control
3. **Password**: Hashed using bcrypt (12 rounds)
4. **Validation**: Input validation on both frontend and backend
5. **SQL Injection**: Protected by parameterized queries
6. **Branch Isolation**: Managers can only access their branch

## Testing Guide

### Test Add User Functionality:
1. Login as ADMIN user
2. Navigate to Admin Dashboard
3. Click "Users" tab
4. Click "Add User" button
5. Fill in the form with valid data
6. Select a role and branch
7. Click "Create User"
8. Verify success message
9. Verify new user appears in the list

### Test Search Functionality:
1. Go to Users tab
2. Enter search query (name, email, username, or NIC)
3. Verify filtered results appear
4. Clear search to see all users

### Test Role Filter:
1. Go to Users tab
2. Select a role from the dropdown
3. Verify only users with that role appear
4. Select "All Roles" to see all users

### Test Combined Filters:
1. Enter a search query
2. Select a role filter
3. Verify results match both criteria
4. Click "Clear All" to reset

## Future Enhancements

### Potential Improvements:
1. **Edit User**: Update existing user information
2. **Delete User**: Soft delete or deactivate users
3. **Pagination**: Handle large user lists
4. **Export**: Export user list to CSV/Excel
5. **Bulk Operations**: Select and manage multiple users
6. **Advanced Filters**: Date range, status, etc.
7. **User Details View**: Detailed user profile page
8. **Password Reset**: Admin-initiated password reset
9. **User Activity Log**: Track user actions
10. **Profile Photos**: Upload and display user photos

## Troubleshooting

### Common Issues:

1. **Users not appearing**
   - Check authentication token
   - Verify user role permissions
   - Check browser console for errors

2. **Cannot create user**
   - Verify all required fields are filled
   - Check if email/username/NIC already exists
   - Ensure branch is selected for staff roles
   - Verify password meets minimum requirements

3. **Search not working**
   - Check network tab for API calls
   - Verify search query is not empty
   - Check backend logs for errors

4. **Role filter not working**
   - Verify role value is valid
   - Check if API returns filtered data
   - Clear browser cache if needed

## Files Modified

### Backend:
- `/backend/src/controllers/userController.ts` - Enhanced getUsers method

### Frontend:
- `/frontend/src/services/userService.js` - Added new API functions
- `/frontend/src/components/AdminDashboard.js` - Complete UI implementation

## Dependencies

### Backend:
- express
- mysql2
- bcryptjs
- uuid
- jsonwebtoken

### Frontend:
- react
- lucide-react (icons)
- axios

## Conclusion

This implementation provides a complete user management system with:
- ✅ Add new users with validation
- ✅ Search users by multiple criteria
- ✅ Filter users by role
- ✅ Role-based access control
- ✅ Responsive UI design
- ✅ Real-time feedback
- ✅ Comprehensive error handling

The system is production-ready and follows best practices for security, usability, and maintainability.
