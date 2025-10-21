import { pool } from './db.js';
import * as fs from 'fs';
import * as path from 'path';

async function runSchemaUpdate() {
    console.log('🔄 Running database schema update...\n');
    
    try {
        // Read the SQL file
        const sqlFile = path.join(process.cwd(), 'update-database-schema.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf-8');
        
        // Split by semicolons and filter out empty statements
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SELECT'));
        
        console.log(`Found ${statements.length} SQL statements to execute\n`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            if (!statement) continue;
            
            if (statement.includes('ALTER TABLE bookings')) {
                console.log(`${i + 1}. Adding columns to bookings table...`);
            } else if (statement.includes('CREATE TABLE')) {
                console.log(`${i + 1}. Creating room_mapping table...`);
            } else if (statement.includes('ALTER TABLE booking_channels')) {
                console.log(`${i + 1}. Adding API credential columns to booking_channels...`);
            } else {
                console.log(`${i + 1}. Executing statement...`);
            }
            
            try {
                await pool.query(statement);
                console.log('   ✓ Success\n');
            } catch (error: any) {
                // Ignore "duplicate column" errors (means already exists)
                if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log('   ⚠ Already exists (skipping)\n');
                } else {
                    console.error('   ✗ Error:', error.message);
                    console.error('   Statement:', statement.substring(0, 100) + '...\n');
                }
            }
        }
        
        // Verify changes
        console.log('📋 Verifying changes...\n');
        
        const [tables] = await pool.query('SHOW TABLES');
        console.log(`✓ Total tables: ${(tables as any[]).length}`);
        (tables as any[]).forEach((table: any) => {
            console.log(`  - ${Object.values(table)[0]}`);
        });
        
        console.log('\n✅ Schema update completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Add room mappings (see setup-room-mapping.sql)');
        console.log('2. Configure Booking.com credentials');
        console.log('3. Run: node dist/example-two-way-sync.js');
        
        process.exit(0);
        
    } catch (error: any) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

runSchemaUpdate();
