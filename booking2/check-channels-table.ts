import { pool } from './db.js';

async function checkTable() {
    try {
        console.log('Checking booking_channels table structure...\n');
        
        const [columns] = await pool.query('DESCRIBE booking_channels');
        console.log('Current columns:');
        (columns as any[]).forEach((col: any) => {
            console.log(`  - ${col.Field} (${col.Type})`);
        });
        
        process.exit(0);
    } catch (error: any) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkTable();
