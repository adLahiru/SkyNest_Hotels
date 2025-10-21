import { pool } from './db.js';
async function updateSchema() {
    console.log('🔄 Updating database schema...\n');
    try {
        // 1. Add columns to bookings table
        console.log('1. Adding new columns to bookings table...');
        const columns = [
            'guest_name VARCHAR(255) NULL AFTER status',
            'guest_email VARCHAR(255) NULL AFTER guest_name',
            'guest_phone VARCHAR(50) NULL AFTER guest_email',
            'guest_nationality VARCHAR(3) NULL AFTER guest_phone',
            'total_price DECIMAL(10,2) NULL AFTER guest_nationality',
            'currency VARCHAR(3) NULL AFTER total_price',
            'synced_to_booking_com BOOLEAN DEFAULT FALSE AFTER currency',
            'synced_at TIMESTAMP NULL AFTER synced_to_booking_com',
            'cancellation_reason TEXT NULL AFTER synced_at',
            'cancelled_at TIMESTAMP NULL AFTER cancellation_reason',
            'modified_at TIMESTAMP NULL AFTER cancelled_at'
        ];
        for (const col of columns) {
            try {
                await pool.query(`ALTER TABLE bookings ADD COLUMN ${col}`);
                console.log(`   ✓ Added ${col.split(' ')[0]}`);
            }
            catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') {
                    console.log(`   ⚠ ${col.split(' ')[0]} already exists`);
                }
                else {
                    throw e;
                }
            }
        }
        console.log('   ✓ Bookings table updated\n');
        // 2. Add indexes
        console.log('2. Adding indexes...');
        try {
            await pool.query('ALTER TABLE bookings ADD INDEX idx_guest_email (guest_email)');
            console.log('   ✓ Added idx_guest_email');
        }
        catch (e) {
            if (e.code === 'ER_DUP_KEYNAME') {
                console.log('   ⚠ idx_guest_email already exists');
            }
        }
        try {
            await pool.query('ALTER TABLE bookings ADD INDEX idx_booking_dates (start_date, end_date)');
            console.log('   ✓ Added idx_booking_dates');
        }
        catch (e) {
            if (e.code === 'ER_DUP_KEYNAME') {
                console.log('   ⚠ idx_booking_dates already exists');
            }
        }
        console.log();
        // 3. Create room_mapping table
        console.log('3. Creating room_mapping table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS room_mapping (
                id INT AUTO_INCREMENT PRIMARY KEY,
                external_room_id VARCHAR(100) NOT NULL,
                local_room_id INT NOT NULL,
                channel_type ENUM('booking_com', 'expedia', 'airbnb', 'direct') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_mapping (external_room_id, channel_type),
                FOREIGN KEY (local_room_id) REFERENCES rooms(id) ON DELETE CASCADE,
                INDEX idx_channel_external (channel_type, external_room_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('   ✓ Room mapping table created\n');
        // 4. Update booking_channels table
        console.log('4. Adding API credential columns to booking_channels...');
        const channelColumns = [
            'api_key VARCHAR(500) NULL',
            'api_secret VARCHAR(500) NULL',
            'hotel_id VARCHAR(100) NULL'
        ];
        for (const col of channelColumns) {
            try {
                await pool.query(`ALTER TABLE booking_channels ADD COLUMN ${col}`);
                console.log(`   ✓ Added ${col.split(' ')[0]}`);
            }
            catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') {
                    console.log(`   ⚠ ${col.split(' ')[0]} already exists`);
                }
                else {
                    throw e;
                }
            }
        }
        console.log('   ✓ Booking channels table updated\n');
        // 5. Verify
        console.log('📋 Verifying changes...\n');
        const [tables] = await pool.query('SHOW TABLES');
        console.log(`✓ Total tables: ${tables.length}`);
        tables.forEach((table) => {
            console.log(`  - ${Object.values(table)[0]}`);
        });
        console.log('\n✅ Schema update completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Add room mappings:');
        console.log('   INSERT INTO room_mapping (external_room_id, local_room_id, channel_type)');
        console.log('   VALUES (\'BDC-ROOM-001\', 1, \'booking_com\');');
        console.log('\n2. Run test: node dist/test-db-connection.js');
        console.log('3. Configure credentials in example-two-way-sync.ts');
        process.exit(0);
    }
    catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('SQL State:', error.sqlState);
        console.error('Code:', error.code);
        process.exit(1);
    }
}
updateSchema();
//# sourceMappingURL=update-schema-simple.js.map