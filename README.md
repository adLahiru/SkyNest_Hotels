# 🏨 SkyNest Hotels - Hotel Management System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.9.2-blue.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)

A comprehensive hotel management system built with **Node.js**, **TypeScript**, **Express**, **React**, and **MySQL**. This system provides complete functionality for managing hotel operations including bookings, rooms, branches, staff, services, payments, and reporting.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (Admin, Manager, Receptionist, Housekeeping, Guest)
- Secure password hashing with bcrypt
- Session management with automatic token refresh

### 🏢 Branch Management
- Multi-branch hotel support
- Branch-specific operations and reporting
- Branch details with contact information and photos

### 🚪 Room Management
- Room type categorization with pricing
- Room status tracking (available, occupied, maintenance, cleaning)
- Floor-wise room organization
- Real-time availability checking

### 📅 Booking System
- Complete booking workflow (pending → confirmed → checked-in → checked-out)
- Booking modification and cancellation
- Guest information management
- Date validation and double-booking prevention
- Check-in/check-out processing

### 🛎️ Service Management
- Service catalogue with branch-specific pricing
- Service addition to bookings
- Service usage tracking
- Photo uploads for services

### 💰 Payment Processing
- Flexible payment handling (full/partial payments)
- Multiple payment methods (cash, credit card, debit card, bank transfer)
- Payment transaction history
- Automatic bill calculation with taxes and discounts
- Outstanding balance tracking

### 👥 User Management
- Staff management (managers, receptionists, housekeepers)
- Guest registration and profiles
- User status control (active/inactive)
- Salary and employment tracking for staff

### 📊 Reporting & Analytics
- Room occupancy reports
- Revenue analysis (daily, monthly)
- Service usage statistics
- Guest billing summaries
- Top services by branch

### 📧 Contact Management
- Guest inquiry system
- Message status tracking (pending/read)
- Inquiry type categorization

### 🔒 Security Features
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection
- CORS configuration
- Secure session management

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js v18+
- **Language:** TypeScript 5.9.2
- **Framework:** Express 5.1.0
- **Database:** MySQL 8.0 / MariaDB 10.11
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Logging:** Winston 3.18.3
- **File Upload:** Multer
- **Database Migrations:** db-migrate
- **Package Manager:** pnpm

### Frontend
- **Framework:** React 18.3.1
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Styling:** CSS3
- **Package Manager:** npm

### Database
- **RDBMS:** MySQL 8.0+ / MariaDB 10.11+
- **Connection Pooling:** mysql2
- **Triggers & Stored Procedures:** Advanced SQL features
- **Transactions:** ACID compliance

---

## 📁 Project Structure

```
SkyNest_Hotels/
├── backend/                    # Backend application
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   └── db.ts          # Database connection
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API routes
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions & logger
│   │   └── index.ts           # Application entry point
│   ├── migrations/            # Database migration files
│   ├── logs/                  # Application logs
│   ├── config/                # Environment configurations
│   │   ├── .env.development   # Development environment
│   │   └── .env.test          # Test environment
│   ├── database.json          # Migration configuration
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/                   # Frontend application
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API service layer
│   │   ├── styles/            # CSS stylesheets
│   │   ├── utils/             # Utility functions & logger
│   │   ├── config/            # Configuration
│   │   ├── App.js             # Main app component
│   │   └── index.js           # React entry point
│   ├── package.json
│   └── README.md
│
├── docs/                       # Documentation
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── MIGRATION_FIXES.md
│   └── BOOKING_MANAGEMENT_*.md
│
└── README.md                   # This file
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- **pnpm** v8.0.0 or higher (for backend)
- **MySQL** 8.0+ or **MariaDB** 10.11+
- **Git**

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/adLahiru/SkyNest_Hotels.git
cd SkyNest_Hotels
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
pnpm install

# Copy environment file
cp config/.env.development config/.env

# Update database credentials in config/.env
# Then run migrations
pnpm migrate:dev

# Build TypeScript
pnpm build
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
REACT_APP_API_URL=http://localhost:8084/api
REACT_APP_ENV=development
EOF

# Build production version (optional)
npm run build
```

---

## ⚙️ Configuration

### Backend Configuration (`backend/config/.env`)

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=SkyNest_Hotels

