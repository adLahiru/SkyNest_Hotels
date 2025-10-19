# Contact Form Database Integration

## Changes Made

### 1. Removed "Our Locations" Section
- ✅ Removed the location cards section displaying Colombo, Kandy, and Galle branches
- ✅ Cleaned up unused location data and MapPin, Phone, Mail, Clock icons
- Contact page now only shows the contact form

### 2. Created Contact Table in Database

**Table Name:** `contact`

**Structure:**
```sql
CREATE TABLE contact (
  contact_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NULL,                         -- Foreign key to users table
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NULL,
  inquiry_type VARCHAR(50) NOT NULL DEFAULT 'general',
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('pending', 'read', 'replied', 'closed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_inquiry_type (inquiry_type),
  INDEX idx_created_at (created_at)
);
```

**Key Features:**
- ✅ `contact_id` - UUID primary key (auto-generated)
- ✅ `user_id` - Foreign key to users table (nullable for guest submissions)
- ✅ `inquiry_type` - Type of inquiry (general, booking, complaint, event, media, career)
- ✅ `status` - Message status (pending, read, replied, closed) for admin tracking
- ✅ Timestamps for created and updated dates
- ✅ Indexed fields for fast queries

### 3. Backend API Implementation

**Files Created/Modified:**

#### `backend/src/controllers/contactController.ts`
- ✅ `submitContactForm()` - Public endpoint (POST /api/contact)
- ✅ `getAllContactMessages()` - Admin only (GET /api/contact)
- ✅ `getContactMessageById()` - Admin only (GET /api/contact/:id)
- ✅ `updateContactStatus()` - Admin only (PATCH /api/contact/:id/status)
- ✅ `deleteContactMessage()` - Admin only (DELETE /api/contact/:id)

#### `backend/src/routes/contactRoutes.ts`
- ✅ Public route for form submission (no auth required)
- ✅ Protected admin routes with authentication middleware
- ✅ Authorization for admin-only operations

#### `backend/src/routes/index.ts`
- ✅ Mounted contact routes at `/api/contact`
- ✅ Added to API health check

#### `backend/src/scripts/createContactTable.ts`
- ✅ Script to create contact table in database
- ✅ Handles collation matching with users table

### 4. Frontend Integration

**Files Created/Modified:**

#### `frontend/src/services/contactService.js`
New service file with methods:
- ✅ `submitContactForm(contactData)` - Public submission
- ✅ `getAllContactMessages(filters)` - Admin view all
- ✅ `getContactMessageById(contactId)` - Admin view single
- ✅ `updateContactStatus(contactId, status)` - Admin update
- ✅ `deleteContactMessage(contactId)` - Admin delete

#### `frontend/src/components/ContactPage.js`
Updated to:
- ✅ Removed "Our Locations" section completely
- ✅ Import `contactService` for API calls
- ✅ Call actual backend API on form submission
- ✅ Display success messages from backend
- ✅ Display error messages if submission fails
- ✅ Fixed `inquiry_type` field name (was `location`)
- ✅ Auto-clear success/error messages after 5 seconds

## API Endpoints

### Public Endpoints

**Submit Contact Form**
```
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+94 123 456789",
  "inquiry_type": "general",
  "subject": "Booking Question",
  "message": "I would like to know about..."
}

Response 201:
{
  "success": true,
  "message": "Your message has been sent successfully! We will respond within 24 hours.",
  "data": {
    "contact_id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Booking Question",
    "inquiry_type": "general"
  }
}
```

### Admin Endpoints (Require Authentication)

**Get All Contact Messages**
```
GET /api/contact?status=pending&limit=50&offset=0
Authorization: Bearer <admin_token>

Response 200:
{
  "success": true,
  "message": "Contact messages retrieved successfully.",
  "data": {
    "messages": [...],
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

**Get Single Contact Message**
```
GET /api/contact/:contact_id
Authorization: Bearer <admin_token>

