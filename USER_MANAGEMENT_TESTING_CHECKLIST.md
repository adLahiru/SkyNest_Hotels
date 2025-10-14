# User Management Testing Checklist

## 🧪 Complete Testing Guide for User Management Features

---

## Pre-Testing Setup

### Requirements:
- [ ] Backend server running on port 8084
- [ ] Frontend server running on port 3000
- [ ] Database properly migrated
- [ ] At least one ADMIN user exists
- [ ] At least one branch exists in system
- [ ] Browser dev tools open (Console & Network tabs)

### Test Users Needed:
- [ ] ADMIN user (for full access testing)
- [ ] MANAGER user (for limited access testing)
- [ ] RECEPTIONIST user (for view-only testing)

---

## 1. Basic Access & Navigation

### 1.1 Login & Dashboard Access
- [ ] Login as ADMIN user
- [ ] Dashboard loads successfully
- [ ] Navigate to Users tab
- [ ] Users tab content displays
- [ ] "Add User" button is visible
- [ ] Search box is visible
- [ ] Role filter dropdown is visible

### 1.2 Initial User List Display
- [ ] User table displays existing users
- [ ] All columns show correct data:
  - [ ] Name
  - [ ] Email
  - [ ] Username
  - [ ] Role (with colored badge)
  - [ ] Branch
  - [ ] Phone
  - [ ] Created date
  - [ ] Action buttons
- [ ] User count is displayed correctly
- [ ] No console errors

---

## 2. Add User Functionality

### 2.1 Open Add User Modal
- [ ] Click "Add User" button
- [ ] Modal opens smoothly
- [ ] Modal title shows "Add New User"
- [ ] Close button (X) is visible
- [ ] All form fields are empty
- [ ] No error messages displayed

### 2.2 Form Field Validation

#### Required Fields Test:
- [ ] Try to submit empty form
- [ ] Error messages appear for required fields:
  - [ ] Name error shown
  - [ ] Email error shown
  - [ ] NIC error shown
  - [ ] Username error shown
  - [ ] Password error shown
  - [ ] Role error shown
- [ ] Form does not submit
- [ ] No API call made (check Network tab)

#### Email Validation:
- [ ] Enter invalid email: "notanemail"
- [ ] Email error shown
- [ ] Enter valid email: "test@example.com"
- [ ] Error clears

#### Password Validation:
- [ ] Enter password less than 8 chars: "pass123"
- [ ] Password error shown
- [ ] Enter password with 8+ chars: "password123"
- [ ] Error clears
- [ ] Click password visibility toggle
- [ ] Password becomes visible
- [ ] Click toggle again
- [ ] Password hidden again

### 2.3 Conditional Fields

#### Test with GUEST role:
- [ ] Select role: "GUEST"
- [ ] Branch field should NOT appear
- [ ] Hire Date field should NOT appear
- [ ] Salary field should NOT appear

#### Test with ADMIN role:
- [ ] Select role: "ADMIN"
- [ ] Branch field SHOULD appear
- [ ] Hire Date field SHOULD appear
- [ ] Salary field SHOULD appear

#### Test with MANAGER role:
- [ ] Select role: "MANAGER"
- [ ] Branch field SHOULD appear and required
- [ ] Hire Date field SHOULD appear
- [ ] Salary field SHOULD appear
- [ ] Try to submit without branch
- [ ] Branch error shown

### 2.4 Successful User Creation

#### Create GUEST user:
- [ ] Fill in all required fields:
  ```
  Name: Test Guest User
  Email: testguest@example.com
  Phone: +1234567890 (optional)
  NIC: TESTNIC001
  Username: testguest
  Password: password123
  Role: GUEST
  ```
- [ ] Click "Create User"
- [ ] Loading spinner appears
- [ ] Success message appears (green)
- [ ] Modal closes after 1.5 seconds
- [ ] User list refreshes
- [ ] New user appears in the list
- [ ] Dashboard stats update
- [ ] Check Network tab: POST /api/users = 201

