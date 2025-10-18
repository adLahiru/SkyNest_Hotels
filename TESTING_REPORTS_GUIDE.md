# Testing Reports Guide

## 🧪 How to Test the Implemented Reports

All five reports are now live and ready for testing. Here's a step-by-step guide to test each report.

---

## Prerequisites

### 1. Get Authentication Token

**Login as Admin:**
```bash
curl -X POST http://localhost:8084/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your-admin-password"
  }'
```

**Save the token from response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Set token as environment variable:**
```bash
export JWT_TOKEN="your-token-here"
```

---

## Test 1: Room Occupancy Report 📊

### Test Case 1.1: Basic Request (Last 30 Days)
```bash
curl -X GET \
  "http://localhost:8084/api/dashboard/reports/room-occupancy?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Room occupancy report retrieved successfully",
  "data": {
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "occupancyData": [...],
    "occupancyStats": [...]
  }
}
```

### Test Case 1.2: With Branch Filter
```bash
curl -X GET \
  "http://localhost:8084/api/dashboard/reports/room-occupancy?startDate=2024-01-01&endDate=2024-01-31&branchId=YOUR_BRANCH_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.data.occupancyStats'
```

### Test Case 1.3: Missing Required Parameters (Should Fail)
```bash
curl -X GET \
  "http://localhost:8084/api/dashboard/reports/room-occupancy" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Start date and end date are required"
}
```

**Validation Checklist:**
- [ ] Returns occupancy data for specified period
- [ ] Calculates occupancy rate correctly
- [ ] Shows room-by-room details
- [ ] Includes guest information
- [ ] Validates required parameters

---

## Test 2: Guest Billing Summary 💰

### Test Case 2.1: All Branches (Admin)
```bash
curl -X GET \
  "http://localhost:8084/api/dashboard/reports/guest-billing" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Guest billing summary retrieved successfully",
  "data": {
    "billingData": [...],
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

### Test Case 2.2: Filter by Payment Status
```bash
# Check for unpaid records (should be sorted first)
curl -X GET \
  "http://localhost:8084/api/dashboard/reports/guest-billing" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.data.billingData[0].payment_status'
```

**Expected:** Should return `"UNPAID"` or `"PARTIALLY_PAID"` (priority sorting)

### Test Case 2.3: Specific Branch
```bash
curl -X GET \
  "http://localhost:8084/api/dashboard/reports/guest-billing?branchId=YOUR_BRANCH_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.data.summary'
```

**Validation Checklist:**
- [ ] Shows all booking records
- [ ] Calculates unpaid balances correctly
- [ ] Priority sorts (unpaid first)
- [ ] Includes guest contact information
- [ ] Summary statistics accurate

---

## Test 3: Service Usage Breakdown 🛎️

### Test Case 3.1: All Services
```bash
curl -X GET \
  "http://localhost:8084/api/dashboard/reports/service-usage" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.'
```

### Test Case 3.2: Filter by Service Type
```bash
# Food services only
curl -X GET \
  "http://localhost:8084/api/dashboard/reports/service-usage?serviceType=FOOD" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.data.usageStats'
```

### Test Case 3.3: Filter by Room
```bash
curl -X GET \
  "http://localhost:8084/api/dashboard/reports/service-usage?roomId=YOUR_ROOM_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.data.serviceUsageData'
```

### Test Case 3.4: Multiple Filters
```bash
curl -X GET \
  "http://localhost:8084/api/dashboard/reports/service-usage?branchId=YOUR_BRANCH_ID&serviceType=LAUNDRY" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.data.usageStats'
```

**Validation Checklist:**
- [ ] Returns service usage records
- [ ] Filters by service type work
- [ ] Filters by room work
- [ ] Calculates revenue correctly
- [ ] Shows usage statistics

---

## Test 4: Monthly Revenue Per Branch 📈

### Test Case 4.1: Current Month (Auto-defaults)
```bash
curl -X GET \
  "http://localhost:8084/api/dashboard/reports/monthly-revenue" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.'
```

### Test Case 4.2: Specific Month and Year
```bash
curl -X GET \
  "http://localhost:8084/api/dashboard/reports/monthly-revenue?year=2024&month=1" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.data.revenueData'
```

**Expected Response:**
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
        "branch_id": "...",
        "branch_name": "Downtown Branch",
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

### Test Case 4.3: Check Growth Calculation
```bash
# Get current month revenue
curl -X GET \
  "http://localhost:8084/api/dashboard/reports/monthly-revenue?year=2024&month=2" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.data.revenueData[0] | {branch_name, total_revenue, previous_month_revenue, revenue_growth_percent}'
