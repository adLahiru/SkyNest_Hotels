# Database Migration Fixes - DELIMITER Issue Resolution

## Problem Overview

Database migrations were failing with SQL syntax errors when running `pnpm migrate:dev`. The error indicated issues with the `DELIMITER` command in MySQL/MariaDB stored procedures and triggers.

### Error Message
```
AssertionError [ERR_ASSERTION]: ifError got unwanted exception: 
You have an error in your SQL syntax; check the manual that corresponds 
to your MariaDB server version for the right syntax to use near 
'DELIMITER $$' at line 22
```

## Root Cause

The migration files were loading SQL from external `.sql` files that contained `DELIMITER $$` and `DELIMITER ;` commands. These commands are **MySQL CLI-specific** and do not work in programmatic database connections (like those used by db-migrate, Node.js mysql2 driver, etc.).

### Why DELIMITER Doesn't Work Programmatically

- `DELIMITER` is a MySQL **client command**, not a SQL server command
- It's only used in the MySQL command-line client to temporarily change the statement delimiter
- When executing SQL through a driver/library, the delimiter is always `;` and cannot be changed
- Database drivers execute statements one at a time, making `DELIMITER` unnecessary

## Solution

All affected migration files were refactored to:
1. **Remove SQL file dependencies** - Inline SQL directly in JavaScript
2. **Remove DELIMITER commands** - Not needed when executing statements separately
3. **Split multi-statement SQL** - Execute triggers, procedures, and functions in separate `db.runSql()` calls
4. **Add BEGIN...END blocks** - Required for triggers and procedures with multiple statements
5. **Fix variable assignments in triggers** - Assign CONCAT results to variables before using in SIGNAL statements

## Files Modified

### 1. `20251018212900-partial-payment-handling.js`

**Changes:**
- Removed SQL file loading (`sqls/20251018212900-partial-payment-handling-up.sql`)
- Inlined SQL for creating `payment_transactions` table
- Split into 5 separate SQL executions:
  1. CREATE TABLE `payment_transactions`
  2. CREATE TRIGGER `update_payment_status_insert`
  3. CREATE TRIGGER `update_payment_status`
  4. CREATE TRIGGER `update_payment_after_transaction`
  5. CREATE PROCEDURE `process_partial_payment`
  6. CREATE FUNCTION `get_outstanding_balance`
- Updated down migration to drop objects in correct order

**Key Code Pattern:**
```javascript
exports.up = function(db) {
  return db.runSql(`CREATE TABLE payment_transactions (...)`)
    .then(() => db.runSql(`CREATE TRIGGER ... BEGIN ... END;`))
    .then(() => db.runSql(`CREATE TRIGGER ... BEGIN ... END;`))
    // ... more statements
};
```

### 2. `20251018212901-prevent-double-booking.js`

**Changes:**
- Removed SQL file dependency
- Split into 2 trigger creations:
  1. `prevent_double_booking_insert` trigger
  2. `prevent_double_booking_update` trigger
- Each trigger properly wrapped in `BEGIN...END`

**Purpose:** Prevents overlapping room bookings for the same date range.

### 3. `20251018212902-room-status-triggers.js`

**Changes:**
- Removed SQL file dependency
- Split into 2 trigger creations:
  1. `update_room_status_on_checkin` trigger
  2. `update_room_status_on_checkout` trigger

**Purpose:** Automatically updates room status (occupied/available) when guests check in/out.

### 4. `20251018212903-bill-calculation.js`

**Changes:**
- Removed SQL file dependency
- Split into 3 database object creations:
  1. `calculate_room_charges` function
  2. `calculate_service_charges` function
  3. `calculate_booking_bill` stored procedure

**Purpose:** Provides billing calculation functions for room charges, services, taxes, and discounts.

### 5. `20251018212904-payment-validation-checkout.js`

**Changes:**
- Removed SQL file dependency
- Added `v_error_message` variable declaration
- Fixed CONCAT usage by assigning to variable before SIGNAL

**Critical Fix:**
```javascript
// BEFORE (Incorrect - causes "Undeclared variable: CONCAT" error)
SIGNAL SQLSTATE '45000'
SET MESSAGE_TEXT = CONCAT(...);

// AFTER (Correct)
SET v_error_message = CONCAT(...);
SIGNAL SQLSTATE '45000'
SET MESSAGE_TEXT = v_error_message;
```

