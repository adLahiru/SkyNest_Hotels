# 🎨 SkyNest Hotels - Frontend Application# Sky Nest Hotels - Luxury Hotel Website



![React](https://img.shields.io/badge/react-18.3.1-blue.svg)An elegant and luxurious hotel website built with React, featuring modern design, smooth animations, and mobile responsiveness.

![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

![License](https://img.shields.io/badge/license-MIT-green.svg)## Features



Modern, responsive frontend application for SkyNest Hotels Management System built with React.- **Elegant Design**: Luxury hotel branding with premium aesthetics

- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices

---- **Smooth Animations**: Engaging animations and transitions throughout

- **Interactive Components**: Dynamic booking forms, image galleries, and user interactions

## 📋 Table of Contents- **Local Image Integration**: Uses images from the Images and Figmaimages folders

- **Component-Based Architecture**: Well-organized, reusable React components

- [Features](#-features)

- [Tech Stack](#-tech-stack)## Pages & Components

- [Project Structure](#-project-structure)

- [Prerequisites](#-prerequisites)### Main Pages

- [Installation](#-installation)- **Home Page**: Hero section, rooms showcase, facilities, testimonials

- [Configuration](#-configuration)- **Booking Page**: Comprehensive booking form with validation

- [Running the Application](#-running-the-application)- **Offers Page**: Special deals and discounts with filtering

- [Building for Production](#-building-for-production)- **Contact Page**: Contact form and location information

- [Components Overview](#-components-overview)- **Login Page**: User authentication with sign up/sign in

- [API Integration](#-api-integration)

- [Styling](#-styling)### Key Components

- [Deployment](#-deployment)- **Navigation**: Responsive navbar with smooth animations

- **IntroPage**: Animated landing page with luxury branding

---- **Footer**: Complete footer with social links and newsletter signup



## ✨ Features## Getting Started



### 🏠 Guest Portal### Prerequisites

- **Home Page** with hotel showcase and featured rooms- Node.js (version 14 or higher)

- **Room Browsing** with filters (type, capacity, price range)- npm or yarn package manager

- **Branch Selection** for multi-location booking

- **Online Booking System** with real-time availability### Installation

- **User Registration & Login**

- **User Profile Management**1. **Clone or download the project**

- **Booking History** and tracking   ```bash

- **Contact Form** for inquiries   cd "D:\Database project"

   ```

### 👨‍💼 Admin Dashboard

- **Complete Control Panel** for hotel operations2. **Install dependencies**

- **Multi-tab Interface:**   ```bash

  - User Management   npm install

  - Branch Management   ```

  - Room Type Management

  - Room Management3. **Start the development server**

  - Service Catalogue   ```bash

  - Contact Messages   npm start

  - Booking Management   ```

  

### 🏨 Booking Management4. **Open your browser**

- **Pending Check-ins** view (confirmed bookings)   Navigate to `http://localhost:8084` to view the website

- **Checked-in Guests** management

- **Check-in/Check-out** processing## Project Structure

- **Service Addition** to bookings

- **Payment Processing** (full/partial)```

- **Booking Cancellation**D:\Database project/

├── public/

### 👔 Manager Dashboard│   ├── index.html

- **Branch-specific** analytics│   └── favicon.ico

- **Room Status** overview├── src/

- **Booking Reports**│   ├── components/

- **Service Management**│   │   ├── IntroPage.js       # Animated landing page

- **Staff Monitoring**│   │   ├── Navigation.js      # Responsive navigation bar

│   │   ├── HomePage.js        # Main home page with sections

### 🧹 Housekeeping Dashboard│   │   ├── BookingPage.js     # Booking form and validation

- **Room Cleaning** status│   │   ├── OffersPage.js      # Special offers and deals

- **Assigned Rooms** view│   │   ├── ContactPage.js     # Contact form and information

- **Status Updates**│   │   ├── LoginPage.js       # User authentication

│   │   └── Footer.js          # Site footer

### 🧾 Receptionist Dashboard│   ├── styles/

- **Guest Check-in/out**│   │   └── App.css            # Main stylesheet with animations

- **Booking Management**│   ├── App.js                 # Main application component

- **Payment Collection**│   └── index.js               # Application entry point

- **Current Guests** view├── Images/                    # Local images for the website

├── Figmaimages/              # Design reference images

### 🎨 UI/UX Features└── package.json              # Project dependencies and scripts

- **Responsive Design** (mobile, tablet, desktop)```

- **Modern Interface** with Lucide icons

- **Interactive Modals** for actions## Features in Detail

- **Real-time Search & Filters**

- **Loading States** and error handling### Animations & Effects

- **Professional Logger** (development only)- Smooth page transitions

- Hover effects on cards and buttons

---- Typing animations for text

- Floating elements and particles

## 🛠️ Tech Stack- Scroll-triggered animations

- Loading states and spinners

- **Framework:** React 18.3.1

- **Routing:** React Router DOM 6.22.0### Responsive Design

- **HTTP Client:** Axios 1.6.7- Mobile-first approach

- **Icons:** Lucide React 0.344.0- Flexible grid layouts

- **Styling:** CSS3 (custom stylesheets)- Optimized images and content

- **State Management:** React Hooks (useState, useEffect, useCallback)- Touch-friendly navigation

- **Build Tool:** Create React App- Responsive typography

- **Package Manager:** npm

### User Experience

---- Form validation with error messages

- Loading states for better feedback

## 📁 Project Structure- Success messages and confirmations

- Intuitive navigation flow

```- Accessibility considerations

frontend/

├── public/### Modern React Patterns

│   ├── index.html              # HTML template- Functional components with hooks

│   └── assets/- State management with useState

│       └── images/             # Static images- Effect hooks for animations

│- Component composition

├── src/- Event handling and form management

│   ├── components/             # React components

│   │   ├── HomePage.js         # Landing page## Customization

│   │   ├── IntroPage.js        # Welcome page

│   │   ├── LoginPage.js        # Login form### Styling

│   │   ├── BranchSelectionPage.js- Main styles are in `src/styles/App.css`

│   │   ├── RoomSelectionPage.js- Uses CSS custom properties for theming

│   │   ├── BookingPage.js      # Booking form- Tailwind CSS for utility classes

│   │   ├── UserProfilePage.js- Component-specific styles inline

│   │   ├── ContactPage.js

│   │   ├── Navigation.js       # Navigation bar### Images

│   │   ├── Footer.js           # Footer component- Place your images in the `Images/` folder

│   │   │- Update image paths in components as needed

│   │   ├── Dashboard.js        # Main guest dashboard- Fallback images are provided for missing assets

│   │   ├── AdminDashboard.js   # Admin control panel

│   │   ├── ManagerDashboard.js### Content

│   │   ├── ReceptionistDashboard.js- Update hotel information in each component

│   │   ├── HousekeepingDashboard.js- Modify room types, offers, and locations

│   │   │- Customize contact information and social links

│   │   └── manager/            # Manager-specific components

│   │       ├── BranchAnalytics.js## Available Scripts

│   │       ├── RoomStatusWidget.js

│   │       └── ...- `npm start` - Runs the app in development mode

│   │- `npm run build` - Builds the app for production

│   ├── services/               # API service layer- `npm test` - Launches the test runner

│   │   ├── authService.js      # Authentication API- `npm run eject` - Ejects from Create React App (not recommended)

│   │   ├── userService.js      # User management API

│   │   ├── branchService.js    # Branch API## Browser Support

│   │   ├── roomTypeService.js  # Room types API

│   │   ├── roomService.js      # Rooms API- Chrome (latest)

│   │   ├── bookingService.js   # Booking API- Firefox (latest)

│   │   ├── serviceCatalogueService.js- Safari (latest)

│   │   ├── contactService.js   # Contact form API- Edge (latest)

│   │   ├── dashboardService.js # Dashboard stats API- Mobile browsers (iOS Safari, Chrome Mobile)

│   │   ├── reportService.js    # Reports API

│   │   └── index.js            # Service exports## Contributing

│   │

│   ├── config/1. Fork the repository

│   │   └── api.js              # Axios configuration2. Create a feature branch (`git checkout -b feature/amazing-feature`)

│   │3. Commit your changes (`git commit -m 'Add some amazing feature'`)

│   ├── utils/4. Push to the branch (`git push origin feature/amazing-feature`)

│   │   └── logger.js           # Custom logger (dev only)5. Open a Pull Request

│   │

│   ├── styles/                 # CSS stylesheets## License

│   │   ├── HomePage.css

│   │   ├── LoginPage.cssThis project is licensed under the MIT License - see the LICENSE file for details.

│   │   ├── Dashboard.css

│   │   ├── AdminDashboard.css## Support

│   │   └── ... (more styles)

│   │For support and questions, please contact:

│   ├── App.js                  # Main app component- Email: info@skynesthotels.com

│   └── index.js                # React entry point- Phone: +94 11 234 5678

│

├── .env                        # Environment variables---

├── .eslintrc.json             # ESLint configuration

├── package.jsonBuilt with ❤️ using React and modern web technologies.
└── README.md                   # This file
```

---

## 📦 Prerequisites

- Node.js v18.0.0 or higher
- npm v9.0.0 or higher
- Backend API running (see backend README)

---

## 🚀 Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Create Environment File

```bash
cat > .env << EOF
REACT_APP_API_URL=http://localhost:8084/api
REACT_APP_ENV=development
EOF
```

### 3. Verify Backend Connection

Ensure the backend API is running on `http://localhost:8084`

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:8084/api` |
| `REACT_APP_ENV` | Environment name | `development` or `production` |

### API Configuration (`src/config/api.js`)

```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8084/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handles token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Automatic token refresh logic
    // Redirects to login on auth failure
  }
);

export default apiClient;
```

---

## 🏃 Running the Application

### Development Mode

```bash
npm start
```

Application runs on `http://localhost:3000` with hot reload.

### Production Build

```bash
npm run build
```

Creates optimized production build in `build/` folder.

### Linting

```bash
npm run lint
```

Runs ESLint to check code quality.

---

## 🏗️ Building for Production

### Create Optimized Build

```bash
npm run build
```

**Build Output:**
- **Location:** `build/` directory
- **Optimized:** Minified and tree-shaken
- **Assets:** Cached with content hashes
- **Size:** ~120KB gzipped

### Build Analysis

The build process:
1. Compiles JSX to JavaScript
2. Minifies code
3. Optimizes images
4. Generates source maps
5. Creates asset manifest
6. Adds cache-busting hashes

### Serve Build Locally

```bash
npm install -g serve
serve -s build -p 3000
```

---

## 🧩 Components Overview

### Public Pages

**HomePage.js**
- Hero section with hotel showcase
- Featured rooms
- Special offers
- Quick booking call-to-action

**IntroPage.js**
- Welcome screen
- Hotel introduction
- Navigation to booking or login

**LoginPage.js**
- User authentication form
- Guest registration link
- Role-based redirection

**BranchSelectionPage.js**
- Display available branches
- Branch details and photos
- Selection for booking

**RoomSelectionPage.js**
- Display available rooms
- Filter by type, capacity, price
- Real-time availability check

**BookingPage.js**
- Complete booking form
- Date selection with validation
- Guest information capture
- Booking confirmation

**ContactPage.js**
- Contact form for inquiries
- Multiple inquiry types
- Form validation

### Dashboard Components

**Dashboard.js** (Guest)
- View own bookings
- Booking details
- Profile management
- Make new bookings

**AdminDashboard.js**
- Complete admin control panel
- 7-tab interface:
  1. Users - User management
  2. Branches - Branch CRUD
  3. Room Types - Room type management
  4. Rooms - Room inventory
  5. Services - Service catalogue
  6. Messages - Contact inquiries
  7. Booking Management - Check-in/out operations

**ManagerDashboard.js**
- Branch-specific dashboard
- Room status overview
- Booking management
- Service management
- Staff monitoring
- Reports and analytics

**ReceptionistDashboard.js**
- Guest check-in/out
- Current guests management
- Pending guests view
- Payment processing
- Outstanding balances

**HousekeepingDashboard.js**
- Assigned rooms view
- Cleaning status updates
- Room priorities

### Shared Components

**Navigation.js**
- Responsive navigation bar
- Role-based menu items
- User profile dropdown
- Logout functionality

**Footer.js**
- Footer with links
- Contact information
- Social media links

---

## 🔌 API Integration

### Service Layer Architecture

All API calls are centralized in the `services/` directory:

```javascript
// Example: bookingService.js
import apiClient from '../config/api';

const bookingService = {
  getAllBookings: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(`/bookings?${params}`);
    return response.data;
  },
  
  createBooking: async (bookingData) => {
    const response = await apiClient.post('/bookings', bookingData);
    return response.data;
  },
  
  checkIn: async (bookingId) => {
    const response = await apiClient.patch(`/bookings/${bookingId}/checkin`);
    return response.data;
  }
};

export default bookingService;
```

### Available Services

- `authService` - Login, register, logout, token refresh
- `userService` - User CRUD operations
- `branchService` - Branch management
- `roomTypeService` - Room type operations
- `roomService` - Room management
- `bookingService` - Booking operations
- `serviceCatalogueService` - Service management
- `contactService` - Contact form
- `dashboardService` - Dashboard statistics
- `reportService` - Generate reports

### Authentication Flow

1. User logs in → receives JWT tokens
2. Access token stored in `localStorage`
3. Refresh token stored in `localStorage`
4. Axios interceptor adds token to requests
5. Token refresh on 401 errors
6. Redirect to login on auth failure

---

## 🎨 Styling

### CSS Organization

Each component has its own stylesheet:
- Scoped styles for better maintainability
- Consistent naming conventions
- Responsive breakpoints
- Modern CSS features (flexbox, grid)

### Responsive Design

**Breakpoints:**
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

**Approach:**
- Mobile-first design
- Flexible layouts
- Touch-friendly buttons
- Readable typography

### Color Scheme

- **Primary:** Blue tones (#3B82F6)
- **Success:** Green (#10B981)
- **Warning:** Yellow (#F59E0B)
- **Error:** Red (#EF4444)
- **Neutral:** Gray shades

---

## 📊 State Management

### React Hooks

The application uses React Hooks for state management:

- `useState` - Component state
- `useEffect` - Side effects and data fetching
- `useCallback` - Memoized functions
- `useContext` - (if needed) Global state

### Example Pattern

```javascript
const [bookings, setBookings] = useState([]);
const [loading, setLoading] = useState(false);
const [filter, setFilter] = useState('confirmed');

const fetchBookings = useCallback(async () => {
  setLoading(true);
  try {
    const result = await bookingService.getAllBookings({ 
      status: filter 
    });
    if (result.success) {
      setBookings(result.bookings);
    }
  } catch (error) {
    logger.error('Fetch error', error);
  } finally {
    setLoading(false);
  }
}, [filter]);

useEffect(() => {
  fetchBookings();
}, [fetchBookings]);
```

---

## 🔒 Security

### Best Practices Implemented

- ✅ JWT token authentication
- ✅ Automatic token refresh
- ✅ Secure token storage (localStorage)
- ✅ Route protection based on roles
- ✅ Input validation on forms
- ✅ XSS prevention (React escaping)
- ✅ HTTPS ready (production)
- ✅ No sensitive data in logs (production)

---

## 🚢 Deployment

### Static Hosting (Recommended)

#### Netlify
```bash
npm run build
# Deploy build/ folder
```

#### Vercel
```bash
npm run build
vercel --prod
```

#### Nginx
```bash
npm run build

# Copy to web server
sudo cp -r build/* /var/www/skynest/

# Nginx configuration
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/skynest;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Environment Setup

**Production `.env`:**
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_ENV=production
```

### Docker Deployment (Optional)

**Dockerfile:**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build and run:**
```bash
docker build -t skynest-frontend .
docker run -d -p 80:80 skynest-frontend
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Login/logout flow
- [ ] User registration
- [ ] Booking creation
- [ ] Room selection and filtering
- [ ] Payment processing
- [ ] Dashboard navigation
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Token refresh

---

## 📝 Scripts Reference

```json
{
  "start": "react-scripts start",
  "build": "react-scripts build",
  "lint": "eslint src/**/*.{js,jsx}",
  "eject": "react-scripts eject"
}
```

---

## 🐛 Troubleshooting

### Common Issues

**API Connection Failed:**
- Check backend is running
- Verify `REACT_APP_API_URL` in `.env`
- Check CORS settings on backend

**Build Errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`

**Token Expired:**
- Automatic refresh should handle this
- Check refresh token validity
- Re-login if needed

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Run `npm run lint`
5. Submit a pull request

---

## 📞 Support

For issues or questions:
- Check browser console for errors
- Review network requests in DevTools
- Contact the development team

---

**Frontend developed with ❤️ for SkyNest Hotels**
