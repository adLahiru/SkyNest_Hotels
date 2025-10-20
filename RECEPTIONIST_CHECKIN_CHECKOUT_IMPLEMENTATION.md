# Receptionist Check-in/Check-out Implementation

## Overview
Added functional check-in and check-out buttons for the Receptionist Dashboard, allowing receptionists to manage guest check-ins and check-outs directly from their dashboard.

## Changes Made

### 1. **dashboardService.js** - Added Check-in/Check-out Methods

Added two new service methods to handle check-in and check-out operations:

```javascript
/**
 * Check-in a guest
 * @param {string} bookingId - The booking ID to check in
 * @returns {Promise} Response with check-in result
 */
checkInGuest: async (bookingId) => {
  try {
    const response = await apiClient.patch(`/bookings/${bookingId}/checkin`);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message || 'Guest checked in successfully',
    };
  } catch (error) {
    console.error('Check-in guest error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to check in guest',
      error,
    };
  }
}

/**
 * Check-out a guest
 * @param {string} bookingId - The booking ID to check out
 * @returns {Promise} Response with check-out result
 */
checkOutGuest: async (bookingId) => {
  try {
    const response = await apiClient.patch(`/bookings/${bookingId}/checkout`);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message || 'Guest checked out successfully',
    };
  } catch (error) {
    console.error('Check-out guest error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to check out guest',
      error,
    };
  }
}
```

**Backend Endpoints Used:**
- `PATCH /api/bookings/:booking_id/checkin` - Check in a guest
- `PATCH /api/bookings/:booking_id/checkout` - Check out a guest

### 2. **ReceptionistDashboard.js** - Added Handlers and Enhanced UI

#### Added State Management
```javascript
const [processingBooking, setProcessingBooking] = useState(null);
```
- Tracks which booking is currently being processed
- Prevents double-clicks and shows loading state

#### Added Check-in Handler
```javascript
const handleCheckIn = async (bookingId) => {
  setProcessingBooking(bookingId);
  try {
    const result = await dashboardService.checkInGuest(bookingId);
    if (result.success) {
      await fetchDashboardStats(); // Refresh dashboard
      alert('Guest checked in successfully!');
    } else {
      alert(result.message || 'Failed to check in guest');
    }
  } catch (error) {
    console.error('Error checking in guest:', error);
    alert('Failed to check in guest. Please try again.');
  } finally {
    setProcessingBooking(null);
  }
};
```

#### Added Check-out Handler
```javascript
const handleCheckOut = async (bookingId) => {
  setProcessingBooking(bookingId);
  try {
    const result = await dashboardService.checkOutGuest(bookingId);
    if (result.success) {
      await fetchDashboardStats(); // Refresh dashboard
      alert('Guest checked out successfully!');
    } else {
      alert(result.message || 'Failed to check out guest');
    }
  } catch (error) {
    console.error('Error checking out guest:', error);
    alert('Failed to check out guest. Please try again.');
  } finally {
    setProcessingBooking(null);
  }
};
```

#### Enhanced Check-in Button (Today's Check-ins Table)
- **Shows when**: Booking status is 'confirmed' (case-insensitive)
- **Features**:
  - Loading spinner during processing
  - Disabled state while processing
  - Green button with hover effect
  - Success/error alerts

```javascript
{(booking.status === 'CONFIRMED' || booking.status === 'confirmed') && (
  <button 
    onClick={() => handleCheckIn(booking.booking_id)}
    disabled={processingBooking === booking.booking_id}
    className={`flex items-center px-3 py-1 text-white text-sm rounded transition-colors ${
      processingBooking === booking.booking_id
        ? 'bg-gray-400 cursor-not-allowed'
        : 'bg-green-600 hover:bg-green-700'
    }`}
  >
    {processingBooking === booking.booking_id ? (
      <>
        <div className="w-4 h-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        Processing...
      </>
    ) : (
      <>
        <CheckCircle className="w-4 h-4 mr-1" />
        Check In
      </>
    )}
  </button>
)}
```

#### Enhanced Check-out Button (Today's Check-outs Table)
- **Shows when**: Booking status is 'checked_in' (case-insensitive)
- **Features**:
  - Loading spinner during processing
  - Disabled state while processing
  - Orange button with hover effect
  - Success/error alerts

