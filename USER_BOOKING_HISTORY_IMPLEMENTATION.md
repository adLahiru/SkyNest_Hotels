# User Booking History Implementation Guide

## Overview
This document provides a comprehensive guide to implementing the user booking history feature that displays all bookings made by a logged-in user in their profile page.

## Architecture

### Frontend Component: UserProfilePage.js
- **Location**: `frontend/src/components/UserProfilePage.js`
- **Purpose**: Displays user profile information and booking history
- **Key Feature**: Fetches and displays all bookings for the authenticated user

---

## Implementation Details

### 1. State Management

```javascript
// State for bookings
const [userBookings, setUserBookings] = useState([]);
const [isBookingsLoading, setIsBookingsLoading] = useState(true);
```

**State Variables:**
- `userBookings`: Array to store all booking records for the user
- `isBookingsLoading`: Boolean to manage loading state while fetching bookings

### 2. Data Fetching with useEffect

```javascript
useEffect(() => {
  const fetchUserBookings = async () => {
    setIsBookingsLoading(true);
    try {
      const result = await bookingService.getMyBookings();
      if (result.success) {
        setUserBookings(result.bookings);
      } else {
        setUserBookings([]);
      }
    } catch (error) {
      setUserBookings([]);
    } finally {
      setIsBookingsLoading(false);
    }
  };
  fetchUserBookings();
}, []);
```

**How It Works:**
1. **Automatic Fetch**: Runs once when component mounts (empty dependency array `[]`)
2. **Loading State**: Sets loading to true before API call
3. **API Call**: Calls `bookingService.getMyBookings()` which is an authenticated endpoint
4. **Success Handling**: Stores bookings in state if successful
5. **Error Handling**: Sets empty array if request fails
6. **Cleanup**: Sets loading to false in finally block

### 3. Booking Status Mapping

```javascript
// Map backend status to user-friendly label and color
let statusLabel = '';
let statusColor = '';
switch (booking.booking_status) {
  case 'confirmed':
    statusLabel = 'Confirmed';
    statusColor = 'bg-blue-100 text-blue-800';
    break;
  case 'checked_in':
    statusLabel = 'Checked In';
    statusColor = 'bg-green-100 text-green-800';
    break;
  case 'checked_out':
    statusLabel = 'Checked Out';
    statusColor = 'bg-gray-200 text-gray-800';
    break;
  case 'cancelled':
    statusLabel = 'Cancelled';
    statusColor = 'bg-red-100 text-red-800';
    break;
  default:
    statusLabel = booking.booking_status || 'Status';
    statusColor = 'bg-gray-100 text-gray-800';
}
```

**Status Types:**
| Backend Status | Display Label | Color Scheme |
|---------------|---------------|--------------|
| `confirmed` | Confirmed | Blue (bg-blue-100 text-blue-800) |
| `checked_in` | Checked In | Green (bg-green-100 text-green-800) |
| `checked_out` | Checked Out | Gray (bg-gray-200 text-gray-800) |
| `cancelled` | Cancelled | Red (bg-red-100 text-red-800) |
| Other | Status | Gray (bg-gray-100 text-gray-800) |

### 4. UI Rendering Logic

```javascript
{isBookingsLoading ? (
  <div className="text-center text-gray-500 py-6">Loading bookings...</div>
) : userBookings.length === 0 ? (
  <div className="text-center text-gray-400 py-6">No bookings found.</div>
) : (
  <div className="space-y-4">
    {userBookings.map((booking) => {
      // Render booking card
    })}
  </div>
)}
```

**Rendering States:**
1. **Loading**: Shows "Loading bookings..." message
2. **Empty**: Shows "No bookings found." when array is empty
3. **Data**: Maps through bookings array and renders each booking card

### 5. Booking Card Component

```javascript
<div key={booking.booking_id} className="border-l-4 border-amber-500 pl-4 py-2">
  {/* Header: Branch name and status */}
  <div className="flex justify-between items-start mb-1">
    <span className="font-medium text-sm">{booking.branch_name || 'Branch'}</span>
    <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>
      {statusLabel}
    </span>
  </div>
  
  {/* Room details */}
  <p className="text-xs text-gray-600 mb-1">
    Room: {booking.room_no || 'N/A'} | Type: {booking.room_type || 'N/A'}
  </p>
  
  {/* Check-in/out dates and total cost */}
  <div className="flex justify-between text-xs text-gray-500">
    <span>
      {booking.checking_datetime ? new Date(booking.checking_datetime).toLocaleDateString() : 'N/A'}
      {' '}to{' '}
      {booking.checkout_datetime ? new Date(booking.checkout_datetime).toLocaleDateString() : 'N/A'}
    </span>
    <span className="font-medium">
      {typeof booking.total_cost !== 'undefined' ? `LKR ${booking.total_cost}` : ''}
    </span>
  </div>
</div>
```

