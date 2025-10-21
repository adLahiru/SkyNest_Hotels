/**
 * Database Configuration
 * 
 * Manages MySQL database connection pool with:
 * - Environment-specific configuration
 * - Connection pooling for performance
 * - Automatic connection testing
 * - Error handling and logging
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { logInfo, logError } from '../utils/logger';

// Determine the environment and load the corresponding .env file
const environment = process.env.NODE_ENV || 'development';
const envFile = path.join(__dirname, '../../config', `.env.${environment}`);

// Log environment info (console for immediate startup feedback)
console.log(`🌍 Loading environment: ${environment}`);
console.log(`📁 Environment file: ${envFile}`);

// Load environment variables from the specific .env file
dotenv.config({ path: envFile });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'SkyNest_Hotels',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds to establish connection
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create connection pool for better performance
console.log(`🔗 Creating database pool: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`);
logInfo('Database pool created', {
  database: dbConfig.database,
  host: dbConfig.host,
  port: dbConfig.port,
  environment
});

export const db = mysql.createPool(dbConfig);

/**
 * Test database connection
 * Attempts to acquire a connection from the pool to verify connectivity
 * @returns {Promise<boolean>} True if connection successful
 * @throws {Error} If connection fails
 */
export const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log(`✅ Database connected successfully to ${environment} environment!`);
    console.log(`📊 Database: ${dbConfig.database}`);
    console.log('─'.repeat(50));
    
    logInfo('Database connection test successful', {
      environment,
      database: dbConfig.database,
      host: dbConfig.host
    });
    
    connection.release();
    return true;
  } catch (error) {
    console.error(`❌ Database connection failed for ${environment} environment:`);
    console.error('Error details:', error);
    console.log('─'.repeat(50));
    
    logError('Database connection test failed', error, {
      environment,
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port
    });
    
    throw error;
  }
};

/**
 * Legacy connection function for backward compatibility
 * Creates a new database connection (not from pool)
 * @deprecated Use db.getConnection() from pool instead
 * @returns {Promise<Connection>} MySQL connection
 * @throws {Error} If connection fails
 */
const connection = async () => {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (error) {
    console.error(`❌ Database connection failed for ${environment} environment:`);
    console.error('Error details:', error);
    
    logError('Legacy database connection failed', error, {
      environment,
      database: dbConfig.database
    });
    
    throw error;
  }
};

export default connection;