```javascript
{(booking.status === 'CHECKED_IN' || booking.status === 'checked_in') && (
  <button 
    onClick={() => handleCheckOut(booking.booking_id)}
    disabled={processingBooking === booking.booking_id}
    className={`flex items-center px-3 py-1 text-white text-sm rounded transition-colors ${
      processingBooking === booking.booking_id
        ? 'bg-gray-400 cursor-not-allowed'
        : 'bg-orange-600 hover:bg-orange-700'
    }`}
  >
    {processingBooking === booking.booking_id ? (
      <>
        <div className="w-4 h-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        Processing...
      </>
    ) : (
      <>
        <CheckCircle className="w-4 h-4 mr-1" />
        Check Out
      </>
    )}
  </button>
)}
```

#### Fixed Status Checking
Updated status comparisons to handle both uppercase and lowercase values:
- Database stores: `'confirmed'`, `'checked_in'`, `'checked_out'`, `'cancelled'`
- Now checks for both cases: `booking.status === 'CONFIRMED' || booking.status === 'confirmed'`

## Features

### Check-in Flow
1. Receptionist sees bookings with status "confirmed" in Today's Check-ins table
2. "Check In" button appears in Actions column
3. Click button → Shows loading state
4. Backend updates booking status to "checked_in"
5. Room status automatically updated to "occupied" (via database trigger)
6. Dashboard refreshes automatically
7. Success message displayed

### Check-out Flow
1. Receptionist sees bookings with status "checked_in" in Today's Check-outs table
2. "Check Out" button appears in Actions column
3. Click button → Shows loading state
4. Backend updates booking status to "checked_out"
5. Room status automatically updated to "available" (via database trigger)
6. Bill calculation triggered automatically (via database trigger)
7. Dashboard refreshes automatically
8. Success message displayed

## Database Status Values
```sql
booking_status ENUM('confirmed', 'cancelled', 'checked_in', 'checked_out')
```

## UI States

### Button States
1. **Normal**: Green (check-in) / Orange (check-out) with hover effect
2. **Processing**: Gray background with spinner + "Processing..." text
3. **Disabled**: Cursor not allowed, gray background

### Status Badges
- **Confirmed**: Green badge (bg-green-100, text-green-800)
- **Checked In**: Blue badge (bg-blue-100, text-blue-800)
- **Checked Out**: Gray badge (bg-gray-100, text-gray-800)
- **Other**: Yellow badge (bg-yellow-100, text-yellow-800)

## Error Handling
- Service layer catches and returns errors gracefully
- User-friendly error messages via alerts
- Console logging for debugging
- Processing state reset in finally block

## Auto-refresh
After successful check-in or check-out:
- Dashboard statistics automatically refresh
- Updated data displayed immediately
- No manual page reload required

## Testing Checklist

### Check-in Testing
- [ ] Button shows only for 'confirmed' bookings
- [ ] Loading state displays during processing
- [ ] Success message shows after check-in
- [ ] Booking moves from check-ins to current guests
- [ ] Room status changes to 'occupied'
- [ ] Dashboard statistics update

### Check-out Testing
- [ ] Button shows only for 'checked_in' bookings
- [ ] Loading state displays during processing
- [ ] Success message shows after check-out
- [ ] Booking disappears from current guests
- [ ] Room status changes to 'available'
- [ ] Bill calculation completes
- [ ] Dashboard statistics update

### Error Testing
- [ ] Network error handling
- [ ] Invalid booking ID handling
- [ ] Permission error handling
- [ ] Double-click prevention

## Backend Dependencies
This feature relies on existing backend infrastructure:
- ✅ `PATCH /api/bookings/:booking_id/checkin` endpoint
- ✅ `PATCH /api/bookings/:booking_id/checkout` endpoint
- ✅ Database triggers for room status updates
- ✅ Database triggers for bill calculation
- ✅ Authentication middleware

## Future Enhancements
- Replace alerts with toast notifications
- Add confirmation dialogs before check-in/check-out
- Show booking details in a modal before action
- Add partial payment handling for check-out
- Add reason field for early check-out
- Add ability to extend booking during check-out

## Files Modified
1. `frontend/src/services/dashboardService.js` - Added checkInGuest and checkOutGuest methods
2. `frontend/src/components/ReceptionistDashboard.js` - Added handlers and enhanced buttons

## Date
October 20, 2025
