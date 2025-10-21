import { BookingComAPI } from './booking-com-api.js';
import type { BookingComConfig } from './booking-com-api.js';
import { channelManager, ChannelType } from './channels.js';
import { pool } from './db.js';
import type mysql from 'mysql2/promise';

/**
 * Configuration for sync service
 */
export interface SyncConfig {
    intervalMinutes: number; // How often to sync (in minutes)
    lookbackDays: number;    // How many days back to fetch bookings
    channelId: number;       // Your Booking.com channel ID in the database
    defaultRoomId: number;   // Default room ID (you may need mapping logic)
}

/**
 * Service to sync bookings from Booking.com to local database
 */
export class BookingSyncService {
    private bookingComAPI: BookingComAPI;
    private syncConfig: SyncConfig;
    private syncInterval: NodeJS.Timeout | null = null;
    private isRunning: boolean = false;

    constructor(apiConfig: BookingComConfig, syncConfig: SyncConfig) {
        this.bookingComAPI = new BookingComAPI(apiConfig);
        this.syncConfig = syncConfig;
    }

    /**
     * Start automatic synchronization
     */
    start(): void {
        if (this.isRunning) {
            console.log('Sync service is already running');
            return;
        }

        console.log(`Starting Booking.com sync service (every ${this.syncConfig.intervalMinutes} minutes)`);
        this.isRunning = true;

        // Run immediately
        this.syncBookings();

        // Then run at intervals
        const intervalMs = this.syncConfig.intervalMinutes * 60 * 1000;
        this.syncInterval = setInterval(() => {
            this.syncBookings();
        }, intervalMs);
    }

    /**
     * Stop automatic synchronization
     */
    stop(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        this.isRunning = false;
        console.log('Booking.com sync service stopped');
    }

    /**
     * Manually trigger a sync
     */
    async syncBookings(): Promise<{ success: number; failed: number; skipped: number }> {
        console.log('[Booking.com Sync] Starting sync...');
        
        const stats = {
            success: 0,
            failed: 0,
            skipped: 0
        };

        try {
            // Calculate date range
            const toDate = new Date();
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - this.syncConfig.lookbackDays);

            const fromDateStr = fromDate.toISOString().split('T')[0];
            const toDateStr = toDate.toISOString().split('T')[0];

            console.log(`[Booking.com Sync] Fetching reservations from ${fromDateStr} to ${toDateStr}`);

            // Fetch reservations from Booking.com
            const reservations = await this.bookingComAPI.fetchReservations(fromDateStr, toDateStr);
            
            console.log(`[Booking.com Sync] Found ${reservations.length} reservations`);

            // Process each reservation
            for (const reservation of reservations) {
                try {
                    // Skip cancelled reservations
                    if (reservation.status === 'cancelled') {
                        console.log(`[Booking.com Sync] Skipping cancelled reservation: ${reservation.reservation_id}`);
                        stats.skipped++;
                        continue;
                    }

                    // Check if booking already exists
                    const bookingRef = `BDC-${reservation.reservation_id}`;
                    const exists = await this.bookingExists(bookingRef);
                    
                    if (exists) {
                        console.log(`[Booking.com Sync] Booking already exists: ${bookingRef}`);
                        stats.skipped++;
                        continue;
                    }

                    // Map room (you may need more sophisticated logic here)
                    const roomId = await this.mapRoomId(reservation.room_id);

                    // Convert to channel booking format
                    const channelBooking = this.bookingComAPI.convertToChannelBooking(
                        reservation,
                        this.syncConfig.channelId,
                        roomId
                    );

                    // Process the booking
                    const result = await channelManager.processChannelBooking(channelBooking);

                    if (result.success) {
                        console.log(`[Booking.com Sync] ✓ Successfully imported booking: ${bookingRef}`);
                        stats.success++;

                        // Confirm back to Booking.com
                        await this.bookingComAPI.confirmReservation(reservation.reservation_id);
                    } else {
                        console.error(`[Booking.com Sync] ✗ Failed to import booking: ${bookingRef} - ${result.message}`);
                        stats.failed++;
                    }

                } catch (error: any) {
                    console.error(`[Booking.com Sync] Error processing reservation ${reservation.reservation_id}:`, error.message);
                    stats.failed++;
                }
            }

            console.log(`[Booking.com Sync] Sync completed - Success: ${stats.success}, Failed: ${stats.failed}, Skipped: ${stats.skipped}`);

        } catch (error: any) {
            console.error('[Booking.com Sync] Error during sync:', error.message);
        }

        return stats;
    }

    /**
     * Check if a booking already exists in the database
     */
    private async bookingExists(bookingReference: string): Promise<boolean> {
        const [rows] = await pool.execute<mysql.RowDataPacket[]>(
            'SELECT id FROM bookings WHERE booking_reference = ?',
            [bookingReference]
        );
        return rows.length > 0;
    }

    /**
     * Map Booking.com room ID to local room ID
     * This is where you'd implement your room mapping logic
     */
    private async mapRoomId(bookingComRoomId: string): Promise<number> {
        // Option 1: Look up in a mapping table
        const [rows] = await pool.execute<mysql.RowDataPacket[]>(
            'SELECT local_room_id FROM room_mapping WHERE external_room_id = ? AND channel_type = ?',
            [bookingComRoomId, ChannelType.BOOKING_COM]
        );

        if (rows.length > 0 && rows[0]) {
            return rows[0].local_room_id;
        }

        // Option 2: Use default room ID (fallback)
        console.warn(`No mapping found for Booking.com room ${bookingComRoomId}, using default`);
        return this.syncConfig.defaultRoomId;
    }

    /**
     * Get sync status
     */
    getStatus() {
        return {
            running: this.isRunning,
            intervalMinutes: this.syncConfig.intervalMinutes,
            lookbackDays: this.syncConfig.lookbackDays
        };
    }
}

/**
 * Create and export sync service instance
 */
export function createSyncService(apiConfig: BookingComConfig, syncConfig: SyncConfig): BookingSyncService {
    return new BookingSyncService(apiConfig, syncConfig);
}
