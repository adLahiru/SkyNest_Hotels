# 🎯 Current Guests Management Feature

## Overview
Complete guest management system for checked-in guests, allowing staff to add services and record payments manually.

---

## ✨ Features Implemented

### 1. **Current Guests Dashboard**
- ✅ View all checked-in guests (filtered by branch)
- ✅ Real-time guest information display
- ✅ Search guests by name, email, room number
- ✅ Beautiful card-based layout with guest details

### 2. **Add Services to Guest**
- ✅ Modal dialog to select service from catalogue
- ✅ Quantity selection
- ✅ Automatic price calculation
- ✅ Service charges added to guest's bill
- ✅ Real-time total display

### 3. **Manual Payment Recording**
- ✅ Receptionist can mark payments manually
- ✅ Multiple payment methods (Cash, Card, Transfer, etc.)
- ✅ Payment amount validation
- ✅ Transaction recording
- ✅ Automatic payment status update

### 4. **Guest Information Display**
For each checked-in guest:
- Guest name and email
- Room number and type
- Check-in and check-out dates
- Branch location
- Room charges breakdown
- Daily rate and total days
- Total bill amount

---

## 📁 Files Created

### Frontend Components:
1. **`/frontend/src/components/CurrentGuestsManager.js`** (700+ lines)
   - Main component for current guests management
   - Service addition modal
   - Payment marking modal
   - Search functionality

### Frontend Services:
2. **`/frontend/src/services/serviceService.js`** (140 lines)
   - API calls for service catalogue
   - Add service to booking
   - Get booking services

3. **`/frontend/src/services/paymentService.js`** (100 lines)
   - API calls for payment operations
   - Mark payment endpoint
   - Get payment details
   - Generate bill

### Backend Routes:
4. **`/backend/src/routes/serviceUsageRoutes.ts`** (28 lines)
   - Routes for service usage operations

### Backend Controllers:
5. **Enhanced `/backend/src/controllers/paymentController.ts`**
   - Added `markPayment` function (115 lines)
   
6. **Enhanced `/backend/src/controllers/serviceCatalogueController.ts`**
   - Added `addServiceToBooking` function (108 lines)
   - Added `getBookingServices` function (37 lines)

### Backend Routes Updated:
7. **`/backend/src/routes/paymentRoutes.ts`**
   - Added `/mark-payment` endpoint

8. **`/backend/src/routes/index.ts`**
   - Mounted `/service-usage` routes

### Dashboard Integration:
9. **`/frontend/src/components/ReceptionistDashboard.js`** - Updated
   - Added "Current Guests" button
   - View switching logic

10. **`/frontend/src/components/ManagerDashboard.js`** - Updated
    - Added "Current Guests" tab
    - Tab switching logic

---

## 🔧 Technical Implementation

### API Endpoints

#### 1. Service Usage Endpoints

**Add Service to Booking**
```http
POST /api/service-usage
Authorization: Bearer <token>
Content-Type: application/json

{
  "booking_id": "uuid",
  "service_id": "uuid",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Service added to booking successfully",
  "data": {
    "usage": {
      "usage_id": "uuid",
      "service_name": "Room Service",
      "quantity": 2,
      "unit_price": 25.00,
      "total": 50.00,
      "usage_date": "2025-10-19",
      "usage_time": "14:30:00"
    }
  }
}
```

**Get Booking Services**
```http
GET /api/service-usage/booking/:booking_id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Booking services retrieved successfully",
  "data": {
    "services": [...],
    "count": 3,
    "totalCharges": 125.50
  }
}
```

#### 2. Payment Endpoints

**Mark Payment (Manual Recording)**
```http
POST /api/payments/mark-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "booking_id": "uuid",
  "amount": 150.00,
  "payment_method": "cash"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "payment": {
      "payment_id": "uuid",
      "total_charges": 500.00,
      "amount_paid": 150.00,
      "due_amount": 350.00,
      "payment_status": "partial"
    },
    "transaction_id": "uuid"
  }
}
```

**Payment Methods Supported:**
- `cash`
- `credit_card`
- `debit_card`
- `bank_transfer`
- `mobile_payment`

---

## 🎬 User Workflows

### Workflow 1: Add Service to Guest

