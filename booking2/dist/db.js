import mysql from 'mysql2/promise';
// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '@Hkbag2003',
    database: 'hotel_booking_sync',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
// Check if a room is available for specific dates in a specific hotel branch
async function isRoomAvailable(hotelBranchId, roomId, startDate, endDate) {
    try {
        // First verify the room exists and belongs to the specified hotel branch
        const [roomCheck] = await pool.execute('SELECT id FROM rooms WHERE id = ? AND hotel_branch_id = ?', [roomId, hotelBranchId]);
        if (!roomCheck || roomCheck.length === 0) {
            throw new Error(`Room ${roomId} does not exist in hotel branch ${hotelBranchId}`);
        }
        const [rows] = await pool.execute(`SELECT COUNT(*) as booking_count 
             FROM bookings b
             JOIN rooms r ON b.room_id = r.id
             WHERE b.room_id = ? 
             AND r.hotel_branch_id = ?
             AND b.status = 'confirmed'
             AND NOT (b.end_date <= ? OR b.start_date >= ?)`, [roomId, hotelBranchId, startDate, endDate]);
        // Safely access booking_count with a default of 1 (assume booked if error)
        const bookingCount = rows?.[0]?.booking_count ?? 1;
        // If booking_count is 0, the room is available
        return bookingCount === 0;
    }
    catch (err) {
        console.error('Error checking room availability:', err);
        throw err;
    }
}
async function createBooking(bookingData) {
    const connection = await pool.getConnection();
    try {
        // Start transaction
        await connection.beginTransaction();
        // 1. Check if room exists and belongs to the hotel branch
        const [roomCheck] = await connection.execute('SELECT id, status FROM rooms WHERE id = ? AND hotel_branch_id = ?', [bookingData.roomId, bookingData.hotelBranchId]);
        if (!roomCheck?.[0]) {
            throw new Error(`Room ${bookingData.roomId} does not exist in hotel branch ${bookingData.hotelBranchId}`);
        }
        // 2. Check room availability
        const isAvailable = await isRoomAvailable(bookingData.hotelBranchId, bookingData.roomId, bookingData.startDate, bookingData.endDate);
        if (!isAvailable) {
            throw new Error('Room is not available for the selected dates');
        }
        // 3. Create the booking
        const bookingReference = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const [bookingResult] = await connection.execute(`INSERT INTO bookings (
                room_id,
                channel_id,
                booking_reference,
                start_date,
                end_date,
                status
            ) VALUES (?, ?, ?, ?, ?, 'confirmed')`, [
            bookingData.roomId,
            bookingData.channelId,
            bookingReference,
            bookingData.startDate,
            bookingData.endDate
        ]);
        const bookingId = bookingResult.insertId;
        // 4. Update room status to booked
        await connection.execute('UPDATE rooms SET status = \'booked\' WHERE id = ?', [bookingData.roomId]);
        // 5. Commit transaction
        await connection.commit();
        return {
            bookingId,
            success: true,
            message: `Booking created successfully with ID: ${bookingId}`
        };
    }
    catch (error) {
        // Rollback transaction on error
        await connection.rollback();
        return {
            bookingId: 0,
            success: false,
            message: error.message || 'Failed to create booking'
        };
    }
    finally {
        connection.release();
    }
}
// Test the connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL database successfully!');
        connection.release();
    }
    catch (err) {
        console.error('Error connecting to MySQL:', err);
    }
}
// Export pool and utility functions
export { pool, isRoomAvailable, createBooking };
// Run initial connection test
testConnection();
//# sourceMappingURL=db.js.map