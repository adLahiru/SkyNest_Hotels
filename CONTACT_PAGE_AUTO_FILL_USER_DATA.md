# Contact Page Auto-Fill User Data Implementation

## Changes Made

### Auto-Fill User Information from Database

**Updated:** `frontend/src/components/ContactPage.js`

### What Was Added:

#### 1. New Imports
```javascript
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import userService from '../services/userService';
```

#### 2. New State Variables
```javascript
const [loadingUserData, setLoadingUserData] = useState(true);
const [isLoggedIn, setIsLoggedIn] = useState(false);
```

#### 3. useEffect to Fetch User Data
```javascript
useEffect(() => {
  const fetchUserData = async () => {
    try {
      setLoadingUserData(true);
      const token = localStorage.getItem('token');
      
      if (token) {
        setIsLoggedIn(true);
        const response = await userService.getCurrentUserProfile();
        
        if (response.success && response.user) {
          setContactForm(prev => ({
            ...prev,
            name: response.user.name || '',
            email: response.user.email || '',
            phone: response.user.phone || ''
          }));
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error fetching user data for contact form:', error);
      setIsLoggedIn(false);
    } finally {
      setLoadingUserData(false);
    }
  };

  fetchUserData();
}, []);
```

#### 4. Loading Indicator
```javascript
{loadingUserData && (
  <div className="max-w-2xl mx-auto mb-8">
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center text-blue-600">
      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
      <span>Loading your information...</span>
    </div>
  </div>
)}
```

#### 5. Disabled Input Fields for Logged-in Users
```javascript
// Name field
<input
  type="text"
  value={contactForm.name}
  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
  disabled={isLoggedIn}  // ← Disabled if logged in
  className={`form-input ${formErrors.name ? 'border-red-500' : ''} ${isLoggedIn ? 'bg-gray-100 cursor-not-allowed' : ''}`}
  placeholder="SkyNest"
/>
{isLoggedIn && (
  <p className="text-sm text-gray-500 mt-1">Auto-filled from your profile</p>
)}

// Email field - Same pattern
// Phone field - Same pattern
```

## How It Works

### For Logged-In Users:

1. **Page Loads** → Checks for JWT token in localStorage
2. **Token Found** → Sets `isLoggedIn = true`
3. **API Call** → `userService.getCurrentUserProfile()`
4. **Backend Returns** → User data (name, email, phone)
5. **Auto-Fill** → Form fields populated with user data
6. **Fields Disabled** → Name, email, phone are read-only with gray background
7. **Helper Text** → Shows "Auto-filled from your profile" below each field

### For Guest Users (Not Logged In):

1. **Page Loads** → No token found
2. **Sets** → `isLoggedIn = false`
3. **Fields Enabled** → User can type in all fields
4. **No Helper Text** → Normal form behavior

## User Experience

### Logged-In User Flow:

```
User Opens Contact Page
  ↓
Loading indicator shows: "Loading your information..."
  ↓
API fetches user data from database
  ↓
Name, Email, Phone fields auto-filled
  ↓
Fields disabled (gray background, cursor not-allowed)
  ↓
Helper text: "Auto-filled from your profile"
  ↓
User only needs to fill: Inquiry Type, Subject, Message
  ↓
Submit form → Saves to database with user_id ✅
```

### Guest User Flow:

```
User Opens Contact Page (Not Logged In)
  ↓
Loading indicator briefly shows
  ↓
No token found → All fields enabled
  ↓
User fills all fields manually
  ↓
Submit form → Saves to database with user_id = NULL ✅
```

## Visual Indicators

### Loading State:
- 🔵 Blue notification box with spinning loader
- Message: "Loading your information..."

### Logged-In State:
- 🔒 Name field: Gray background, disabled
- 🔒 Email field: Gray background, disabled
- 🔒 Phone field: Gray background, disabled
- ℹ️ Helper text below each: "Auto-filled from your profile"

### Guest State:
- ✏️ All fields enabled and editable
- No helper text

## Benefits

