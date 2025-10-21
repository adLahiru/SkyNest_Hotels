import { pool } from './db.js';
export var ChannelType;
(function (ChannelType) {
    ChannelType["BOOKING_COM"] = "booking_com";
    ChannelType["EXPEDIA"] = "expedia";
    ChannelType["AIRBNB"] = "airbnb";
    ChannelType["DIRECT"] = "direct";
})(ChannelType || (ChannelType = {}));
export class ChannelManager {
    // Map channel types to their specific handlers
    channelHandlers = {
        [ChannelType.BOOKING_COM]: this.handleBookingComReservation.bind(this),
        [ChannelType.EXPEDIA]: this.handleExpediaReservation.bind(this),
        [ChannelType.AIRBNB]: this.handleAirbnbReservation.bind(this)
    };
    async getChannels() {
        const [rows] = await pool.execute('SELECT id, name, type, enabled FROM channels');
        return rows;
    }
    async getChannelById(id) {
        const [rows] = await pool.execute('SELECT id, name, type, enabled FROM channels WHERE id = ?', [id]);
        return rows[0] || null;
    }
    async processChannelBooking(booking) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            // 1. Check if booking already exists
            const [existingBooking] = await connection.execute('SELECT id FROM bookings WHERE booking_reference = ?', [booking.channelReference]);
            if (existingBooking[0]) {
                return {
                    success: false,
                    message: 'Booking already exists'
                };
            }
            // 2. Get channel information
            const channel = await this.getChannelById(booking.channelId);
            if (!channel) {
                throw new Error('Invalid channel ID');
            }
            if (!channel.enabled) {
                throw new Error('Channel is disabled');
            }
            // 3. Process booking based on channel type
            const handler = this.channelHandlers[channel.type];
            if (!handler) {
                throw new Error(`No handler found for channel type: ${channel.type}`);
            }
            // 4. Let the specific handler process the booking
            const result = await handler(booking);
            // 5. Create the booking
            const [bookingResult] = await connection.execute(`INSERT INTO bookings (
                    room_id,
                    channel_id,
                    booking_reference,
                    start_date,
                    end_date,
                    status,
                    guest_name,
                    guest_email,
                    guest_phone,
                    total_price,
                    currency
                ) VALUES (?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, ?, ?)`, [
                booking.roomId,
                booking.channelId,
                booking.channelReference,
                booking.startDate,
                booking.endDate,
                booking.guestDetails?.name || null,
                booking.guestDetails?.email || null,
                booking.guestDetails?.phone || null,
                booking.price?.amount || null,
                booking.price?.currency || null
            ]);
            console.log(`[ChannelManager] Booking created: ${booking.channelReference} for ${booking.guestDetails?.name || 'Guest'}`);
            await connection.commit();
            return {
                success: true,
                bookingId: bookingResult.insertId,
                message: 'Booking processed successfully'
            };
        }
        catch (error) {
            await connection.rollback();
            return {
                success: false,
                message: error.message || 'Failed to process channel booking'
            };
        }
        finally {
            connection.release();
        }
    }
    async handleBookingComReservation(booking) {
        console.log(`[Booking.com] Processing reservation: ${booking.channelReference}`);
        // 1. Validate reference format
        if (!booking.channelReference.startsWith('BDC-')) {
            throw new Error('Invalid Booking.com reference number format');
        }
        // 2. Validate required fields
        if (!booking.roomId || !booking.startDate || !booking.endDate) {
            throw new Error('Missing required booking fields');
        }
        // 3. Validate dates
        const startDate = new Date(booking.startDate);
        const endDate = new Date(booking.endDate);
        if (endDate <= startDate) {
            throw new Error('End date must be after start date');
        }
        if (startDate < new Date()) {
            console.warn(`[Booking.com] Warning: Booking start date is in the past: ${booking.channelReference}`);
        }
        // 4. Validate guest details (if provided)
        if (booking.guestDetails) {
            if (!booking.guestDetails.email || !booking.guestDetails.email.includes('@')) {
                console.warn(`[Booking.com] Invalid guest email for booking: ${booking.channelReference}`);
            }
        }
        // 5. Log booking details
        console.log(`[Booking.com] Guest: ${booking.guestDetails?.name || 'Unknown'}`);
        console.log(`[Booking.com] Dates: ${booking.startDate} to ${booking.endDate}`);
        console.log(`[Booking.com] Price: ${booking.price?.currency} ${booking.price?.amount || 'N/A'}`);
        // Additional Booking.com specific logic can be added here:
        // - Store additional metadata
        // - Apply Booking.com specific business rules
        // - Calculate commissions
        // - Handle special requests
    }
    async handleExpediaReservation(booking) {
        // Implement Expedia specific logic
        if (!booking.channelReference.startsWith('EXP-')) {
            throw new Error('Invalid Expedia reference number format');
        }
    }
    async handleAirbnbReservation(booking) {
        // Implement Airbnb specific logic
        if (!booking.channelReference.startsWith('ABB-')) {
            throw new Error('Invalid Airbnb reference number format');
        }
    }
}
// Create and export channel manager instance
export const channelManager = new ChannelManager();
//# sourceMappingURL=channels.js.map