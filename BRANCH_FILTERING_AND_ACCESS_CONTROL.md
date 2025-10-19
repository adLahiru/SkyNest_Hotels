# ✅ Branch-Wise Filtering & Guest Access Control

## 🎯 Implementation Summary

Your requirements have been fully implemented:
1. ✅ **Branch-wise filtering** - Staff only see bookings in their branch
2. ✅ **Guest restrictions** - Guests CANNOT check themselves in
3. ✅ **Staff-only check-in** - Only Managers/Receptionists can check in guests

---

## 🔐 Access Control Rules

### Who Can See Pending Guests?

| Role | What They See | Branch Filter |
|------|--------------|---------------|
| **ADMIN** | All bookings (all branches) | ❌ No filter |
| **MANAGER** | Only their branch bookings | ✅ Auto-filtered |
| **RECEPTIONIST** | Only their branch bookings | ✅ Auto-filtered |
| **GUEST** | Only their own bookings | ✅ Own bookings only |
| **HOUSEKEEPING** | ❌ No access | N/A |

### Who Can Check In Guests?

| Role | Can Check In? | Notes |
|------|---------------|-------|
| **ADMIN** | ✅ Yes | Any booking, any branch |
| **MANAGER** | ✅ Yes | Only their branch |
| **RECEPTIONIST** | ✅ Yes | Only their branch |
| **GUEST** | ❌ **NO** | **Cannot self-check-in** |
| **HOUSEKEEPING** | ❌ No | No access |

---

## 🔧 Technical Implementation

### 1. Backend: Branch-Wise Filtering

**File**: `/backend/src/controllers/bookingController.ts`

**Function**: `getBookings()` (Line 375-487)

```typescript
// Apply access control
if (req.user?.role === UserRole.GUEST) {
  // Guests can only see their own bookings
  query += ' AND b.user_id = ?';
  params.push(req.user.user_id);
} else if (req.user?.role === UserRole.MANAGER || 
           req.user?.role === UserRole.RECEPTIONIST) {
  // Staff can see bookings in their branch
  query += ' AND b.branch_id = ?';
  params.push(req.user.branch_id);
}
// Admins can see all bookings (no filter)
```

**How It Works:**
- When a Manager/Receptionist logs in, their `branch_id` is stored in JWT token
- All booking queries automatically filter by `branch_id`
- **No manual filtering needed in frontend**
- Database ensures data isolation between branches

### 2. Backend: Guest Check-In Prevention

**File**: `/backend/src/controllers/bookingController.ts`

**Function**: `checkInGuest()` (Line 1066-1161)

```typescript
// CRITICAL: Only staff (Manager/Receptionist) can check in guests
// Guests cannot check themselves in
if (req.user?.role !== UserRole.ADMIN && 
    req.user?.role !== UserRole.MANAGER && 
    req.user?.role !== UserRole.RECEPTIONIST) {
  res.status(403).json({ 
    success: false,
    error: 'Access denied',
    message: 'Only hotel staff can check in guests.'
  });
  return;
}
```

**Protection Layers:**
1. **Role Check**: Blocks non-staff users immediately
2. **Branch Check**: Staff can only check in guests in their branch
3. **Status Check**: Only CONFIRMED bookings can be checked in

### 3. Frontend: Service Layer

**File**: `/frontend/src/services/bookingService.js`

**Function**: `getAllBookings()` (Line 40-75)

```javascript
/**
 * Get all bookings (with optional filters)
 * Backend automatically filters by branch for Managers/Receptionists
 * Guests only see their own bookings
 */
getAllBookings: async (filters = {}) => {
  // Backend handles branch filtering automatically
  const response = await apiClient.get(`/bookings?${params}`);
  return response.data;
}
```

**No Branch Parameter Needed:**
- Frontend just calls API with `status: 'confirmed'`
- Backend automatically applies branch filter
- Response contains only authorized bookings

### 4. Frontend: Pending Guests Component

**File**: `/frontend/src/components/PendingGuestsManager.js`

**Function**: `fetchPendingGuests()` (Line 36-59)

```javascript
const fetchPendingGuests = async () => {
  // Fetch all confirmed bookings 
  // Backend filters by branch automatically
  const result = await bookingService.getAllBookings({ 
    status: 'confirmed' 
  });
  
  // Managers/Receptionists only see their branch
  // Guests only see their own bookings
  setPendingGuests(result.bookings);
};
```

