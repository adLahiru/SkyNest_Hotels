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

// Create connection with error handling
const connection = async () => {
  try {
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'SkyNest_Hotels',
      port: parseInt(process.env.DB_PORT || '3306'),
    };

    console.log(`🔗 Connecting to database: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`);
    // console.log(`👤 Using user: ${dbConfig.user}`);
    
    const connection = await mysql.createConnection(dbConfig);
    
    console.log(`✅ Database connected successfully to ${environment} environment!`);
    // console.log(`📊 Database: ${dbConfig.database}`);
    console.log('─'.repeat(50));
    
    return connection;
  } catch (error) {
    console.error(`❌ Database connection failed for ${environment} environment:`);
    console.error('Error details:', error);
    console.log('─'.repeat(50));
    throw error;
  }
};


export default connection;
