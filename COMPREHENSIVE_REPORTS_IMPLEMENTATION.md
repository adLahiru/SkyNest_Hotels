# Comprehensive Reports Implementation

## Overview
Implemented five comprehensive reports for Admin and Manager dashboards with advanced filtering, statistics, and analytics capabilities.

---

## 1. Room Occupancy Report

### Description
Comprehensive room occupancy analysis for selected date periods with detailed room-by-room breakdown and occupancy statistics.

### Endpoint
```
GET /api/dashboard/reports/room-occupancy
```

### Access Control
- **Admin**: All branches
- **Manager**: Not implemented (Admin only)

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | Date | Yes | Start date of the period (YYYY-MM-DD) |
| endDate | Date | Yes | End date of the period (YYYY-MM-DD) |
| branchId | UUID | No | Filter by specific branch |

### Response Structure
```json
{
  "success": true,
  "message": "Room occupancy report retrieved successfully",
  "data": {
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "occupancyData": [
      {
        "branch_id": "uuid",
        "branch_name": "Downtown Branch",
        "room_id": "uuid",
        "room_no": 101,
        "floor_no": 1,
        "room_type": "Deluxe",
        "capacity": 2,
        "room_state": "occupied",
        "booking_id": "uuid",
        "checking_datetime": "2024-01-15",
        "checkout_datetime": "2024-01-20",
        "booking_status": "CHECKED_IN",
        "guest_name": "John Doe",
        "days_occupied": 5
      }
    ],
    "occupancyStats": [
      {
        "branch_id": "uuid",
        "branch_name": "Downtown Branch",
        "total_rooms": 50,
        "occupied_rooms": 35,
        "occupancy_rate": 70.00
      }
    ]
  }
}
```

### Features
- ✅ Date range filtering
- ✅ Branch-specific filtering
- ✅ Room-by-room occupancy details
- ✅ Guest information
- ✅ Days occupied calculation
- ✅ Occupancy rate percentage
- ✅ Branch-wise statistics

### Use Cases
1. **Seasonal Analysis**: Compare occupancy across different seasons
2. **Revenue Planning**: Identify low-occupancy periods for promotions
3. **Room Utilization**: Track which rooms are most/least used
4. **Capacity Planning**: Determine if more rooms needed

---

## 2. Guest Billing Summary

### Description
Comprehensive billing report showing all guest bookings with payment status, including unpaid and partially paid balances.

### Endpoint
```
GET /api/dashboard/reports/guest-billing
```

### Access Control
- **Admin**: All branches
- **Manager**: Their branch only

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| branchId | UUID | No | Filter by specific branch (Admin only) |

### Response Structure
```json
{
  "success": true,
  "message": "Guest billing summary retrieved successfully",
  "data": {
    "billingData": [
      {
        "booking_id": "uuid",
        "user_id": "uuid",
        "guest_name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "branch_name": "Downtown Branch",
        "room_no": 101,
        "checking_datetime": "2024-01-15",
        "checkout_datetime": "2024-01-20",
        "booking_status": "CHECKED_OUT",
        "total_amount": 1500.00,
        "amount_paid": 1000.00,
        "unpaid_balance": 500.00,
        "payment_method": "CREDIT_CARD",
        "payment_date": "2024-01-15",
        "payment_status": "PARTIALLY_PAID"
      }
    ],
    "summary": {
      "total_bookings": 150,
      "total_billed": 225000.00,
      "total_paid": 200000.00,
      "total_unpaid": 25000.00,
      "unpaid_count": 10,
      "partially_paid_count": 15,
      "fully_paid_count": 125
    }
  }
}
```

### Payment Status Values
- **UNPAID**: No payment received
- **PARTIALLY_PAID**: Partial payment received
- **FULLY_PAID**: Full payment received

### Features
- ✅ Priority sorting (unpaid first, then partially paid, then fully paid)
- ✅ Detailed guest contact information
- ✅ Payment breakdown
- ✅ Summary statistics
- ✅ Branch filtering for managers
- ✅ Outstanding balance tracking

