export declare enum ChannelType {
    BOOKING_COM = "booking_com",
    EXPEDIA = "expedia",
    AIRBNB = "airbnb",
    DIRECT = "direct"
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
    channelReference: string;
    channelId: number;
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
export declare class ChannelManager {
    private channelHandlers;
    getChannels(): Promise<Channel[]>;
    getChannelById(id: number): Promise<Channel | null>;
    processChannelBooking(booking: ChannelBooking): Promise<{
        success: boolean;
        bookingId?: number;
        message: string;
    }>;
    private handleBookingComReservation;
    private handleExpediaReservation;
    private handleAirbnbReservation;
}
export declare const channelManager: ChannelManager;
//# sourceMappingURL=channels.d.ts.map