Response 200:
{
  "success": true,
  "message": "Contact message retrieved successfully.",
  "data": {
    "contact_id": "uuid",
    "user_id": "uuid or null",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+94 123 456789",
    "inquiry_type": "general",
    "subject": "Booking Question",
    "message": "I would like to know...",
    "status": "read",
    "created_at": "2025-10-18T...",
    "updated_at": "2025-10-18T...",
    "user_name": "John Doe",
    "user_email": "john@example.com"
  }
}
```

**Update Contact Status**
```
PATCH /api/contact/:contact_id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "replied"
}

Response 200:
{
  "success": true,
  "message": "Contact message status updated successfully.",
  "data": {
    "contact_id": "uuid",
    "status": "replied"
  }
}
```

**Delete Contact Message**
```
DELETE /api/contact/:contact_id
Authorization: Bearer <admin_token>

Response 200:
{
  "success": true,
  "message": "Contact message deleted successfully."
}
```

## Data Flow

### User Submits Contact Form:

1. **Frontend (ContactPage.js)**
   - User fills out form (name, email, phone, inquiry type, subject, message)
   - Form validation runs (email format, required fields, message length)
   - If valid, calls `contactService.submitContactForm(contactData)`

2. **Service Layer (contactService.js)**
   - Sends POST request to `/api/contact`
   - Handles response and errors
   - Returns formatted result to component

3. **Backend API (contactController.ts)**
   - Validates request data
   - Generates UUID for contact_id
   - Checks if user is logged in (attaches user_id if available)
   - Inserts data into contact table
   - Returns success response

4. **Database (MySQL)**
   - Stores contact message with all details
   - Sets status to 'pending'
   - Records timestamp

5. **Frontend Response**
   - Shows success message: "Thank you! Your message has been sent successfully. We'll respond within 24 hours."
   - Clears form
   - Auto-hides message after 5 seconds

### Admin Views Contact Messages:

1. Admin logs in and navigates to contact management (future feature)
2. Backend fetches all messages from database with filters
3. Admin can:
   - View all messages with pagination
   - Filter by status or inquiry type
   - Click on message to view details
   - Update status (pending → read → replied → closed)
   - Delete spam or resolved messages

## Inquiry Types

The system supports 6 types of inquiries:
- **general** - General Inquiry (default)
- **booking** - Booking Assistance
- **complaint** - Complaint/Feedback
- **event** - Events & Conferences
- **media** - Media Inquiry
- **career** - Career Opportunities

## Contact Status Workflow

```
pending → read → replied → closed
  ↓        ↓       ↓         ↓
 New     Viewed  Responded  Resolved