### Use Cases
1. **Collection Management**: Identify guests with outstanding balances
2. **Cash Flow Analysis**: Track payment collection rates
3. **Follow-up Actions**: Generate list for payment reminders
4. **Financial Reporting**: Reconcile accounts receivable

---

## 3. Service Usage Breakdown

### Description
Detailed analysis of service usage with filtering by room and service type, including revenue breakdown.

### Endpoint
```
GET /api/dashboard/reports/service-usage
```

### Access Control
- **Admin**: All branches
- **Manager**: Their branch only

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| branchId | UUID | No | Filter by specific branch |
| roomId | UUID | No | Filter by specific room |
| serviceType | String | No | Filter by service type |

### Response Structure
```json
{
  "success": true,
  "message": "Service usage breakdown retrieved successfully",
  "data": {
    "serviceUsageData": [
      {
        "service_id": "uuid",
        "service_name": "Room Service - Breakfast",
        "service_type": "FOOD",
        "service_charge": 25.00,
        "branch_name": "Downtown Branch",
        "room_no": 101,
        "booking_id": "uuid",
        "guest_name": "John Doe",
        "quantity": 2,
        "usage_date": "2024-01-16 08:30:00",
        "total_charge": 50.00
      }
    ],
    "usageStats": [
      {
        "service_type": "FOOD",
        "usage_count": 150,
        "total_quantity": 300,
        "total_revenue": 7500.00
      },
      {
        "service_type": "LAUNDRY",
        "usage_count": 80,
        "total_quantity": 120,
        "total_revenue": 1200.00
      }
    ]
  }
}
```

### Service Types
- **FOOD**: Room service, restaurant
- **LAUNDRY**: Laundry and dry cleaning
- **SPA**: Spa and wellness services
- **TRANSPORT**: Airport transfers, car rental
- **OTHER**: Miscellaneous services

### Features
- ✅ Multi-level filtering (branch, room, service type)
- ✅ Detailed usage records
- ✅ Service type aggregation
- ✅ Revenue analysis
- ✅ Guest-specific tracking
- ✅ Quantity tracking

### Use Cases
1. **Service Optimization**: Identify most/least popular services
2. **Revenue Diversification**: Track non-room revenue streams
3. **Inventory Management**: Plan for service demand
4. **Staff Allocation**: Schedule staff based on service patterns

---

## 4. Monthly Revenue Per Branch

### Description
Comprehensive monthly revenue report showing room and service charges breakdown with month-over-month growth analysis.

### Endpoint
```
GET /api/dashboard/reports/monthly-revenue
```

### Access Control
- **Admin**: All branches
- **Manager**: Their branch only

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| year | Number | No | Year (defaults to current year) |
| month | Number | No | Month 1-12 (defaults to current month) |
| branchId | UUID | No | Filter by specific branch (Admin only) |

### Response Structure
```json
{
  "success": true,
  "message": "Monthly revenue per branch retrieved successfully",
  "data": {
    "period": {
      "year": 2024,
      "month": 1
    },
    "revenueData": [
      {
        "branch_id": "uuid",
        "branch_name": "Downtown Branch",
        "address": "123 Main St",
        "total_bookings": 85,
        "room_revenue": 127500.00,
        "service_revenue": 18500.00,
        "total_revenue": 146000.00,
        "avg_booking_value": 1717.65,
        "previous_month_revenue": 135000.00,
        "revenue_growth_percent": "8.15"
      }
    ]
  }
}
```

### Features
- ✅ Room and service revenue breakdown
- ✅ Month-over-month comparison
- ✅ Growth percentage calculation
- ✅ Average booking value
- ✅ Branch ranking by revenue
- ✅ Historical comparison

### Use Cases
1. **Performance Tracking**: Monitor branch performance trends
2. **Budget Planning**: Compare actual vs projected revenue
3. **Incentive Programs**: Reward high-performing branches
4. **Strategic Planning**: Identify growth opportunities

---

## 5. Top-Used Services & Customer Preferences