# Server Configuration
PORT=8084
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-min-32-characters
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-min-32-characters
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend Configuration (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:8084/api
REACT_APP_ENV=development
```

---

## 🏃 Running the Application

### Development Mode

**Backend:**
```bash
cd backend
pnpm dev
# Server runs on http://localhost:8084
```

**Frontend:**
```bash
cd frontend
npm start
# Application runs on http://localhost:3000
```

### Production Mode

**Backend:**
```bash
cd backend
pnpm build
pnpm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the build folder with a static server
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8084/api
```

### Main Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - Guest registration

#### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile

#### Branches
- `GET /api/branches` - Get all branches
- `GET /api/branches/:id` - Get branch by ID
- `POST /api/branches` - Create branch (Admin)
- `PUT /api/branches/:id` - Update branch (Admin)
- `DELETE /api/branches/:id` - Delete branch (Admin)

#### Room Types
- `GET /api/room-types` - Get all room types
- `GET /api/room-types/:id` - Get room type by ID
- `POST /api/room-types` - Create room type (Admin/Manager)
- `PUT /api/room-types/:id` - Update room type
- `DELETE /api/room-types/:id` - Delete room type

#### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms` - Create room (Admin/Manager)
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room
- `PATCH /api/rooms/:id/status` - Update room status

#### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking
- `PATCH /api/bookings/:id/checkin` - Check-in
- `PATCH /api/bookings/:id/checkout` - Check-out
- `POST /api/bookings/:id/services` - Add service to booking
- `GET /api/bookings/:id/services` - Get booking services
- `POST /api/bookings/:id/payments` - Process payment
- `GET /api/bookings/:id/payment-details` - Get payment details
- `GET /api/bookings/available-rooms` - Get available rooms

#### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create service (Admin/Manager)
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

#### Dashboard
- `GET /api/dashboard/admin` - Admin dashboard statistics
- `GET /api/dashboard/housekeeping` - Housekeeping statistics

#### Reports
- `GET /api/reports/room-occupancy` - Room occupancy report
- `GET /api/reports/guest-billing` - Guest billing report
- `GET /api/reports/service-usage` - Service usage report
- `GET /api/reports/monthly-revenue` - Monthly revenue report
- `GET /api/reports/top-services` - Top services report

#### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all messages (Admin)
- `PUT /api/contact/:id/status` - Update message status
- `DELETE /api/contact/:id` - Delete message

---

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts (staff and guests)
- `staff` - Staff-specific information
- `hotel_branches` - Hotel branch information
- `room_types` - Room categories and pricing
- `rooms` - Individual room records
- `booking` - Booking records
- `payments` - Payment information
- `payment_transactions` - Payment transaction history
- `service_catalogue` - Available services
- `service_usage` - Service usage records
- `tax_policies` - Tax configuration
- `discounts` - Discount policies
- `contact_messages` - Customer inquiries
- `user_sessions` - Active user sessions
- `refresh_tokens` - JWT refresh tokens
- `audit_log` - System audit trail

### Database Features
- Foreign key constraints
- Triggers for automatic status updates
- Stored procedures for complex calculations
- Indexes for performance optimization
- Transaction support

---

## 🚢 Deployment

### Quick Deployment Checklist

1. **Configure Production Environment**
   - Update `.env.production` with production database credentials
   - Set strong JWT secrets
   - Configure CORS for production domain

2. **Build Applications**
   ```bash
   # Backend
   cd backend && pnpm build
   
   # Frontend
   cd frontend && npm run build
   ```

3. **Run Database Migrations**
   ```bash
   cd backend
   pnpm migrate:prod
   ```

4. **Deploy**
   - Backend: Use PM2, Docker, or your preferred Node.js hosting
   - Frontend: Deploy build folder to static hosting (Nginx, Vercel, Netlify)
   - Database: Use managed MySQL service or self-hosted

For detailed deployment instructions, see [`docs/DEPLOYMENT_CHECKLIST.md`](docs/DEPLOYMENT_CHECKLIST.md)

---

## 👥 User Roles & Permissions

| Role | Permissions |
|------|------------|
| **Admin** | Full system access, manage all branches, users, and settings |
| **Manager** | Branch-specific management, staff, rooms, bookings, reports |
| **Receptionist** | Check-in/out, bookings, guest management for assigned branch |
| **Housekeeping** | View assigned rooms, update room status |
| **Guest** | View own bookings, update profile, make new bookings |

---

## 🔧 Development

### Available Scripts

**Backend:**
```bash
pnpm dev          # Start development server with nodemon
pnpm build        # Build TypeScript to JavaScript
pnpm start        # Start production server
pnpm migrate:dev  # Run database migrations (development)
pnpm migrate:prod # Run database migrations (production)
```

**Frontend:**
```bash
npm start         # Start development server
npm run build     # Create production build
npm run lint      # Run ESLint
```

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Winston for structured logging
- Comprehensive error handling

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Lahiru**
- GitHub: [@adLahiru](https://github.com/adLahiru)

---

## 🙏 Acknowledgments

- Built with ❤️ for efficient hotel management
- Inspired by modern hotel management needs
- Special thanks to all contributors

---

## 📞 Support

For support, please:
1. Check the [documentation](docs/)
2. Open an issue on GitHub
3. Contact the development team

---

**Made with ❤️ by SkyNest Hotels Development Team**
