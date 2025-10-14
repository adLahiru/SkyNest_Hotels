# Dashboard System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐              │
│  │   App.js     │──────│ Navigation   │──────│   Auth       │              │
│  │              │      │              │      │   Service    │              │
│  │ - Routing    │      │ - Role-based │      │              │              │
│  │ - State Mgmt │      │   Menu       │      │ - Login      │              │
│  └──────┬───────┘      └──────────────┘      │ - Logout     │              │
│         │                                     │ - Get User   │              │
│         │                                     └──────────────┘              │
│         │                                                                    │
│         ├─────────────┬─────────────┬─────────────┐                        │
│         │             │             │             │                         │
│    ┌────▼───┐   ┌────▼───┐   ┌────▼───┐   ┌─────▼────┐                   │
│    │Dashboard│   │  Admin  │   │Manager │   │Receptionist│                 │
│    │ Router  │   │Dashboard│   │Dashboard│  │ Dashboard │                 │
│    └────┬───┘   └────┬───┘   └────┬───┘   └─────┬────┘                   │
│         │            │            │             │                           │
│         │            └────────┬───┴─────────────┘                          │
│         │                     │                                             │
│         │              ┌──────▼──────┐                                      │
│         └──────────────│  Dashboard  │                                      │
│                        │   Service   │                                      │
│                        │             │                                      │
│                        │ - getAdmin  │                                      │
│                        │ - getManager│                                      │
│                        │ - getRecept │                                      │
│                        └──────┬──────┘                                      │
│                               │                                             │
└───────────────────────────────┼─────────────────────────────────────────────┘
                                │
                                │ HTTP/HTTPS (Port 8084)
                                │ JWT Token in Headers
                                │
┌───────────────────────────────▼─────────────────────────────────────────────┐
│                         BACKEND (Express + TypeScript)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐              │
│  │   index.ts   │──────│    Routes    │──────│  Middleware  │              │
│  │              │      │   /index.ts  │      │              │              │
│  │ - Server     │      │              │      │ - authenticate│              │
│  │ - DB Pool    │      │ - /api/auth  │      │ - requireAdmin│             │
│  │ - CORS       │      │ - /api/dash  │      │ - requireMgr │              │
│  └──────────────┘      └──────┬───────┘      │ - requireStaff│             │
│                               │               └──────────────┘              │
│                               │                                             │
│                        ┌──────▼──────────┐                                  │
│                        │ Dashboard Routes │                                  │
│                        │                  │                                  │
│                        │ GET /admin       │──┐                              │
│                        │ GET /manager     │  │                              │
│                        │ GET /receptionist│  │                              │
│                        └──────┬───────────┘  │                              │
│                               │              │                              │
│                        ┌──────▼──────────┐  │                              │
│                        │    Dashboard     │  │                              │
│                        │   Controller     │  │                              │
│                        │                  │  │                              │
│                        │ - getAdminStats  │◄─┘                              │
│                        │ - getManagerStats│                                 │
│                        │ - getReceptStats │                                 │
│                        └──────┬───────────┘                                 │
│                               │                                             │
│                               │ SQL Queries                                 │
│                               │                                             │
└───────────────────────────────┼─────────────────────────────────────────────┘
                                │
                                │ MySQL Connection Pool
                                │
┌───────────────────────────────▼─────────────────────────────────────────────┐
│                         DATABASE (MySQL)                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  users   │  │ branches │  │  staff   │  │  rooms   │  │ bookings │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       │             │             │             │             │             │
│       └─────────────┴─────────────┴─────────────┴─────────────┘             │
│                                                                               │
│  Relationships:                                                               │
│  - users.user_id → staff.user_id                                            │
│  - branches.branch_id → staff.branch_id                                     │
│  - branches.branch_id → rooms.branch_id                                     │
│  - rooms.room_id → bookings.room_id                                         │
│  - users.user_id → bookings.user_id (guest)                                 │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘


DATA FLOW FOR ADMIN DASHBOARD:
═════════════════════════════════════════════════════════════════════════════

