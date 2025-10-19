# 🎯 Pending Guests Management Feature

## Overview
This feature provides a dedicated interface for **Managers** and **Receptionists** to view all confirmed bookings awaiting check-in and process guest arrivals efficiently.

---

## 🌟 Key Features

### 1. **Pending Guests Dashboard**
- View all confirmed bookings that haven't been checked in yet
- Real-time booking status
- Search and filter capabilities
- Automatic room status update on check-in

### 2. **Smart Filtering**
- **All Pending**: View all confirmed bookings
- **Today**: Show only today's check-ins
- **Upcoming**: Show future check-ins
- **Search**: Filter by guest name, email, room number, or room type

### 3. **Check-in Process**
1. Guest arrives at hotel
2. Receptionist/Manager finds booking in Pending Guests
3. Click "Check In Guest" button
4. Confirm check-in
5. Room automatically marked as **OCCUPIED**
6. Booking status changes to **CHECKED_IN**

### 4. **Status Indicators**
- 🟢 **Check-in Today**: Green badge for today's arrivals
- 🔴 **Overdue Check-in**: Red badge for missed check-ins
- 🔵 **Upcoming**: Blue badge for future check-ins

---

## 📍 Access Points

### For Receptionists
**Location**: `Receptionist Dashboard`
- Click "**View Pending Guests**" button in the header
- Or navigate from the Pending Bookings section

### For Managers
**Location**: `Manager Dashboard`
- Navigate to "**Pending Guests**" tab
- Located between "Overview" and "Reports"

---

## 💻 User Interface

### Stats Cards
Shows at-a-glance information:
- **Total Pending**: Total number of confirmed bookings awaiting check-in
- **Check-ins Today**: Number of guests scheduled to check in today
- **Filtered Results**: Count of currently displayed bookings

### Guest Cards
Each pending guest card displays:
- **Guest Information**
  - Full name
  - Email address
  - Status badge (Today/Upcoming/Overdue)
  
- **Booking Details**
  - Room number and type
  - Check-in date and time
  - Check-out date and time
  - Number of guests
  - Branch location
  
- **Special Requests**
  - Highlighted in yellow if present
  - Shows any special requirements or notes
  
- **Actions**
  - Large "Check In Guest" button
  - Confirmation dialog before check-in
  - Real-time processing feedback

---

## 🔄 Workflow

### Guest Booking Flow
```
1. Guest creates booking (via website/app)
   ↓
2. Booking status: CONFIRMED
   ↓
3. Booking appears in "Pending Guests"
   ↓
4. Guest arrives at hotel
   ↓
5. Staff checks in guest
   ↓
6. Booking status: CHECKED_IN
   ↓
7. Room status: OCCUPIED
   ↓
8. Guest removed from "Pending Guests"
   ↓
9. Guest appears in "Current Guests"
```

### Check-in Process
```
Staff Action → API Call → Database Update → UI Update
     ↓            ↓              ↓            ↓
 Click        PATCH /api/    UPDATE         Room
 Check-In     bookings/:id/  booking        marked
 Button       checkin        + rooms        OCCUPIED
```

---

## 🔧 Technical Implementation

### Frontend Components

**1. PendingGuestsManager.js**
- Main component for pending guests interface
- Located: `/frontend/src/components/PendingGuestsManager.js`
- Features:
  - State management for bookings list
  - Search and filter logic
  - Check-in button handlers
  - Real-time UI updates

**2. Dashboard Integration**
- **ReceptionistDashboard.js**: Button in header
- **ManagerDashboard.js**: Tab in navigation
- View switching logic
- Seamless integration

### Backend API Endpoints

**1. Get Pending Bookings**
```http
GET /api/bookings?status=confirmed
Authorization: Bearer <token>
```
Returns all confirmed bookings for the user's branch

**2. Check-in Guest**
```http
PATCH /api/bookings/:booking_id/checkin
Authorization: Bearer <token>
```
- Updates booking status to `checked_in`
- Sets `checking_datetime` to NOW()
- Records staff member who processed check-in
- Triggers database trigger to update room status

**Response:**
```json
{
  "success": true,
  "message": "Check-in successful",
  "booking": { ... },
  "roomStatus": "occupied"
}
```

### Database Changes

**Automatic Room Status Update**
- Database trigger automatically sets room state to 'occupied'
- No manual room status update needed
- Ensures data consistency

**Booking Status Flow**
```
confirmed → checked_in → checked_out
```

**Room Status Flow**
```
available → occupied → available
```

---

## 🎨 UI/UX Features

### Visual Hierarchy
1. **Color-coded badges** for quick status identification
2. **Large action buttons** for easy click targets
3. **Card-based layout** for scannable information
4. **Responsive design** works on all screen sizes

### User Feedback
- **Loading states** during API calls
- **Confirmation dialogs** before actions
- **Success messages** with details
- **Error handling** with clear messages
- **Disabled states** prevent double-clicking

### Search & Filter
- **Live search** - updates as you type
- **One-click filters** for date ranges
- **Result counter** shows filtered count
- **Instant feedback** - no page reload

---

## 📊 Sample Data Display