```
1. Staff opens Current Guests
   ↓
2. Finds checked-in guest
   ↓
3. Clicks "Add Service" button
   ↓
4. Modal opens with service catalogue
   ↓
5. Selects service (e.g., "Room Service")
   ↓
6. Enters quantity (e.g., 2)
   ↓
7. Sees total: 2 × $25.00 = $50.00
   ↓
8. Clicks "Add Service"
   ↓
9. Service added to database:
   - service_usage table updated
   - Guest's bill increased by $50.00
   ↓
10. Success message shown
    ↓
11. Modal closes
```

### Workflow 2: Mark Manual Payment

```
1. Guest arrives at front desk with cash
   ↓
2. Receptionist opens Current Guests
   ↓
3. Finds guest's booking
   ↓
4. Clicks "Mark Payment" button
   ↓
5. Modal opens
   ↓
6. Enters amount: $200.00
   ↓
7. Selects payment method: "Cash"
   ↓
8. Reviews info and clicks "Confirm Payment"
   ↓
9. Payment recorded in database:
   - payments table updated
   - payment_transactions table: new record
   - amount_paid increased
   - due_amount decreased
   - payment_status updated (paid/partial)
   ↓
10. Success message shown
    ↓
11. Modal closes
```

### Workflow 3: Search for Guest

```
1. Staff opens Current Guests
   ↓
2. Types in search box: "John"
   ↓
3. List filters in real-time
   ↓
4. Shows only guests matching "John"
   - In name
   - In email
   - In room number
   ↓
5. Staff finds the right guest
   ↓
6. Performs action (add service/mark payment)
```

---

## 🎨 UI Components

### Main Screen

**Stats Cards:**
- Total Current Guests
- Search Results Count
- Available Services Count

**Search Bar:**
- Real-time filtering
- Search by: name, email, room number, room type

**Guest Cards:**
Each card shows:
- Guest name and email
- Room details (number, type)
- Check-in and check-out dates
- Branch location
- Billing information:
  - Room charges
  - Total days
  - Daily rate
- Action buttons:
  - "Add Service"
  - "Mark Payment"

### Add Service Modal

**Components:**
- Guest information display
- Service dropdown (from catalogue)
- Quantity input
- Total calculation display
- Cancel button
- Add Service button (with loading state)

**Validation:**
- Service must be selected
- Quantity must be > 0
- Shows confirmation before adding

### Mark Payment Modal

**Components:**
- Guest information display
- Payment amount input
- Payment method dropdown
- Important notice
- Cancel button
- Confirm Payment button (with loading state)

**Validation:**
- Amount must be > 0
- Payment method required
- Confirmation dialog

---

## 📊 Database Schema

### Tables Used

**1. service_usage**
```sql
CREATE TABLE service_usage (
  usage_id CHAR(36) PRIMARY KEY,
  service_id CHAR(36),  -- FK to service_catalogue
  booking_id CHAR(36),  -- FK to booking
  usage_date DATE,
  usage_time TIME,
  quantity INT,
  total DECIMAL(10,2),
  created_at TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES service_catalogue(service_id),
  FOREIGN KEY (booking_id) REFERENCES booking(booking_id)
);
```

**2. payments**
```sql
CREATE TABLE payments (
  payment_id CHAR(36) PRIMARY KEY,
  booking_id CHAR(36),
  payment_date DATE,
  payment_method VARCHAR(50),
  total_charges DECIMAL(10,2),
  amount_paid DECIMAL(10,2),
  due_amount DECIMAL(10,2),
  payment_status ENUM('pending','paid','partial'),
  staff_id CHAR(36),
  created_at TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES booking(booking_id)
);
```

**3. payment_transactions**
```sql
CREATE TABLE payment_transactions (
  transaction_id CHAR(36) PRIMARY KEY,
  payment_id CHAR(36),
  booking_id CHAR(36),
  transaction_date DATETIME,
  amount DECIMAL(10,2),
  payment_method VARCHAR(50),
  processed_by_staff_id CHAR(36),
  created_at TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(payment_id)
);
```

---

## 🔐 Access Control

### Who Can Access Current Guests?

| Role | Access | Services | Payments |
|------|--------|----------|----------|
| **ADMIN** | All branches | ✅ Add | ✅ Mark |
| **MANAGER** | Own branch only | ✅ Add | ✅ Mark |
| **RECEPTIONIST** | Own branch only | ✅ Add | ✅ Mark |
| **HOUSEKEEPING** | ❌ No access | ❌ | ❌ |
| **GUEST** | Own bookings only | ❌ | ❌ |

