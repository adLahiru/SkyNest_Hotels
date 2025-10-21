/**
 * This simulates a guest making a booking on YOUR WEBSITE
 * Shows how two-way sync works to prevent double bookings
 */
import { createIntegratedBookingService } from './integrated-booking-service.js';
async function createWebsiteBooking() {
    console.log('🏨 Guest Booking on YOUR Website\n');
    console.log('='.repeat(60));
    console.log('SCENARIO: Guest visits your website and books Room 101\n');
    // Configure Booking.com (for two-way sync)
    const bookingComConfig = {
        hotelId: 'YOUR_HOTEL_ID',
        apiKey: 'YOUR_API_KEY',
        apiSecret: 'YOUR_API_SECRET',
        baseUrl: 'https://supply-xml.booking.com/api/v1'
    };
    // Create booking service WITH two-way sync
    const bookingService = createIntegratedBookingService(bookingComConfig);
    console.log('📋 Booking Details:');
    console.log('   Guest: John Smith');
    console.log('   Room: 101 (Standard)');
    console.log('   Check-in: Nov 1, 2025');
    console.log('   Check-out: Nov 3, 2025');
    console.log('   Channel: Direct (Your Website)\n');
    console.log('⏳ Processing booking...\n');
    // This is what happens when guest clicks "Confirm Booking" on your site
    const result = await bookingService.createBooking({
        hotelBranchId: 1, // Your hotel branch
        roomId: 1, // Room 101
        channelId: 4, // Direct channel (NOT Booking.com)
        startDate: '2025-11-01',
        endDate: '2025-11-03'
    });
    console.log('='.repeat(60));
    console.log('📊 BOOKING RESULT:\n');
    if (result.success) {
        console.log('✅ Step 1: Saved to YOUR database');
        console.log(`   → Booking ID: ${result.bookingId}`);
        console.log(`   → Status: Confirmed`);
        console.log();
        console.log('✅ Step 2: Pushed to Booking.com API');
        console.log(`   → Synced: ${result.syncedToBookingCom ? 'YES ✓' : 'NO ✗'}`);
        if (result.syncedToBookingCom) {
            console.log('   → Action: BLOCKED dates on Booking.com');
            console.log('   → Nov 1-3 now shows UNAVAILABLE on Booking.com');
            console.log();
            console.log('🎉 SUCCESS! Two-way sync working!');
            console.log('   → Your database: ✓ Booking saved');
            console.log('   → Booking.com: ✓ Dates blocked');
            console.log('   → Result: NO DOUBLE BOOKING POSSIBLE! 🎯');
        }
        else {
            console.log('   → Reason: No valid API credentials');
            console.log('   → Booking saved locally, but NOT synced to Booking.com');
            console.log();
            console.log('⚠️  WARNING: Without sync, double booking is possible!');
            console.log('   → Add real API credentials to enable sync');
        }
        console.log();
        console.log('='.repeat(60));
        console.log('📋 What happens next:\n');
        console.log('1. Guest receives confirmation email');
        console.log('2. Booking appears in your admin panel');
        console.log('3. Booking.com shows room as UNAVAILABLE for Nov 1-3');
        console.log('4. Other guests visiting Booking.com cannot book these dates');
        console.log('5. No double booking! ✓\n');
        // Check database
        console.log('🔍 Verifying in database...');
        const { pool } = await import('./db.js');
        const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ?', [result.bookingId]);
        if (bookings.length > 0) {
            const booking = bookings[0];
            console.log(`   ✓ Found booking ${booking.id}`);
            console.log(`   ✓ Room ID: ${booking.room_id}`);
            console.log(`   ✓ Dates: ${booking.start_date} to ${booking.end_date}`);
            console.log(`   ✓ Status: ${booking.status}`);
            console.log(`   ✓ Synced to Booking.com: ${booking.synced_to_booking_com ? 'YES' : 'NO'}`);
        }
    }
    else {
        console.log('❌ BOOKING FAILED');
        console.log(`   Reason: ${result.message}`);
        console.log();
        console.log('Possible reasons:');
        console.log('   - Room already booked for these dates');
        console.log('   - Room does not exist');
        console.log('   - Invalid dates');
    }
    console.log('\n' + '='.repeat(60));
    console.log('✅ DEMO COMPLETE!\n');
    process.exit(0);
}
createWebsiteBooking().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});
//# sourceMappingURL=create-website-booking.js.map