### Example Pending Guest Card
```
┌─────────────────────────────────────────────────────────┐
│ John Doe Smith                    [Check-in Today] 🟢   │
│ ✉ john.doe@email.com                                    │
│                                                          │
│ 🛏 Room 101 - Deluxe Suite                              │
│ 📅 Check-in: Oct 25, 2025 - 2:00 PM                    │
│ 📅 Check-out: Oct 27, 2025 - 12:00 PM                  │
│ 👥 2 Guests                                             │
│ 📍 Colombo Branch                                       │
│                                                          │
│ ⚠️ Special Requests:                                    │
│    Late check-in requested (after 8 PM)                 │
│                                                          │
│ Booking ID: 039d2e39-e6e7-4d29-9d2d-532b946e9a0d       │
│                                                          │
│              [✓ Check In Guest]                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Access Control

### Permissions
- ✅ **ADMIN**: Full access to all branches
- ✅ **MANAGER**: Access to their branch only
- ✅ **RECEPTIONIST**: Access to their branch only
- ❌ **HOUSEKEEPING**: No access
- ❌ **GUEST**: No access

### Security
- JWT authentication required
- Branch-level access control
- Staff ID recorded for audit trail
- All actions logged

---

## 🚀 Usage Examples

### Scenario 1: Today's Check-ins
**Receptionist wants to see who's checking in today**
1. Open Receptionist Dashboard
2. Click "View Pending Guests"
3. Click "Today" filter button
4. See list of today's arrivals
5. Process check-ins as guests arrive

### Scenario 2: Searching for a Guest
**Guest calls to confirm booking**
1. Navigate to Pending Guests
2. Type guest name in search box
3. Booking appears instantly
4. Verify details with guest
5. Guest arrives → Click "Check In Guest"

### Scenario 3: Manager Overview
**Manager wants to monitor all pending check-ins**
1. Open Manager Dashboard
2. Click "Pending Guests" tab
3. See all confirmed bookings
4. View stats: Total Pending, Today's Check-ins
5. Monitor staff processing check-ins

---

## 📱 Responsive Design

### Desktop (1200px+)
- 3-column stats cards
- Full-width guest cards
- All filters in one row
- Large buttons

### Tablet (768px - 1199px)
- 2-column stats cards
- Responsive guest cards
- Filters may wrap
- Medium buttons

### Mobile (< 768px)
- 1-column layout
- Stacked cards
- Vertical filters
- Full-width buttons

---

## 🐛 Error Handling

### Common Errors & Solutions

**1. "Booking not found"**
- Booking may have been cancelled
- Refresh the page
- Check booking ID

**2. "Access denied"**
- User doesn't have permission for this branch
- Contact administrator

**3. "Cannot check in booking with status: checked_in"**
- Guest already checked in
- Refresh pending guests list

**4. "Room validation failed"**
- Room may be occupied by another booking
- Check room status
- Contact manager

---

## 🔄 Integration Points

### With Other Features
1. **Dashboard Stats**: Pending count updates automatically
2. **Room Management**: Room status syncs on check-in
3. **Current Guests**: Checked-in guests appear here
4. **Billing**: Ready for bill generation after check-in
5. **Reports**: Check-in data included in reports

---

## 📈 Benefits

### For Staff
- ⚡ **Faster check-ins** - One-click process
- 👀 **Better visibility** - See all pending arrivals
- 🔍 **Quick search** - Find bookings instantly
- ✅ **Fewer errors** - Automatic room updates

### For Management
- 📊 **Better planning** - See upcoming arrivals
- 👥 **Staff efficiency** - Monitor check-in process
- 📈 **Analytics** - Track check-in patterns
- 🎯 **Decision support** - Real-time occupancy

### For Guests
- ⏱️ **Faster service** - Quick check-in process
- ✓ **Accurate info** - Up-to-date booking details
- 💬 **Clear communication** - Special requests visible
- 🎉 **Better experience** - Smooth arrival process

---

## 🎯 Future Enhancements

### Planned Features
- [ ] **SMS notifications** for today's check-ins
- [ ] **Email confirmation** sent on check-in
- [ ] **QR code check-in** for guests
- [ ] **Batch check-in** for groups
- [ ] **Pre-check-in** via mobile app
- [ ] **ID verification** integration
- [ ] **Payment on check-in** option
- [ ] **Room upgrade** during check-in

---

## 📝 Testing Checklist

- [ ] Create a booking as guest
- [ ] Login as Receptionist
- [ ] Navigate to Pending Guests
- [ ] Search for guest by name
- [ ] Filter by "Today"
- [ ] Click "Check In Guest"
- [ ] Confirm check-in
- [ ] Verify room marked as occupied
- [ ] Verify booking removed from pending list
- [ ] Login as Manager
- [ ] Access Pending Guests tab
- [ ] Repeat check-in process
- [ ] Test with different branches

---

## 🆘 Support

### For Users
- Contact your system administrator
- Check user manual
- Training materials available

### For Developers
- See backend documentation: `/backend/src/controllers/bookingController.ts`
- Frontend component: `/frontend/src/components/PendingGuestsManager.js`
- API routes: `/backend/src/routes/bookingRoutes.ts`

---

**Feature Status**: ✅ **READY FOR TESTING**  
**Last Updated**: October 19, 2025  
**Version**: 1.0.0