### Branch Filtering
- Automatic in backend
- Uses JWT token's `branch_id`
- No manual filtering needed in frontend

---

## 🧪 Testing Guide

### Test 1: View Current Guests

```
1. Login as Receptionist (branch: Colombo)
2. Click "Current Guests" button
3. Should see only Colombo checked-in guests
4. Login as Manager (branch: Kandy)
5. Go to "Current Guests" tab
6. Should see only Kandy checked-in guests
```

**Expected:** Branch-wise isolation working

### Test 2: Add Service

```
1. Open Current Guests
2. Click "Add Service" on any guest
3. Select "Room Service" (or any service)
4. Enter quantity: 2
5. Verify total calculation
6. Click "Add Service"
7. Check database:
   - service_usage table has new record
   - booking_id matches
   - total = unit_price × quantity
```

**Expected:** Service added successfully

### Test 3: Mark Payment

```
1. Open Current Guests
2. Click "Mark Payment" on any guest
3. Enter amount: 100.00
4. Select method: "cash"
5. Click "Confirm Payment"
6. Check database:
   - payments table updated:
     - amount_paid increased
     - due_amount decreased
     - payment_status updated
   - payment_transactions table:
     - new transaction record
     - amount = 100.00
     - processed_by_staff_id set
```

**Expected:** Payment recorded successfully

### Test 4: Search Functionality

```
1. Open Current Guests (with multiple guests)
2. Type "john" in search
3. Verify only matching guests shown
4. Clear search
5. Verify all guests shown again
```

**Expected:** Search works in real-time

---

## 🐛 Error Handling

### Common Errors

**1. "Service not found or not active"**
- Service doesn't exist in catalogue
- Service is deactivated
- Solution: Use active service only

**2. "Valid payment amount is required"**
- Amount is 0 or negative
- Amount is not a number
- Solution: Enter valid positive number

**3. "Booking not found"**
- Booking ID doesn't exist
- Booking was deleted
- Solution: Refresh guest list

**4. "Access denied"**
- User trying to access wrong branch
- User lacks permissions
- Solution: Check user's branch and role

---

## 📱 Responsive Design

### Desktop (1200px+)
- 3-column stats cards
- Full-width guest cards
- Side-by-side action buttons
- Large modals

### Tablet (768px - 1199px)
- 2-column stats cards
- Responsive guest cards
- Wrapped buttons if needed
- Medium modals

### Mobile (< 768px)
- 1-column layout
- Stacked cards
- Full-width buttons
- Full-screen modals

---

## 🚀 Future Enhancements

### Planned Features:
- [ ] **Bulk operations** - Add service to multiple guests
- [ ] **Service history** - View all services for a guest
- [ ] **Payment history** - View all payment transactions
- [ ] **Print receipts** - Generate payment receipts
- [ ] **Service categories filter** - Filter services by category
- [ ] **Auto-refresh** - WebSocket for real-time updates
- [ ] **Service suggestions** - Popular services shortcut
- [ ] **Quick payment** - Predefined amounts (Full/Half/etc.)

---

## 📞 Support

### For Users:
- Open Current Guests from dashboard
- Use search to find specific guests
- Add services as requested by guests
- Mark payments when guests pay

### For Developers:
- **Frontend Component**: `/frontend/src/components/CurrentGuestsManager.js`
- **Backend Controllers**: 
  - `/backend/src/controllers/paymentController.ts`
  - `/backend/src/controllers/serviceCatalogueController.ts`
- **API Routes**: 
  - `/backend/src/routes/paymentRoutes.ts`
  - `/backend/src/routes/serviceUsageRoutes.ts`

---

## ✅ Testing Checklist

- [ ] Backend server restarted
- [ ] Frontend compiled without errors
- [ ] Current Guests visible for Receptionist
- [ ] Current Guests visible for Manager
- [ ] Search functionality works
- [ ] Add Service modal opens
- [ ] Service list populated from catalogue
- [ ] Service quantity validates
- [ ] Service total calculates correctly
- [ ] Service added to database
- [ ] Mark Payment modal opens
- [ ] Payment amount validates
- [ ] Payment methods available
- [ ] Payment recorded in database
- [ ] Transaction created in payment_transactions
- [ ] Branch filtering working
- [ ] No cross-branch access

---

**Status**: ✅ COMPLETE & READY FOR TESTING  
**Version**: 1.0.0  
**Date**: October 19, 2025, 9:30 PM IST

**Restart backend server and test the features!** 🎉
