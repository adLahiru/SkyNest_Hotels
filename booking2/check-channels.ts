import { pool } from './db.js';

async function checkChannels() {
    console.log('📋 Checking booking channels...\n');
    
    const [channels] = await pool.query('SELECT * FROM booking_channels');
    
    if ((channels as any[]).length === 0) {
        console.log('No channels found. Creating Direct channel...\n');
        await pool.query("INSERT INTO booking_channels (name, enabled) VALUES ('Direct Website', true)");
        console.log('✓ Created Direct channel\n');
    }
    
    const [allChannels] = await pool.query('SELECT * FROM booking_channels');
    console.log('Available channels:');
    (allChannels as any[]).forEach((ch: any) => {
        console.log(`  ID: ${ch.id} - ${ch.name} (${ch.enabled ? 'enabled' : 'disabled'})`);
    });
    
    process.exit(0);
}

checkChannels();