### Description
Analytics report showing most popular services, customer preferences, and usage trends across all branches.

### Endpoint
```
GET /api/dashboard/reports/top-services
```

### Access Control
- **Admin**: All branches (full data)
- **Manager**: All branches (full data) - for competitive analysis

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | Date | No | Filter by start date |
| endDate | Date | No | Filter by end date |
| limit | Number | No | Number of top services (default: 10) |

### Response Structure
```json
{
  "success": true,
  "message": "Top-used services and trends retrieved successfully",
  "data": {
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "topServicesByUsage": [
      {
        "service_id": "uuid",
        "service_name": "Room Service - Breakfast",
        "service_type": "FOOD",
        "charge": 25.00,
        "usage_count": 245,
        "total_quantity": 380,
        "total_revenue": 9500.00,
        "unique_customers": 180,
        "avg_quantity_per_booking": 1.55
      }
    ],
    "topServicesByRevenue": [
      {
        "service_id": "uuid",
        "service_name": "Airport Transfer - Premium",
        "service_type": "TRANSPORT",
        "charge": 75.00,
        "total_revenue": 15000.00,
        "usage_count": 200
      }
    ],
    "serviceUsageByBranch": [
      {
        "branch_id": "uuid",
        "branch_name": "Downtown Branch",
        "service_type": "FOOD",
        "usage_count": 150,
        "total_quantity": 250,
        "total_revenue": 6250.00
      }
    ],
    "serviceTypePreferences": [
      {
        "service_type": "FOOD",
        "booking_count": 450,
        "customer_count": 320,
        "total_quantity": 680,
        "total_revenue": 17000.00,
        "usage_percentage": 45.50
      }
    ]
  }
}
```

### Features
- ✅ Dual ranking (by usage and by revenue)
- ✅ Branch-wise service comparison
- ✅ Service type preference analysis
- ✅ Unique customer tracking
- ✅ Usage percentage calculation
- ✅ Average quantity per booking
- ✅ Date range filtering

### Use Cases
1. **Menu Optimization**: Adjust service offerings based on popularity
2. **Pricing Strategy**: Optimize pricing for high-demand services
3. **Marketing Focus**: Promote popular services to increase revenue
4. **Cross-selling**: Bundle related services together
5. **Competitive Analysis**: Managers can see what works across branches

---

## Database Schema Requirements

### Required Tables
All reports use existing tables:
- `hotel_branches`
- `rooms`
- `room_types`
- `booking`
- `users`
- `payments`
- `services`
- `booking_service`
- `staff`

### Key Relationships
```sql
-- Bookings to Rooms to Branches
booking -> rooms -> hotel_branches

-- Bookings to Payments
booking -> payments

-- Bookings to Users (Guests)
booking -> users

-- Bookings to Services
booking -> booking_service -> services
```

---

## Frontend Integration Guide

### Service Layer
Create a new service file: `reportService.js`

```javascript
import apiClient from '../config/api';

const reportService = {
  // Room Occupancy Report
  getRoomOccupancy: async (startDate, endDate, branchId = null) => {
    try {
      const params = { startDate, endDate };
      if (branchId) params.branchId = branchId;
      
      const response = await apiClient.get('/dashboard/reports/room-occupancy', { params });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get room occupancy error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch room occupancy report',
        error,
      };
    }
  },

  // Guest Billing Summary
  getGuestBilling: async (branchId = null) => {
    try {
      const params = branchId ? { branchId } : {};
      const response = await apiClient.get('/dashboard/reports/guest-billing', { params });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get guest billing error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch guest billing summary',
        error,
      };
    }
  },

  // Service Usage Breakdown
  getServiceUsage: async (filters = {}) => {
    try {
      const response = await apiClient.get('/dashboard/reports/service-usage', { params: filters });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get service usage error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch service usage breakdown',
        error,
      };
    }
  },

  // Monthly Revenue Per Branch
  getMonthlyRevenue: async (year = null, month = null, branchId = null) => {
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;
      if (branchId) params.branchId = branchId;
      
      const response = await apiClient.get('/dashboard/reports/monthly-revenue', { params });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get monthly revenue error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch monthly revenue report',
        error,
      };
    }
  },

  // Top Services
  getTopServices: async (startDate = null, endDate = null, limit = 10) => {
    try {
      const params = { limit };
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      
      const response = await apiClient.get('/dashboard/reports/top-services', { params });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get top services error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch top services report',
        error,
      };
    }
  },
};

export default reportService;
```

