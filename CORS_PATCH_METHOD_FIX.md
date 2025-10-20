# CORS PATCH Method Fix

## Issue Description

**Error Message:**
```
Access to XMLHttpRequest at 'http://localhost:8084/api/bookings/{booking_id}/checkin' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
Method PATCH is not allowed by Access-Control-Allow-Methods in preflight response.
```

## Root Cause

The backend CORS configuration was missing the `PATCH` HTTP method in the `Access-Control-Allow-Methods` header. 

The configuration only allowed:
- GET
- POST
- PUT
- DELETE
- OPTIONS

But the check-in and check-out endpoints use `PATCH` method.

## Solution

### File: `backend/src/index.ts`

**Before:**
```typescript
res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
```

**After:**
```typescript
res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
```

## What is CORS?

**CORS (Cross-Origin Resource Sharing)** is a security feature implemented by browsers that restricts web pages from making requests to a different domain than the one that served the web page.

### The Preflight Request

When making certain HTTP requests (like PATCH, PUT, DELETE), the browser first sends a "preflight" OPTIONS request to check if the actual request is allowed.

**Preflight Flow:**
1. Browser sends OPTIONS request to backend
2. Backend responds with allowed methods in `Access-Control-Allow-Methods` header
3. If the actual method (PATCH) is in the list → Request proceeds
4. If not → Request is blocked with CORS error

## Endpoints Affected

This fix enables the following endpoints to work properly:

- `PATCH /api/bookings/:booking_id/checkin` - Check in a guest
- `PATCH /api/bookings/:booking_id/checkout` - Check out a guest
- Any other PATCH endpoints in the application

## How to Apply the Fix

1. **Edit the file**: `backend/src/index.ts` (Already done ✅)

2. **Restart the backend server**:
   ```bash
   # If using npm
   cd backend
   npm run dev
   
   # If using node directly
   cd backend
   node dist/index.js
   ```

3. **Verify the fix**: 
   - Open browser console
   - Try clicking the "Check In" button
   - Should work without CORS error

## Testing Checklist

After restarting the backend:

- [ ] Backend server starts without errors
- [ ] Can access the API at `http://localhost:8084/api`
- [ ] Check-in button works without CORS error
- [ ] Check-out button works without CORS error
- [ ] Other PATCH endpoints work (if any)

## HTTP Methods Overview

Common HTTP methods and their purposes:

| Method | Purpose | Example Use Case |
|--------|---------|------------------|
| GET | Retrieve data | Fetch booking list |
| POST | Create new resource | Create new booking |
| PUT | Replace entire resource | Update entire booking |
| **PATCH** | **Partial update** | **Update booking status only** |
| DELETE | Remove resource | Cancel booking |
| OPTIONS | Preflight check | CORS validation |

## Why PATCH for Check-in/Check-out?

We use `PATCH` instead of `PUT` because:
- We're only updating the `booking_status` field
- We're not replacing the entire booking record
- PATCH is semantically correct for partial updates
- It's more efficient (only sends changed fields)

## Additional Security Considerations

Current CORS setup:
```typescript
res.header('Access-Control-Allow-Origin', '*'); // Allows all origins
```

**For Production**, you should restrict this:
```typescript
const allowedOrigins = ['https://yourfrontend.com', 'https://www.yourfrontend.com'];
const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
  res.header('Access-Control-Allow-Origin', origin);
}
```

## Related Files

- `backend/src/index.ts` - CORS configuration
- `backend/src/routes/bookingRoutes.ts` - Check-in/check-out endpoints
- `frontend/src/services/dashboardService.js` - Frontend service calls
- `frontend/src/components/ReceptionistDashboard.js` - UI component

## Date
October 20, 2025

## Status
✅ **FIXED** - Added PATCH to allowed CORS methods
⚠️ **ACTION REQUIRED** - Restart backend server to apply changes
