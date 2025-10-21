import { pool } from './db.js';

async function addDirectChannel() {
    console.log('Adding Direct channel...\n');
    
    try {
        // Add the channel with all required fields
        const [result] = await pool.query(
            "INSERT INTO booking_channels (name, api_key, api_secret, hotel_id) VALUES ('Direct Website', '', '', '')"
        );
        console.log('✓ Created Direct Website channel');
        console.log(`  ID: ${(result as any).insertId}\n`);
    } catch (e: any) {
        if (e.code === 'ER_DUP_ENTRY') {
            console.log('⚠ Direct channel already exists\n');
        } else {
            console.error('Error:', e.message);
        }
    }
    
    // Show all channels
    const [all] = await pool.query('SELECT * FROM booking_channels ORDER BY id');
    console.log('All channels:');
    (all as any[]).forEach((ch: any) => {
        console.log(`  ${ch.id}. ${ch.name}`);
    });
    console.log();
    
    process.exit(0);
}

addDirectChannel();