✅ **Better UX** - Logged-in users don't need to re-enter their information  
✅ **Data Accuracy** - Uses current database values, not stale JWT data  
✅ **Consistent** - Same pattern as BookingPage (familiar to users)  
✅ **Prevents Errors** - User can't accidentally change their profile info  
✅ **Saves Time** - Only need to fill inquiry type, subject, and message  
✅ **Works for Both** - Guests can still use the form without logging in  

## Data Source

**API Endpoint Used:**
```
GET /api/users/profile
Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": {
    "user_id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+94 712345678",
    ...
  }
}
```

## Form Fields

### Auto-Filled (for logged-in users):
- ✅ **Name** - From `users.name`
- ✅ **Email** - From `users.email`
- ✅ **Phone** - From `users.phone`

### User Must Fill:
- 📝 **Inquiry Type** - Dropdown (always enabled)
- 📝 **Subject** - Text input (always enabled)
- 📝 **Message** - Text area (always enabled)

## Database Impact

When form is submitted:

**Logged-In User:**
```sql
INSERT INTO contact (
  contact_id, user_id, name, email, phone, 
  inquiry_type, subject, message, status
) VALUES (
  'uuid-generated',
  'user-uuid-from-token',  ← Links to user account
  'John Doe',
  'john@example.com',
  '+94 712345678',
  'booking',
  'Room Availability',
  'I would like to...',
  'pending'
);
```

**Guest User:**
```sql
INSERT INTO contact (
  contact_id, user_id, name, email, phone,
  inquiry_type, subject, message, status
) VALUES (
  'uuid-generated',
  NULL,  ← No user_id (guest submission)
  'Jane Smith',
  'jane@example.com',
  '+94 771234567',
  'general',
  'Question',
  'I have a question...',
  'pending'
);
```

## Testing Checklist

### Test as Logged-In User:
- [ ] Login to your account
- [ ] Go to Contact page
- [ ] Verify loading indicator shows briefly
- [ ] Verify name, email, phone are auto-filled
- [ ] Verify fields are disabled (gray background)
- [ ] Verify helper text appears: "Auto-filled from your profile"
- [ ] Fill inquiry type, subject, message
- [ ] Submit form
- [ ] Verify success message
- [ ] Check database - user_id should be present

### Test as Guest:
- [ ] Logout or use incognito window
- [ ] Go to Contact page
- [ ] Verify all fields are empty and enabled
- [ ] Fill all fields manually
- [ ] Submit form
- [ ] Verify success message
- [ ] Check database - user_id should be NULL

### Test Profile Update:
- [ ] Login and update phone number in profile
- [ ] Go to Contact page
- [ ] Verify phone field shows updated number
- [ ] Confirms data comes fresh from database ✅

## Code Comparison

### Before:
```javascript
// All fields always editable
<input
  type="text"
  value={contactForm.name}
  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
  className="form-input"
/>
```

### After:
```javascript
// Auto-fill and disable for logged-in users
<input
  type="text"
  value={contactForm.name}
  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
  disabled={isLoggedIn}  // ← New
  className={`form-input ${isLoggedIn ? 'bg-gray-100 cursor-not-allowed' : ''}`}  // ← New
/>
{isLoggedIn && (
  <p className="text-sm text-gray-500 mt-1">Auto-filled from your profile</p>
)}
```

## Error Handling

If API call fails:
1. Sets `isLoggedIn = false`
2. Fields remain enabled
3. User can fill manually
4. Form still works ✅

If token is invalid:
1. API returns 401
2. Treated as guest user
3. All fields enabled
4. Form still works ✅

## Consistency with BookingPage

Both pages now use the same pattern:
- ✅ Fetch user data from `userService.getCurrentUserProfile()`
- ✅ Auto-fill name, email, phone
- ✅ Disable fields for logged-in users
- ✅ Show helper text: "Auto-filled from your profile"
- ✅ Display loading indicator
- ✅ Fallback to manual entry if API fails

---

**Status:** ✅ Implemented and Ready for Testing  
**Date:** October 18, 2025

**Summary:**
- Contact page now auto-fills name, email, phone from database for logged-in users
- Fields are disabled (read-only) to prevent accidental changes
- Shows helpful text: "Auto-filled from your profile"
- Loading indicator while fetching data
- Guests can still use the form without logging in
- Consistent UX with BookingPage
