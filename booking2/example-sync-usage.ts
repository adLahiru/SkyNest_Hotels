/**
 * Example: How to use the Booking.com sync service
 * 
 * This file shows you how to set up and run the booking synchronization
 */

import { createSyncService } from './booking-sync-service.js';
import type { BookingComConfig } from './booking-com-api.js';
import type { SyncConfig } from './booking-sync-service.js';

// ============================================
// STEP 1: Configure Booking.com API credentials
// ============================================
const bookingComConfig: BookingComConfig = {
    hotelId: 'YOUR_HOTEL_ID',           // Get this from Booking.com
    apiKey: 'YOUR_API_KEY',              // Get this from Booking.com
    apiSecret: 'YOUR_API_SECRET',        // Get this from Booking.com
    baseUrl: 'https://supply-xml.booking.com/api/v1' // Or their test environment
};

// ============================================
// STEP 2: Configure sync settings
// ============================================
const syncConfig: SyncConfig = {
    intervalMinutes: 15,     // Sync every 15 minutes
    lookbackDays: 7,         // Fetch bookings from the last 7 days
    channelId: 1,            // Your Booking.com channel ID from the 'channels' table
    defaultRoomId: 1         // Default room to use if mapping fails
};

// ============================================
// STEP 3: Create and start the sync service
// ============================================
const syncService = createSyncService(bookingComConfig, syncConfig);

// Start automatic syncing
syncService.start();

console.log('✓ Booking.com sync service started');
console.log('  - Syncing every 15 minutes');
console.log('  - Fetching bookings from last 7 days');

// ============================================
// OPTIONAL: Manual sync trigger
// ============================================
async function manualSync() {
    console.log('Triggering manual sync...');
    const stats = await syncService.syncBookings();
    console.log('Manual sync completed:', stats);
}

// Trigger manual sync (uncomment to test)
// manualSync();

// ============================================
// OPTIONAL: Stop the service gracefully
// ============================================
process.on('SIGINT', () => {
    console.log('\nShutting down sync service...');
    syncService.stop();
    process.exit(0);
});

// Keep the process running
console.log('Press Ctrl+C to stop the sync service');
