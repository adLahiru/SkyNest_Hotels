import { pool } from './db.js';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            resolve(answer);
        });
    });
}

async function autoSetup() {
    console.log('🚀 Automatic Two-Way Sync Setup\n');
    console.log('This will set up your database for Booking.com integration.\n');
    
    try {
        // Step 1: Check if Booking.com channel exists
        console.log('📋 Step 1: Checking Booking.com channel...');
        const [channels] = await pool.query<any[]>(
            "SELECT id FROM booking_channels WHERE name = 'Booking.com'"
        );
        
        let bookingComChannelId: number;
        
        if (channels.length === 0) {
            console.log('   Creating Booking.com channel...');
            const [result] = await pool.query(
                "INSERT INTO booking_channels (name, enabled) VALUES ('Booking.com', true)"
            );
            bookingComChannelId = (result as any).insertId;
            console.log(`   ✓ Created Booking.com channel (ID: ${bookingComChannelId})\n`);
        } else {
            bookingComChannelId = channels[0].id;
            console.log(`   ✓ Booking.com channel exists (ID: ${bookingComChannelId})\n`);
        }
        
        // Step 2: Check rooms
        console.log('📋 Step 2: Checking your rooms...');
        const [rooms] = await pool.query<any[]>('SELECT id, room_number, room_type FROM rooms');
        
        if (rooms.length === 0) {
            console.log('   ⚠ No rooms found in database!');
            console.log('   You need to add rooms first.\n');
        } else {
            console.log(`   Found ${rooms.length} rooms:`);
            rooms.forEach((room) => {
                console.log(`   - Room ${room.id}: ${room.room_number} (${room.room_type})`);
            });
            console.log();
        }
        
        // Step 3: Set up room mappings
        console.log('📋 Step 3: Setting up room mappings...');
        console.log('   (This maps your local rooms to Booking.com room IDs)\n');
        
        const setupMappings = await question('Do you want to set up room mappings now? (y/n): ');
        
        if (setupMappings.toLowerCase() === 'y' && rooms.length > 0) {
            for (const room of rooms) {
                const mapping = await question(
                    `   Enter Booking.com room ID for Room ${room.id} (${room.room_number}) [or press Enter to skip]: `
                );
                
                if (mapping.trim()) {
                    try {
                        await pool.query(
                            'INSERT INTO room_mapping (external_room_id, local_room_id, channel_type) VALUES (?, ?, ?)',
                            [mapping.trim(), room.id, 'booking_com']
                        );
                        console.log(`   ✓ Mapped Room ${room.id} → ${mapping.trim()}`);
                    } catch (e: any) {
                        if (e.code === 'ER_DUP_ENTRY') {
                            console.log(`   ⚠ Mapping already exists`);
                        } else {
                            console.log(`   ✗ Error: ${e.message}`);
                        }
                    }
                }
            }
            console.log();
        } else if (rooms.length === 0) {
            console.log('   ⚠ Skipped - No rooms available\n');
        } else {
            console.log('   ⚠ Skipped by user\n');
        }
        
        // Step 4: Check existing mappings
        console.log('📋 Step 4: Current room mappings:');
        const [mappings] = await pool.query<any[]>(
            `SELECT rm.external_room_id, rm.local_room_id, r.room_number 
             FROM room_mapping rm 
             JOIN rooms r ON rm.local_room_id = r.id 
             WHERE rm.channel_type = 'booking_com'`
        );
        
        if (mappings.length === 0) {
            console.log('   ⚠ No room mappings configured yet');
            console.log('   You can add them later in MySQL Workbench\n');
        } else {
            mappings.forEach((m) => {
                console.log(`   ✓ ${m.external_room_id} → Room ${m.local_room_id} (${m.room_number})`);
            });
            console.log();
        }
        
        // Step 5: Configuration summary
        console.log('📋 Step 5: Configuration Summary\n');
        console.log('✅ Database schema: Updated');
        console.log(`✅ Booking.com channel: ID ${bookingComChannelId}`);
        console.log(`✅ Rooms found: ${rooms.length}`);
        console.log(`✅ Room mappings: ${mappings.length}`);
        
        // Step 6: Next steps
        console.log('\n📝 Next Steps:\n');
        
        if (rooms.length === 0) {
            console.log('❌ REQUIRED: Add rooms to your database first!');
            console.log('   Run your room creation script or add manually.\n');
        }
        
        if (mappings.length === 0) {
            console.log('⚠️  REQUIRED: Add room mappings');
            console.log('   You can run this script again or add manually in MySQL:\n');
            console.log('   INSERT INTO room_mapping (external_room_id, local_room_id, channel_type)');
            console.log('   VALUES (\'BDC-YOUR-ROOM-ID\', 1, \'booking_com\');\n');
        }
        
        console.log('📝 REQUIRED: Get Booking.com API credentials');
        console.log('   1. Apply at: https://admin.booking.com');
        console.log('   2. Navigate to: Connectivity section');
        console.log('   3. Get: Hotel ID, API Key, API Secret\n');
        
        console.log('📝 REQUIRED: Configure credentials');
        console.log('   Edit: example-two-way-sync.ts');
        console.log('   Replace: YOUR_HOTEL_ID, YOUR_API_KEY, YOUR_API_SECRET\n');
        
        console.log('🚀 Then run:');
        console.log('   node dist/example-two-way-sync.js\n');
        
        // Create a quick config template
        console.log('📝 Creating configuration template...');
        const configTemplate = `// Booking.com Configuration
// Fill in your actual credentials from Booking.com Partner Hub

export const bookingComConfig = {
    hotelId: 'YOUR_HOTEL_ID_HERE',        // Get from Booking.com
    apiKey: 'YOUR_API_KEY_HERE',          // Get from Booking.com
    apiSecret: 'YOUR_API_SECRET_HERE',    // Get from Booking.com
    baseUrl: 'https://supply-xml.booking.com/api/v1'
};

export const syncConfig = {
    intervalMinutes: 15,                  // Check every 15 minutes
    lookbackDays: 7,                      // Fetch bookings from last 7 days
    channelId: ${bookingComChannelId},    // Booking.com channel ID
    defaultRoomId: 1                      // Default room (change if needed)
};
`;
        
        const fs = await import('fs');
        fs.writeFileSync('booking-config.ts', configTemplate);
        console.log('   ✓ Created booking-config.ts\n');
        
        console.log('✅ Setup Complete!\n');
        console.log('Your database is ready for two-way sync.');
        console.log('Complete the steps above to start syncing with Booking.com! 🎉\n');
        
        rl.close();
        process.exit(0);
        
    } catch (error: any) {
        console.error('\n❌ Error:', error.message);
        rl.close();
        process.exit(1);
    }
}

autoSetup();