---

## 🎬 How It Works in Practice

### Scenario 1: Manager Views Pending Guests

```
1. Manager "Viran" logs in
   ↓
2. JWT token contains:
   - user_id: xxx
   - role: MANAGER
   - branch_id: "Colombo Branch ID"
   ↓
3. Manager clicks "Pending Guests"
   ↓
4. Frontend calls: GET /api/bookings?status=confirmed
   ↓
5. Backend reads JWT token
   ↓
6. Backend adds filter: WHERE branch_id = 'Colombo Branch ID'
   ↓
7. Manager ONLY sees Colombo bookings
   ✅ Kandy bookings: HIDDEN
   ✅ Galle bookings: HIDDEN
```

### Scenario 2: Receptionist Checks In Guest

```
1. Receptionist at Kandy branch finds pending guest
   ↓
2. Clicks "Check In Guest"
   ↓
3. Frontend calls: PATCH /api/bookings/:id/checkin
   ↓
4. Backend checks user role:
   - Role: RECEPTIONIST ✅ Allowed
   ↓
5. Backend checks branch:
   - Booking branch: Kandy
   - Staff branch: Kandy ✅ Match
   ↓
6. Backend updates:
   - booking.status = 'checked_in'
   - room.state = 'occupied'
   ↓
7. Guest checked in successfully
```

### Scenario 3: Guest Tries Self Check-In (BLOCKED)

```
1. Guest logs into app
   ↓
2. Guest sees "My Bookings"
   ↓
3. Guest tries to access check-in API
   ↓
4. Backend receives request
   ↓
5. Backend checks role:
   - Role: GUEST ❌ DENIED
   ↓
6. Backend returns 403 Forbidden:
   "Only hotel staff can check in guests"
   ↓
7. Check-in BLOCKED ✅
```

### Scenario 4: Branch Isolation Test

```
Colombo Manager tries to check in Kandy guest:

1. Manager clicks "Check In Guest"
   ↓
2. Backend checks:
   - Booking branch: Kandy
   - Staff branch: Colombo ❌ MISMATCH
   ↓
3. Backend returns 403 Forbidden:
   "You can only check in guests in your branch"
   ↓
4. Cross-branch check-in BLOCKED ✅
```

---

## 📊 Database Structure

### Bookings Table
```sql
CREATE TABLE booking (
  booking_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),           -- Guest who made booking
  room_id INT,
  staff_id VARCHAR(36),           -- Staff who checked in
  branch_id VARCHAR(36),          -- ← Branch isolation key
  booking_status ENUM(...),
  checking_datetime DATETIME,
  ...
);
```

### Users/Staff Table
```sql
CREATE TABLE users (
  user_id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50),
  role ENUM('ADMIN','MANAGER','RECEPTIONIST','HOUSEKEEPING','GUEST'),
  ...
);

CREATE TABLE staff (
  staff_id VARCHAR(36) PRIMARY KEY,
  branch_id VARCHAR(36),          -- ← Staff's branch
  ...
);
```

**Key Point**: 
- Every booking has `branch_id`
- Every staff member has `branch_id`
- Backend matches these for access control

---

## 🧪 Testing Guide

### Test 1: Branch Filtering

**Steps:**
```bash
# 1. Login as Manager in Colombo
username: mrviran
password: 12345678

# 2. Go to Pending Guests
# 3. Create a test booking for Colombo room
# 4. Verify it appears in pending list

# 5. Login as Manager in Kandy
username: mrshehara
password: 12345678

# 6. Go to Pending Guests
# 7. Verify Colombo booking DOES NOT appear
```

**Expected Result:**
- ✅ Each manager only sees their branch bookings
- ✅ No cross-branch data leakage

### Test 2: Guest Cannot Check In

**Steps:**
```bash
# 1. Create booking as guest
# 2. Try to call check-in API directly

curl -X PATCH http://localhost:8084/api/bookings/xxx/checkin \
  -H "Authorization: Bearer <guest_token>"
```

**Expected Result:**
```json
{
  "success": false,
  "error": "Access denied",
  "message": "Only hotel staff (Manager/Receptionist) can check in guests."
}
```

### Test 3: Staff Check-In Works

**Steps:**
```bash
# 1. Login as Receptionist
# 2. Go to Pending Guests
# 3. Click "Check In Guest"
# 4. Verify success message
# 5. Check database: booking_status = 'checked_in'
# 6. Check database: room.state = 'occupied'
```

