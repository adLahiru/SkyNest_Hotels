# User Management - Quick Reference Guide

## 🚀 Quick Start

### Access User Management
1. Login as ADMIN user
2. Go to Admin Dashboard
3. Click on **"Users"** tab

## ✨ Features

### 1️⃣ Add New User
**Button**: Blue "Add User" button (top right)

**Required Fields**:
- Full Name
- Email (must be valid format)
- NIC Number (must be unique)
- Username (must be unique)
- Password (minimum 8 characters)
- Role (select from dropdown)
- Branch (required for staff, not for guests)

**Optional Fields**:
- Phone Number
- Hire Date (for staff)
- Salary (for staff)

**Steps**:
1. Click "Add User"
2. Fill in all required fields
3. Select role (ADMIN, MANAGER, RECEPTIONIST, HOUSEKEEPING, or GUEST)
4. Select branch (if not GUEST)
5. Click "Create User"

### 2️⃣ Search Users
**Location**: Search box in filter section

**Search By**:
- Name
- Email
- Username
- NIC Number

**How to Use**:
- Type in the search box
- Results update automatically
- Clear search to see all users

### 3️⃣ Filter by Role
**Location**: Role dropdown in filter section

**Available Roles**:
- All Roles (default - shows everyone)
- ADMIN
- MANAGER
- RECEPTIONIST
- HOUSEKEEPING
- GUEST

**How to Use**:
- Select a role from dropdown
- Only users with that role will appear
- Select "All Roles" to reset

### 4️⃣ Combine Filters
You can use search AND role filter together!

**Example**:
- Search: "john"
- Role: "MANAGER"
- Result: Only managers named John

**Clear All**: Click "Clear All" button to reset all filters

## 📋 User List Columns

| Column | Description |
|--------|-------------|
| Name | Full name of the user |
| Email | Email address |
| Username | Login username |
| Role | User role with color badge |
| Branch | Branch name (if staff) |
| Phone | Phone number |
| Created | Account creation date |
| Actions | Edit/Delete buttons |

## 🎨 Role Badge Colors

- 🟣 **ADMIN**: Purple
- 🔵 **MANAGER**: Blue
- 🟢 **RECEPTIONIST**: Green
- 🟡 **HOUSEKEEPING**: Yellow
- ⚪ **GUEST**: Gray

## ⚠️ Important Notes

### Who Can Create Users?
- **ADMIN**: Can create any role
- **MANAGER**: Can create RECEPTIONIST and HOUSEKEEPING in their branch only

### Branch Assignment
- **Required for**: ADMIN, MANAGER, RECEPTIONIST, HOUSEKEEPING
- **Not required for**: GUEST

### Password Requirements
- Minimum 8 characters
- Will be hashed for security
- User will use this to login

### Unique Fields
These must be unique across all users:
- Email
- Username
- NIC Number

## 🔍 Search Tips

1. **Partial Matching**: Search works with partial text
   - "john" will find "John Doe", "Johnny Smith", etc.

2. **Case Insensitive**: Search is not case-sensitive
   - "JOHN" and "john" give same results

3. **Multiple Fields**: One search looks through:
   - Name
   - Email
   - Username
   - NIC

## 🎯 Common Tasks

### Find all managers:
1. Set role filter to "MANAGER"
2. View results

### Find a specific user:
1. Type their name/email in search
2. View results

### Find managers named John:
1. Search: "john"
2. Role: "MANAGER"
3. View results

### Create a receptionist:
1. Click "Add User"
2. Fill in basic info
3. Role: "RECEPTIONIST"
4. Select their branch
5. Add hire date and salary (optional)
6. Click "Create User"

## 📱 Mobile Friendly
All features work on mobile devices with responsive design!

## 🆘 Need Help?

### User not found?
- Check if filters are active
- Click "Clear All" to reset
- Verify user exists in system

### Can't create user?
- Check all required fields are filled
- Verify email/username/NIC are unique
- Password must be 8+ characters
- Branch required for staff roles

### Permission denied?
- Check your user role
- Managers can only create in their branch
- Contact admin if you need more access

## 📊 Quick Stats
At the top of the dashboard, see:
- Total Users count
- Guests vs Staff breakdown
- Other system statistics

## 🔒 Security
- All passwords are encrypted
- Role-based access control
- Branch isolation for managers
- Secure API communication

---

**Need more details?** See `USER_MANAGEMENT_IMPLEMENTATION.md` for complete documentation.