**Card Structure:**
- **Left Border**: Amber (brand color) for visual consistency
- **Header Row**: Branch name (left) and status badge (right)
- **Room Info**: Room number and room type in single line
- **Footer Row**: Date range (left) and total cost (right)

---

## Backend Service Integration

### Required Service: bookingService

**Location**: `frontend/src/services/bookingService.js`

**Method**: `getMyBookings()`

```javascript
/**
 * Get all bookings for the current authenticated user
 * @returns {Promise} Response with user's bookings
 */
getMyBookings: async () => {
  try {
    const response = await apiClient.get('/bookings/my-bookings');
    return {
      success: response.data.success,
      bookings: response.data.data || response.data.bookings || [],
      message: response.data.message,
    };
  } catch (error) {
    console.error('Get my bookings error:', error);
    return {
      success: false,
      bookings: [],
      message: error.response?.data?.message || 'Failed to fetch bookings',
      error,
    };
  }
}
```

**API Endpoint**: `GET /bookings/my-bookings`
- **Authentication**: Required (JWT token)
- **Response**: Array of booking objects

---

## Booking Object Structure

### Expected Fields from API

```javascript
{
  booking_id: number,           // Unique booking identifier
  booking_status: string,       // Status: confirmed, checked_in, checked_out, cancelled
  branch_name: string,          // Name of the branch/hotel
  room_no: string,              // Room number (e.g., "101", "201")
  room_type: string,            // Room type (e.g., "Deluxe", "Suite", "Standard")
  checking_datetime: string,    // ISO date string for check-in
  checkout_datetime: string,    // ISO date string for check-out
  total_cost: number,           // Total cost of booking in LKR
  number_of_guests: number,     // Number of guests (optional display)
  special_requests: string      // Special requests (optional display)
}
```

### Sample API Response

```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "booking_id": 12345,
      "booking_status": "confirmed",
      "branch_name": "Sky Nest Colombo",
      "room_no": "305",
      "room_type": "Deluxe Suite",
      "checking_datetime": "2025-10-25T14:00:00.000Z",
      "checkout_datetime": "2025-10-28T11:00:00.000Z",
      "total_cost": 45000,
      "number_of_guests": 2,
      "special_requests": "Late check-in"
    },
    {
      "booking_id": 12344,
      "booking_status": "checked_out",
      "branch_name": "Sky Nest Kandy",
      "room_no": "201",
      "room_type": "Standard Room",
      "checking_datetime": "2025-10-15T14:00:00.000Z",
      "checkout_datetime": "2025-10-18T11:00:00.000Z",
      "total_cost": 27000,
      "number_of_guests": 2,
      "special_requests": null
    }
  ]
}
```

---

## Complete Implementation Code

### Full Component Section

