import axios from 'axios';

async function testBooking() {
    try {
        // Test data for creating a booking
        const bookingData = {
            hotelBranchId: 1,
            roomId: 1,
            channelId: 1,  // Assuming channel 1 exists
            startDate: "2025-10-25",  // 4 days from now
            endDate: "2025-10-28"     // 7 days from now
        };

        // First, check if the room is available
        const availabilityResponse = await axios.get(`http://localhost:3001/rooms/${bookingData.hotelBranchId}/availability`, {
            params: {
                roomId: bookingData.roomId,
                startDate: bookingData.startDate,
                endDate: bookingData.endDate
            }
        });

        console.log('\nAvailability Check Response:', availabilityResponse.data);

        if (!availabilityResponse.data.isAvailable) {
            console.log('Room is not available for the selected dates. Stopping here.');
            return;
        }

        // If room is available, proceed with booking
        console.log('\nRoom is available, proceeding with booking...');
        
        const bookingResponse = await axios.post('http://localhost:3001/bookings', bookingData);
        
        console.log('\nBooking Response:', bookingResponse.data);
        
        if (bookingResponse.data.success) {
            console.log(`\n✅ Booking created successfully! Booking ID: ${bookingResponse.data.bookingId}`);
        } else {
            console.log('\n❌ Failed to create booking:', bookingResponse.data.message);
        }

    } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
            console.error('\n❌ Error: Could not connect to the server. Make sure the server is running on port 3001.');
        } else {
            console.error('\n❌ Error:', error.response?.data || error.message);
            console.error('Full error:', error);
        }
    }
}

testBooking();