import axios from 'axios';
/**
 * Client for interacting with Booking.com API
 */
export class BookingComAPI {
    client;
    config;
    constructor(config) {
        this.config = config;
        // Booking.com uses their own base URL for API
        const baseUrl = config.baseUrl || 'https://supply-xml.booking.com/api/v1';
        this.client = axios.create({
            baseURL: baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'X-Booking-Auth-Token': config.apiKey,
                'X-Booking-Hotel-Id': config.hotelId
            },
            timeout: 30000
        });
    }
    /**
     * Fetch new reservations from Booking.com
     * @param fromDate - Start date in YYYY-MM-DD format
     * @param toDate - End date in YYYY-MM-DD format
     */
    async fetchReservations(fromDate, toDate) {
        try {
            const params = {
                hotel_id: this.config.hotelId
            };
            if (fromDate) {
                params.from_date = fromDate;
            }
            if (toDate) {
                params.to_date = toDate;
            }
            const response = await this.client.get('/reservations', {
                params
            });
            return response.data.reservations;
        }
        catch (error) {
            console.error('Error fetching Booking.com reservations:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
            }
            throw new Error(`Failed to fetch reservations: ${error.message}`);
        }
    }
    /**
     * Get a specific reservation by ID
     */
    async getReservation(reservationId) {
        try {
            const response = await this.client.get(`/reservations/${reservationId}`, {
                params: { hotel_id: this.config.hotelId }
            });
            return response.data;
        }
        catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error('Error fetching reservation:', error.message);
            throw error;
        }
    }
    /**
     * Send confirmation back to Booking.com
     */
    async confirmReservation(reservationId) {
        try {
            await this.client.post(`/reservations/${reservationId}/confirm`, {
                hotel_id: this.config.hotelId
            });
            return true;
        }
        catch (error) {
            console.error('Error confirming reservation:', error.message);
            return false;
        }
    }
    /**
     * Convert Booking.com reservation to our internal format
     */
    convertToChannelBooking(reservation, channelId, roomId) {
        const guestDetails = {
            name: `${reservation.guest.first_name} ${reservation.guest.last_name}`,
            email: reservation.guest.email
        };
        if (reservation.guest.phone) {
            guestDetails.phone = reservation.guest.phone;
        }
        if (reservation.guest.country_code) {
            guestDetails.nationality = reservation.guest.country_code;
        }
        return {
            channelReference: `BDC-${reservation.reservation_id}`,
            channelId: channelId,
            roomId: roomId,
            startDate: reservation.checkin_date,
            endDate: reservation.checkout_date,
            guestDetails,
            price: {
                amount: reservation.total_price.amount,
                currency: reservation.total_price.currency
            }
        };
    }
    // =====================================================
    // AVAILABILITY PUSH METHODS (Two-Way Sync)
    // =====================================================
    /**
     * Close availability on Booking.com (block dates when room is booked)
     * @param externalRoomId - Booking.com's room ID
     * @param startDate - Start date in YYYY-MM-DD format
     * @param endDate - End date in YYYY-MM-DD format
     */
    async closeAvailability(externalRoomId, startDate, endDate) {
        try {
            console.log(`[Booking.com] Closing availability for room ${externalRoomId} from ${startDate} to ${endDate}`);
            await this.client.post('/availability/close', {
                hotel_id: this.config.hotelId,
                room_id: externalRoomId,
                from_date: startDate,
                to_date: endDate
            });
            console.log(`[Booking.com] ✓ Successfully closed availability`);
            return true;
        }
        catch (error) {
            console.error(`[Booking.com] ✗ Failed to close availability:`, error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
            }
            return false;
        }
    }
    /**
     * Open availability on Booking.com (unblock dates when booking is cancelled)
     * @param externalRoomId - Booking.com's room ID
     * @param startDate - Start date in YYYY-MM-DD format
     * @param endDate - End date in YYYY-MM-DD format
     */
    async openAvailability(externalRoomId, startDate, endDate) {
        try {
            console.log(`[Booking.com] Opening availability for room ${externalRoomId} from ${startDate} to ${endDate}`);
            await this.client.post('/availability/open', {
                hotel_id: this.config.hotelId,
                room_id: externalRoomId,
                from_date: startDate,
                to_date: endDate
            });
            console.log(`[Booking.com] ✓ Successfully opened availability`);
            return true;
        }
        catch (error) {
            console.error(`[Booking.com] ✗ Failed to open availability:`, error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
            }
            return false;
        }
    }
    /**
     * Update inventory count for a specific date
     * @param externalRoomId - Booking.com's room ID
     * @param date - Date in YYYY-MM-DD format
     * @param availableCount - Number of available rooms (0 = fully booked)
     */
    async updateInventory(externalRoomId, date, availableCount) {
        try {
            await this.client.post('/availability/inventory', {
                hotel_id: this.config.hotelId,
                room_id: externalRoomId,
                date: date,
                available_rooms: availableCount
            });
            return true;
        }
        catch (error) {
            console.error(`[Booking.com] Failed to update inventory:`, error.message);
            return false;
        }
    }
    /**
     * Batch update availability for multiple dates
     * @param externalRoomId - Booking.com's room ID
     * @param updates - Array of date and availability status
     */
    async batchUpdateAvailability(externalRoomId, updates) {
        try {
            await this.client.post('/availability/batch', {
                hotel_id: this.config.hotelId,
                room_id: externalRoomId,
                updates: updates.map(u => ({
                    date: u.date,
                    available: u.available ? 1 : 0
                }))
            });
            return true;
        }
        catch (error) {
            console.error(`[Booking.com] Failed to batch update availability:`, error.message);
            return false;
        }
    }
}
/**
 * Factory function to create Booking.com API client
 */
export function createBookingComClient(config) {
    return new BookingComAPI(config);
}
//# sourceMappingURL=booking-com-api.js.map