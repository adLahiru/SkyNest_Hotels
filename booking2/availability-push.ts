import { BookingComAPI } from './booking-com-api.js';
import type { BookingComConfig } from './booking-com-api.js';
import { pool } from './db.js';
import type mysql from 'mysql2/promise';
import { ChannelType } from './channels.js';

/**
 * Service to push availability updates to Booking.com
 * This enables TWO-WAY sync to prevent double bookings
 */
export class AvailabilityPushService {
    private bookingComAPI: BookingComAPI;
    private enabled: boolean = true;

    constructor(apiConfig: BookingComConfig) {
        this.bookingComAPI = new BookingComAPI(apiConfig);
    }

    /**
     * Enable or disable the push service
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        console.log(`[AvailabilityPush] Service ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Push availability update when a booking is created
     * Blocks the dates on Booking.com
     */
    async onBookingCreated(bookingId: number): Promise<boolean> {
        if (!this.enabled) {
            return false;
        }

        try {
            // Get booking details
            const booking = await this.getBookingDetails(bookingId);
            if (!booking) {
                console.error(`[AvailabilityPush] Booking ${bookingId} not found`);
                return false;
            }

            // Only push for bookings NOT from Booking.com (avoid circular updates)
            if (booking.channel_type === ChannelType.BOOKING_COM) {
                console.log(`[AvailabilityPush] Skipping - Booking came from Booking.com`);
                return true;
            }

            // Get the Booking.com room ID
            const externalRoomId = await this.getExternalRoomId(booking.room_id);
            if (!externalRoomId) {
                console.warn(`[AvailabilityPush] No Booking.com room mapping for room ${booking.room_id}`);
                return false;
            }

            // Close availability on Booking.com
            const success = await this.bookingComAPI.closeAvailability(
                externalRoomId,
                booking.start_date,
                booking.end_date
            );

            if (success) {
                await this.markBookingSynced(bookingId);
                console.log(`[AvailabilityPush] ✓ Booking ${bookingId} synced to Booking.com`);
            }

            return success;
        } catch (error: any) {
            console.error(`[AvailabilityPush] Error pushing booking ${bookingId}:`, error.message);
            return false;
        }
    }

    /**
     * Push availability update when a booking is cancelled
     * Opens the dates on Booking.com
     */
    async onBookingCancelled(bookingId: number): Promise<boolean> {
        if (!this.enabled) {
            return false;
        }

        try {
            // Get booking details
            const booking = await this.getBookingDetails(bookingId);
            if (!booking) {
                console.error(`[AvailabilityPush] Booking ${bookingId} not found`);
                return false;
            }

            // Only push for bookings NOT from Booking.com
            if (booking.channel_type === ChannelType.BOOKING_COM) {
                console.log(`[AvailabilityPush] Skipping - Booking came from Booking.com`);
                return true;
            }

            // Get the Booking.com room ID
            const externalRoomId = await this.getExternalRoomId(booking.room_id);
            if (!externalRoomId) {
                console.warn(`[AvailabilityPush] No Booking.com room mapping for room ${booking.room_id}`);
                return false;
            }

            // Open availability on Booking.com
            const success = await this.bookingComAPI.openAvailability(
                externalRoomId,
                booking.start_date,
                booking.end_date
            );

            if (success) {
                console.log(`[AvailabilityPush] ✓ Cancellation ${bookingId} synced to Booking.com`);
            }

            return success;
        } catch (error: any) {
            console.error(`[AvailabilityPush] Error pushing cancellation ${bookingId}:`, error.message);
            return false;
        }
    }

