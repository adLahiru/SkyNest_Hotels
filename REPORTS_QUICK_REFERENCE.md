# Reports Quick Reference Guide

## Available Reports

### 📊 1. Room Occupancy Report
**Purpose**: Track room utilization across date periods  
**Access**: Admin only  
**Endpoint**: `GET /api/dashboard/reports/room-occupancy`

**Example Request:**
```javascript
const result = await reportService.getRoomOccupancy('2024-01-01', '2024-01-31', branchId);
```

**Key Metrics:**
- Total rooms per branch
- Occupied rooms count
- Occupancy rate percentage
- Days occupied per booking
- Guest details per room

**Best For:**
- Seasonal planning
- Identifying low-occupancy periods
- Room utilization analysis

---

### 💰 2. Guest Billing Summary
**Purpose**: Track payments and outstanding balances  
**Access**: Admin (all branches), Manager (their branch)  
**Endpoint**: `GET /api/dashboard/reports/guest-billing`

**Example Request:**
```javascript
const result = await reportService.getGuestBilling(branchId);
```

**Payment Statuses:**
- 🔴 **UNPAID**: No payment received
- 🟡 **PARTIALLY_PAID**: Partial payment received
- 🟢 **FULLY_PAID**: Full payment completed

**Key Metrics:**
- Total billed amount
- Total paid amount
- Outstanding balance
- Payment status breakdown

**Best For:**
- Collections management
- Cash flow tracking
- Payment reminders
- Financial reconciliation

---

### 🛎️ 3. Service Usage Breakdown
**Purpose**: Analyze service consumption patterns  
**Access**: Admin (all branches), Manager (their branch)  
**Endpoint**: `GET /api/dashboard/reports/service-usage`

**Example Request:**
```javascript
const result = await reportService.getServiceUsage({
  branchId: 'uuid',
  roomId: 'uuid',
  serviceType: 'FOOD'
});
```

**Service Types:**
- FOOD (Room service, restaurant)
- LAUNDRY (Cleaning services)
- SPA (Wellness services)
- TRANSPORT (Transfers, rentals)
- OTHER (Miscellaneous)

**Key Metrics:**
- Usage count by service type
- Total quantity consumed
- Revenue per service type
- Guest-specific usage

**Best For:**
- Service optimization
- Menu planning
- Inventory management
- Staff allocation

---

### 📈 4. Monthly Revenue Per Branch
**Purpose**: Track branch performance and growth  
**Access**: Admin (all branches), Manager (their branch)  
**Endpoint**: `GET /api/dashboard/reports/monthly-revenue`

**Example Request:**
```javascript
const result = await reportService.getMonthlyRevenue(2024, 1, branchId);
```

**Revenue Breakdown:**
- Room charges
- Service charges
- Total revenue
- Average booking value
- Month-over-month growth %

**Key Metrics:**
- Total bookings count
- Revenue by category
- Growth percentage
- Average transaction value

**Best For:**
- Performance tracking
- Budget vs actual analysis
- Growth monitoring
- Strategic planning

---

### 🏆 5. Top Services & Trends
**Purpose**: Identify popular services and preferences  
**Access**: Admin & Manager (all branches data)  
**Endpoint**: `GET /api/dashboard/reports/top-services`

**Example Request:**
```javascript
const result = await reportService.getTopServices('2024-01-01', '2024-01-31', 10);
```

**Rankings:**
- **By Usage**: Most frequently ordered
- **By Revenue**: Highest revenue generators

**Key Metrics:**
- Usage count
- Total quantity
- Total revenue
- Unique customers
- Usage percentage
- Branch-wise comparison

**Best For:**
- Menu optimization
- Pricing strategy
- Marketing focus
- Cross-selling opportunities
- Competitive analysis

---

## Common Use Cases

### 📅 Weekly Operations Review
**Reports to Run:**
1. Room Occupancy (last 7 days)
2. Guest Billing (unpaid filter)
3. Top Services (last 7 days)

### 📊 Monthly Business Review
**Reports to Run:**
1. Monthly Revenue (current month)
2. Room Occupancy (current month)
3. Service Usage (current month)
4. Guest Billing (all statuses)
5. Top Services (current month)

### 💡 Strategic Planning
**Reports to Run:**
1. Room Occupancy (last 12 months, by quarter)
2. Monthly Revenue (trend analysis)
3. Top Services (identify trends)

### 💰 Financial Reconciliation
**Reports to Run:**
1. Guest Billing (all branches)
2. Monthly Revenue (completed bookings)
3. Service Usage (revenue verification)

---

## Filter Combinations

### Room Occupancy
```javascript
// All branches, specific period
getRoomOccupancy('2024-01-01', '2024-01-31')

// Specific branch, specific period
getRoomOccupancy('2024-01-01', '2024-01-31', 'branch-uuid')
```

