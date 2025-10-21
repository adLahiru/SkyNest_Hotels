# 🔧 SkyNest Hotels - Backend API

![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.9.2-blue.svg)
![Express](https://img.shields.io/badge/express-5.1.0-lightgrey.svg)
![MySQL](https://img.shields.io/badge/mysql-8.0+-blue.svg)

Backend REST API for SkyNest Hotels Management System built with Node.js, TypeScript, Express, and MySQL.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Server](#-running-the-server)
- [API Endpoints](#-api-endpoints)
- [Database](#-database)
- [Logging](#-logging)
- [Testing](#-testing)
- [Deployment](#-deployment)

---

## ✨ Features

- **RESTful API** with Express.js
- **TypeScript** for type safety
- **JWT Authentication** with refresh tokens
- **Role-based Authorization** (Admin, Manager, Receptionist, Housekeeping, Guest)
- **MySQL Database** with connection pooling
- **Database Migrations** with db-migrate
- **File Uploads** with Multer
- **Winston Logger** with automatic log rotation
- **CORS** enabled for cross-origin requests
- **Input Validation** and sanitization
- **Error Handling** middleware
- **SQL Injection Prevention** (parameterized queries)
- **Password Hashing** with bcrypt
- **Environment-based Configuration**

---

## 🛠️ Tech Stack

- **Runtime:** Node.js v18+
- **Language:** TypeScript 5.9.2
- **Framework:** Express 5.1.0
- **Database:** MySQL 8.0+ / MariaDB 10.11+
- **Authentication:** jsonwebtoken
- **Password Hashing:** bcryptjs
- **Database Driver:** mysql2
- **Logger:** Winston 3.18.3
- **File Upload:** Multer
- **Migrations:** db-migrate
- **Package Manager:** pnpm
- **Process Manager:** Nodemon (dev), PM2 (production)

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.ts                 # Database connection & pool
│   ├── controllers/              # Route controllers
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── branchController.ts
│   │   ├── roomTypeController.ts
│   │   ├── roomController.ts
│   │   ├── bookingController.ts
│   │   ├── serviceCatalogueController.ts
│   │   ├── paymentController.ts
│   │   ├── discountController.ts
│   │   ├── contactController.ts
│   │   └── dashboardController.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts     # JWT authentication
│   │   ├── roleMiddleware.ts     # Role-based access control
│   │   └── uploadMiddleware.ts   # File upload handling
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── branchRoutes.ts
│   │   ├── roomTypeRoutes.ts
│   │   ├── roomRoutes.ts
│   │   ├── bookingRoutes.ts
│   │   ├── serviceRoutes.ts
│   │   ├── paymentRoutes.ts
│   │   ├── discountRoutes.ts
│   │   ├── contactRoutes.ts
│   │   ├── dashboardRoutes.ts
│   │   └── reportRoutes.ts
│   ├── types/
│   │   └── auth.types.ts         # TypeScript type definitions
│   ├── utils/
│   │   └── logger.ts             # Winston logger configuration
│   └── index.ts                  # Application entry point
│
├── migrations/                   # Database migration files
│   ├── 20250924042910-create-users-table.js
│   ├── 20250924042932-create-branches-table.js
│   └── ... (more migrations)
│
├── logs/                         # Application logs
│   ├── combined.log              # All logs
│   └── error.log                 # Error logs only
│
├── uploads/                      # Uploaded files
│   ├── branches/
│   ├── rooms/
│   └── services/
│
├── config/
│   ├── .env.development          # Development environment
│   ├── .env.test                 # Test environment
│   └── .env.production           # Production environment (not in git)
│
├── database.json                 # db-migrate configuration
├── package.json
├── tsconfig.json                 # TypeScript configuration
├── nodemon.json                  # Nodemon configuration
└── README.md                     # This file
```

---

## 📦 Prerequisites

- Node.js v18.0.0 or higher
- pnpm v8.0.0 or higher
- MySQL 8.0+ or MariaDB 10.11+

---

## 🚀 Installation

### 1. Install Dependencies

```bash
cd backend
pnpm install
```

### 2. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE SkyNest_Hotels CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configuration

Copy the environment file:

```bash
cp config/.env.development config/.env
```

Update `config/.env` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=SkyNest_Hotels

PORT=8084
NODE_ENV=development

JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-minimum-32-characters
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 4. Run Database Migrations

```bash
pnpm migrate:dev
```

This will create all necessary tables, triggers, stored procedures, and functions.

### 5. Build TypeScript

```bash
pnpm build
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `3306` |
| `DB_USER` | Database username | `root` |
| `DB_PASSWORD` | Database password | `password` |
| `DB_NAME` | Database name | `SkyNest_Hotels` |
| `PORT` | Server port | `8084` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | JWT access token secret | Min 32 characters |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Min 32 characters |
| `JWT_EXPIRES_IN` | Access token expiry | `1h`, `30m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d`, `30d` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |

### Database Configuration

The database connection uses connection pooling for optimal performance:

```typescript
// Default pool configuration
{
  connectionLimit: 10,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  queueLimit: 0
}
```

---

## 🏃 Running the Server

### Development Mode

```bash
pnpm dev
```

Server runs on `http://localhost:8084` with auto-reload on file changes.

### Production Mode

```bash
# Build TypeScript
pnpm build

# Start server
pnpm start
```

### Using PM2 (Recommended for Production)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/index.js --name skynest-backend

# View logs
pm2 logs skynest-backend

# Monitor
pm2 monit

# Stop
pm2 stop skynest-backend

# Restart
pm2 restart skynest-backend
```

---

## 📚 API Endpoints

### Base URL
```
http://localhost:8084/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/register` | Guest registration | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| POST | `/api/auth/logout` | Logout user | Yes |

### User Management

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin, Manager |
| POST | `/api/users` | Create user | Admin |
| PUT | `/api/users/:id` | Update user | Admin, Manager |
| DELETE | `/api/users/:id` | Delete user | Admin |
| GET | `/api/users/profile` | Get own profile | All |
| PUT | `/api/users/profile` | Update own profile | All |
| PUT | `/api/users/change-password` | Change password | All |

### Branch Management

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/branches` | Get all branches | All |
| GET | `/api/branches/:id` | Get branch by ID | All |
| POST | `/api/branches` | Create branch | Admin |
| PUT | `/api/branches/:id` | Update branch | Admin |
| DELETE | `/api/branches/:id` | Delete branch | Admin |

### Room Type Management

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/room-types` | Get all room types | All |
| GET | `/api/room-types/:id` | Get room type by ID | All |
| POST | `/api/room-types` | Create room type | Admin, Manager |
| PUT | `/api/room-types/:id` | Update room type | Admin, Manager |
| DELETE | `/api/room-types/:id` | Delete room type | Admin |

### Room Management

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/rooms` | Get all rooms | Staff, Admin |
| GET | `/api/rooms/:id` | Get room by ID | Staff, Admin |
| POST | `/api/rooms` | Create room | Admin, Manager |
| PUT | `/api/rooms/:id` | Update room | Admin, Manager |
| DELETE | `/api/rooms/:id` | Delete room | Admin |
| PATCH | `/api/rooms/:id/status` | Update room status | Staff, Admin |

### Booking Management

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/bookings` | Get bookings | Staff, Admin, Own |
| GET | `/api/bookings/:id` | Get booking by ID | Staff, Admin, Own |
| POST | `/api/bookings` | Create booking | Guest, Staff, Admin |
| PUT | `/api/bookings/:id` | Update booking | Staff, Admin, Own |
| DELETE | `/api/bookings/:id` | Cancel booking | Staff, Admin, Own |
| PATCH | `/api/bookings/:id/checkin` | Check-in | Staff, Admin |
| PATCH | `/api/bookings/:id/checkout` | Check-out | Staff, Admin |
| GET | `/api/bookings/available-rooms` | Get available rooms | All |

### Service Management

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/services` | Get all services | All |
| GET | `/api/services/:id` | Get service by ID | All |
| POST | `/api/services` | Create service | Admin, Manager |
| PUT | `/api/services/:id` | Update service | Admin, Manager |
| DELETE | `/api/services/:id` | Delete service | Admin |
| POST | `/api/bookings/:id/services` | Add service to booking | Staff, Admin |
| GET | `/api/bookings/:id/services` | Get booking services | Staff, Admin, Own |

### Payment Processing

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/bookings/:id/payments` | Process payment | Staff, Admin |
| GET | `/api/bookings/:id/payment-details` | Get payment details | Staff, Admin, Own |

### Dashboard & Reports

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/dashboard/admin` | Admin statistics | Admin |
| GET | `/api/dashboard/housekeeping` | Housekeeping stats | Housekeeping, Admin |
| GET | `/api/reports/room-occupancy` | Room occupancy report | Admin, Manager |
| GET | `/api/reports/guest-billing` | Guest billing report | Admin, Manager |
| GET | `/api/reports/service-usage` | Service usage report | Admin, Manager |
| GET | `/api/reports/monthly-revenue` | Monthly revenue | Admin, Manager |
| GET | `/api/reports/top-services` | Top services | Admin, Manager |

### Contact Messages

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/contact` | Submit inquiry | All (public) |
| GET | `/api/contact` | Get all messages | Admin |
| PUT | `/api/contact/:id/status` | Update message status | Admin |
| DELETE | `/api/contact/:id` | Delete message | Admin |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Server health check | No |

---

## 🗄️ Database

### Database Migrations

Run migrations:
```bash
# Development
pnpm migrate:dev

# Production
pnpm migrate:prod

# Rollback last migration
pnpm db-migrate down -e development
```

Create new migration:
```bash
pnpm db-migrate create migration-name --sql-file
```

### Database Features

- **Tables:** 16 core tables for complete hotel management
- **Triggers:** 8 triggers for automatic status updates and validations
- **Stored Procedures:** 2 procedures for complex operations
- **Functions:** 3 functions for calculations
- **Indexes:** Optimized for query performance
- **Foreign Keys:** Referential integrity maintained
- **Transactions:** ACID compliance

### Key Tables

- `users` - User accounts
- `staff` - Staff details
- `hotel_branches` - Branch information
- `room_types` - Room categories
- `rooms` - Room inventory
- `booking` - Booking records
- `payments` - Payment information
- `payment_transactions` - Transaction history
- `service_catalogue` - Available services
- `service_usage` - Service tracking
- `contact_messages` - Customer inquiries

---

## 📊 Logging

### Winston Logger

Logs are automatically generated with rotation:

- **Location:** `logs/` directory
- **Files:**
  - `combined.log` - All logs (info, warn, error)
  - `error.log` - Error logs only
- **Rotation:** Automatic (max 5MB per file, max 5 files)
- **Format:** JSON with timestamps

### Log Levels

```typescript
logger.error('Error message', error);
logger.warn('Warning message', { data });
logger.info('Info message', { data });
logger.debug('Debug message', { data });
```

### Viewing Logs

```bash
# View combined logs
tail -f logs/combined.log

# View error logs
tail -f logs/error.log

# Search logs
grep "keyword" logs/combined.log
```

---

## 🧪 Testing

### Manual API Testing

Use tools like:
- **Postman** - Import collection for all endpoints
- **cURL** - Command-line testing
- **Thunder Client** - VS Code extension

Example cURL:
```bash
# Login
curl -X POST http://localhost:8084/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Get bookings with token
curl -X GET http://localhost:8084/api/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🚢 Deployment

### Production Build

```bash
# Install dependencies
pnpm install --prod

# Build TypeScript
pnpm build

# Run migrations
pnpm migrate:prod

# Start with PM2
pm2 start dist/index.js --name skynest-backend
pm2 save
pm2 startup
```

### Environment Setup

Create `.env.production`:
```env
DB_HOST=production-db-host
DB_PORT=3306
DB_USER=prod_user
DB_PASSWORD=strong_password
DB_NAME=SkyNest_Hotels

PORT=8084
NODE_ENV=production

JWT_SECRET=production-super-secure-secret
JWT_REFRESH_SECRET=production-refresh-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

ALLOWED_ORIGINS=https://yourdomain.com
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 8084
CMD ["node", "dist/index.js"]
```

Build and run:
```bash
docker build -t skynest-backend .
docker run -d -p 8084:8084 --name skynest-backend skynest-backend
```

---

## 🔒 Security Best Practices

- ✅ JWT tokens with expiration
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Parameterized SQL queries (no SQL injection)
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Environment variables for secrets
- ✅ Role-based access control
- ✅ Secure session management
- ✅ Error messages don't expose sensitive info
- ✅ File upload validation

---

## 📝 Scripts Reference

```json
{
  "dev": "nodemon src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "migrate:dev": "db-migrate up -e development",
  "migrate:prod": "db-migrate up -e production"
}
```

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📞 Support

For issues or questions:
- Check logs in `logs/` directory
- Review error messages
- Contact the development team

---

**Backend developed with ❤️ for SkyNest Hotels**
