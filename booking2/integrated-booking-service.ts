import { createBooking, type CreateBookingParams } from './db.js';
import { AvailabilityPushService } from './availability-push.js';
import type { BookingComConfig } from './booking-com-api.js';
import { pool } from './db.js';
import type mysql from 'mysql2/promise';

/**
 * Integrated booking service that handles BOTH:
 * 1. Database operations (creating/cancelling bookings)
 * 2. Availability push to Booking.com (two-way sync)
 * 
 * This ensures availability is always synced automatically
 */
export class IntegratedBookingService {
    private availabilityPush: AvailabilityPushService | null = null;

    /**
     * Initialize with Booking.com credentials to enable two-way sync
     */
    constructor(bookingComConfig?: BookingComConfig) {
        if (bookingComConfig) {
            this.availabilityPush = new AvailabilityPushService(bookingComConfig);
            console.log('[IntegratedBooking] Two-way sync ENABLED');
        } else {
            console.warn('[IntegratedBooking] Two-way sync DISABLED - No Booking.com config provided');
        }
    }

    /**
     * Create a booking with automatic availability push
     */
    async createBooking(bookingData: CreateBookingParams): Promise<{
        bookingId: number;
        success: boolean;
        message: string;
        syncedToBookingCom: boolean;
    }> {
        // 1. Create booking in database
        const result = await createBooking(bookingData);

        if (!result.success) {
            return {
                ...result,
                syncedToBookingCom: false
            };
        }

        // 2. Push availability to Booking.com (if enabled)
        let syncedToBookingCom = false;
        if (this.availabilityPush) {
            syncedToBookingCom = await this.availabilityPush.onBookingCreated(result.bookingId);
            
            if (syncedToBookingCom) {
                console.log(`[IntegratedBooking] ✓ Booking ${result.bookingId} created AND synced to Booking.com`);
            } else {
                console.warn(`[IntegratedBooking] ⚠ Booking ${result.bookingId} created but NOT synced to Booking.com`);
            }
        }

        return {
            ...result,
            syncedToBookingCom
        };
    }

    /**
     * Cancel a booking with automatic availability push
     */
    async cancelBooking(bookingId: number, reason?: string): Promise<{
        success: boolean;
        message: string;
        syncedToBookingCom: boolean;
    }> {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // 1. Update booking status
            const [result] = await connection.execute(
                'UPDATE bookings SET status = ?, cancellation_reason = ?, cancelled_at = NOW() WHERE id = ?',
                ['cancelled', reason || null, bookingId]
            );

            const affectedRows = (result as any).affectedRows;
            
            if (affectedRows === 0) {
                throw new Error('Booking not found');
            }

            // 2. Get room ID to update status
            const [bookingRows] = await connection.execute<mysql.RowDataPacket[]>(
                'SELECT room_id FROM bookings WHERE id = ?',
                [bookingId]
            );

            if (bookingRows[0]) {
                await connection.execute(
                    'UPDATE rooms SET status = \'available\' WHERE id = ?',
                    [bookingRows[0].room_id]
                );
            }

            await connection.commit();

            // 3. Push availability to Booking.com (if enabled)
            let syncedToBookingCom = false;
            if (this.availabilityPush) {
                syncedToBookingCom = await this.availabilityPush.onBookingCancelled(bookingId);
                
                if (syncedToBookingCom) {
                    console.log(`[IntegratedBooking] ✓ Booking ${bookingId} cancelled AND synced to Booking.com`);
                } else {
                    console.warn(`[IntegratedBooking] ⚠ Booking ${bookingId} cancelled but NOT synced to Booking.com`);
                }
            }

            return {
                success: true,
                message: 'Booking cancelled successfully',
                syncedToBookingCom
            };

        } catch (error: any) {
            await connection.rollback();
            return {
                success: false,
                message: error.message || 'Failed to cancel booking',
                syncedToBookingCom: false
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Modify a booking (cancels old dates and creates new dates on Booking.com)
     */
    async modifyBooking(
        bookingId: number,
        newStartDate: string,
        newEndDate: string
    ): Promise<{ success: boolean; message: string }> {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // 1. Get current booking details
            const [currentRows] = await connection.execute<mysql.RowDataPacket[]>(
                'SELECT room_id, start_date, end_date FROM bookings WHERE id = ?',
                [bookingId]
            );

            if (!currentRows[0]) {
                throw new Error('Booking not found');
            }

            const oldBooking = currentRows[0];

            // 2. Update booking dates
            await connection.execute(
                'UPDATE bookings SET start_date = ?, end_date = ?, modified_at = NOW() WHERE id = ?',
                [newStartDate, newEndDate, bookingId]
            );

            await connection.commit();

            // 3. Push availability changes to Booking.com
            if (this.availabilityPush) {
                // Open old dates
                await this.availabilityPush.onBookingCancelled(bookingId);
                
                // Close new dates
                await this.availabilityPush.onBookingCreated(bookingId);
                
                console.log(`[IntegratedBooking] ✓ Booking ${bookingId} modified and synced to Booking.com`);
            }

            return {
                success: true,
                message: 'Booking modified successfully'
            };

        } catch (error: any) {
            await connection.rollback();
            return {
                success: false,
                message: error.message || 'Failed to modify booking'
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Sync all unsynced bookings (recovery/catchup)
     */
    async syncUnsyncedBookings(): Promise<{ success: number; failed: number }> {
        if (!this.availabilityPush) {
            console.warn('[IntegratedBooking] Cannot sync - Two-way sync not enabled');
            return { success: 0, failed: 0 };
        }

        return await this.availabilityPush.syncUnsyncedBookings();
    }

    /**
     * Sync full availability calendar for a room
     */
    async syncRoomAvailability(roomId: number, daysAhead: number = 90): Promise<boolean> {
        if (!this.availabilityPush) {
            console.warn('[IntegratedBooking] Cannot sync - Two-way sync not enabled');
            return false;
        }

        return await this.availabilityPush.syncRoomAvailability(roomId, daysAhead);
    }

    /**
     * Check if two-way sync is enabled
     */
    isTwoWaySyncEnabled(): boolean {
        return this.availabilityPush !== null;
    }
}

/**
 * Factory function to create integrated booking service
 */
export function createIntegratedBookingService(bookingComConfig?: BookingComConfig): IntegratedBookingService {
    return new IntegratedBookingService(bookingComConfig);
}
