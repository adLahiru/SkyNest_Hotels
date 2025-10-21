import { pool } from './db.js';
async function setupDirectChannel() {
    console.log('Setting up Direct channel...\n');
    // Check if Direct channel exists
    const [existing] = await pool.query("SELECT id FROM booking_channels WHERE name LIKE '%Direct%' OR name LIKE '%Website%'");
    if (existing.length > 0) {
        console.log('✓ Direct channel already exists');
        console.log(`  ID: ${existing[0].id}\n`);
    }
    else {
        const [result] = await pool.query("INSERT INTO booking_channels (name, enabled) VALUES ('Direct Website', true)");
        console.log('✓ Created Direct Website channel');
        console.log(`  ID: ${result.insertId}\n`);
    }
    // Show all channels
    const [all] = await pool.query('SELECT * FROM booking_channels ORDER BY id');
    console.log('All channels:');
    all.forEach((ch) => {
        console.log(`  ${ch.id}. ${ch.name} (${ch.enabled ? 'enabled' : 'disabled'})`);
    });
    process.exit(0);
}
setupDirectChannel();
//# sourceMappingURL=setup-direct-channel.js.map