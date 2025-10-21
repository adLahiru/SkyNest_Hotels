/**
 * Complete Example: Two-Way Sync with Booking.com
 *
 * This shows how to use the integrated booking service that:
 * 1. PULLS bookings FROM Booking.com (sync service)
 * 2. PUSHES availability TO Booking.com (availability push)
 */
import { createSyncService } from './booking-sync-service.js';
import { createIntegratedBookingService } from './integrated-booking-service.js';
// ============================================
// STEP 1: Configure Booking.com Credentials
// ============================================
const bookingComConfig = {
    hotelId: 'YOUR_HOTEL_ID',
    apiKey: 'YOUR_API_KEY',
    apiSecret: 'YOUR_API_SECRET',
    baseUrl: 'https://supply-xml.booking.com/api/v1'
};
const syncConfig = {
    intervalMinutes: 15, // Check for new bookings every 15 minutes
    lookbackDays: 7,
    channelId: 1, // Your Booking.com channel ID
    defaultRoomId: 1
};
// ============================================
// STEP 2: Create Services
// ============================================
// Service 1: Pull bookings FROM Booking.com (runs automatically)
const syncService = createSyncService(bookingComConfig, syncConfig);
// Service 2: Push availability TO Booking.com (automatic on booking create/cancel)
const bookingService = createIntegratedBookingService(bookingComConfig);
// ============================================
// STEP 3: Start Automatic Sync (Pull)
// ============================================
syncService.start();
console.log('✓ Booking pull service started (gets bookings FROM Booking.com)');
console.log('✓ Availability push enabled (sends updates TO Booking.com)');
// ============================================
// EXAMPLE 1: Create a Direct Booking
// ============================================
async function createDirectBooking() {
    console.log('\n=== EXAMPLE 1: Creating Direct Booking ===');
    const result = await bookingService.createBooking({
        hotelBranchId: 1,
        roomId: 1,
        channelId: 4, // Direct channel (not Booking.com)
        startDate: '2025-10-25',
        endDate: '2025-10-27'
    });
    if (result.success) {
        console.log(`✓ Booking created: ${result.bookingId}`);
        console.log(`✓ Synced to Booking.com: ${result.syncedToBookingCom ? 'YES' : 'NO'}`);
        if (result.syncedToBookingCom) {
            console.log('→ Booking.com now shows these dates as UNAVAILABLE');
            console.log('→ Prevents double booking!');
        }
    }
    else {
        console.error(`✗ Failed: ${result.message}`);
    }
}
// ============================================
// EXAMPLE 2: Cancel a Booking
// ============================================
async function cancelBooking() {
    console.log('\n=== EXAMPLE 2: Cancelling Booking ===');
    const result = await bookingService.cancelBooking(1, 'Guest requested cancellation');
    if (result.success) {
        console.log('✓ Booking cancelled');
        console.log(`✓ Synced to Booking.com: ${result.syncedToBookingCom ? 'YES' : 'NO'}`);
        if (result.syncedToBookingCom) {
            console.log('→ Booking.com now shows these dates as AVAILABLE again');
        }
    }
    else {
        console.error(`✗ Failed: ${result.message}`);
    }
}
// ============================================
// EXAMPLE 3: Modify a Booking
// ============================================
async function modifyBooking() {
    console.log('\n=== EXAMPLE 3: Modifying Booking Dates ===');
    const result = await bookingService.modifyBooking(1, // booking ID
    '2025-10-26', // new start date
    '2025-10-28' // new end date
    );
    if (result.success) {
        console.log('✓ Booking dates modified');
        console.log('→ Old dates opened on Booking.com');
        console.log('→ New dates closed on Booking.com');
    }
}
// ============================================
// EXAMPLE 4: Sync Unsynced Bookings (Recovery)
// ============================================
async function syncUnsyncedBookings() {
    console.log('\n=== EXAMPLE 4: Syncing Unsynced Bookings ===');
    console.log('(Useful if there were previous errors or system downtime)');
    const stats = await bookingService.syncUnsyncedBookings();
    console.log(`✓ Sync complete - Success: ${stats.success}, Failed: ${stats.failed}`);
}
// ============================================
// EXAMPLE 5: Full Room Availability Sync
// ============================================
async function syncFullRoomAvailability() {
    console.log('\n=== EXAMPLE 5: Full Room Availability Sync ===');
    console.log('(Sends complete availability calendar to Booking.com)');
    const success = await bookingService.syncRoomAvailability(1, 90); // 90 days ahead
    if (success) {
        console.log('✓ Room 1 availability synced for next 90 days');
    }
}
// ============================================
// EXAMPLE 6: Check Sync Status
// ============================================
function checkSyncStatus() {
    console.log('\n=== Sync Status ===');
    console.log(`Two-way sync enabled: ${bookingService.isTwoWaySyncEnabled()}`);
    console.log(`Pull service status:`, syncService.getStatus());
}
// ============================================
// Run Examples (uncomment to test)
// ============================================
// Uncomment the functions you want to test:
// createDirectBooking();
// cancelBooking();
// modifyBooking();
// syncUnsyncedBookings();
// syncFullRoomAvailability();
// checkSyncStatus();
// ============================================
// WHAT HAPPENS BEHIND THE SCENES
// ============================================
console.log('\n📋 How Two-Way Sync Works:');
console.log('');
console.log('PULL (Sync Service):');
console.log('  Every 15 minutes → Check Booking.com API → Pull new bookings → Save to DB');
console.log('');
console.log('PUSH (Availability Push):');
console.log('  Direct booking created → Save to DB → Push to Booking.com → Block dates');
console.log('  Booking cancelled → Update DB → Push to Booking.com → Open dates');
console.log('');
console.log('RESULT:');
console.log('  ✓ No double bookings');
console.log('  ✓ Real-time availability sync');
console.log('  ✓ Booking.com always shows correct availability');
console.log('');
// ============================================
// Graceful Shutdown
// ============================================
process.on('SIGINT', () => {
    console.log('\n\nShutting down...');
    syncService.stop();
    console.log('✓ Services stopped');
    process.exit(0);
});
console.log('\n✓ Two-way sync system ready!');
console.log('Press Ctrl+C to stop');
//# sourceMappingURL=example-two-way-sync.js.map