```

**Validation Checklist:**
- [ ] Returns revenue breakdown
- [ ] Separates room and service revenue
- [ ] Calculates growth percentage
- [ ] Shows average booking value
- [ ] Ranks by total revenue

---

## Test 5: Top-Used Services 🏆

### Test Case 5.1: Top 10 Services (Default)
```bash
curl -X GET \
  "http://localhost:8084/api/dashboard/reports/top-services" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Top-used services and trends retrieved successfully",
  "data": {
    "period": {
      "period": "All Time"
    },
    "topServicesByUsage": [...],
    "topServicesByRevenue": [...],
    "serviceUsageByBranch": [...],
    "serviceTypePreferences": [...]
  }
}
```

### Test Case 5.2: Top 20 Services
```bash
curl -X GET \
  "http://localhost:8084/api/dashboard/reports/top-services?limit=20" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.data.topServicesByUsage | length'
```

**Expected:** Should return `20` or less

### Test Case 5.3: Date Range Filter
```bash
curl -X GET \
  "http://localhost:8084/api/dashboard/reports/top-services?startDate=2024-01-01&endDate=2024-01-31&limit=5" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.data | {period, topServicesByUsage: .topServicesByUsage[0:3]}'
```

### Test Case 5.4: Service Type Preferences
```bash
curl -X GET \
  "http://localhost:8084/api/dashboard/reports/top-services" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.data.serviceTypePreferences'
```

**Validation Checklist:**
- [ ] Returns top services by usage count
- [ ] Returns top services by revenue
- [ ] Shows branch-wise comparison
- [ ] Calculates service type preferences
- [ ] Usage percentage sums to 100%

---

## Authorization Testing 🔐

### Test Case A1: Without Token (Should Fail)
```bash
curl -X GET \
  "http://localhost:8084/api/dashboard/reports/guest-billing"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "No token provided"
}
```

### Test Case A2: Invalid Token (Should Fail)
```bash
curl -X GET \
  "http://localhost:8084/api/dashboard/reports/guest-billing" \
  -H "Authorization: Bearer invalid-token-here"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### Test Case A3: Manager Access (Room Occupancy - Should Fail)
```bash
# Login as manager first
MANAGER_TOKEN=$(curl -s -X POST http://localhost:8084/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "manager", "password": "manager-password"}' \
  | jq -r '.token')

# Try to access admin-only report
curl -X GET \
  "http://localhost:8084/api/dashboard/reports/room-occupancy?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Admin access required"
}
```

---

## Performance Testing ⚡

### Test P1: Large Date Range
```bash
time curl -X GET \
  "http://localhost:8084/api/dashboard/reports/room-occupancy?startDate=2023-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -o /dev/null -s -w "Time: %{time_total}s\n"
```

**Expected:** < 2 seconds for moderate data

### Test P2: Concurrent Requests
```bash
# Run 5 concurrent requests
for i in {1..5}; do
  curl -X GET \
    "http://localhost:8084/api/dashboard/reports/guest-billing" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -o /dev/null -s -w "Request $i: %{time_total}s\n" &
done
wait
```

---

## Data Validation Tests ✓

### Test D1: Verify Revenue Calculations
```bash
# Get monthly revenue
REVENUE=$(curl -s -X GET \
  "http://localhost:8084/api/dashboard/reports/monthly-revenue?year=2024&month=1" \
  -H "Authorization: Bearer $JWT_TOKEN")

# Extract and verify
echo $REVENUE | jq '.data.revenueData[0] | {
  branch: .branch_name,
  room_revenue: .room_revenue,
  service_revenue: .service_revenue,
  total_revenue: .total_revenue,
  calculated_total: (.room_revenue + .service_revenue)
}'
```

**Verify:** `total_revenue` should equal `room_revenue + service_revenue`

### Test D2: Verify Payment Status Logic
```bash
# Get billing data
curl -s -X GET \
  "http://localhost:8084/api/dashboard/reports/guest-billing" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.data.billingData[0] | {
    total: .total_amount,
    paid: .amount_paid,
    unpaid: .unpaid_balance,
    status: .payment_status,
    calculated_unpaid: (.total_amount - .amount_paid)
  }'
```

**Verify:** 
- `unpaid_balance` = `total_amount - amount_paid`
- Status logic:
  - `amount_paid = 0` → UNPAID
  - `0 < amount_paid < total_amount` → PARTIALLY_PAID
  - `amount_paid >= total_amount` → FULLY_PAID