### Guest Billing
```javascript
// All branches (Admin only)
getGuestBilling()

// Specific branch
getGuestBilling('branch-uuid')
```

### Service Usage
```javascript
// All services, all branches
getServiceUsage({})

// Food services only
getServiceUsage({ serviceType: 'FOOD' })

// Specific room
getServiceUsage({ roomId: 'room-uuid' })

// Specific branch and service type
getServiceUsage({ 
  branchId: 'branch-uuid',
  serviceType: 'LAUNDRY' 
})
```

### Monthly Revenue
```javascript
// Current month, all branches
getMonthlyRevenue()

// Specific month/year, all branches
getMonthlyRevenue(2024, 1)

// Specific branch, specific month
getMonthlyRevenue(2024, 1, 'branch-uuid')
```

### Top Services
```javascript
// All time, top 10
getTopServices()

// Specific period, top 20
getTopServices('2024-01-01', '2024-01-31', 20)

// Last quarter, top 15
getTopServices('2024-01-01', '2024-03-31', 15)
```

---

## Response Data Formats

### Dates
```javascript
// Input format (YYYY-MM-DD)
"2024-01-15"

// Output format (ISO 8601)
"2024-01-15T10:30:00.000Z"
```

### Currency
```javascript
// All amounts in decimal
1250.50  // $1,250.50
```

### Percentages
```javascript
// Occupancy rate
70.00  // 70%

// Growth rate
8.15   // 8.15%

// Usage percentage
45.50  // 45.5%
```

---

## Error Handling

### Common Errors

**400 Bad Request**
```json
{
  "success": false,
  "message": "Start date and end date are required"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "No token provided"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**500 Server Error**
```json
{
  "success": false,
  "message": "Failed to retrieve report"
}
```

### Handling in Frontend
```javascript
const result = await reportService.getRoomOccupancy(startDate, endDate);

if (result.success) {
  // Handle success
  const data = result.data;
} else {
  // Handle error
  console.error(result.message);
  showErrorNotification(result.message);
}
```

---

## Performance Tips

### 1. Date Range Selection
- ✅ **Optimal**: 1 month or less
- ⚠️ **Acceptable**: 3 months
- ❌ **Avoid**: More than 6 months

### 2. Filtering
- Always filter by branch when possible
- Use service type filters to reduce data
- Limit top services to 10-20 items

### 3. Caching
- Cache monthly revenue reports (1 hour)
- Cache top services (30 minutes)
- Refresh billing summary frequently (5 minutes)

### 4. Loading States
```javascript
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);

const fetchReport = async () => {
  setLoading(true);
  const result = await reportService.getRoomOccupancy(startDate, endDate);
  if (result.success) {
    setData(result.data);
  }
  setLoading(false);
};
```

---

## Testing Checklist

### Before Deployment
- [ ] Test all 5 reports with valid data
- [ ] Test with empty datasets
- [ ] Test with large date ranges
- [ ] Test branch filtering (admin)
- [ ] Test branch restriction (manager)
- [ ] Test error handling
- [ ] Test loading states
- [ ] Verify data accuracy
- [ ] Check response times
- [ ] Test export functionality (if implemented)

### User Acceptance Testing
- [ ] Admin can see all reports
- [ ] Manager can see allowed reports
- [ ] Manager sees only their branch data
- [ ] Filters work correctly
- [ ] Data matches expectations
- [ ] UI is responsive
- [ ] Export works (if implemented)

---

## Implementation Status

| Report | Backend | Routes | Service | Frontend UI |
|--------|---------|--------|---------|-------------|
| Room Occupancy | ✅ | ✅ | ✅ | ⏳ Pending |
| Guest Billing | ✅ | ✅ | ✅ | ⏳ Pending |
| Service Usage | ✅ | ✅ | ✅ | ⏳ Pending |
| Monthly Revenue | ✅ | ✅ | ✅ | ⏳ Pending |
| Top Services | ✅ | ✅ | ✅ | ⏳ Pending |

**Legend:**
- ✅ Complete
- ⏳ Pending
- ❌ Not Started

---

## Next Steps

### Phase 1: Basic UI (Current)
1. Create "Reports" tab in Admin Dashboard
2. Implement date pickers and filters
3. Display data in tables
4. Add loading states

### Phase 2: Enhanced UI
1. Add charts and visualizations
2. Implement export to PDF/Excel
3. Add print functionality
4. Create responsive mobile views

### Phase 3: Advanced Features
1. Scheduled reports (email)
2. Custom report builder
3. Report templates
4. Automated alerts

---

## Support & Documentation

- **Full Documentation**: `COMPREHENSIVE_REPORTS_IMPLEMENTATION.md`
- **API Reference**: Backend route comments in `dashboardRoutes.ts`
- **Examples**: This file (Quick Reference)
- **Code**: `dashboardController.ts` and `reportService.js`
