import { pool } from './db.js';
async function viewMappings() {
    try {
        console.log('🔍 Current Room Mappings:\n');
        const [mappings] = await pool.query(`SELECT 
                rm.id,
                rm.external_room_id,
                rm.local_room_id,
                r.room_number,
                r.room_type,
                rm.channel_type,
                rm.created_at
             FROM room_mapping rm
             LEFT JOIN rooms r ON rm.local_room_id = r.id
             ORDER BY rm.local_room_id`);
        if (mappings.length === 0) {
            console.log('No room mappings found.\n');
        }
        else {
            console.log(`Found ${mappings.length} room mapping(s):\n`);
            mappings.forEach((m, i) => {
                console.log(`${i + 1}. Mapping ID: ${m.id}`);
                console.log(`   External ID: ${m.external_room_id}`);
                console.log(`   Local Room: ${m.local_room_id} - ${m.room_number || 'N/A'} (${m.room_type || 'N/A'})`);
                console.log(`   Channel: ${m.channel_type}`);
                console.log(`   Created: ${m.created_at}`);
                console.log();
            });
        }
        // Also show all rooms
        console.log('📋 All Rooms in Database:\n');
        const [rooms] = await pool.query('SELECT id, room_number, room_type FROM rooms ORDER BY id');
        if (rooms.length === 0) {
            console.log('No rooms found.\n');
        }
        else {
            rooms.forEach((r) => {
                const hasMappingResult = mappings.find((m) => m.local_room_id === r.id);
                const hasMapping = hasMappingResult ? '✓ Mapped' : '✗ Not mapped';
                console.log(`Room ${r.id}: ${r.room_number} (${r.room_type}) - ${hasMapping}`);
            });
            console.log();
        }
        console.log('✅ Done!\n');
        if (mappings.length > 0) {
            console.log('To update a mapping:');
            console.log('UPDATE room_mapping SET external_room_id = \'NEW_ID\' WHERE id = X;\n');
            console.log('To delete a mapping:');
            console.log('DELETE FROM room_mapping WHERE id = X;\n');
            console.log('To delete all mappings:');
            console.log('DELETE FROM room_mapping WHERE channel_type = \'booking_com\';\n');
        }
        process.exit(0);
    }
    catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}
viewMappings();
//# sourceMappingURL=view-mappings.js.map