    /**
     * Sync all unsynced bookings (recovery mechanism)
     */
    async syncUnsyncedBookings(): Promise<{ success: number; failed: number }> {
        console.log('[AvailabilityPush] Syncing unsynced bookings...');
        
        const stats = { success: 0, failed: 0 };

        try {
            const unsyncedBookings = await this.getUnsyncedBookings();
            console.log(`[AvailabilityPush] Found ${unsyncedBookings.length} unsynced bookings`);

            for (const booking of unsyncedBookings) {
                const success = await this.onBookingCreated(booking.id);
                if (success) {
                    stats.success++;
                } else {
                    stats.failed++;
                }
            }

            console.log(`[AvailabilityPush] Sync complete - Success: ${stats.success}, Failed: ${stats.failed}`);
        } catch (error: any) {
            console.error('[AvailabilityPush] Error syncing unsynced bookings:', error.message);
        }

        return stats;
    }

    /**
     * Calculate and push full availability calendar for a room
     * Useful for initial sync or recovery
     */
    async syncRoomAvailability(roomId: number, daysAhead: number = 90): Promise<boolean> {
        try {
            const externalRoomId = await this.getExternalRoomId(roomId);
            if (!externalRoomId) {
                console.warn(`[AvailabilityPush] No Booking.com room mapping for room ${roomId}`);
                return false;
            }

            // Get all bookings for this room in the next X days
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + daysAhead);

            const [rows] = await pool.execute<mysql.RowDataPacket[]>(
                `SELECT start_date, end_date 
                 FROM bookings 
                 WHERE room_id = ? 
                 AND status = 'confirmed' 
                 AND start_date >= ? 
                 AND start_date <= ?
                 ORDER BY start_date`,
                [roomId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
            );

            console.log(`[AvailabilityPush] Syncing ${rows.length} bookings for room ${roomId}`);

            // Close availability for all booked dates
            for (const booking of rows) {
                await this.bookingComAPI.closeAvailability(
                    externalRoomId,
                    booking.start_date,
                    booking.end_date
                );
            }

            return true;
        } catch (error: any) {
            console.error(`[AvailabilityPush] Error syncing room ${roomId}:`, error.message);
            return false;
        }
    }

    // =====================================================
    // HELPER METHODS
    // =====================================================

    /**
     * Get booking details from database
     */
    private async getBookingDetails(bookingId: number) {
        const [rows] = await pool.execute<mysql.RowDataPacket[]>(
            `SELECT b.id, b.room_id, b.start_date, b.end_date, b.status, bc.type as channel_type
             FROM bookings b
             JOIN booking_channels bc ON b.channel_id = bc.id
             WHERE b.id = ?`,
            [bookingId]
        );

        return rows[0] || null;
    }

    /**
     * Get Booking.com external room ID from local room ID
     */
    private async getExternalRoomId(localRoomId: number): Promise<string | null> {
        const [rows] = await pool.execute<mysql.RowDataPacket[]>(
            'SELECT external_room_id FROM room_mapping WHERE local_room_id = ? AND channel_type = ?',
            [localRoomId, ChannelType.BOOKING_COM]
        );

        return rows[0]?.external_room_id || null;
    }

    /**
     * Mark booking as synced to Booking.com
     */
    private async markBookingSynced(bookingId: number): Promise<void> {
        await pool.execute(
            'UPDATE bookings SET synced_to_booking_com = TRUE, synced_at = NOW() WHERE id = ?',
            [bookingId]
        );
    }

    /**
     * Get all bookings that haven't been synced yet
     */
    private async getUnsyncedBookings() {
        const [rows] = await pool.execute<mysql.RowDataPacket[]>(
            `SELECT b.id 
             FROM bookings b
             JOIN booking_channels bc ON b.channel_id = bc.id
             WHERE b.status = 'confirmed'
             AND (b.synced_to_booking_com IS NULL OR b.synced_to_booking_com = FALSE)
             AND bc.type != ?
             AND b.start_date >= CURDATE()
             LIMIT 100`,
            [ChannelType.BOOKING_COM]
        );

        return rows;
    }
}

/**
 * Factory function to create availability push service
 */
export function createAvailabilityPushService(apiConfig: BookingComConfig): AvailabilityPushService {
    return new AvailabilityPushService(apiConfig);
}