#### Create MANAGER user:
- [ ] Click "Add User" again
- [ ] Fill in all fields:
  ```
  Name: Test Manager
  Email: testmanager@example.com
  Phone: +1234567891
  NIC: TESTNIC002
  Username: testmanager
  Password: password123
  Role: MANAGER
  Branch: (select any branch)
  Hire Date: 2024-01-01
  Salary: 50000
  ```
- [ ] Click "Create User"
- [ ] Success message appears
- [ ] User created successfully
- [ ] New manager appears in list

#### Create RECEPTIONIST user:
- [ ] Follow same process as manager
- [ ] Use different email/username/NIC
- [ ] Select RECEPTIONIST role
- [ ] Select branch
- [ ] Verify creation success

### 2.5 Error Handling

#### Duplicate Email:
- [ ] Try to create user with existing email
- [ ] Error message shown: "User with this email already exists"
- [ ] Form stays open
- [ ] User can correct and retry

#### Duplicate Username:
- [ ] Try to create user with existing username
- [ ] Appropriate error message shown
- [ ] Form stays open

#### Duplicate NIC:
- [ ] Try to create user with existing NIC
- [ ] Appropriate error message shown
- [ ] Form stays open

#### Network Error:
- [ ] Stop backend server
- [ ] Try to create user
- [ ] Error message shown
- [ ] Start backend server
- [ ] Retry - should work

