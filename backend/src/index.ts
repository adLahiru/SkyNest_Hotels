/**
 * Main Application Entry Point
 * 
 * Initializes the Express server with middleware, routes, and error handling.
 * Configures CORS, JSON parsing, and establishes database connection.
 */

import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { testConnection } from './config/db';
import routes from './routes';
import { logInfo, logError, logWarn } from './utils/logger';

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - Increase limit for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS middleware (basic implementation)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to SkyNest Hotels API!',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      branches: '/api/branches',
      roomTypes: '/api/room-types',
      rooms: '/api/rooms',
      bookings: '/api/bookings',
      services: '/api/services',
      discounts: '/api/discounts'
    }
  });
});

/**
 * Global error handling middleware
 * Catches unhandled errors and returns a generic error response
 */
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logError('Unhandled error in request', error, {
    method: req.method,
    url: req.url,
    body: req.body,
  });
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

/**
 * Start the Express server
 * Tests database connection and initializes the HTTP server
 */
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    logInfo('Database connection established successfully');
    
    app.listen(PORT, () => {
      try {
        const bannerPath = path.join(__dirname, '..', 'banner.txt');
        const banner = fs.readFileSync(bannerPath, 'utf8');
        console.log(banner); // Keep banner in console for visual appeal
      } catch (error) {
        logWarn('Banner file not found');
      }
      
      // Log server startup information
      logInfo(`Server started successfully on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
      });
      
      // Display endpoint information in console (for development)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`\n🚀 Server is running on port ${PORT}`);
        console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
        console.log(`🔐 Auth Endpoints: http://localhost:${PORT}/api/auth`);
        console.log(`👥 User Management: http://localhost:${PORT}/api/users`);
        console.log(`🏢 Branch Management: http://localhost:${PORT}/api/branches`);
        console.log(`🏠 Room Type Management: http://localhost:${PORT}/api/room-types`);
        console.log(`🚪 Room Management: http://localhost:${PORT}/api/rooms`);
        console.log(`📅 Booking System: http://localhost:${PORT}/api/bookings`);
        console.log(`🛎️  Service Catalogue: http://localhost:${PORT}/api/services`);
        console.log(`🎟️  Discount Management: http://localhost:${PORT}/api/discounts`);
        console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
        console.log('─'.repeat(50));
      }
    });
  } catch (error) {
    logError('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
