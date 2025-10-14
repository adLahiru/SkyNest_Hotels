# User Update & Delete Implementation Guide

## Overview
This document describes the user update and delete functionality implementation in the Admin Dashboard.

## Implementation Date
October 15, 2025

---

## Features Implemented

### 1. Update User (Edit) ✏️

#### Backend Implementation

**Endpoint**: `PUT /api/users/:userId`

**Controller Method**: `updateUser` in `userController.ts`

**Features**:
- ✅ Update user personal information (name, email, phone, username)
- ✅ Update user role
- ✅ Update branch assignment
- ✅ Update hire date and salary (for staff)
- ✅ Role-based authorization (Admin can edit any user, Manager can edit users in their branch)
- ✅ Validation for unique fields (email, username)
- ✅ Prevents NIC modification (security)
- ✅ Transactional updates
- ✅ Auto-update branch manager if role changes to MANAGER

**Authorization**:
- **ADMIN**: Can update any user
- **MANAGER**: Can update users in their branch only
- **Others**: No access

**Validation**:
- Required fields: name, email, username
- Email format validation
- Unique email and username check
- Role change permission check
- Branch requirement for staff roles

#### Frontend Implementation

**Service Function**: `updateUser(userId, userData)` in `userService.js`

**UI Components**:
1. **Edit Button** - In user table actions column
2. **Edit User Modal** - Pre-filled form with existing data
3. **Form Validation** - Real-time validation
4. **Success/Error Messages** - User feedback
5. **Auto-refresh** - List updates after successful edit

**Modal Features**:
- Pre-populated with current user data
- All fields editable except NIC and password
- Password note: "Use password reset feature"
- Conditional fields based on role (branch, hire date, salary)
- Save button shows loading state
- Success message auto-closes modal

---

### 2. Delete User (Remove) 🗑️

#### Backend Implementation

**Endpoint**: `DELETE /api/users/:userId`

**Controller Method**: `deleteUser` in `userController.ts`

**Features**:
- ✅ Hard delete implementation (complete removal)
- ✅ Admin-only access
- ✅ Self-deletion prevention
- ✅ Manager removal from branches
- ✅ Cascade deletion (staff record removed first)
- ✅ Transactional deletion
- ✅ Returns deleted user details

**Authorization**:
- **ADMIN**: Can delete any user (except themselves)
- **Others**: No access

**Safety Features**:
- Cannot delete own account
- Checks user exists before deletion
- Removes manager assignment from branches
- Transaction rollback on error

**Deletion Process**:
1. Verify admin role
2. Check not self-deletion
3. Verify user exists
4. Start transaction
5. Remove manager assignment (if applicable)
6. Delete staff record
7. Delete user record
8. Commit transaction

#### Frontend Implementation

**Service Function**: `deleteUser(userId)` in `userService.js`

**UI Components**:
1. **Delete Button** - In user table actions column
2. **Confirmation Modal** - Safety confirmation dialog
3. **User Details Display** - Shows who will be deleted
4. **Loading State** - During deletion
5. **Success/Error Messages** - User feedback

**Confirmation Modal Features**:
- Red warning theme
- Shows user details (name, email, role)
- "Cannot be undone" warning
- Cancel and Delete buttons
- Loading spinner during deletion
- Error display if deletion fails

---

## API Documentation

### Update User