```

## Validation Rules

### Frontend Validation:
- ✅ Name is required
- ✅ Email is required and must be valid format
- ✅ Subject is required
- ✅ Message is required and minimum 10 characters
- ✅ Phone is optional

### Backend Validation:
- ✅ Name, email, subject, message are required
- ✅ Email must match regex pattern
- ✅ Message must be at least 10 characters
- ✅ Inquiry type defaults to 'general' if not provided
- ✅ Status must be valid enum value

## User Experience Features

### For Website Visitors:
- ✅ Simple, clean contact form without overwhelming location information
- ✅ Clear validation messages
- ✅ Instant feedback on submission
- ✅ Success confirmation message
- ✅ Error handling with user-friendly messages
- ✅ Optional phone number field
- ✅ Character counter for message (0/500)
- ✅ Dropdown for inquiry type selection

### For Logged-in Users:
- ✅ Contact message linked to user account via `user_id`
- ✅ Admin can see user history of contact messages
- ✅ Future: Users can view their own contact history

### For Administrators:
- ✅ View all contact messages with filtering
- ✅ Track message status (pending, read, replied, closed)
- ✅ Search by inquiry type
- ✅ Pagination for large datasets
- ✅ Automatic status update when viewing message
- ✅ Full CRUD operations on contact messages

## Files Created/Modified

### Backend:
- ✅ `backend/migrations/20251018091658-create-contact-table.js`
- ✅ `backend/migrations/sqls/20251018091658-create-contact-table-up.sql`
- ✅ `backend/migrations/sqls/20251018091658-create-contact-table-down.sql`
- ✅ `backend/src/controllers/contactController.ts`
- ✅ `backend/src/routes/contactRoutes.ts`
- ✅ `backend/src/routes/index.ts` (modified)
- ✅ `backend/src/scripts/createContactTable.ts`

### Frontend:
- ✅ `frontend/src/services/contactService.js`
- ✅ `frontend/src/components/ContactPage.js` (modified)

## Database Changes

**Migration Executed:**
```bash
npx ts-node src/scripts/createContactTable.ts
```

**Result:**
```
✅ Contact table created successfully!
✅ Verified: contact table exists
```

**Table Columns:**
```
contact_id       CHAR(36)      PRIMARY KEY
user_id          CHAR(36)      FOREIGN KEY → users(user_id)
name             VARCHAR(255)  NOT NULL
email            VARCHAR(255)  NOT NULL
phone            VARCHAR(20)   NULLABLE
inquiry_type     VARCHAR(50)   DEFAULT 'general'
subject          VARCHAR(255)  NOT NULL
message          TEXT          NOT NULL
status           ENUM          DEFAULT 'pending'
created_at       TIMESTAMP     AUTO
updated_at       TIMESTAMP     AUTO
```

## Testing Checklist

### Public Contact Form:
- [ ] Submit form with all fields filled
- [ ] Submit form without optional phone number
- [ ] Try to submit with invalid email
- [ ] Try to submit with message < 10 characters
- [ ] Try to submit with empty required fields
- [ ] Verify success message appears
- [ ] Verify form clears after submission
- [ ] Check database record was created
- [ ] Verify user_id is NULL for guest submissions

### Logged-in User Contact Form:
- [ ] Login as user
- [ ] Submit contact form
- [ ] Verify user_id is attached to contact record
- [ ] Check user_name appears in admin view

### Admin Contact Management:
- [ ] Login as admin
- [ ] View all contact messages (GET /api/contact)
- [ ] Filter by status (pending, read, replied, closed)
- [ ] Filter by inquiry type
- [ ] View single contact message
- [ ] Update contact status
- [ ] Delete contact message
- [ ] Verify status auto-updates to 'read' when viewing

## Security Features

- ✅ Public endpoint allows anyone to submit (as intended for contact forms)
- ✅ Admin endpoints protected with JWT authentication
- ✅ Role-based authorization (only ADMIN can view/manage contacts)
- ✅ SQL injection prevention via parameterized queries
- ✅ Input validation on both frontend and backend
- ✅ Foreign key constraint with ON DELETE SET NULL (preserves contacts if user deleted)
- ✅ Error messages don't leak sensitive information

## Future Enhancements

### For Users:
- [ ] View own contact history (My Messages page)
- [ ] Receive email notification when admin replies
- [ ] Track message status in user dashboard

### For Admins:
- [ ] Admin dashboard section for contact management
- [ ] Reply to messages directly from admin panel
- [ ] Email integration for responses
- [ ] Search by name, email, or message content
- [ ] Export contact messages to CSV
- [ ] Auto-archive old messages
- [ ] Statistics dashboard (messages per type, response time, etc.)
- [ ] Email templates for common responses

### System:
- [ ] Rate limiting to prevent spam
- [ ] CAPTCHA integration for public form
- [ ] Email notifications to admin on new contact
- [ ] SMS notifications for urgent inquiries
- [ ] Auto-responder email to user confirming receipt
- [ ] File attachment support for complaints/feedback
- [ ] Multi-language support for international guests

---

**Status:** ✅ Completed and Ready for Testing  
**Date:** October 18, 2025

**Summary:**
- Contact table created in database with proper foreign key
- Backend API fully implemented with 5 endpoints
- Frontend service layer created
- Contact page updated to use real API
- "Our Locations" section removed as requested
- All data now stored in database and retrievable by admins
