import { pool } from './db.js';
async function checkTable() {
    try {
        console.log('Checking booking_channels table structure...\n');
        const [columns] = await pool.query('DESCRIBE booking_channels');
        console.log('Current columns:');
        columns.forEach((col) => {
            console.log(`  - ${col.Field} (${col.Type})`);
        });
        process.exit(0);
    }
    catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}
checkTable();
//# sourceMappingURL=check-channels-table.js.map