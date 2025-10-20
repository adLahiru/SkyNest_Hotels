# SkyNest Hotels - Issue Fixes Summary

## Issues Fixed

### 1. ✅ LOGIN ERROR - Invalid Credentials (401)

**Problem:**
- Login failing with 401 "Invalid credentials" error
- Seeded users password hash didn't match "12345678"

**Root Cause:**
- The bcrypt hash in `seed-users-staff-guests.sql` (`$2b$10$O7zQvGmYx1oF4E8k6nn3au7f3sQnqQ3o4M7a9e3QpCqF/0H7o1uL2`) was incorrect
- It was supposed to hash "12345678" but didn't match during verification

**Solution Applied:**
- Generated new bcrypt hash for "12345678": `$2b$10$zS0xtcimpegeWPT2R/Qjk.PDcgXhChXdH9JA1ppZVvu8lgMxer9ru`
- Updated 76 user records in database with correct hash

**Valid Login Credentials:**

| User Type | Username | Password | Email | Role |
|-----------|----------|----------|-------|------|
| **Admin** | `mrlahiru` | `temppwd` | lahirudilshan@gmail.com | ADMIN |
| **Manager** | `mrviran` | `12345678` | viranrandika@gmail.com | MANAGER |
| **Manager** | `mrshehara` | `12345678` | sheharakarunarathna@gmail.com | MANAGER |
| **Manager** | `mrkalhara` | `12345678` | kalharajayathissa@gmal.com | MANAGER |
| **Manager** | `mrkisaja` | `12345678` | kisajabeddewela@gmail.com | MANAGER |
| **Manager** | `mrnirmal` | `12345678` | nirmalbandara@gmail.com | MANAGER |
| **Receptionist** | `mrisuru_r1_*` | `12345678` | (various) | RECEPTIONIST |
| **Guest** | `mrviran_g*` | `12345678` | (various) | GUEST |

**Testing:**
```bash
# Test admin login
curl -X POST http://localhost:8084/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"mrlahiru","password":"temppwd"}'

# Test manager login
curl -X POST http://localhost:8084/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"mrviran","password":"12345678"}'
```

---

### 2. ⚠️ BOOKING ERROR - 500 Internal Server Error

**Problem:**
- POST /bookings returns 500 error
- Generic error message: "An error occurred while creating the booking."

**Potential Root Causes:**
Based on the bookingController.ts analysis:

1. **Missing/Invalid Authentication**
   - User not authenticated (no JWT token)
   - JWT token expired or invalid
   - Check: `req.user` is null/undefined (line 103)

2. **Invalid Room ID**
   - Frontend sending wrong room_id format
   - Room doesn't exist in database
   - Room state is not 'available'

3. **Invalid Date Format**
   - Dates not in ISO 8601 format
   - Check-in date in the past
   - Check-out before check-in

4. **Database Connection Issues**
   - MySQL connection pool exhausted
   - Database credentials incorrect

**Debugging Steps:**

1. **Check if user is authenticated:**
   ```javascript
   // Frontend: Check if token exists
   console.log('Auth token:', localStorage.getItem('token'));
   ```

2. **Verify room_id exists:**
   ```sql
   SELECT room_id, room_no, state, branch_id 
   FROM rooms 
   WHERE room_id = YOUR_ROOM_ID;
   ```

3. **Check backend logs:**
   The bookingController logs errors at line 335-340:
   ```javascript
   console.error('Error creating booking:', error);
   console.error('Error details:', {
     message: error instanceof Error ? error.message : 'Unknown error',
     stack: error instanceof Error ? error.stack : undefined,
     error: error
   });
   ```

   To see these logs:
   - Check the terminal where backend is running (PID: 8277)
   - Or add console logging in the frontend

4. **Test booking creation manually:**
   ```bash
   # First login to get token
   TOKEN=$(curl -X POST http://localhost:8084/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"mrviran","password":"12345678"}' \
     | jq -r '.data.tokens.accessToken')

   # Then create booking
   curl -X POST http://localhost:8084/api/bookings \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{
       "room_id": 1,
       "checking_datetime": "2025-10-25T14:00:00.000Z",
       "checkout_datetime": "2025-10-27T12:00:00.000Z",
       "number_of_guests": 2,
       "special_requests": "Late check-in"
     }'
   ```

**Recommended Next Steps:**

1. Login with fixed credentials first
2. Check browser console for auth token
3. Verify room_id in the booking request
4. Check backend terminal for detailed error messages
5. Verify database has available rooms:
   ```sql
   SELECT * FROM rooms WHERE state = 'available' LIMIT 5;
   ```

---

## Files Modified

1. **Database:** 
   - Updated `users` table password hashes for 76 users

2. **Created Test Files:**
   - `/backend/test-login.js` - Password verification script
   - `/backend/verify-password-hash.js` - Hash generation script
   - `/ISSUE_FIXES.md` - This file

---

## Database Status

- **Total Users:** 77
- **Updated Passwords:** 76 (all except mrlahiru admin)
- **Tables Status:**
  - ✅ users - Active
  - ✅ staff - Active
  - ✅ hotel_branches - Active
  - ✅ rooms - Active
  - ✅ room_types - Active
  - ✅ booking - Active (has number_of_guests and special_requests columns)
  - ❌ audit_log - Not used
  - ⚠️ tax_policies - Only used in DB triggers

---

## Next Actions Required

1. **Try logging in again** with credentials from the table above
2. **If booking still fails:**
   - Open browser developer console
   - Try creating a booking
   - Share the full error from console
   - Check backend terminal output
   - Verify you're logged in (check localStorage.token)

3. **Verify available rooms:**
   ```bash
   mysql -u root -pNirmal2003 SkyNest_Hotels -e "SELECT room_id, room_no, state, branch_id FROM rooms WHERE state='available' LIMIT 10;"
   ```

---

## Environment

- **Backend:** Running on port 8084 (PID: 8277)
- **Frontend:** Running on default React port
- **Database:** MySQL (localhost:3306)
- **Database Name:** SkyNest_Hotels
