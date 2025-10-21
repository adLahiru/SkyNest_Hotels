import mysql from 'mysql2/promise';

async function testConnection() {
    console.log('Testing database connection...\n');
    
    try {
        // Test 1: Connect to MySQL server (no database)
        console.log('Test 1: Connecting to MySQL server...');
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '@Hkbag2003'
        });
        console.log('✓ MySQL server connection successful!\n');
        
        // Test 2: Check if database exists
        console.log('Test 2: Checking if hotel_booking_sync database exists...');
        const [databases] = await connection.query('SHOW DATABASES LIKE "hotel_booking_sync"');
        
        if ((databases as any[]).length === 0) {
            console.log('✗ Database "hotel_booking_sync" does NOT exist!');
            console.log('\nCreating database...');
            await connection.query('CREATE DATABASE hotel_booking_sync');
            console.log('✓ Database created successfully!\n');
        } else {
            console.log('✓ Database exists!\n');
        }
        
        // Test 3: Connect to the database
        console.log('Test 3: Connecting to hotel_booking_sync database...');
        await connection.changeUser({ database: 'hotel_booking_sync' });
        console.log('✓ Connected to hotel_booking_sync!\n');
        
        // Test 4: Check tables
        console.log('Test 4: Checking existing tables...');
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`Found ${(tables as any[]).length} tables:`);
        (tables as any[]).forEach((table: any) => {
            console.log(`  - ${Object.values(table)[0]}`);
        });
        
        if ((tables as any[]).length === 0) {
            console.log('\n⚠ No tables found. You need to run your schema setup!');
        }
        
        console.log('\n✅ All connection tests passed!');
        
        await connection.end();
        
    } catch (error: any) {
        console.error('\n❌ Connection Error:');
        console.error('Message:', error.message);
        console.error('Code:', error.code);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n💡 FIX: Wrong username or password');
            console.error('   Check your credentials in db.ts');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 FIX: MySQL server is not running');
            console.error('   Start MySQL server first');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('\n💡 FIX: Database does not exist');
            console.error('   Run: CREATE DATABASE hotel_booking_sync;');
        }
    }
}

testConnection();
