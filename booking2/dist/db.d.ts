import mysql from 'mysql2/promise';
declare const pool: mysql.Pool;
declare function isRoomAvailable(hotelBranchId: number, roomId: number, startDate: string, endDate: string): Promise<boolean>;
interface CreateBookingParams {
    hotelBranchId: number;
    roomId: number;
    channelId: number;
    startDate: string;
    endDate: string;
}
declare function createBooking(bookingData: CreateBookingParams): Promise<{
    bookingId: number;
    success: boolean;
    message: string;
}>;
export { pool, isRoomAvailable, createBooking, type CreateBookingParams };
//# sourceMappingURL=db.d.ts.map