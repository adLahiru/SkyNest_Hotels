import express from 'express';
import { pool, isRoomAvailable, createBooking, type CreateBookingParams } from './db.js';

const app = express();
app.use(express.json());

// Endpoint to check room availability
app.get('/rooms/:hotelBranchId/availability', async (req, res) => {
    try {
        const hotelBranchId = parseInt(req.params.hotelBranchId);
        const roomId = parseInt(req.query.roomId as string);
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        // Validate input
        if (!hotelBranchId || !roomId || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters'
            });
        }

        // Check room availability
        const isAvailable = await isRoomAvailable(hotelBranchId, roomId, startDate, endDate);

        res.json({
            success: true,
            hotelBranchId,
            roomId,
            dates: {
                start: startDate,
                end: endDate
            },
            isAvailable,
            message: isAvailable 
                ? 'Room is available for the selected dates'
                : 'Room is not available for the selected dates'
        });

    } catch (error: any) {
        console.error('Error checking room availability:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error checking room availability'
        });
    }
});

// Endpoint to create a new booking
app.post('/bookings', async (req, res) => {
    try {
        const bookingData: CreateBookingParams = req.body;

        // Validate required fields
        const requiredFields = ['hotelBranchId', 'roomId', 'channelId', 'startDate', 'endDate'];
        const missingFields = requiredFields.filter(field => !bookingData[field as keyof CreateBookingParams]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate dates
        const today = new Date();
        const startDate = new Date(bookingData.startDate);
        const endDate = new Date(bookingData.endDate);

        if (startDate < today) {
            return res.status(400).json({
                success: false,
                error: 'Start date cannot be in the past'
            });
        }

        if (endDate <= startDate) {
            return res.status(400).json({
                success: false,
                error: 'End date must be after start date'
            });
        }

        const result = await createBooking(bookingData);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.message
            });
        }

        res.status(201).json(result);
    } catch (error: any) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error creating booking'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});