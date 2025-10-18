import { db } from '../config/db';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../config/.env.development') });

const createContactTable = async () => {
  try {
    console.log('Creating contact table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS contact (
        contact_id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
        user_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NULL,
        inquiry_type VARCHAR(50) NOT NULL DEFAULT 'general',
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('pending', 'read', 'replied', 'closed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_inquiry_type (inquiry_type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `;

    await db.query(createTableSQL);
    console.log('✅ Contact table created successfully!');
    
    // Verify table was created
    const [tables]: any = await db.query("SHOW TABLES LIKE 'contact'");
    if (tables.length > 0) {
      console.log('✅ Verified: contact table exists');
      
      // Show table structure
      const [columns]: any = await db.query('DESCRIBE contact');
      console.log('\nTable structure:');
      console.table(columns);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating contact table:', error);
    process.exit(1);
  }
};

createContactTable();