**Purpose:** Validates payment is complete before allowing checkout.

## Cleanup Actions

Removed duplicate migration files that were created as attempted fixes:
- `20251019122411-create-payment-procedures.js`
- `20251019122412-create-payment-procedures.js`
- `20251019122413-create-payment-transactions.js`
- `20251019122414-add-payment-triggers.js`

## Migration Execution Results

After fixes, all migrations executed successfully:

```bash
✓ [INFO] Processed migration 20251018212900-partial-payment-handling
✓ [INFO] Processed migration 20251018212901-prevent-double-booking
✓ [INFO] Processed migration 20251018212902-room-status-triggers
✓ [INFO] Processed migration 20251018212903-bill-calculation
✓ [INFO] Processed migration 20251018212904-payment-validation-checkout
✓ [INFO] Done
```

## Database Objects Created

### Tables
- `payment_transactions` - Stores individual payment transaction records

### Triggers
1. **update_payment_status_insert** - Auto-calculates payment status on INSERT
2. **update_payment_status** - Auto-calculates payment status on UPDATE
3. **update_payment_after_transaction** - Updates payment totals after transaction insert
4. **prevent_double_booking_insert** - Prevents overlapping bookings on INSERT
5. **prevent_double_booking_update** - Prevents overlapping bookings on UPDATE
6. **update_room_status_on_checkin** - Sets room to 'occupied' on check-in
7. **update_room_status_on_checkout** - Sets room to 'available' on check-out
8. **validate_payment_before_checkout** - Ensures payment is complete before checkout

### Stored Procedures
- **process_partial_payment** - Handles partial payment processing with validation
- **calculate_booking_bill** - Comprehensive bill calculation with taxes and discounts

### Functions
- **calculate_room_charges** - Calculates room charges based on rate and nights
- **calculate_service_charges** - Sums up all service charges for a booking
- **get_outstanding_balance** - Returns remaining balance for a booking

## Best Practices for Future Migrations

### ✅ DO

1. **Write SQL inline** in JavaScript migration files
2. **Split multi-statement SQL** into separate `db.runSql()` calls
3. **Chain promises** with `.then()` for sequential execution
4. **Use BEGIN...END blocks** for triggers and procedures
5. **Test migrations** in development before deploying

### ❌ DON'T

1. **Don't use DELIMITER** in programmatic SQL
2. **Don't load SQL files** that contain DELIMITER commands
3. **Don't execute multiple CREATE statements** in a single SQL string
4. **Don't use CONCAT directly** in SIGNAL statements (assign to variable first)

### Example Template for Triggers

```javascript
exports.up = function(db) {
  return db.runSql(`
    CREATE TRIGGER trigger_name
    BEFORE/AFTER INSERT/UPDATE ON table_name
    FOR EACH ROW
    BEGIN
        -- Your trigger logic here
        DECLARE variables...;
        -- Statements
    END;
  `);
};

exports.down = function(db) {
  return db.runSql('DROP TRIGGER IF EXISTS trigger_name;');
};
```

### Example Template for Stored Procedures

```javascript
exports.up = function(db) {
  return db.runSql(`
    CREATE PROCEDURE procedure_name(
        IN param1 TYPE,
        OUT param2 TYPE
    )
    BEGIN
        -- Procedure logic
    END;
  `);
};

exports.down = function(db) {
  return db.runSql('DROP PROCEDURE IF EXISTS procedure_name;');
};
```

## Testing

To test migrations:

```bash
# Run migrations
pnpm migrate:dev

# Rollback if needed
pnpm db-migrate down -e development

# Check migration status
pnpm db-migrate status -e development
```

## Related Documentation

- [MySQL CREATE TRIGGER Documentation](https://dev.mysql.com/doc/refman/8.0/en/create-trigger.html)
- [MySQL CREATE PROCEDURE Documentation](https://dev.mysql.com/doc/refman/8.0/en/create-procedure.html)
- [db-migrate Documentation](https://db-migrate.readthedocs.io/)

## Date

**Fixed:** October 19, 2025  
**Migration Tool:** db-migrate v0.11.14  
**Database:** MariaDB/MySQL  
**Node.js Driver:** mysql2 v3.15.0
