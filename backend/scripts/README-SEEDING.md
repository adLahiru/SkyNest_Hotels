# Database Seeding Instructions

This guide explains how to seed your SkyNest Hotels database with complete dummy data.

## 📋 What Gets Created

- **5 Branches** (including Head Office)
- **20 Room Types** (variety of accommodations)
- **75 Rooms** (15 per branch, across 4 floors)
- **5 Managers** (1 per branch)
- **10 Receptionists** (2 per branch)
- **25 Housekeeping Staff** (5 per branch)
- **50 Guest Users**
- **15 Services**

**Total Users: 90** (40 staff + 50 guests)

## 🔐 Default Password

All users (staff and guests) have the same password:
```
12345678
```

## 🚀 How to Run

### Option 1: Run all files sequentially (MySQL command line)

```bash
# Navigate to the scripts directory
cd backend/scripts

# Run in order
mysql -u root -p SkyNest_Hotels < seed-1-branches-roomtypes.sql
mysql -u root -p SkyNest_Hotels < seed-2-users-staff.sql
mysql -u root -p SkyNest_Hotels < seed-3-rooms-services.sql
```

### Option 2: Run from MySQL Workbench

1. Open MySQL Workbench
2. Connect to your database
3. Open each file in order and execute:
   - `seed-1-branches-roomtypes.sql`
   - `seed-2-users-staff.sql`
   - `seed-3-rooms-services.sql`

### Option 3: One-line command

```bash
cd backend/scripts && \
mysql -u root -p SkyNest_Hotels < seed-1-branches-roomtypes.sql && \
mysql -u root -p SkyNest_Hotels < seed-2-users-staff.sql && \
mysql -u root -p SkyNest_Hotels < seed-3-rooms-services.sql
```

## 📊 Sample Login Credentials

### Admin/Manager Accounts
| Username | Email | Role | Branch |
|----------|-------|------|--------|
| john.manager | john.manager@skynest.lk | MANAGER | Head Office |
| sarah.manager | sarah.manager@skynest.lk | MANAGER | Airport Branch |
| michael.manager | michael.manager@skynest.lk | MANAGER | Beach Resort |
| emma.manager | emma.manager@skynest.lk | MANAGER | Hill Country Lodge |
| david.manager | david.manager@skynest.lk | MANAGER | City Center Hotel |

### Receptionist Accounts
| Username | Email | Branch |
|----------|-------|--------|
| olivia.r | olivia.r@skynest.lk | Head Office |
| james.r | james.r@skynest.lk | Head Office |
| sophia.r | sophia.r@skynest.lk | Airport Branch |
| ... | ... | ... |

### Guest Accounts
| Username | Email |
|----------|-------|
| guest1 | john.smith1@guest.com |
| guest2 | sarah.johnson2@guest.com |
| guest3 | michael.williams3@guest.com |
| ... | ... |

## 🗂️ File Breakdown

### seed-1-branches-roomtypes.sql
- Creates 5 hotel branches
- Creates 20 different room types
- Sets up basic infrastructure

### seed-2-users-staff.sql
- Creates 90 user accounts
- Links 40 staff to their branches
- Assigns managers to branches
- Creates 50 guest accounts

### seed-3-rooms-services.sql
- Creates 75 rooms distributed across all branches
- Randomly assigns room types
- All rooms set to 'available' status
- Creates 15 hotel services

## ✅ Verification

After running all scripts, verify with:

```sql
-- Check counts
SELECT 'Branches' AS Type, COUNT(*) AS Count FROM hotel_branches
UNION ALL
SELECT 'Room Types', COUNT(*) FROM room_types
UNION ALL
SELECT 'Rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Staff', COUNT(*) FROM staff
UNION ALL
SELECT 'Services', COUNT(*) FROM service_catalogue;

-- Check branch distribution
SELECT 
  b.branch_name,
  COUNT(r.room_id) AS room_count,
  COUNT(s.staff_id) AS staff_count
FROM hotel_branches b
LEFT JOIN rooms r ON b.branch_id = r.branch_id
LEFT JOIN staff s ON b.branch_id = s.branch_id
GROUP BY b.branch_id, b.branch_name;
```

Expected output:
- Branches: 5
- Room Types: 20
- Rooms: 75
- Users: 90
- Staff: 40
- Services: 15

## 🔄 To Reset and Re-seed

If you need to start fresh:

```sql
-- Clear data (preserves schema)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE payment_transactions;
TRUNCATE TABLE service_usage;
TRUNCATE TABLE payments;
TRUNCATE TABLE booking;
TRUNCATE TABLE refresh_token;
TRUNCATE TABLE user_session;
TRUNCATE TABLE rooms;
TRUNCATE TABLE staff;
TRUNCATE TABLE users;
TRUNCATE TABLE service_catalogue;
TRUNCATE TABLE discount;
TRUNCATE TABLE hotel_branches;
TRUNCATE TABLE room_types;
SET FOREIGN_KEY_CHECKS = 1;
```

Then re-run all three seed files.

## 📝 Notes

- All rooms are initially set to `available` state
- Managers are automatically assigned to their respective branches
- All passwords use bcrypt hashing
- Guest accounts have `is_guest = 1`
- Staff accounts have `is_guest = 0`
- Phone numbers and NIC numbers are generated to be unique

## 🐛 Troubleshooting

**Error: Duplicate entry**
- The scripts use fixed UUIDs for consistency
- If re-running, clear the tables first (see Reset section above)

**Error: Foreign key constraint fails**
- Ensure you run the files in the correct order (1, 2, 3)
- Verify the database schema exists before seeding

**Error: Access denied**
- Check your MySQL username and password
- Ensure you have CREATE, INSERT, UPDATE privileges