1. User logs in as ADMIN → JWT token stored
2. App.js redirects to Dashboard component
3. Dashboard.js checks user.role === 'ADMIN' → renders AdminDashboard
4. AdminDashboard.useEffect() calls dashboardService.getAdminStats()
5. Service makes GET /api/dashboard/admin with JWT token
6. Backend authenticateToken middleware validates JWT
7. Backend requireAdmin middleware checks role === 'ADMIN'
8. dashboardController.getAdminStats() executes:
   - Query 1: Count total users by role
   - Query 2: Count branches
   - Query 3: Count rooms by status
   - Query 4: Count bookings by status
   - Query 5: Sum revenue (total/monthly/daily)
   - Query 6: Get branch-wise stats with JOINs
   - Query 7: Get recent 10 bookings with guest names
9. Controller returns JSON response with all stats
10. Service receives response and returns to component
11. AdminDashboard updates state and renders UI


DATA FLOW FOR MANAGER DASHBOARD:
═════════════════════════════════════════════════════════════════════════════

1. User logs in as MANAGER → JWT token stored
2. App.js redirects to Dashboard component
3. Dashboard.js checks user.role === 'MANAGER' → renders ManagerDashboard
4. ManagerDashboard.useEffect() calls dashboardService.getManagerStats()
5. Service makes GET /api/dashboard/manager with JWT token
6. Backend authenticateToken middleware validates JWT and extracts userId
7. Backend requireManager middleware checks role === 'ADMIN' or 'MANAGER'
8. dashboardController.getManagerStats() executes:
   - Query 1: Get manager's branch_id from staff table
   - Query 2: Get branch details
   - Query 3: Count rooms by status (filtered by branch_id)
   - Query 4: Count bookings (filtered by branch_id)
   - Query 5: Sum revenue (filtered by branch_id)
   - Query 6: Count staff (filtered by branch_id)
   - Query 7: Get today's check-ins (filtered by branch_id)
   - Query 8: Get today's check-outs (filtered by branch_id)
   - Query 9: Get recent bookings (filtered by branch_id)
9. Controller returns JSON response with branch-specific stats
10. Service receives response and returns to component
11. ManagerDashboard updates state and renders UI


DATA FLOW FOR RECEPTIONIST DASHBOARD:
═════════════════════════════════════════════════════════════════════════════

1. User logs in as RECEPTIONIST → JWT token stored
2. App.js redirects to Dashboard component
3. Dashboard.js checks user.role === 'RECEPTIONIST' → renders ReceptionistDashboard
4. ReceptionistDashboard.useEffect() calls dashboardService.getReceptionistStats()
5. Service makes GET /api/dashboard/receptionist with JWT token
6. Backend authenticateToken middleware validates JWT
7. Backend requireStaff middleware checks if user is staff
8. dashboardController.getReceptionistStats() executes:
   - Query 1: Get today's check-ins with guest details
   - Query 2: Get today's check-outs with guest details
   - Query 3: Get pending bookings
   - Query 4: Get available rooms with prices
   - Query 5: Get current guests (checked in)
   - Query 6: Count stats for quick cards
9. Controller returns JSON response with operational data
10. Service receives response and returns to component
11. ReceptionistDashboard updates state and renders UI


NAVIGATION FLOW:
═════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────────┐
│                         User Role Determination                           │
└──────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ├─────────────────┬─────────────────┐
                                   │                 │                 │
                              ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
                              │  ADMIN  │      │ MANAGER │      │  GUEST  │
                              │  STAFF  │      │  RECEPT │      │         │
                              │  HOUSE  │      │         │      │         │
                              └────┬────┘      └────┬────┘      └────┬────┘
                                   │                 │                 │
                    Navigation:    │                 │                 │
                    ┌──────────────┼─────────────────┤                 │
                    │              │                 │                 │
               ┌────▼────┐    ┌────▼────┐      ┌────▼────┐      ┌─────▼────┐
               │Dashboard│    │Bookings │      │ Offers  │      │   Home   │
               └─────────┘    └─────────┘      └─────────┘      │ Booking  │
                                                                 │ Offers   │
                    ❌ HIDDEN FOR STAFF:                         │ Contact  │
                    - Home                                       └──────────┘
                    - Contact
```