```javascript
import React, { useState, useEffect } from 'react';
import bookingService from '../services/bookingService';

const UserProfilePage = () => {
  // ... other state and logic ...

  // Booking history state
  const [userBookings, setUserBookings] = useState([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);

  // Fetch bookings on component mount
  useEffect(() => {
    const fetchUserBookings = async () => {
      setIsBookingsLoading(true);
      try {
        const result = await bookingService.getMyBookings();
        if (result.success) {
          setUserBookings(result.bookings);
        } else {
          setUserBookings([]);
        }
      } catch (error) {
        setUserBookings([]);
      } finally {
        setIsBookingsLoading(false);
      }
    };
    fetchUserBookings();
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">My Bookings</h3>
      
      {/* Loading State */}
      {isBookingsLoading ? (
        <div className="text-center text-gray-500 py-6">Loading bookings...</div>
      ) : userBookings.length === 0 ? (
        <div className="text-center text-gray-400 py-6">No bookings found.</div>
      ) : (
        <div className="space-y-4">
          {userBookings.map((booking) => {
            // Map backend status to user-friendly label and color
            let statusLabel = '';
            let statusColor = '';
            switch (booking.booking_status) {
              case 'confirmed':
                statusLabel = 'Confirmed';
                statusColor = 'bg-blue-100 text-blue-800';
                break;
              case 'checked_in':
                statusLabel = 'Checked In';
                statusColor = 'bg-green-100 text-green-800';
                break;
              case 'checked_out':
                statusLabel = 'Checked Out';
                statusColor = 'bg-gray-200 text-gray-800';
                break;
              case 'cancelled':
                statusLabel = 'Cancelled';
                statusColor = 'bg-red-100 text-red-800';
                break;
              default:
                statusLabel = booking.booking_status || 'Status';
                statusColor = 'bg-gray-100 text-gray-800';
            }
            
            return (
              <div key={booking.booking_id} className="border-l-4 border-amber-500 pl-4 py-2">
                {/* Header: Branch name and status */}
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm">{booking.branch_name || 'Branch'}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>
                
                {/* Room details */}
                <p className="text-xs text-gray-600 mb-1">
                  Room: {booking.room_no || 'N/A'} | Type: {booking.room_type || 'N/A'}
                </p>
                
                {/* Check-in/out dates and total cost */}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    {booking.checking_datetime ? new Date(booking.checking_datetime).toLocaleDateString() : 'N/A'}
                    {' '}to{' '}
                    {booking.checkout_datetime ? new Date(booking.checkout_datetime).toLocaleDateString() : 'N/A'}
                  </span>
                  <span className="font-medium">
                    {typeof booking.total_cost !== 'undefined' ? `LKR ${booking.total_cost}` : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
```

---

## Styling Classes Reference

### Tailwind CSS Classes Used

```css
/* Container */
.bg-white - White background
.rounded-3xl - Large rounded corners
.shadow-xl - Extra large shadow
.p-8 - Padding 2rem (32px)

/* Heading */
.text-lg - Large text size
.font-semibold - Semi-bold font weight
.text-gray-800 - Dark gray text
.mb-6 - Margin bottom 1.5rem

/* Loading/Empty States */
.text-center - Center aligned text
.text-gray-500 - Medium gray text
.text-gray-400 - Light gray text
.py-6 - Padding top/bottom 1.5rem

/* Booking Cards */
.space-y-4 - Vertical spacing 1rem between cards
.border-l-4 - Left border 4px width
.border-amber-500 - Amber colored border
.pl-4 - Padding left 1rem
.py-2 - Padding top/bottom 0.5rem

/* Status Badges */
.px-2 - Padding left/right 0.5rem
.py-1 - Padding top/bottom 0.25rem
.rounded-full - Fully rounded corners
.bg-blue-100 - Light blue background
.text-blue-800 - Dark blue text
(Similar for green, gray, red variants)

/* Text Sizes */
.text-xs - Extra small text
.text-sm - Small text
.font-medium - Medium font weight
```

---

## Key Features

### ✅ Authentication-Based
- Only shows bookings for the logged-in user
- Uses JWT token from authService automatically
- Secure endpoint that validates user identity

### ✅ Status Visualization
- Color-coded status badges for quick identification
- User-friendly status labels
- Clear visual hierarchy

### ✅ Comprehensive Information
- Branch/hotel name
- Room number and type
- Check-in and check-out dates
- Total cost in local currency (LKR)

### ✅ Error Handling
- Gracefully handles API failures
- Shows appropriate empty state
- Loading indicators for better UX

### ✅ Responsive Design
- Works on all screen sizes
- Compact card design for mobile
- Readable on desktop

---

## Integration Requirements

### 1. Service Import
```javascript
import bookingService from '../services/bookingService';
```

### 2. API Endpoint Setup
Backend must have:
- `GET /bookings/my-bookings` endpoint
- JWT authentication middleware
- Returns array of user's bookings with required fields

### 3. Date Formatting
Uses JavaScript's built-in `toLocaleDateString()` for date formatting:
```javascript
new Date(booking.checking_datetime).toLocaleDateString()
```

---

## Potential Enhancements

### 1. Pagination
For users with many bookings:
```javascript
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const bookingsPerPage = 5;
```

### 2. Filtering
Allow users to filter by status:
```javascript
const [statusFilter, setStatusFilter] = useState('all');
const filteredBookings = userBookings.filter(b => 
  statusFilter === 'all' || b.booking_status === statusFilter
);
```

### 3. Sorting
Sort by date (most recent first):
```javascript
const sortedBookings = [...userBookings].sort((a, b) => 
  new Date(b.checking_datetime) - new Date(a.checking_datetime)
);
```

