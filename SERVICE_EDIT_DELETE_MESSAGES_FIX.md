# Service Edit/Delete and Messages Tab Fix

## Date: January 2025

## Summary
Fixed the Service edit/delete functionality and Messages tab by updating the backend controller to use the correct database schema and fixing frontend service function calls.

---

## Issues Fixed

### 1. **Service Edit Returns 404 Error**
- **Problem**: Edit service returned "Service not found" when clicking Edit button
- **Root Cause**: Backend `updateService` function was using obsolete `service_catalogue` table and `service_id` parameter instead of current `service_types` table with `service_type_id`
- **Solution**: Completely rewrote `updateService` function to use correct schema

### 2. **Service Delete Fails**
- **Problem**: Delete service button didn't work despite JWT authentication working
- **Root Cause**: Backend `deleteService` function was querying wrong table `service_catalogue`
- **Solution**: Rewrote `deleteService` function to use `service_types` table

### 3. **Messages Tab Error**
- **Problem**: `TypeError: contactService.getAllMessages is not a function`
- **Root Cause**: Frontend calling wrong function names
- **Solution**: Updated function calls to match actual service methods

---

## Backend Changes

### File: `backend/src/controllers/serviceCatalogueController.ts`

#### **updateService Function** (Lines 312-487)

**Changes Made**:
1. ✅ Changed table from `service_catalogue` → `service_types`
2. ✅ Changed parameter from `service_id` → `service_type_id`
3. ✅ Updated request body fields:
   - **Old**: `category`, `unit_price`, `is_active`
   - **New**: `service_name`, `price`, `branch_id`, `photo`, `description`
4. ✅ Added photo handling as Buffer (Base64 conversion)
5. ✅ Added branch validation (checks if `branch_id` exists)
6. ✅ Updated duplicate check to validate within same branch
7. ✅ Added branch name in response (LEFT JOIN with `hotel_branches`)
8. ✅ Return photo as Base64 string in response

**Key Features**:
```typescript
// Correct table and primary key
SELECT * FROM service_types WHERE service_type_id = ?

// Correct fields
const { service_name, price, branch_id, photo, description } = req.body;

// Photo handling (same as createService)
const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
photoBuffer = Buffer.from(base64Data, 'base64');

// Dynamic update query
UPDATE service_types SET service_name = ?, price = ?, branch_id = ?, 
photo = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
WHERE service_type_id = ?
```

#### **deleteService Function** (Lines 510-563)

**Changes Made**:
1. ✅ Changed table from `service_catalogue` → `service_types`
2. ✅ Changed parameter from `service_id` → `service_type_id`
3. ✅ Removed service_usage check (not applicable to current schema)
4. ✅ Simplified deletion logic

**Implementation**:
```typescript
// Check if service exists
SELECT * FROM service_types WHERE service_type_id = ?

// Delete service
DELETE FROM service_types WHERE service_type_id = ?
```

---

## Frontend Changes

### File: `frontend/src/components/AdminDashboard.js`

#### **Fixed Contact Service Function Calls** (Lines 1393-1430)

**Changes Made**:
```javascript
// ❌ OLD (Wrong function names)
contactService.getAllMessages(filters)
contactService.updateMessageStatus(id, status)
contactService.deleteMessage(id)
result.data.messages

// ✅ NEW (Correct function names)
contactService.getAllContactMessages(filters)
contactService.updateContactStatus(id, status)
contactService.deleteContactMessage(id)
result.messages
```

---

## Database Schema Reference

### **service_types Table** (Actual Schema Used)
```sql
CREATE TABLE service_types (
  service_type_id CHAR(36) PRIMARY KEY,
  service_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  branch_id CHAR(36) NOT NULL,
  photo LONGBLOB,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES hotel_branches(branch_id)
);
```

### **contact Table** (Messages Tab)
```sql
CREATE TABLE contact (
  contact_id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  inquiry_type VARCHAR(50),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status ENUM('pending', 'read', 'replied', 'closed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

---

## Testing Checklist

### ✅ **Services Edit Functionality**
1. Navigate to Admin Dashboard → Services tab
2. Click Edit button on any service
3. Modify fields (name, branch, price, description, photo)
4. Click Submit
5. Verify service updates successfully
6. Check that updated values display in table

### ✅ **Services Delete Functionality**
1. Navigate to Admin Dashboard → Services tab
2. Click Delete button on any service
3. Confirm deletion in modal
4. Verify service removed from table
5. Check that service no longer exists in database

### ✅ **Messages Tab Display**
1. Navigate to Admin Dashboard → Messages tab
2. Verify messages load from contact table
3. Check all columns display: Date, Name, Contact, Inquiry Type, Subject, Message, Actions
4. Verify user_id shows if available

### ✅ **Mark as Read Functionality**
1. Filter by "Needs Review" (pending messages)
2. Click "Mark as Read" button
3. Verify message moves to "Reviewed" section
4. Check status updated to 'read' in database

### ✅ **Delete Message Functionality**
1. Click Delete button on any message
2. Confirm deletion in modal
3. Verify message removed from table
4. Check message deleted from contact table

### ✅ **Search and Filter**
1. Use search bar to filter messages by name, email, subject, message
2. Switch between "Needs Review" and "Reviewed" tabs
3. Verify filtering works correctly

---

## API Endpoints

### **Service Management**
```
PUT    /api/services/:service_id       - Update service (Admin only)
DELETE /api/services/:service_id       - Delete service (Admin only)
```

### **Contact Messages**
```
GET    /api/contact                    - Get all messages (Admin only)
PATCH  /api/contact/:contact_id/status - Update message status (Admin only)
DELETE /api/contact/:contact_id        - Delete message (Admin only)
```

---

## Technical Notes

### **Why the Bug Occurred**
The `createService` function was updated when the database schema changed from `service_catalogue` to `service_types`, but `updateService` and `deleteService` functions were never updated. This created an inconsistency where:
- ✅ Creating services worked (used new schema)
- ❌ Editing services failed (used old schema)
- ❌ Deleting services failed (used old schema)

### **Photo Handling**
Both create and update functions now handle photos consistently:
1. Frontend sends Base64 string
2. Backend strips data URI prefix
3. Backend converts to Buffer
4. Buffer stored in LONGBLOB column
5. Backend converts back to Base64 for responses

### **Authentication**
All endpoints require:
- Valid JWT token (Bearer authentication)
- ADMIN role
- Token verified before any database operations

---

## Files Modified

### Backend
- ✅ `backend/src/controllers/serviceCatalogueController.ts`
  - Rewrote `updateService` function (Lines 312-487)
  - Rewrote `deleteService` function (Lines 510-563)

### Frontend
- ✅ `frontend/src/components/AdminDashboard.js`
  - Fixed contact service function calls (Lines 1393-1430)
  - All UI components already implemented correctly

---

## Result

✅ **Service Edit**: Now works correctly with all fields (name, price, branch, photo, description)
✅ **Service Delete**: Successfully removes services from database
✅ **Messages Tab**: Displays contact form submissions with all fields
✅ **Mark as Read**: Updates message status from pending to read
✅ **Delete Message**: Removes messages from contact table
✅ **Search/Filter**: Works across all message fields and status types

---

## No Further Changes Needed

All functionality is now working correctly. The backend and frontend are fully synchronized with the current database schema.
