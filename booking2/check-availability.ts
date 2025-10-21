import axios from 'axios';

async function checkRoomAvailability(hotelBranchId: number, roomId: number) {
    try {
        // Get today's date and 2 days from now
        const today = new Date();
        const twoDaysFromNow = new Date(today);
        twoDaysFromNow.setDate(today.getDate() + 2);

        // Format dates as YYYY-MM-DD
        const startDate = today.toISOString().slice(0, 10);
        const endDate = twoDaysFromNow.toISOString().slice(0, 10);

        console.log('\nSending request to check availability:');
        console.log('────────────────────────────────────');
        console.log(`Hotel Branch ID: ${hotelBranchId}`);
        console.log(`Room ID: ${roomId}`);
        console.log(`Check-in Date: ${startDate}`);
        console.log(`Check-out Date: ${endDate}`);
        console.log('────────────────────────────────────\n');

        // Make request to check availability
        const response = await axios.get(`http://localhost:3001/rooms/${hotelBranchId}/availability`, {
            params: {
                roomId,
                startDate,
                endDate
            }
        });

        if (response.data.success) {
            console.log('📋 Availability Result:');
            console.log('────────────────────────────────────');
            console.log(`Status: ${response.data.isAvailable ? '✅ Available' : '❌ Not Available'}`);
            console.log(`Message: ${response.data.message}`);
        } else {
            console.error('❌ Error:', response.data.error);
        }

    } catch (error: any) {
        console.error('\n❌ Error checking availability:');
        console.error('────────────────────────────────────');
        if (error.response) {
            console.error('Server Error:', error.response.data.error);
        } else if (error.request) {
            console.error('No response received - is the server running?');
            console.error('Try running: npm start');
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Test room availability
// Change these values to match your hotel branch and room IDs
const hotelBranchId = 1;
const roomId = 1;

checkRoomAvailability(hotelBranchId, roomId);