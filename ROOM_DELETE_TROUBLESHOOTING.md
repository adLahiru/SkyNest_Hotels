# Room Delete Error Troubleshooting Guide

## Issue
Error occurs when trying to delete a room from the Admin Dashboard.

## Backend Analysis ✅

The backend `deleteRoom` function in `roomController.ts` (lines 702-788) is properly implemented with:

1. **Authentication Check**: Requires at least Manager role
2. **Authorization Check**: Managers can only delete rooms in their branch
3. **Existence Check**: Verifies room exists before deletion
4. **Constraint Check**: Prevents deletion if room has associated bookings
5. **Transaction Safety**: Uses database transactions for data integrity

### Deletion Logic:
```typescript
// Line 702-788
export const deleteRoom = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // 1. Check user role (Manager or Admin)
  // 2. Verify room exists
  // 3. Check branch permissions
  // 4. Check for associated bookings
  // 5. Delete room
  // 6. Return success response
}
```

### Common Error Scenarios:

#### 1. **403 Forbidden - Insufficient Role**
```json
{
  "success": false,
  "message": "Access denied. Only administrators and managers can delete rooms."
}
```
**Solution**: User must be logged in as Admin or Manager

#### 2. **404 Not Found - Room Doesn't Exist**
```json
{
  "success": false,
  "message": "Room not found."
}
```
**Solution**: Verify room_id exists in database

#### 3. **403 Forbidden - Branch Permission**
```json
{
  "success": false,
  "message": "Access denied. Managers can only delete rooms in their own branch."
}
```
**Solution**: Manager trying to delete room outside their branch

#### 4. **409 Conflict - Has Bookings**
```json
{
  "success": false,
  "message": "Cannot delete room. It has associated bookings. Consider changing its state to maintenance instead."
}
```
**Solution**: Room has bookings - cannot delete (use maintenance state instead)

#### 5. **500 Internal Server Error**
```json
{
  "success": false,
  "message": "An error occurred while deleting the room.",
  "error": "Specific database error"
}
```
**Solution**: Database connection or query error

## Frontend Analysis ✅

The frontend delete handler in `AdminDashboard.js` (lines 587-616):

```javascript
const handleConfirmDeleteRoom = async () => {
  if (!selectedRoom) return;
  
  setLoadingRooms(true);
  
  const result = await roomService.deleteRoom(selectedRoom.room_id);
  
  if (result.success) {
    setShowDeleteRoomConfirmModal(false);
    setSelectedRoom(null);
    setTimeout(() => {
      fetchRooms();
      fetchDashboardStats();
    }, 500);
  } else {
    setRoomSubmitMessage({ type: 'error', text: result.message || 'Failed to delete room' });
  }
  
  setLoadingRooms(false);
};
```

The `roomService.deleteRoom()` in `roomService.js` (lines 168-181):

```javascript
deleteRoom: async (roomId) => {
  try {
    const response = await apiClient.delete(`/rooms/${roomId}`);
    return {
      success: response.data.success,
      message: response.data.message || 'Room deleted successfully',
    };
  } catch (error) {
    console.error('Delete room error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete room',
      error,
    };
  }
}
```

## Debugging Steps

### Step 1: Check Backend Server
```bash
# Verify backend is running
curl http://localhost:8084/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is healthy",
  "data": { ... }
}
```

### Step 2: Check Authentication
Open browser console and check:
```javascript
// Check if user is logged in
localStorage.getItem('accessToken')
localStorage.getItem('user')
```

### Step 3: Test Delete API Directly
```bash
# Get your access token from localStorage
TOKEN="your-access-token-here"

# Try to delete a room (replace ROOM_ID with actual ID)
curl -X DELETE http://localhost:8084/api/rooms/ROOM_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### Step 4: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Try to delete a room
4. Look for any error messages (red text)
5. Check the error object for details

### Step 5: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Try to delete a room
4. Click on the DELETE request to `/rooms/:room_id`
5. Check:
   - **Status Code**: 200 (success), 400 (bad request), 403 (forbidden), 404 (not found), 409 (conflict), 500 (server error)
   - **Response**: Look at the JSON response body
   - **Headers**: Verify Authorization header is present

### Step 6: Check Room Has No Bookings
```bash
# Check if room has bookings
mysql -u root -p'lahiru123' SkyNest_Hotels -e "
SELECT 
  r.room_id, 
  r.room_no, 
  COUNT(b.booking_id) as booking_count
FROM rooms r
LEFT JOIN bookings b ON r.room_id = b.room_id
WHERE r.room_id = YOUR_ROOM_ID
GROUP BY r.room_id;
"
```

If `booking_count > 0`, the room cannot be deleted.

## Common Fixes

### Fix 1: User Not Logged In or Token Expired
- **Symptom**: 401 Unauthorized error
- **Solution**: Log out and log back in to refresh token

### Fix 2: User Not Admin/Manager
- **Symptom**: 403 Forbidden with role message
- **Solution**: Log in with Admin or Manager account

### Fix 3: Room Has Bookings
- **Symptom**: 409 Conflict error
- **Solution**: 
  ```javascript
  // Instead of deleting, change room state to maintenance
  await roomService.updateRoom(roomId, { state: 'maintenance' });
  ```

### Fix 4: Manager Trying to Delete Room in Other Branch
- **Symptom**: 403 Forbidden with branch message
- **Solution**: 
  - Log in as Admin (can delete any room)
  - Or only delete rooms in your own branch

### Fix 5: Network Error
- **Symptom**: "Failed to delete room" generic error
- **Solution**: 
  - Check backend server is running: `http://localhost:8084`
  - Check network connection
  - Verify API_BASE_URL in frontend config

### Fix 6: CORS Error
- **Symptom**: CORS policy error in console
- **Solution**: Backend already has CORS enabled, but verify middleware is working

## Quick Test Commands

```bash
# 1. Check backend health
curl http://localhost:8084/api/health

# 2. List all rooms (requires auth)
curl http://localhost:8084/api/rooms \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Check if room exists
mysql -u root -p'lahiru123' SkyNest_Hotels -e "SELECT * FROM rooms WHERE room_id = YOUR_ROOM_ID;"

# 4. Check room bookings
mysql -u root -p'lahiru123' SkyNest_Hotels -e "SELECT COUNT(*) as bookings FROM bookings WHERE room_id = YOUR_ROOM_ID;"

# 5. Test delete (replace with actual token and room_id)
curl -X DELETE http://localhost:8084/api/rooms/YOUR_ROOM_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -v
```

## Expected Successful Response

When delete succeeds:
```json
{
  "success": true,
  "message": "Room deleted successfully.",
  "data": {
    "deleted_room_id": 123
  }
}
```

## Need More Help?

Please provide:
1. ✅ **Error message** from browser console
2. ✅ **HTTP status code** from Network tab
3. ✅ **User role** (Admin/Manager/Other)
4. ✅ **Room ID** you're trying to delete
5. ✅ **Response body** from the failed request

Example:
```
Error: Failed to delete room
Status: 409 Conflict
User: Manager (branch_id: B001)
Room ID: 5 (in branch B002)
Response: {"success":false,"message":"Access denied. Managers can only delete rooms in their own branch."}
```

This helps diagnose the exact issue!
