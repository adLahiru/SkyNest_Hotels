# Phone Number Not Showing in Booking Form - Fix

## Problem
When a new user registers, their phone number doesn't appear in the booking form fields (name, email, phone). However, after going to the profile page, clicking edit, and saving, the phone number then appears in the booking form.

## Root Cause
The BookingPage component was using the `user` prop that comes from:
- **localStorage** - Set during login/registration
- **JWT token** - Contains limited user data from when token was created

When a user registers:
1. User data is saved to database (including phone)
2. JWT token is created with basic info
3. User object stored in localStorage
4. **BUT** - The phone number might not be in the JWT payload or localStorage object

When user goes to profile and saves:
1. Profile page fetches fresh data from backend
2. Updates localStorage with complete user data
3. Now phone number is available in the user object

## Solution Implemented

### 1. Fetch Fresh User Data on Booking Page Load

Updated `BookingPage.js` to fetch current user data from the backend API when the component mounts:

```javascript
import userService from '../services/userService';

// Added state
const [loadingUserData, setLoadingUserData] = useState(true);

// Fetch fresh user data from backend when component loads
useEffect(() => {
  const fetchUserData = async () => {
    try {
      setLoadingUserData(true);
      const response = await userService.getCurrentUserProfile();
      
      if (response.success && response.user) {
        console.log('Fresh user data loaded:', response.user);
        setBookingForm(prev => ({
          ...prev,
          name: response.user.name || '',
          email: response.user.email || '',
          phone: response.user.phone || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to user prop if API fails
      if (user) {
        setBookingForm(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || ''
        }));
      }
    } finally {
      setLoadingUserData(false);
    }
  };

  fetchUserData();
}, []); // Run once on mount
```

### 2. Added Loading Indicator

Shows a loading message while fetching user data:

```javascript
{loadingUserData && (
  <div className="max-w-4xl mx-auto mb-8">
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
      <p className="text-blue-600">Loading your profile information...</p>
    </div>
  </div>
)}
```

### 3. Fallback Mechanism

If the API call fails, it falls back to using the `user` prop from localStorage:

```javascript
} catch (error) {
  console.error('Error fetching user data:', error);
  // Fallback to user prop if API fails
  if (user) {
    setBookingForm(prev => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    }));
  }
}
```

## Files Modified

1. **frontend/src/components/BookingPage.js**
   - Added `import userService from '../services/userService'`
   - Added `loadingUserData` state
   - Added `useEffect` to fetch fresh user data on mount
   - Added loading indicator UI
   - Kept fallback `useEffect` for user prop changes

## How It Works Now

### New User Registration → Booking Flow:

1. **User registers** → Phone saved in database
2. **User logs in** → JWT token created (might not include phone)
3. **User navigates to booking** → BookingPage mounts
4. **BookingPage fetches fresh user data** from `/api/users/profile` endpoint
5. **Phone number loaded** from database into booking form
6. **User sees all fields filled** (name, email, phone) ✅

### Data Flow:

```
User Registration
  ↓
Database (phone saved)
  ↓
Login → JWT Token + localStorage (might be missing phone)
  ↓
Navigate to BookingPage
  ↓
useEffect runs → userService.getCurrentUserProfile()
  ↓
Backend: GET /api/users/profile
  ↓
Returns fresh user data with phone
  ↓
BookingForm updated with phone ✅
```

## API Endpoint Used

**Endpoint:** `GET /api/users/profile`  
**Service Method:** `userService.getCurrentUserProfile()`  
**Returns:**
```json
{
  "success": true,
  "user": {
    "user_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0714566635",  ← This is now fetched fresh!
    "nic_no": "...",
    ...
  }
}
```

## Testing Steps

### Test 1: New User Registration
1. Register a new account with phone number
2. Login with the new account
3. Select a branch and room
4. Go to booking page
5. **Expected:** Name, email, and phone should all be filled automatically ✅

### Test 2: Existing User
1. Login with existing account
2. Navigate to booking
3. **Expected:** All fields filled with latest data from database ✅

### Test 3: After Profile Update
1. Login
2. Go to profile, update phone number
3. Go to booking
4. **Expected:** Updated phone number appears ✅

## Benefits

✅ **Always Fresh Data** - Fetches latest user information from database  
✅ **No Manual Refresh Needed** - Automatic on booking page load  
✅ **Better User Experience** - No confusion about missing phone numbers  
✅ **Fallback Support** - Works even if API fails (uses localStorage)  
✅ **Loading Feedback** - User sees loading indicator while data fetches  

## Notes

- The fetch happens only once when BookingPage mounts (not on every re-render)
- If the API call fails, it gracefully falls back to localStorage data
- The phone number field remains disabled (read-only) as intended
- This fix ensures data consistency between database and frontend

---

**Status:** ✅ Fixed and Tested  
**Date:** October 17, 2025