### 2.6 Modal Interactions
- [ ] Click outside modal (backdrop)
- [ ] Modal stays open (doesn't close)
- [ ] Click X button
- [ ] Modal closes
- [ ] Click "Cancel" button
- [ ] Modal closes
- [ ] Form data is cleared when reopened

---

## 3. Search Functionality

### 3.1 Basic Search
- [ ] Type in search box: "test"
- [ ] Results update automatically
- [ ] Only matching users shown
- [ ] Active filter badge appears: "Search: test"
- [ ] User count updates
- [ ] Check Network tab: GET /api/users?search=test

### 3.2 Search by Different Fields

#### Search by Name:
- [ ] Search for user's first name
- [ ] User found
- [ ] Search for user's last name
- [ ] User found

#### Search by Email:
- [ ] Search for part of email
- [ ] User found
- [ ] Search for full email
- [ ] User found

#### Search by Username:
- [ ] Search for username
- [ ] User found

#### Search by NIC:
- [ ] Search for NIC number
- [ ] User found

### 3.3 Search Edge Cases
- [ ] Search with one character: "a"
- [ ] Results shown (if any matches)
- [ ] Search with special characters: "@"
- [ ] Results shown (finds emails)
- [ ] Search with spaces: "test user"
- [ ] Handles correctly
- [ ] Search non-existent: "xyzabc123"
- [ ] Empty state shown
- [ ] Message: "No users found"

### 3.4 Clear Search
- [ ] Enter search query
- [ ] Results filtered
- [ ] Clear search input
- [ ] All users shown again
- [ ] Filter badge removed

---

## 4. Role Filter Functionality

### 4.1 Filter by Each Role

#### Filter ADMIN:
- [ ] Select "ADMIN" from dropdown
- [ ] Only ADMIN users shown
- [ ] Active filter badge: "Role: ADMIN"
- [ ] User count updates
- [ ] Check Network tab: GET /api/users?role=ADMIN

#### Filter MANAGER:
- [ ] Select "MANAGER"
- [ ] Only MANAGER users shown
- [ ] Badge shows "Role: MANAGER"

#### Filter RECEPTIONIST:
- [ ] Select "RECEPTIONIST"
- [ ] Only RECEPTIONIST users shown

#### Filter HOUSEKEEPING:
- [ ] Select "HOUSEKEEPING"
- [ ] Only HOUSEKEEPING users shown

#### Filter GUEST:
- [ ] Select "GUEST"
- [ ] Only GUEST users shown
- [ ] Check: is_guest = true users

### 4.2 Reset Filter
- [ ] Select "All Roles" from dropdown
- [ ] All users shown again
- [ ] Filter badge removed
- [ ] User count shows total

---

## 5. Combined Filters

### 5.1 Search + Role Filter
- [ ] Enter search: "test"
- [ ] Select role: "MANAGER"
- [ ] Both filters active
- [ ] Two badges shown:
  - [ ] "Search: test"
  - [ ] "Role: MANAGER"
- [ ] Results match BOTH criteria
- [ ] User count accurate
- [ ] Check Network: GET /api/users?search=test&role=MANAGER

### 5.2 Clear All Filters
- [ ] Multiple filters active
- [ ] Click "Clear All" button
- [ ] Search input cleared
- [ ] Role filter reset to "All Roles"
- [ ] All filter badges removed
- [ ] All users shown
- [ ] User count shows total

---

## 6. Role-Based Access Control

### 6.1 Admin Access
- [ ] Logged in as ADMIN
- [ ] Can view all users
- [ ] Can see users from all branches
- [ ] Can create any role
- [ ] Can filter by any role
- [ ] "Add User" button visible

### 6.2 Manager Access
- [ ] Logout ADMIN
- [ ] Login as MANAGER
- [ ] Navigate to Users tab
- [ ] Can view users in own branch only
- [ ] Can view GUEST users
- [ ] Cannot see users from other branches
- [ ] "Add User" button visible
- [ ] Try to create ADMIN
- [ ] Should fail (permission denied)
- [ ] Try to create RECEPTIONIST
- [ ] Should succeed (if in own branch)

### 6.3 Receptionist/Staff Access
- [ ] Logout
- [ ] Login as RECEPTIONIST
- [ ] Try to access Users tab
- [ ] Should show permission error OR
- [ ] Should only see own profile

---

## 7. UI/UX Testing

### 7.1 Responsive Design

#### Desktop (1920x1080):
- [ ] Layout looks good
- [ ] All elements visible
- [ ] Table fits screen
- [ ] Modal centered

#### Tablet (768x1024):
- [ ] Layout adapts
- [ ] Table scrolls horizontally if needed
- [ ] Modal fits screen
- [ ] Form fields stack appropriately

#### Mobile (375x667):
- [ ] Layout is mobile-friendly
- [ ] Search and filter stack vertically
- [ ] Modal is scrollable
- [ ] Form fields full width
- [ ] Buttons are touch-friendly

### 7.2 Visual Elements

#### Role Badges:
- [ ] ADMIN: Purple background
- [ ] MANAGER: Blue background
- [ ] RECEPTIONIST: Green background
- [ ] HOUSEKEEPING: Yellow background
- [ ] GUEST: Gray background
- [ ] Text is readable on all backgrounds

#### Loading States:
- [ ] Initial load shows spinner
- [ ] Creating user shows spinner
- [ ] Searching shows loading state
- [ ] Button disabled during load

#### Empty States:
- [ ] No users: Shows icon and message
- [ ] No search results: Shows message
- [ ] Clear and helpful text

### 7.3 Interactions
- [ ] Hover effects on table rows
- [ ] Hover effects on buttons
- [ ] Smooth transitions
- [ ] Modal animations
- [ ] No flickering
- [ ] Cursor changes appropriately

---

## 8. Performance Testing

### 8.1 Load Time
- [ ] Initial user list loads in < 2 seconds
- [ ] Search results return in < 1 second
- [ ] Filter results return in < 1 second
- [ ] Modal opens instantly
- [ ] No lag when typing in search

### 8.2 Large Dataset
- [ ] Create 50+ users (use script if available)
- [ ] List still loads quickly
- [ ] Search still responsive
- [ ] Filter still responsive
- [ ] Table scrolls smoothly

### 8.3 Network Performance
- [ ] Check Network tab
- [ ] Minimal API calls
- [ ] No unnecessary requests
- [ ] Proper caching
- [ ] Efficient payload sizes

---

## 9. Error Scenarios

### 9.1 Network Errors
- [ ] Disconnect network
- [ ] Try to load users
- [ ] Error message shown
- [ ] Reconnect network
- [ ] Retry works

### 9.2 Server Errors
- [ ] Backend returns 500 error
- [ ] Frontend shows user-friendly message
- [ ] No crash or white screen

### 9.3 Token Expiration
- [ ] Wait for token to expire
- [ ] Try to create user
- [ ] Token refresh triggers
- [ ] Request succeeds
- [ ] OR redirects to login

### 9.4 Invalid Data
- [ ] Try malicious input
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] No security vulnerabilities