```http
PUT /api/users/:userId
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "phone": "+1234567890",
  "nic_no": "123456789V",
  "username": "johndoe",
  "role": "MANAGER",
  "branch_id": "branch-uuid",
  "hire_date": "2024-01-01",
  "salary": 60000
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user_id": "uuid",
    "name": "John Doe Updated",
    "email": "john.updated@example.com",
    "username": "johndoe",
    "role": "MANAGER",
    "branch_id": "branch-uuid",
    "branch_name": "Main Branch",
    "is_guest": false,
    "phone": "+1234567890",
    "nic_no": "123456789V",
    "hire_date": "2024-01-01",
    "salary": 60000,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:
- **400**: Missing required fields or invalid data
- **403**: Insufficient permissions
- **404**: User not found
- **409**: Email or username already taken
- **500**: Server error

---

### Delete User

```http
DELETE /api/users/:userId
Authorization: Bearer {token}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "deleted_user_id": "uuid",
    "deleted_user_name": "John Doe"
  }
}
```

**Error Responses**:
- **400**: Missing user ID or trying to delete own account
- **403**: Only administrators can delete users
- **404**: User not found
- **500**: Server error

---

## UI Components

### Edit User Modal

**Trigger**: Click edit icon (pencil) in user table

**Form Fields**:
1. **Name** - Text input (required)
2. **Email** - Email input (required, validated)
3. **Phone** - Tel input (optional)
4. **NIC** - Text input (disabled, cannot change)
5. **Username** - Text input (required)
6. **Password** - Disabled note about password reset
7. **Role** - Dropdown (required)
8. **Branch** - Dropdown (conditional, required for staff)
9. **Hire Date** - Date input (conditional, optional)
10. **Salary** - Number input (conditional, optional)

**Buttons**:
- **Cancel** - Close modal without saving
- **Update User** - Submit changes

**Validation**:
- Required fields marked with red asterisk
- Real-time error messages
- Email format check
- Role-based field display

**States**:
- Default: Form with current values
- Loading: Spinner on submit button
- Success: Green message, auto-close
- Error: Red message, stays open

---

### Delete Confirmation Modal

**Trigger**: Click delete icon (trash) in user table

**Layout**:
- Red trash icon at top
- "Delete User" title
- Warning message: "This action cannot be undone"
- User details card:
  - Name
  - Email
  - Role (with colored badge)
- Cancel and Delete buttons

**Buttons**:
- **Cancel** - Close modal, no action
- **Delete** - Confirm deletion (red button)

**States**:
- Default: Confirmation prompt
- Loading: Spinner on delete button
- Error: Red message above buttons

---

## User Flow

### Editing a User

```
1. User clicks Edit icon on user row
   ↓
2. Edit modal opens
   ↓
3. Form pre-filled with current data
   ↓
4. User modifies fields
   ↓
5. Real-time validation on changes
   ↓
6. User clicks "Update User"
   ↓
7. Frontend validates all fields
   ↓
8. API call: PUT /api/users/:userId
   ↓
9. Backend validates and updates
   ↓
10. Success message shown
   ↓
11. Modal closes after 1.5 seconds
   ↓
12. User list refreshes
   ↓
13. Dashboard stats update
```

### Deleting a User

```
1. User clicks Delete icon on user row
   ↓
2. Confirmation modal appears
   ↓
3. User sees who will be deleted
   ↓
4. User clicks "Delete" button
   ↓
5. API call: DELETE /api/users/:userId
   ↓
6. Backend verifies and deletes
   ↓
7. Modal closes
   ↓
8. User list refreshes
   ↓
9. Success message shown briefly
   ↓
10. Dashboard stats update
```

---

## Security Features

### Update Security
- ✅ JWT authentication required
- ✅ Role-based authorization
- ✅ NIC field cannot be modified
- ✅ Password cannot be changed via update (separate endpoint)
- ✅ Unique constraint validation
- ✅ Permission check on role changes
- ✅ Branch isolation for managers
- ✅ Input sanitization

### Delete Security
- ✅ Admin-only access
- ✅ Self-deletion prevented
- ✅ User existence verification
- ✅ Confirmation modal (prevents accidents)
- ✅ Transaction safety
- ✅ Cascade deletion handling

---

## Testing Guide

### Test Update User

#### Test 1: Admin Updates User
1. Login as ADMIN
2. Go to Users tab
3. Click edit icon on any user
4. Modify name and email
5. Click "Update User"
6. ✅ Verify update succeeds
7. ✅ Verify changes reflected in list

#### Test 2: Change User Role
1. Edit a user
2. Change role from RECEPTIONIST to MANAGER
3. Select branch
4. Update user
5. ✅ Verify role changed
6. ✅ Verify branch updated

#### Test 3: Manager Updates User
1. Logout, login as MANAGER
2. Edit user in same branch
3. ✅ Should succeed
4. Try to edit user in different branch
5. ✅ Should fail with permission error

#### Test 4: Validation Errors
1. Edit user
2. Clear name field
3. Try to update
4. ✅ Verify error message shown
5. Enter invalid email
6. ✅ Verify email validation error

#### Test 5: Duplicate Detection
1. Edit user
2. Change email to existing user's email
3. Try to update
4. ✅ Verify "email already taken" error

---

### Test Delete User

#### Test 1: Admin Deletes User
1. Login as ADMIN
2. Go to Users tab
3. Click delete icon
4. Verify confirmation modal shows
5. Check user details are correct
6. Click "Delete"
7. ✅ Verify user deleted
8. ✅ Verify user removed from list

#### Test 2: Self-Deletion Prevention
1. Find your own user in list
2. Click delete icon
3. Confirm deletion
4. ✅ Verify error: "Cannot delete your own account"

#### Test 3: Non-Admin Cannot Delete
1. Logout, login as MANAGER
2. Try to delete a user
3. ✅ Verify button disabled OR
4. ✅ Verify 403 error

#### Test 4: Cancel Deletion
1. Click delete icon
2. Modal opens
3. Click "Cancel"
4. ✅ Verify modal closes
5. ✅ Verify user still exists

#### Test 5: Manager Deletion
1. Delete a MANAGER user
2. ✅ Verify manager removed from branch
3. ✅ Verify branch.manager_id set to NULL
4. ✅ Verify user deleted

---

## Edge Cases & Error Handling

### Update Edge Cases

**Case 1: User Not Found**
- Scenario: User deleted by another admin
- Behavior: Shows 404 error
- Message: "User not found"

**Case 2: Role Permission Denied**
- Scenario: Manager tries to create ADMIN
- Behavior: Shows 403 error
- Message: "Insufficient permissions to assign this role"

**Case 3: Branch Assignment Error**
- Scenario: Branch doesn't exist
- Behavior: Shows error
- Message: Branch validation fails

**Case 4: Network Error**
- Scenario: Backend down during update
- Behavior: Shows error message
- Message: "Failed to update user. Please try again."
- Action: User can retry

### Delete Edge Cases

**Case 1: User Already Deleted**
- Scenario: User deleted by another admin
- Behavior: Shows 404 error
- Message: "User not found"

**Case 2: Foreign Key Constraint**
- Scenario: User has related records
- Behavior: Cascade deletion handles it
- Action: Deletes staff record first, then user

**Case 3: Network Error**
- Scenario: Connection lost during delete
- Behavior: Transaction rollback
- Message: Error shown, user not deleted

---

## Database Operations

### Update Operation

```sql
-- Update user table
UPDATE users 
SET name = ?, email = ?, phone = ?, username = ?
WHERE user_id = ?;

-- Update staff table (if not guest)
UPDATE staff 
SET role = ?, branch_id = ?, hire_date = ?, salary = ?
WHERE staff_id = ?;

-- Update branch manager (if role changed to MANAGER)
UPDATE hotel_branches 
SET manager_id = ? 
WHERE branch_id = ?;
```

### Delete Operation

```sql
-- Remove manager assignment
UPDATE hotel_branches 
SET manager_id = NULL 
WHERE manager_id = ?;

-- Delete staff record
DELETE FROM staff 
WHERE staff_id = ?;

-- Delete user record
DELETE FROM users 
WHERE user_id = ?;
```

---

## Files Modified

### Backend (2 files):
```
✏️ /backend/src/controllers/userController.ts
   - Added updateUser() method
   - Added deleteUser() method
   
✏️ /backend/src/routes/userRoutes.ts
   - Added PUT /:userId route
   - Added DELETE /:userId route
```

### Frontend (2 files):
```
✏️ /frontend/src/services/userService.js
   - Added updateUser() function
   - Added deleteUser() function

✏️ /frontend/src/components/AdminDashboard.js
   - Added edit modal state
   - Added delete confirmation modal state
   - Added handleEditUserClick()
   - Added handleSubmitEditUser()
   - Added handleDeleteUserClick()
   - Added handleConfirmDelete()
   - Added Edit User Modal component
   - Added Delete Confirmation Modal component
   - Updated action buttons with handlers
```

---

## Best Practices

### Update Best Practices
1. ✅ Always validate input before submission
2. ✅ Show clear error messages
3. ✅ Pre-fill form with existing data
4. ✅ Disable non-editable fields (NIC)
5. ✅ Provide password reset note
6. ✅ Use transactions for multiple updates
7. ✅ Refresh data after successful update
8. ✅ Show loading states during operations

### Delete Best Practices
1. ✅ Always confirm before deletion
2. ✅ Show what will be deleted
3. ✅ Prevent self-deletion
4. ✅ Admin-only permission
5. ✅ Use transactions for safety
6. ✅ Handle cascade deletions
7. ✅ Show success feedback
8. ✅ Refresh data after deletion

---

## Troubleshooting

### Update Issues

**Problem**: Update fails with 409 error
- **Cause**: Email or username already taken
- **Solution**: Change to unique values

**Problem**: Cannot update role
- **Cause**: Insufficient permissions
- **Solution**: Check user role hierarchy

**Problem**: Branch field not showing
- **Cause**: Guest role selected
- **Solution**: Select staff role (ADMIN, MANAGER, etc.)

**Problem**: Update succeeds but changes not showing
- **Cause**: Cache not refreshed
- **Solution**: Check fetchUsers() is called after update

### Delete Issues

**Problem**: Delete button not working
- **Cause**: Not logged in as ADMIN
- **Solution**: Login as ADMIN user

**Problem**: "Cannot delete your own account" error
- **Cause**: Trying to delete yourself
- **Solution**: Use different admin account

**Problem**: Delete fails silently
- **Cause**: Network error or permissions
- **Solution**: Check console for errors

**Problem**: User deleted but still shows in list
- **Cause**: List not refreshed
- **Solution**: Check fetchUsers() is called after delete

---

## Future Enhancements

### Potential Improvements:
1. **Soft Delete** - Mark as deleted instead of removing
2. **Bulk Edit** - Update multiple users at once
3. **Edit History** - Track who changed what
4. **Password Reset** - Admin-initiated password reset
5. **Restore User** - Undo deletion
6. **Photo Upload** - Add profile photo during edit
7. **Advanced Validation** - More field validations
8. **Audit Trail** - Log all updates and deletions
9. **Email Notifications** - Notify user of changes
10. **Batch Delete** - Delete multiple users at once

---

## Summary

### ✅ What Works:
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Role-based access control
- ✅ Input validation (frontend + backend)
- ✅ Transaction safety
- ✅ User-friendly modals
- ✅ Loading states
- ✅ Error handling
- ✅ Success feedback
- ✅ Auto-refresh data
- ✅ Security features

### 📊 Statistics:
- **Backend**: 2 new controller methods (~350 lines)
- **Backend**: 2 new routes added
- **Frontend**: 2 new service functions (~80 lines)
- **Frontend**: 2 new modals (~200 lines)
- **Frontend**: 5 new handler functions (~150 lines)

### 🎯 Quality:
- ✅ No compilation errors
- ✅ No lint errors
- ✅ Type-safe (backend)
- ✅ Well-documented
- ✅ Production-ready

---

**Implementation completed successfully! 🎉**

*Date: October 15, 2025*
