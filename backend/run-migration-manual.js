/**
 * Database Migration Script
 * Run this to add branch_id and photo columns to service_types table
 * 
 * INSTRUCTIONS:
 * 1. Make sure your backend server is NOT running (stop it first)
 * 2. Update the database credentials below if needed
 * 3. Run: node run-migration-manual.js <password>
 *    Example: node run-migration-manual.js YourDatabasePassword
 */

const mysql = require('mysql2/promise');

// Get password from command line argument
const DB_PASSWORD = process.argv[2];

if (!DB_PASSWORD) {
  console.error('\n❌ Error: Database password required!');
  console.error('\nUsage: node run-migration-manual.js <password>');
  console.error('Example: node run-migration-manual.js YourDatabasePassword\n');
  process.exit(1);
}

// Database configuration
const DB_CONFIG = {
  host: '35.154.58.37',
  port: 3306,
  user: 'root',
  password: DB_PASSWORD,
  database: 'SkyNest_Hotels',
  connectTimeout: 10000
};

async function runMigration() {
  let connection;
  
  try {
    console.log('\n🔄 Starting migration...');
    console.log('📡 Connecting to database at', DB_CONFIG.host, '...');
    
    connection = await mysql.createConnection(DB_CONFIG);
    
    console.log('✅ Connected to database successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  RUNNING MIGRATION: Add branch_id and photo  ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Step 1: Add branch_id column
    console.log('📝 Step 1/5: Adding branch_id column...');
    try {
      await connection.query(`
        ALTER TABLE service_types 
        ADD COLUMN branch_id CHAR(36) NULL AFTER service_type_id
      `);
      console.log('   ✅ branch_id column added');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('   ⚠️  branch_id column already exists, skipping...');
      } else {
        throw error;
      }
    }
    
    // Step 2: Add foreign key constraint
    console.log('\n📝 Step 2/5: Adding foreign key constraint...');
    try {
      await connection.query(`
        ALTER TABLE service_types
        ADD CONSTRAINT fk_service_type_branch 
        FOREIGN KEY (branch_id) REFERENCES branch(branch_id) 
        ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log('   ✅ Foreign key constraint added');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('   ⚠️  Foreign key constraint already exists, skipping...');
      } else {
        throw error;
      }
    }
    
    // Step 3: Add photo column
    console.log('\n📝 Step 3/5: Adding photo column...');
    try {
      await connection.query(`
        ALTER TABLE service_types 
        ADD COLUMN photo LONGBLOB NULL AFTER description
      `);
      console.log('   ✅ photo column added');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('   ⚠️  photo column already exists, skipping...');
      } else {
        throw error;
      }
    }
    
    // Step 4: Create index on branch_id
    console.log('\n📝 Step 4/5: Creating index on branch_id...');
    try {
      await connection.query(`
        CREATE INDEX idx_service_type_branch ON service_types(branch_id)
      `);
      console.log('   ✅ Index idx_service_type_branch created');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('   ⚠️  Index idx_service_type_branch already exists, skipping...');
      } else {
        throw error;
      }
    }
    
    // Step 5: Create composite index
    console.log('\n📝 Step 5/5: Creating composite index on branch_id and is_active...');
    try {
      await connection.query(`
        CREATE INDEX idx_service_type_branch_active ON service_types(branch_id, is_active)
      `);
      console.log('   ✅ Index idx_service_type_branch_active created');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('   ⚠️  Index idx_service_type_branch_active already exists, skipping...');
      } else {
        throw error;
      }
    }
    
    // Verify the changes
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  VERIFYING CHANGES  ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const [columns] = await connection.query(`DESCRIBE service_types`);
    
    console.log('📊 Updated service_types table structure:\n');
    console.table(columns.map(col => ({
      Field: col.Field,
      Type: col.Type,
      Null: col.Null,
      Key: col.Key,
      Default: col.Default
    })));
    
    // Show indexes
    const [indexes] = await connection.query(`SHOW INDEX FROM service_types`);
    console.log('\n🔑 Table indexes:\n');
    console.table(indexes.map(idx => ({
      Key_name: idx.Key_name,
      Column: idx.Column_name,
      Type: idx.Index_type,
      Unique: idx.Non_unique === 0 ? 'Yes' : 'No'
    })));
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ✅ MIGRATION COMPLETED SUCCESSFULLY!  ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🎉 The service_types table now has:');
    console.log('   • branch_id column (links to branch table)');
    console.log('   • photo column (stores service images)');
    console.log('   • Proper indexes for performance\n');
    
    console.log('📌 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. Go to Admin Dashboard → Services tab');
    console.log('   3. Try adding a service with branch and photo\n');
    
  } catch (error) {
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('  ❌ MIGRATION FAILED!  ');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Could not connect to database.');
      console.error('   Check: Is the database server running?');
      console.error('   Check: Is the host address correct? (', DB_CONFIG.host, ')');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('❌ Access denied!');
      console.error('   Check: Is the password correct?');
      console.error('   Check: Does the user have ALTER privileges?');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('❌ Connection timeout!');
      console.error('   Check: Network connection');
      console.error('   Check: Firewall settings');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('❌ Database not found!');
      console.error('   Check: Does the database "', DB_CONFIG.database, '" exist?');
    } else if (error.code === 'ER_BAD_TABLE_ERROR') {
      console.error('❌ Table "service_types" not found!');
      console.error('   Check: Does the table exist in the database?');
    } else {
      console.error('❌ Error:', error.message);
      if (error.code) console.error('   Code:', error.code);
      if (error.sql) console.error('   SQL:', error.sql);
    }
    
    console.error('\n💡 Tip: Double-check your database credentials and connection.\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed\n');
    }
  }
}

// Run the migration
console.log('\n╔════════════════════════════════════════════╗');
console.log('║  Service Types Migration Tool              ║');
console.log('║  Adding branch_id and photo support        ║');
console.log('╚════════════════════════════════════════════╝');

runMigration();
