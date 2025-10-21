import type { ChannelBooking } from './channels.js';
/**
 * Booking.com API Configuration
 * You need to get these credentials from Booking.com's Connectivity program
 */
export interface BookingComConfig {
    hotelId: string;
    apiKey: string;
    apiSecret: string;
    baseUrl?: string;
}
/**
 * Booking.com Reservation Response Structure
 */
interface BookingComReservation {
    reservation_id: string;
    hotel_id: string;
    room_id: string;
    checkin_date: string;
    checkout_date: string;
    guest: {
        first_name: string;
        last_name: string;
        email: string;
        phone?: string;
        country_code?: string;
    };
    total_price: {
        amount: number;
        currency: string;
    };
    status: 'confirmed' | 'cancelled' | 'modified';
    created_at: string;
}
/**
 * Client for interacting with Booking.com API
 */
export declare class BookingComAPI {
    private client;
    private config;
    constructor(config: BookingComConfig);
    /**
     * Fetch new reservations from Booking.com
     * @param fromDate - Start date in YYYY-MM-DD format
     * @param toDate - End date in YYYY-MM-DD format
     */
    fetchReservations(fromDate?: string, toDate?: string): Promise<BookingComReservation[]>;
    /**
     * Get a specific reservation by ID
     */
    getReservation(reservationId: string): Promise<BookingComReservation | null>;
    /**
     * Send confirmation back to Booking.com
     */
    confirmReservation(reservationId: string): Promise<boolean>;
    /**
     * Convert Booking.com reservation to our internal format
     */
    convertToChannelBooking(reservation: BookingComReservation, channelId: number, roomId: number): ChannelBooking;
    /**
     * Close availability on Booking.com (block dates when room is booked)
     * @param externalRoomId - Booking.com's room ID
     * @param startDate - Start date in YYYY-MM-DD format
     * @param endDate - End date in YYYY-MM-DD format
     */
    closeAvailability(externalRoomId: string, startDate: string, endDate: string): Promise<boolean>;
    /**
     * Open availability on Booking.com (unblock dates when booking is cancelled)
     * @param externalRoomId - Booking.com's room ID
     * @param startDate - Start date in YYYY-MM-DD format
     * @param endDate - End date in YYYY-MM-DD format
     */
    openAvailability(externalRoomId: string, startDate: string, endDate: string): Promise<boolean>;
    /**
     * Update inventory count for a specific date
     * @param externalRoomId - Booking.com's room ID
     * @param date - Date in YYYY-MM-DD format
     * @param availableCount - Number of available rooms (0 = fully booked)
     */
    updateInventory(externalRoomId: string, date: string, availableCount: number): Promise<boolean>;
    /**
     * Batch update availability for multiple dates
     * @param externalRoomId - Booking.com's room ID
     * @param updates - Array of date and availability status
     */
    batchUpdateAvailability(externalRoomId: string, updates: {
        date: string;
        available: boolean;
    }[]): Promise<boolean>;
}
/**
 * Factory function to create Booking.com API client
 */
export declare function createBookingComClient(config: BookingComConfig): BookingComAPI;
export {};
//# sourceMappingURL=booking-com-api.d.ts.map