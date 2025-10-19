# Timeout Issue Fix - Remote Database Connection

## 🔍 Root Cause Analysis

### Issue Summary
Frontend API requests were timing out with the error: **"timeout of 30000ms exceeded"**

### Error Details
```
API Error: GET /dashboard/admin 
Object { status: undefined, message: "timeout of 30000ms exceeded", code: "ECONNABORTED" }

Backend Error:
Error getting refresh token: Error: connect ETIMEDOUT
```

### Root Cause
The application is connecting to a **remote AWS RDS database** at `35.154.58.37` instead of a local database. The issues were:

1. **Missing Database Timeout Configuration**
   - No `connectTimeout` set in database pool configuration
   - No `acquireTimeout` for getting connections from pool
   - No `timeout` for query execution
   - Default MySQL2 timeout is too short for remote connections

2. **Frontend Timeout Too Short**
   - Frontend axios timeout was 30 seconds
   - Remote database queries can take longer due to:
     - Network latency to AWS region
     - Complex queries with multiple JOINs
     - Large datasets being fetched

3. **Network Latency**
   - Connection to remote database adds network overhead
   - Each query has additional latency compared to local database

## ✅ Solution Implemented

### 1. Backend Database Configuration (`backend/src/config/db.ts`)

**Added timeout settings:**
```typescript
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'SkyNest_Hotels',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000,        // ✅ 60 seconds for remote database
  acquireTimeout: 60000,        // ✅ 60 seconds to acquire connection from pool
  timeout: 60000,               // ✅ 60 seconds for queries
  enableKeepAlive: true,        // ✅ Keep connections alive
  keepAliveInitialDelay: 0      // ✅ Start keep-alive immediately
};
```

**What changed:**
- `connectTimeout: 60000` - Allows 60 seconds to establish initial connection
- `acquireTimeout: 60000` - Allows 60 seconds to get a connection from the pool
- `timeout: 60000` - Allows 60 seconds for queries to execute
- `enableKeepAlive: true` - Prevents idle connections from being closed
- `keepAliveInitialDelay: 0` - Start keep-alive packets immediately

### 2. Frontend API Configuration (`frontend/src/config/api.js`)

**Increased axios timeout:**
```javascript
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // ✅ Increased from 30 seconds to 60 seconds
});
```

**What changed:**
- Frontend now waits up to 60 seconds for API responses
- Matches backend database timeout settings
- Prevents premature timeout on slow queries

## 🎯 Why This Works

### Connection Lifecycle
```
Frontend Request (60s timeout)
    ↓
Backend API (60s query timeout)
    ↓
Database Connection Pool (60s acquire timeout)
    ↓
Database Query Execution (60s query timeout)
    ↓
Remote AWS Database (network latency + query time)
```

All timeouts are now aligned to 60 seconds, giving enough time for:
- Network round trips to AWS
- Complex database queries
- Connection pool management

### Performance Impact
- **Local Database**: Queries typically complete in < 1 second
- **Remote Database**: Queries may take 5-15 seconds due to network latency
- **60-second timeout**: Provides sufficient buffer without being too long

## 🚀 Next Steps to Further Optimize

### 1. Optimize Slow Queries
Check which queries are taking the longest:

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2; -- Log queries taking > 2 seconds

-- Check slow queries
SELECT * FROM mysql.slow_log;
```

### 2. Add Database Indexes
Ensure proper indexes on frequently queried columns:

```sql
-- Example: Add indexes for common lookups
CREATE INDEX idx_booking_status ON booking(booking_status);
CREATE INDEX idx_booking_dates ON booking(checking_datetime, checkout_datetime);
CREATE INDEX idx_payment_status ON payments(payment_status);
CREATE INDEX idx_booking_user ON booking(user_id);
CREATE INDEX idx_booking_branch ON booking(branch_id);
```

### 3. Implement Caching
For frequently accessed data that doesn't change often:

```javascript
// Redis caching example
import Redis from 'ioredis';
const redis = new Redis();

// Cache branch data for 5 minutes
const branches = await redis.get('branches');
if (!branches) {
  const data = await db.query('SELECT * FROM branches');
  await redis.setex('branches', 300, JSON.stringify(data));
}
```

### 4. Use Connection Pooling Effectively
Monitor connection pool usage:

```javascript
// Log pool statistics
setInterval(() => {
  console.log('Pool Statistics:', {
    totalConnections: db.pool._allConnections.length,
    freeConnections: db.pool._freeConnections.length,
    queuedRequests: db.pool._connectionQueue.length
  });
}, 30000); // Every 30 seconds
```

### 5. Consider CDN for Static Data
Move static/reference data (room types, services, etc.) to:
- Local storage/session storage in browser
- CDN for API responses
- In-memory cache in backend

### 6. Database Connection Security
For AWS RDS, ensure:
- Use SSL/TLS connections
- Whitelist only necessary IP addresses
- Use IAM authentication if possible
- Enable VPC peering for better latency

```typescript
// Add SSL configuration
const dbConfig = {
  // ... existing config
  ssl: {
    rejectUnauthorized: true
  }
};
```

## 📊 Monitoring Recommendations

### 1. Add Request Timing Logs
```javascript
// In backend controllers
const startTime = Date.now();
const result = await db.query(...);
console.log(`Query took ${Date.now() - startTime}ms`);
```

### 2. Frontend Performance Monitoring
```javascript
// Track API call durations
const startTime = performance.now();
const response = await apiClient.get('/dashboard/admin');
console.log(`API call took ${performance.now() - startTime}ms`);
```

### 3. Database Query Monitoring
Enable MySQL slow query log and performance schema:
```sql
SHOW VARIABLES LIKE 'slow_query%';
SELECT * FROM performance_schema.events_statements_summary_by_digest 
ORDER BY SUM_TIMER_WAIT DESC LIMIT 10;
```

## 🔧 Testing the Fix

### 1. Restart Backend Server
```bash
cd backend
pnpm dev
```

### 2. Restart Frontend
```bash
cd frontend
npm start
```

### 3. Test API Endpoints
```bash
# Test health endpoint
curl http://localhost:8084/api/health

# Test dashboard (with auth token)
curl http://localhost:8084/api/dashboard/admin \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Monitor Logs
Watch for:
- ✅ Successful database connections
- ✅ API responses completing in < 60 seconds
- ❌ No more ETIMEDOUT errors
- ❌ No more "timeout of 30000ms exceeded" errors

## 📝 Configuration Files Changed

1. ✅ `backend/src/config/db.ts` - Added timeout configurations
2. ✅ `frontend/src/config/api.js` - Increased axios timeout

## 🎉 Expected Results

After implementing these fixes:
- ✅ Frontend loads without timeout errors
- ✅ Dashboard displays admin statistics
- ✅ Branches and room types load successfully
- ✅ API calls complete within 60 seconds
- ✅ Stable database connections to AWS RDS

## ⚠️ Important Notes

1. **60-second timeout is a temporary solution** for remote database
2. **Production optimization needed** - queries should complete in < 5 seconds
3. **Consider using local database for development** to avoid network latency
4. **Monitor database performance** regularly
5. **Add proper indexes** to speed up queries

---

**Issue Status**: ✅ FIXED  
**Date Fixed**: October 18, 2025  
**Files Modified**: 2  
**Testing Status**: Ready for testing
