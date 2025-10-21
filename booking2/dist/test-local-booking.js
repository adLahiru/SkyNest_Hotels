import { createIntegratedBookingService } from './integrated-booking-service.js';
async function testLocalBooking() {
    console.log('🧪 Testing Local Booking Creation\n');
    // Create service WITHOUT Booking.com config (no API calls)
    const bookingService = createIntegratedBookingService();
    console.log('Two-way sync enabled:', bookingService.isTwoWaySyncEnabled());
    console.log('(Two-way sync disabled for local testing)\n');
    // Create a test booking
    console.log('Creating test booking...');
    const result = await bookingService.createBooking({
        hotelBranchId: 1,
        roomId: 1,
        channelId: 1, // Booking.com channel
        startDate: '2025-11-01',
        endDate: '2025-11-03'
    });
    if (result.success) {
        console.log('✓ Booking created successfully!');
        console.log(`  Booking ID: ${result.bookingId}`);
        console.log(`  Synced to Booking.com: ${result.syncedToBookingCom}`);
        console.log(`  Message: ${result.message}\n`);
    }
    else {
        console.log('✗ Failed:', result.message);
    }
    process.exit(0);
}
testLocalBooking();
//# sourceMappingURL=test-local-booking.js.map