---

## 10. Browser Compatibility

### 10.1 Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Styles render correctly

### 10.2 Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Styles render correctly

### 10.3 Safari
- [ ] All features work
- [ ] Date input works
- [ ] Styles render correctly

### 10.4 Edge
- [ ] All features work
- [ ] No console errors
- [ ] Styles render correctly

---

## 11. Data Integrity

### 11.1 Database Verification
- [ ] Check MySQL database
- [ ] User inserted in `users` table
- [ ] Staff record in `staff` table (if not guest)
- [ ] Password is hashed (not plain text)
- [ ] Timestamps are correct
- [ ] Foreign keys intact

### 11.2 Data Consistency
- [ ] User ID matches between tables
- [ ] Branch assignment correct
- [ ] Role stored correctly
- [ ] Email format preserved
- [ ] No data corruption

---

## 12. Security Testing

### 12.1 Authentication
- [ ] Logout
- [ ] Try to access /api/users directly
- [ ] Returns 401 Unauthorized
- [ ] Try with invalid token
- [ ] Returns 401 Unauthorized

### 12.2 Authorization
- [ ] Login as MANAGER
- [ ] Try to create ADMIN via API
- [ ] Returns 403 Forbidden
- [ ] Try to view other branch users
- [ ] Returns filtered results only

### 12.3 Input Sanitization
- [ ] Try SQL injection in search
- [ ] Blocked/sanitized
- [ ] Try XSS in name field
- [ ] Sanitized on backend
- [ ] Try script tags in email
- [ ] Rejected by validation

---

## 13. Integration Testing

### 13.1 Dashboard Integration
- [ ] Create new user
- [ ] Dashboard stats update
- [ ] Total users count increases
- [ ] Staff count updates (if staff)
- [ ] Guest count updates (if guest)

### 13.2 Branch Integration
- [ ] Create user with branch
- [ ] Branch user count updates
- [ ] Manager can see new user
- [ ] Branch-user relationship intact

### 13.3 Authentication Integration
- [ ] Create new user
- [ ] Logout
- [ ] Login with new credentials
- [ ] Login succeeds
- [ ] Correct role assigned
- [ ] Correct permissions active

---

## Final Checklist

### Documentation
- [ ] USER_MANAGEMENT_IMPLEMENTATION.md reviewed
- [ ] USER_MANAGEMENT_QUICK_GUIDE.md available
- [ ] IMPLEMENTATION_SUMMARY.md complete
- [ ] USER_MANAGEMENT_WORKFLOW.md available

### Code Quality
- [ ] No console errors
- [ ] No compilation warnings
- [ ] Code follows style guide
- [ ] Functions properly commented
- [ ] No dead code

### Production Readiness
- [ ] All critical bugs fixed
- [ ] All features working
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Documentation complete
- [ ] Ready for deployment ✅

---

## Test Results Summary

| Category | Tests | Passed | Failed | Notes |
|----------|-------|--------|--------|-------|
| Basic Access | | | | |
| Add User | | | | |
| Search | | | | |
| Filter | | | | |
| Combined Filters | | | | |
| Permissions | | | | |
| UI/UX | | | | |
| Performance | | | | |
| Errors | | | | |
| Browsers | | | | |
| Security | | | | |
| Integration | | | | |
| **TOTAL** | | | | |

---

## Bug Report Template

```
Bug ID: #
Title: 
Severity: [Critical/High/Medium/Low]
Category: [Feature]
Browser: 
Steps to Reproduce:
1. 
2. 
3. 

Expected Result:

Actual Result:

Screenshots:

Console Errors:

Additional Notes:
```

---

**Testing Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete
