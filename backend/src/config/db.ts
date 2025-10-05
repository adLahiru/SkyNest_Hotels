import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Determine the environment and load the corresponding .env file
const environment = process.env.NODE_ENV || 'development';
const envFile = path.join(__dirname, '../../config', `.env.${environment}`);

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
  queueLimit: 0
};

// Create connection pool for better performance
console.log(`🔗 Creating database pool: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`);
export const db = mysql.createPool(dbConfig);

// Test connection function
export const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log(`✅ Database connected successfully to ${environment} environment!`);
    console.log(`📊 Database: ${dbConfig.database}`);
    console.log('─'.repeat(50));
    connection.release();
    return true;
  } catch (error) {
    console.error(`❌ Database connection failed for ${environment} environment:`);
    console.error('Error details:', error);
    console.log('─'.repeat(50));
    throw error;
  }
};

// Legacy connection function for backward compatibility
const connection = async () => {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (error) {
    console.error(`❌ Database connection failed for ${environment} environment:`);
    console.error('Error details:', error);
    throw error;
  }
};

export default connection;
