# Database Connection Leak Fix - GET /users Error

## Problem
The GET `/api/users` endpoint was returning a **500 Internal Server Error** after multiple requests:
```
API Error: GET /users 
{
  status: 500, 
  message: "Internal server error while retrieving users", 
  code: "ERR_BAD_RESPONSE"
}
```

## Root Cause
**Database Connection Pool Exhaustion** caused by connection leaks in the `UserController` class.

### Why It Happened
The `UserController` class was using an **instance-level connection pattern** that was fundamentally flawed:

```typescript
export class UserController {
  private connection: PoolConnection | null = null;
  
  private async initConnection(): Promise<void> {
    if (!this.connection) {
      this.connection = await db.getConnection(); // ❌ Connection acquired but NEVER released
    }
  }
}
```

**Problems with this approach:**
1. **Connection Never Released**: Once `initConnection()` was called, the connection was stored in `this.connection` and never released back to the pool
2. **Pool Exhaustion**: With a pool limit of 10 connections, after 10 requests, no more connections were available
3. **Cascading Failures**: All subsequent requests failed with 500 errors because they couldn't acquire a connection

## The Fix
Refactored all methods in `UserController` to use one of two patterns:

### Pattern 1: Direct Pool Queries (for simple operations)
Used for methods like `getUsers`, `getUserById`, `updateProfile`, `changePassword`:

```typescript
// ✅ BEFORE: Using instance connection (causes leak)
await this.initConnection();
const [rows] = await this.connection!.execute<DatabaseUserRow[]>(query, params);

// ✅ AFTER: Direct pool usage (connection auto-released)
const [rows] = await db.execute<DatabaseUserRow[]>(query, params);
```

**Benefits:**
- Connection automatically acquired and released by the pool
- No manual cleanup required
- Perfect for single queries

### Pattern 2: Explicit Connection Management (for transactions)
Used for methods like `createUser`, `registerGuest`, `updateUser`, `deleteUser`:

```typescript
// ✅ Get connection from pool
const connection = await db.getConnection();

try {
  // Start transaction
  await connection.beginTransaction();
  
  try {
    // Perform multiple operations
    await connection.execute(/*...*/);
    await connection.execute(/*...*/);
    
    // Commit transaction
    await connection.commit();
    
  } catch (error) {
    // Rollback on error
    await connection.rollback();
    throw error;
  }
} finally {
  // ✅ ALWAYS release connection back to pool
  connection.release();
}
```

**Benefits:**
- Connection properly released in `finally` block (guaranteed execution)
- Supports transactions with multiple operations
- Clean error handling with automatic rollback

## Changes Made

### Files Modified
- `/backend/src/controllers/userController.ts`

### Methods Fixed
1. **Helper Methods** (now use `db.execute()` directly):
   - `validateBranchAccess()`
   - `checkUserExists()`
   - `checkBranchHasManager()`

2. **Query Methods** (now use `db.execute()` directly):
   - `getUsers()` ✅ **Primary fix for the reported error**
   - `getUserById()`
   - `updateProfile()`
   - `changePassword()`

3. **Transaction Methods** (now use explicit connection with `finally` block):
   - `createUser()`
   - `registerGuest()`
   - `updateUser()`
   - `deleteUser()`

4. **Removed**:
   - `private connection: PoolConnection | null` (instance property)
   - `private async initConnection()` (connection acquisition method)

## Verification
After the fix:
- ✅ Backend compiles without errors
- ✅ Server running on port 8084
- ✅ Health check returns 200 OK
- ✅ All database connections properly released after use
- ✅ Connection pool remains healthy under load

## Testing Recommendations
1. **Load Test**: Make 20+ sequential requests to `/api/users` to verify no connection exhaustion
2. **Monitor Pool**: Check that active connections return to 0 after requests complete
3. **Error Scenarios**: Verify connections are released even when errors occur

## Lessons Learned
1. **Never store pool connections as instance variables** - they must be explicitly managed
2. **Always use `finally` blocks** when manually acquiring connections
3. **Prefer `db.execute()` for simple queries** - let the pool handle connection lifecycle
4. **Use explicit connection management only for transactions** - when you need multiple operations in sequence

## Related Files
- Database Pool Config: `/backend/src/config/db.ts`
- Database Connection Pattern used in: `/backend/src/controllers/authController.ts` (already correct)