### Component Structure
Create a "Reports" tab in both Admin and Manager dashboards:

```
AdminDashboard/
├── Overview (existing)
├── Users (existing)
├── Branches (existing)
├── Rooms (existing)
├── Room Types (existing)
└── Reports (new)
    ├── Room Occupancy
    ├── Guest Billing
    ├── Service Usage
    ├── Monthly Revenue
    └── Top Services
```

---

## API Testing Examples

### 1. Room Occupancy Report
```bash
curl -X GET \
  'http://localhost:8084/api/dashboard/reports/room-occupancy?startDate=2024-01-01&endDate=2024-01-31' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 2. Guest Billing Summary
```bash
curl -X GET \
  'http://localhost:8084/api/dashboard/reports/guest-billing' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 3. Service Usage Breakdown
```bash
curl -X GET \
  'http://localhost:8084/api/dashboard/reports/service-usage?serviceType=FOOD' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 4. Monthly Revenue Per Branch
```bash
curl -X GET \
  'http://localhost:8084/api/dashboard/reports/monthly-revenue?year=2024&month=1' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 5. Top Services
```bash
curl -X GET \
  'http://localhost:8084/api/dashboard/reports/top-services?limit=10' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## Performance Considerations

### Optimization Strategies
1. **Indexing**: Ensure proper indexes on:
   - `booking.checking_datetime`
   - `booking.checkout_datetime`
   - `booking.booking_status`
   - `payments.payment_date`
   - `booking_service.date_time`

2. **Caching**: Consider caching report results for:
   - Monthly revenue (cache for 1 hour)
   - Top services (cache for 30 minutes)

3. **Pagination**: For large datasets, implement pagination:
   - Guest billing (limit 100 per page)
   - Service usage (limit 50 per page)

4. **Async Processing**: For very large date ranges:
   - Queue report generation
   - Send email when ready
   - Provide download link

---

## Security & Access Control

### Role-Based Access
| Report | Admin | Manager | Receptionist | Housekeeping |
|--------|-------|---------|--------------|--------------|
| Room Occupancy | ✅ All branches | ❌ | ❌ | ❌ |
| Guest Billing | ✅ All branches | ✅ Their branch | ❌ | ❌ |
| Service Usage | ✅ All branches | ✅ Their branch | ❌ | ❌ |
| Monthly Revenue | ✅ All branches | ✅ Their branch | ❌ | ❌ |
| Top Services | ✅ All branches | ✅ All branches | ❌ | ❌ |

### Data Protection
- ✅ JWT authentication required
- ✅ Role-based middleware
- ✅ Branch filtering for managers
- ✅ Sensitive data exclusion (passwords, tokens)
- ✅ SQL injection prevention (parameterized queries)

---

## Future Enhancements

### Potential Additions
1. **Export Functionality**
   - PDF export
   - Excel export
   - CSV export

2. **Scheduled Reports**
   - Daily/Weekly/Monthly email reports
   - Automated report generation

3. **Advanced Analytics**
   - Predictive occupancy forecasting
   - Revenue trend analysis
   - Customer segmentation

4. **Visualizations**
   - Charts and graphs
   - Heat maps for occupancy
   - Revenue dashboards

5. **Custom Reports**
   - User-defined report builder
   - Saved report templates
   - Scheduled custom reports

---

## Files Modified
- `/backend/src/controllers/dashboardController.ts` - Added 5 new report methods
- `/backend/src/routes/dashboardRoutes.ts` - Added 5 new routes

## Files to Create
- `/frontend/src/services/reportService.js` - Report API service
- `/frontend/src/components/Reports/` - Report components directory
