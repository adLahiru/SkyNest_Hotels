import { type CreateBookingParams } from './db.js';
import type { BookingComConfig } from './booking-com-api.js';
/**
 * Integrated booking service that handles BOTH:
 * 1. Database operations (creating/cancelling bookings)
 * 2. Availability push to Booking.com (two-way sync)
 *
 * This ensures availability is always synced automatically
 */
export declare class IntegratedBookingService {
    private availabilityPush;
    /**
     * Initialize with Booking.com credentials to enable two-way sync
     */
    constructor(bookingComConfig?: BookingComConfig);
    /**
     * Create a booking with automatic availability push
     */
    createBooking(bookingData: CreateBookingParams): Promise<{
        bookingId: number;
        success: boolean;
        message: string;
        syncedToBookingCom: boolean;
    }>;
    /**
     * Cancel a booking with automatic availability push
     */
    cancelBooking(bookingId: number, reason?: string): Promise<{
        success: boolean;
        message: string;
        syncedToBookingCom: boolean;
    }>;
    /**
     * Modify a booking (cancels old dates and creates new dates on Booking.com)
     */
    modifyBooking(bookingId: number, newStartDate: string, newEndDate: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Sync all unsynced bookings (recovery/catchup)
     */
    syncUnsyncedBookings(): Promise<{
        success: number;
        failed: number;
    }>;
    /**
     * Sync full availability calendar for a room
     */
    syncRoomAvailability(roomId: number, daysAhead?: number): Promise<boolean>;
    /**
     * Check if two-way sync is enabled
     */
    isTwoWaySyncEnabled(): boolean;
}
/**
 * Factory function to create integrated booking service
 */
export declare function createIntegratedBookingService(bookingComConfig?: BookingComConfig): IntegratedBookingService;
//# sourceMappingURL=integrated-booking-service.d.ts.map