import type { BookingComConfig } from './booking-com-api.js';
/**
 * Service to push availability updates to Booking.com
 * This enables TWO-WAY sync to prevent double bookings
 */
export declare class AvailabilityPushService {
    private bookingComAPI;
    private enabled;
    constructor(apiConfig: BookingComConfig);
    /**
     * Enable or disable the push service
     */
    setEnabled(enabled: boolean): void;
    /**
     * Push availability update when a booking is created
     * Blocks the dates on Booking.com
     */
    onBookingCreated(bookingId: number): Promise<boolean>;
    /**
     * Push availability update when a booking is cancelled
     * Opens the dates on Booking.com
     */
    onBookingCancelled(bookingId: number): Promise<boolean>;
    /**
     * Sync all unsynced bookings (recovery mechanism)
     */
    syncUnsyncedBookings(): Promise<{
        success: number;
        failed: number;
    }>;
    /**
     * Calculate and push full availability calendar for a room
     * Useful for initial sync or recovery
     */
    syncRoomAvailability(roomId: number, daysAhead?: number): Promise<boolean>;
    /**
     * Get booking details from database
     */
    private getBookingDetails;
    /**
     * Get Booking.com external room ID from local room ID
     */
    private getExternalRoomId;
    /**
     * Mark booking as synced to Booking.com
     */
    private markBookingSynced;
    /**
     * Get all bookings that haven't been synced yet
     */
    private getUnsyncedBookings;
}
/**
 * Factory function to create availability push service
 */
export declare function createAvailabilityPushService(apiConfig: BookingComConfig): AvailabilityPushService;
//# sourceMappingURL=availability-push.d.ts.map