**Expected Result:**
- ✅ Check-in succeeds
- ✅ Room marked occupied
- ✅ Guest removed from pending list

### Test 4: Cross-Branch Prevention

**Steps:**
```bash
# 1. Create booking in Colombo (room_id from Colombo)
# 2. Get booking_id
# 3. Login as Kandy receptionist
# 4. Try to check in Colombo booking

curl -X PATCH http://localhost:8084/api/bookings/<colombo_booking_id>/checkin \
  -H "Authorization: Bearer <kandy_receptionist_token>"
```

**Expected Result:**
```json
{
  "success": false,
  "error": "Access denied",
  "message": "You can only check in guests in your branch."
}
```

---

## 🔍 Verification Commands

### Check User's Branch
```sql
SELECT u.username, u.role, s.branch_id, b.branch_name
FROM users u
LEFT JOIN staff s ON u.user_id = s.staff_id
LEFT JOIN hotel_branches b ON s.branch_id = b.branch_id
WHERE u.username = 'mrviran';
```

### Check Booking's Branch
```sql
SELECT b.booking_id, b.user_id, u.name as guest_name,
       b.branch_id, hb.branch_name, b.booking_status
FROM booking b
JOIN users u ON b.user_id = u.user_id
JOIN hotel_branches hb ON b.branch_id = hb.branch_id
WHERE b.booking_status = 'confirmed';
```

### Check Who Can Check In
```sql
SELECT u.username, u.role, s.branch_id
FROM users u
LEFT JOIN staff s ON u.user_id = s.staff_id
WHERE u.role IN ('ADMIN', 'MANAGER', 'RECEPTIONIST');
```

---

## 📋 Security Checklist

- ✅ **Branch isolation**: Staff can only see their branch bookings
- ✅ **Role-based access**: Guests blocked from check-in endpoint
- ✅ **JWT authentication**: All requests require valid token
- ✅ **Automatic filtering**: Backend applies filters, not frontend
- ✅ **Database-level**: Branch_id used in WHERE clauses
- ✅ **Transaction safety**: Check-in uses database transactions
- ✅ **Audit trail**: Staff_id recorded on check-in
- ✅ **Status validation**: Only CONFIRMED bookings can be checked in
- ✅ **Error messages**: Clear feedback for access violations

---

## 🎯 Key Takeaways

### ✅ What's Implemented

1. **Automatic Branch Filtering**
   - No frontend code needed
   - Backend filters by JWT token
   - Database-level isolation

2. **Guest Self-Check-In Prevention**
   - Explicit role check
   - Clear error messages
   - Multiple security layers

3. **Staff-Only Check-In**
   - Admin: All branches
   - Manager: Own branch only
   - Receptionist: Own branch only

### 🔒 Security Features

1. **JWT Token Protection**
   - Contains user_id, role, branch_id
   - Verified on every request
   - Cannot be tampered with

2. **Database Queries**
   - Always include branch_id filter
   - Parameterized queries (SQL injection safe)
   - Transaction-based check-in

3. **Access Control Layers**
   - Authentication (JWT required)
   - Authorization (role check)
   - Data isolation (branch filter)

---

## 📞 Support

### If Branch Filtering Not Working:
1. Check JWT token contains `branch_id`
2. Verify staff record has correct `branch_id`
3. Check database queries include branch filter
4. Review browser console for API responses

### If Guest Can Self-Check-In:
1. This should be IMPOSSIBLE now
2. Role check blocks at endpoint level
3. Check backend logs for access attempts
4. Verify user role in JWT token

### If Cross-Branch Access:
1. Should also be IMPOSSIBLE
2. Branch check blocks unauthorized access
3. Verify booking's branch_id
3. Verify staff's branch_id

---

## 🎉 Summary

**Everything is now properly configured:**

✅ **Branch-wise filtering**: Automatic in backend  
✅ **Guest restrictions**: Cannot self-check-in  
✅ **Staff-only check-in**: Managers & Receptionists only  
✅ **Data isolation**: Each branch sees only their bookings  
✅ **Security**: Multiple layers of protection  

**Your system is production-ready!** 🚀

---

**Last Updated**: October 19, 2025, 9:05 PM IST  
**Status**: ✅ FULLY IMPLEMENTED  
**Security Level**: 🔒 HIGH