### 4. Detailed View
Add click handler to show full booking details:
```javascript
const [selectedBooking, setSelectedBooking] = useState(null);
const handleBookingClick = (booking) => setSelectedBooking(booking);
```

### 5. Cancel Booking
Add cancel button for confirmed bookings:
```javascript
const handleCancelBooking = async (bookingId) => {
  await bookingService.cancelBooking(bookingId);
  fetchUserBookings(); // Refresh list
};
```

---

## Testing Scenarios

### Test Case 1: User with Bookings
1. Login as user with existing bookings
2. Navigate to profile page
3. ✅ Verify all bookings are displayed
4. ✅ Verify status colors are correct
5. ✅ Verify dates are formatted properly

### Test Case 2: New User (No Bookings)
1. Login as new user with no bookings
2. Navigate to profile page
3. ✅ Verify "No bookings found" message displays
4. ✅ No errors in console

### Test Case 3: Loading State
1. Login and navigate to profile
2. ✅ Verify loading spinner shows initially
3. ✅ Verify it disappears after data loads

### Test Case 4: API Error
1. Stop backend server
2. Login and navigate to profile
3. ✅ Verify error is handled gracefully
4. ✅ Shows empty state instead of crashing

### Test Case 5: Different Statuses
1. Create bookings with different statuses
2. Navigate to profile page
3. ✅ Verify each status has correct color
4. ✅ Verify labels are user-friendly

---

## Common Issues & Solutions

### Issue 1: Bookings Not Loading
**Symptom**: Always shows "No bookings found"
**Solution**: 
- Check API endpoint is correct
- Verify JWT token is being sent
- Check backend response format matches expected structure

### Issue 2: Dates Showing as "N/A"
**Symptom**: All dates show as N/A
**Solution**:
- Verify date fields are in ISO format from backend
- Check field names match (checking_datetime vs check_in_date)

### Issue 3: Wrong Status Colors
**Symptom**: Status badges have wrong colors
**Solution**:
- Verify status values match switch cases exactly
- Check for case sensitivity
- Add console.log to debug status values

### Issue 4: Component Re-renders
**Symptom**: Bookings fetched multiple times
**Solution**:
- Ensure useEffect has empty dependency array `[]`
- Don't call fetchUserBookings outside useEffect

---

## Backend Requirements

### Database Schema Reference
```sql
-- Booking table should have these fields
booking_id (INT, PRIMARY KEY)
user_id (INT, FOREIGN KEY)
room_id (INT, FOREIGN KEY)
branch_id (INT, FOREIGN KEY)
booking_status (ENUM: 'confirmed', 'checked_in', 'checked_out', 'cancelled')
checking_datetime (DATETIME)
checkout_datetime (DATETIME)
total_cost (DECIMAL)
number_of_guests (INT)
special_requests (TEXT, NULLABLE)
```

### API Endpoint Structure
```javascript
// GET /bookings/my-bookings
// Headers: Authorization: Bearer <JWT_TOKEN>

// Response Format:
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "booking_id": 123,
      "booking_status": "confirmed",
      "branch_name": "Sky Nest Colombo",
      "room_no": "305",
      "room_type": "Deluxe Suite",
      "checking_datetime": "2025-10-25T14:00:00.000Z",
      "checkout_datetime": "2025-10-28T11:00:00.000Z",
      "total_cost": 45000,
      "number_of_guests": 2,
      "special_requests": "Late check-in"
    }
  ]
}
```

---

## Summary

This implementation provides a clean, user-friendly way to display booking history with:
- **Clean UI**: Compact cards with essential information
- **Status Visualization**: Color-coded badges for quick status identification
- **Error Handling**: Graceful handling of loading, empty, and error states
- **Responsive**: Works well on all devices
- **Maintainable**: Clear code structure and easy to extend

The component can be easily integrated into any user profile page and customized to match your brand's design system.

---

## Quick Reference Checklist

- [ ] Import bookingService
- [ ] Add state for bookings and loading
- [ ] Create useEffect to fetch bookings on mount
- [ ] Implement status color mapping
- [ ] Render loading/empty/data states
- [ ] Style with Tailwind CSS classes
- [ ] Test with different user scenarios
- [ ] Verify backend API endpoint works
- [ ] Ensure JWT authentication is working
- [ ] Format dates correctly

---

**Document Version**: 1.0  
**Last Updated**: October 20, 2025  
**Implementation Status**: ✅ Complete and Tested
