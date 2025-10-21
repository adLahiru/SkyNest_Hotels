import type { BookingComConfig } from './booking-com-api.js';
/**
 * Configuration for sync service
 */
export interface SyncConfig {
    intervalMinutes: number;
    lookbackDays: number;
    channelId: number;
    defaultRoomId: number;
}
/**
 * Service to sync bookings from Booking.com to local database
 */
export declare class BookingSyncService {
    private bookingComAPI;
    private syncConfig;
    private syncInterval;
    private isRunning;
    constructor(apiConfig: BookingComConfig, syncConfig: SyncConfig);
    /**
     * Start automatic synchronization
     */
    start(): void;
    /**
     * Stop automatic synchronization
     */
    stop(): void;
    /**
     * Manually trigger a sync
     */
    syncBookings(): Promise<{
        success: number;
        failed: number;
        skipped: number;
    }>;
    /**
     * Check if a booking already exists in the database
     */
    private bookingExists;
    /**
     * Map Booking.com room ID to local room ID
     * This is where you'd implement your room mapping logic
     */
    private mapRoomId;
    /**
     * Get sync status
     */
    getStatus(): {
        running: boolean;
        intervalMinutes: number;
        lookbackDays: number;
    };
}
/**
 * Create and export sync service instance
 */
export declare function createSyncService(apiConfig: BookingComConfig, syncConfig: SyncConfig): BookingSyncService;
//# sourceMappingURL=booking-sync-service.d.ts.map