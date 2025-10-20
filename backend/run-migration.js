const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '35.154.58.37',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'SkyNest_Hotels',
      connectTimeout: 10000
    });
    
    console.log('✓ Connected to database');
    console.log('Running migration: Add branch_id and photo to service_types...\n');
    
    // Step 1: Add branch_id column with foreign key
    console.log('Step 1: Adding branch_id column...');
    await connection.query(`
      ALTER TABLE service_types 
      ADD COLUMN branch_id CHAR(36) NULL AFTER service_type_id
    `);
    console.log('✓ branch_id column added');
    
    // Step 2: Add foreign key constraint
    console.log('Step 2: Adding foreign key constraint...');
    try {
      await connection.query(`
        ALTER TABLE service_types
        ADD CONSTRAINT fk_service_type_branch 
        FOREIGN KEY (branch_id) REFERENCES branch(branch_id) 
        ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log('✓ Foreign key constraint added');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('⚠ Foreign key constraint already exists, skipping...');
      } else {
        throw error;
      }
    }
    
    // Step 3: Add photo column
    console.log('Step 3: Adding photo column...');
    await connection.query(`
      ALTER TABLE service_types 
      ADD COLUMN photo LONGBLOB NULL AFTER description
    `);
    console.log('✓ photo column added');
    
    // Step 4: Create index on branch_id
    console.log('Step 4: Creating index on branch_id...');
    try {
      await connection.query(`
        CREATE INDEX idx_service_type_branch ON service_types(branch_id)
      `);
      console.log('✓ Index idx_service_type_branch created');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('⚠ Index idx_service_type_branch already exists, skipping...');
      } else {
        throw error;
      }
    }
    
    // Step 5: Create composite index on branch_id and is_active
    console.log('Step 5: Creating composite index on branch_id and is_active...');
    try {
      await connection.query(`
        CREATE INDEX idx_service_type_branch_active ON service_types(branch_id, is_active)
      `);
      console.log('✓ Index idx_service_type_branch_active created');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('⚠ Index idx_service_type_branch_active already exists, skipping...');
      } else {
        throw error;
      }
    }
    
    // Verify the changes
    console.log('\nVerifying table structure...');
    const [columns] = await connection.query(`
      DESCRIBE service_types
    `);
    
    console.log('\n✓ Migration completed successfully!');
    console.log('\nUpdated service_types table structure:');
    console.table(columns);
    
    // Show indexes
    const [indexes] = await connection.query(`
      SHOW INDEX FROM service_types
    `);
    console.log('\nTable indexes:');
    console.table(indexes.map(idx => ({
      Key_name: idx.Key_name,
      Column_name: idx.Column_name,
      Index_type: idx.Index_type
    })));
    
  } catch (error) {
    console.error('\n✗ Migration failed!');
    
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.error('Column already exists. The migration may have been run previously.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Could not connect to database. Please check your connection settings.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied. Please check your database credentials.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection timeout. Please check your network connection.');
    } else {
      console.error('Error:', error.message);
      console.error('Code:', error.code);
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✓ Database connection closed');
    }
  }
}

// Run the migration
runMigration();
