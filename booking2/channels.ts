import { pool } from './db.js';
import type mysql from 'mysql2/promise';

export enum ChannelType {
    BOOKING_COM = 'booking_com',
    EXPEDIA = 'expedia',
    AIRBNB = 'airbnb',
    DIRECT = 'direct'
}

export interface Channel {
    id: number;
    name: string;
    type: ChannelType;
    apiKey?: string;
    apiSecret?: string;
    enabled: boolean;
}

export interface ChannelBooking {
    channelReference: string;    // Booking.com's reservation number
    channelId: number;          // Our channel ID
    roomId: number;
    startDate: string;
    endDate: string;
    guestDetails?: {
        name: string;
        email: string;
        phone?: string;
        nationality?: string;
    };
    price?: {
        amount: number;
        currency: string;
    };
}

export class ChannelManager {
    // Map channel types to their specific handlers
    private channelHandlers: { [key in ChannelType]?: (booking: ChannelBooking) => Promise<any> } = {
        [ChannelType.BOOKING_COM]: this.handleBookingComReservation.bind(this),
        [ChannelType.EXPEDIA]: this.handleExpediaReservation.bind(this),
        [ChannelType.AIRBNB]: this.handleAirbnbReservation.bind(this)
    };

    async getChannels(): Promise<Channel[]> {
        const [rows] = await pool.execute<mysql.RowDataPacket[]>(
            'SELECT id, name, type, enabled FROM channels'
        );
        return rows as Channel[];
    }

    async getChannelById(id: number): Promise<Channel | null> {
        const [rows] = await pool.execute<mysql.RowDataPacket[]>(
            'SELECT id, name, type, enabled FROM channels WHERE id = ?',
            [id]
        );
        return (rows[0] as Channel) || null;
    }

    async processChannelBooking(booking: ChannelBooking): Promise<{ success: boolean; bookingId?: number; message: string }> {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // 1. Check if booking already exists
            const [existingBooking] = await connection.execute<mysql.RowDataPacket[]>(
                'SELECT id FROM bookings WHERE booking_reference = ?',
                [booking.channelReference]
            );

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
            const handler = this.channelHandlers[channel.type as ChannelType];
            if (!handler) {
                throw new Error(`No handler found for channel type: ${channel.type}`);
            }

            // 4. Let the specific handler process the booking
            const result = await handler(booking);

            // 5. Create the booking
            const [bookingResult] = await connection.execute(
                `INSERT INTO bookings (
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
                ) VALUES (?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, ?, ?)`,
                [
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
                ]
            );

            console.log(`[ChannelManager] Booking created: ${booking.channelReference} for ${booking.guestDetails?.name || 'Guest'}`);

            await connection.commit();

            return {
                success: true,
                bookingId: (bookingResult as any).insertId,
                message: 'Booking processed successfully'
            };

        } catch (error: any) {
            await connection.rollback();
            return {
                success: false,
                message: error.message || 'Failed to process channel booking'
            };
        } finally {
            connection.release();
        }
    }

    private async handleBookingComReservation(booking: ChannelBooking): Promise<void> {
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

    private async handleExpediaReservation(booking: ChannelBooking): Promise<void> {
        // Implement Expedia specific logic
        if (!booking.channelReference.startsWith('EXP-')) {
            throw new Error('Invalid Expedia reference number format');
        }
    }

    private async handleAirbnbReservation(booking: ChannelBooking): Promise<void> {
        // Implement Airbnb specific logic
        if (!booking.channelReference.startsWith('ABB-')) {
            throw new Error('Invalid Airbnb reference number format');
        }
    }
}

// Create and export channel manager instance
export const channelManager = new ChannelManager();