### Test D3: Verify Occupancy Rate
```bash
curl -s -X GET \
  "http://localhost:8084/api/dashboard/reports/room-occupancy?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.data.occupancyStats[0] | {
    branch: .branch_name,
    total_rooms: .total_rooms,
    occupied_rooms: .occupied_rooms,
    occupancy_rate: .occupancy_rate,
    calculated_rate: ((.occupied_rooms / .total_rooms) * 100)
  }'
```

**Verify:** `occupancy_rate` matches `(occupied_rooms / total_rooms) * 100`

---

## Integration Test Script 🔄

Create a test script: `test-reports.sh`

```bash
#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Get token
echo "Getting authentication token..."
TOKEN=$(curl -s -X POST http://localhost:8084/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"temppwd"}' \
  | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to get token${NC}"
  exit 1
fi

echo "Token obtained successfully"
echo ""

# Test 1: Room Occupancy
echo "Test 1: Room Occupancy Report..."
RESULT=$(curl -s -X GET \
  "http://localhost:8084/api/dashboard/reports/room-occupancy?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.success')

if [ "$RESULT" == "true" ]; then
  echo -e "${GREEN}✓ Passed${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ Failed${NC}"
  ((FAILED++))
fi

# Test 2: Guest Billing
echo "Test 2: Guest Billing Summary..."
RESULT=$(curl -s -X GET \
  "http://localhost:8084/api/dashboard/reports/guest-billing" \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.success')

if [ "$RESULT" == "true" ]; then
  echo -e "${GREEN}✓ Passed${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ Failed${NC}"
  ((FAILED++))
fi

# Test 3: Service Usage
echo "Test 3: Service Usage Breakdown..."
RESULT=$(curl -s -X GET \
  "http://localhost:8084/api/dashboard/reports/service-usage" \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.success')

if [ "$RESULT" == "true" ]; then
  echo -e "${GREEN}✓ Passed${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ Failed${NC}"
  ((FAILED++))
fi

# Test 4: Monthly Revenue
echo "Test 4: Monthly Revenue Per Branch..."
RESULT=$(curl -s -X GET \
  "http://localhost:8084/api/dashboard/reports/monthly-revenue" \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.success')

if [ "$RESULT" == "true" ]; then
  echo -e "${GREEN}✓ Passed${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ Failed${NC}"
  ((FAILED++))
fi

# Test 5: Top Services
echo "Test 5: Top-Used Services..."
RESULT=$(curl -s -X GET \
  "http://localhost:8084/api/dashboard/reports/top-services" \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.success')

if [ "$RESULT" == "true" ]; then
  echo -e "${GREEN}✓ Passed${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ Failed${NC}"
  ((FAILED++))
fi

# Summary
echo ""
echo "================================"
echo "Test Summary:"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "================================"
```

**Run the script:**
```bash
chmod +x test-reports.sh
./test-reports.sh
```

---

## Visual Verification ✅

### Using Browser/Postman

1. **Import to Postman:**
   - Create new collection: "SkyNest Reports"
   - Add 5 requests (one for each report)
   - Set Authorization header: `Bearer {{token}}`

2. **Test each endpoint:**
   - Verify response structure
   - Check data accuracy
   - Validate calculations

3. **Save successful responses:**
   - Compare with expected structures
   - Document any discrepancies

---

## Troubleshooting Guide 🔧

### Issue: "No token provided"
**Solution:** Ensure Authorization header is set correctly
```bash
-H "Authorization: Bearer YOUR_TOKEN"
```

### Issue: "Invalid token"
**Solution:** Token might be expired, get a new one

### Issue: Empty data arrays
**Solution:** Database might not have data for the specified period

### Issue: 500 Internal Server Error
**Solution:** 
1. Check backend logs
2. Verify database connection
3. Check if all required tables exist

---

## Test Completion Checklist ✓

### Functional Testing
- [ ] All 5 reports return success
- [ ] Required parameters validated
- [ ] Optional parameters work
- [ ] Filters work correctly
- [ ] Calculations are accurate

### Security Testing
- [ ] Authentication required
- [ ] Role-based access enforced
- [ ] SQL injection prevented
- [ ] Branch restriction for managers works

### Performance Testing
- [ ] Response time < 2 seconds
- [ ] Handles concurrent requests
- [ ] Large datasets handled properly

### Data Validation
- [ ] Revenue calculations correct
- [ ] Payment status logic correct
- [ ] Occupancy rate correct
- [ ] Growth percentage correct

---

## Next Steps After Testing ✨

1. ✅ Verify all tests pass
2. ✅ Document any issues found
3. ✅ Fix critical bugs if any
4. ✅ Begin frontend UI development
5. ✅ Integrate with dashboard
6. ✅ User acceptance testing

---

**Happy Testing! 🎉**
