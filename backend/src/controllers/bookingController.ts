import { Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '../config/db';
import { UserRole, AuthenticatedRequest } from '../types/auth.types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { v4: uuidv4 } = require('uuid');

/**
 * Booking Controller
 * Allows all authenticated users to create and manage their own bookings
 * Staff can view and manage bookings in their branch
 * Admins have full access
 */

// Booking status enum
export enum BookingStatus {
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out'
}

interface Booking extends RowDataPacket {
  booking_id: string;
  user_id: string;
  room_id: number;
  staff_id: string | null;
  checking_datetime: Date;
  checkout_datetime: Date;
  booking_status: BookingStatus;
  booking_date: Date;
  branch_id: string;
  number_of_guests: number;
  special_requests: string | null;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  user_name?: string;
  user_email?: string;
  room_no?: string;
  room_type?: string;
  branch_name?: string;
  daily_rate?: number;
  staff_name?: string;
}

/**
 * Calculate total days for a booking
 */
const calculateTotalDays = (checkIn: Date, checkOut: Date): number => {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays || 1; // Minimum 1 day
};

/**
 * Calculate total cost for a booking
 */
const calculateTotalCost = (dailyRate: number, totalDays: number): number => {
  return dailyRate * totalDays;
};

/**
 * Check if user can access a booking
 */
const canAccessBooking = (req: AuthenticatedRequest, booking: Booking): boolean => {
  // Admins can access any booking
  if (req.user?.role === UserRole.ADMIN) {
    return true;
  }
  
  // Managers and staff can access bookings in their branch
  if (req.user?.role === UserRole.MANAGER || req.user?.role === UserRole.RECEPTIONIST) {
    return req.user.branch_id === booking.branch_id;
  }
  
  // Users can only access their own bookings
  return req.user?.user_id === booking.user_id;
};

/**
 * Create a new booking
 * All authenticated users can create bookings
 * POST /api/bookings
 */
export const createBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const connection = await db.getConnection();
  
  try {
    console.log('=== CREATE BOOKING REQUEST ===');
    console.log('Request body:', req.body);
    console.log('User from JWT:', req.user);
    
    const { 
      room_id, 
      checking_datetime, 
      checkout_datetime,
      staff_id, // Optional - can be assigned by receptionist
      number_of_guests, // New field
      special_requests // New field
    } = req.body;

    // Get the user_id from the authenticated user
    const user_id = req.user?.user_id;

    if (!user_id) {
      console.log('ERROR: No user_id found in JWT token');
      res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
      return;
    }

    // Validate required fields
    if (!room_id || !checking_datetime || !checkout_datetime) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: room_id, checking_datetime, and checkout_datetime are required.'
      });
      return;
    }

    // Parse and validate dates
    const checkIn = new Date(checking_datetime);
    const checkOut = new Date(checkout_datetime);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of today for fair comparison

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss).'
      });
      return;
    }

    // Validate check-in is not in the past (allow today)
    checkIn.setHours(0, 0, 0, 0); // Normalize to start of day
    if (checkIn < now) {
      res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past.'
      });
      return;
    }

    // Validate checkout is after check-in
    checkOut.setHours(0, 0, 0, 0); // Normalize to start of day
    if (checkOut <= checkIn) {
      res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date.'
      });
      return;
    }

    // Calculate total days
    const totalDays = calculateTotalDays(checkIn, checkOut);

    // Validate maximum booking duration (e.g., 30 days)
    if (totalDays > 30) {
      res.status(400).json({
        success: false,
        message: 'Maximum booking duration is 30 days.'
      });
      return;
    }

    await connection.beginTransaction();

    // Check if room exists and get room details
    const [rooms] = await connection.query<RowDataPacket[]>(
      `SELECT r.room_id, r.room_no, r.state, r.branch_id, rt.daily_rate, rt.type as room_type
       FROM rooms r
       LEFT JOIN room_types rt ON r.room_type_id = rt.room_type_id
       WHERE r.room_id = ?`,
      [room_id]
    );

    if (rooms.length === 0) {
      await connection.rollback();
      res.status(404).json({
        success: false,
        message: 'Room not found.'
      });
      return;
    }

    const room = rooms[0];
    
    if (!room) {
      await connection.rollback();
      res.status(404).json({
        success: false,
        message: 'Room not found.'
      });
      return;
    }

    // Check if room is available
    if (room.state !== 'available') {
      await connection.rollback();
      res.status(409).json({
        success: false,
        message: `Room is currently ${room.state}. Please choose an available room.`
      });
      return;
    }

    // Check for conflicting bookings (room already booked for overlapping dates)
    const [conflicts] = await connection.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM booking 
       WHERE room_id = ? 
       AND booking_status NOT IN ('cancelled', 'checked_out')
       AND (
         (checking_datetime <= ? AND checkout_datetime > ?) OR
         (checking_datetime < ? AND checkout_datetime >= ?) OR
         (checking_datetime >= ? AND checkout_datetime <= ?)
       )`,
      [room_id, checkOut, checkIn, checkOut, checkIn, checkIn, checkOut]
    );

    const conflictCount = conflicts[0]?.count ?? 0;

    if (conflictCount > 0) {
      await connection.rollback();
      res.status(409).json({
        success: false,
        message: 'Room is already booked for the selected dates. Please choose different dates.'
      });
      return;
    }

    // Validate staff_id if provided
    if (staff_id) {
      const [staff] = await connection.query<RowDataPacket[]>(
        'SELECT staff_id FROM staff WHERE staff_id = ?',
        [staff_id]
      );

      if (staff.length === 0) {
        await connection.rollback();
        res.status(404).json({
          success: false,
          message: 'Staff member not found.'
        });
        return;
      }
    }

    // Calculate room charges (daily_rate × number of days)
    const dailyRate = room.daily_rate ? parseFloat(room.daily_rate.toString()) : 0;
    const roomCharges = dailyRate * totalDays;
    const totalCost = calculateTotalCost(dailyRate, totalDays);

    // Generate UUID for booking
    const booking_id = uuidv4();

    console.log('Creating booking with data:', {
      booking_id,
      user_id,
      room_id,
      staff_id: staff_id || null,
      checking_datetime,
      checkout_datetime,
      booking_status: BookingStatus.CONFIRMED,
      branch_id: room.branch_id,
      number_of_guests: number_of_guests || 1,
      special_requests: special_requests || null,
      room_charges: roomCharges
      // Note: total_amount is auto-calculated by database (generated column)
    });

    // Create the booking with room_charges (total_amount is auto-calculated)
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO booking 
       (booking_id, user_id, room_id, staff_id, checking_datetime, checkout_datetime, booking_status, booking_date, branch_id, number_of_guests, special_requests, room_charges) 
       VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?)`,
      [booking_id, user_id, room_id, staff_id || null, checking_datetime, checkout_datetime, BookingStatus.CONFIRMED, room.branch_id, number_of_guests || 1, special_requests || null, roomCharges]
    );

    // Fetch the created booking with joined data
    const [newBooking] = await connection.query<Booking[]>(
      `SELECT b.*, 
              u.name as user_name, u.email as user_email,
              r.room_no, rt.type as room_type, rt.daily_rate,
              hb.branch_name,
              su.name as staff_name
       FROM booking b
       LEFT JOIN users u ON b.user_id = u.user_id
       LEFT JOIN rooms r ON b.room_id = r.room_id
       LEFT JOIN room_types rt ON r.room_type_id = rt.room_type_id
       LEFT JOIN hotel_branches hb ON b.branch_id = hb.branch_id
       LEFT JOIN staff st ON b.staff_id = st.staff_id
       LEFT JOIN users su ON st.staff_id = su.user_id
       WHERE b.booking_id = ?`,
      [booking_id]
    );

    // Update room state to occupied (optional - can be done at check-in)
    // For now, we'll keep it available until check-in

    await connection.commit();

    const booking = newBooking[0];

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      data: {
        booking: {
          booking_id: booking?.booking_id,
          user_id: booking?.user_id,
          user_name: booking?.user_name,
          user_email: booking?.user_email,
          room_id: booking?.room_id,
          room_no: booking?.room_no,
          room_type: booking?.room_type,
          branch_id: booking?.branch_id,
          branch_name: booking?.branch_name,
          checking_datetime: booking?.checking_datetime,
          checkout_datetime: booking?.checkout_datetime,
          number_of_guests: booking?.number_of_guests || number_of_guests || 1,
          booking_status: booking?.booking_status,
          booking_date: booking?.booking_date,
          staff_id: booking?.staff_id,
          staff_name: booking?.staff_name,
          daily_rate: booking?.daily_rate ? parseFloat(booking.daily_rate.toString()) : null,
          room_charges: booking?.room_charges || roomCharges,
          service_charges: booking?.service_charges || 0,
          total_amount: booking?.total_amount || roomCharges, // Auto-calculated by database
          total_days: totalDays,
          total_cost: totalCost,
          created_at: booking?.created_at,
          updated_at: booking?.updated_at
        }
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating booking:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating the booking.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    connection.release();
  }
};

/**
 * Get all bookings
 * Users: see only their own bookings
 * Staff: see bookings in their branch
 * Admins: see all bookings
 * GET /api/bookings
 */
export const getBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, room_id, branch_id, user_id } = req.query;

    let query = `SELECT b.*, 
                        u.name as user_name, u.email as user_email,
                        r.room_no, rt.type as room_type, rt.daily_rate,
                        hb.branch_name,
                        su.name as staff_name
                 FROM booking b
                 LEFT JOIN users u ON b.user_id = u.user_id
                 LEFT JOIN rooms r ON b.room_id = r.room_id
                 LEFT JOIN room_types rt ON r.room_type_id = rt.room_type_id
                 LEFT JOIN hotel_branches hb ON b.branch_id = hb.branch_id
                 LEFT JOIN staff st ON b.staff_id = st.staff_id
                 LEFT JOIN users su ON st.staff_id = su.user_id
                 WHERE 1=1`;
    const params: any[] = [];

    // Apply access control
    if (req.user?.role === UserRole.GUEST) {
      // Guests can only see their own bookings
      query += ' AND b.user_id = ?';
      params.push(req.user.user_id);
    } else if (req.user?.role === UserRole.MANAGER || req.user?.role === UserRole.RECEPTIONIST) {
      // Staff can see bookings in their branch
      query += ' AND b.branch_id = ?';
      params.push(req.user.branch_id);
    }
    // Admins can see all bookings (no filter)

    // Apply filters
    if (status) {
      if (!Object.values(BookingStatus).includes(status as BookingStatus)) {
        res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${Object.values(BookingStatus).join(', ')}`
        });
        return;
      }
      query += ' AND b.booking_status = ?';
      params.push(status);
    }

    if (room_id) {
      query += ' AND b.room_id = ?';
      params.push(room_id);
    }

    if (branch_id && req.user?.role === UserRole.ADMIN) {
      query += ' AND b.branch_id = ?';
      params.push(branch_id);
    }

    if (user_id && req.user?.role !== UserRole.GUEST) {
      query += ' AND b.user_id = ?';
      params.push(user_id);
    }

    query += ' ORDER BY b.checking_datetime DESC';

    const [bookings] = await db.query<Booking[]>(query, params);

    const formattedBookings = bookings.map((booking: Booking) => {
      const totalDays = calculateTotalDays(
        new Date(booking.checking_datetime),
        new Date(booking.checkout_datetime)
      );
      const dailyRate = booking.daily_rate ? parseFloat(booking.daily_rate.toString()) : 0;
      const totalCost = calculateTotalCost(dailyRate, totalDays);

      return {
        booking_id: booking.booking_id,
        user_id: booking.user_id,
        user_name: booking.user_name,
        user_email: booking.user_email,
        room_id: booking.room_id,
        room_no: booking.room_no,
        room_type: booking.room_type,
        branch_id: booking.branch_id,
        branch_name: booking.branch_name,
        checking_datetime: booking.checking_datetime,
        checkout_datetime: booking.checkout_datetime,
        booking_status: booking.booking_status,
        booking_date: booking.booking_date,
        staff_id: booking.staff_id,
        staff_name: booking.staff_name,
        daily_rate: dailyRate,
        total_days: totalDays,
        total_cost: totalCost,
        created_at: booking.created_at,
        updated_at: booking.updated_at
      };
    });

    res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully.',
      data: {
        bookings: formattedBookings,
        count: formattedBookings.length
      }
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving bookings.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get booking by ID
 * Users can only view their own bookings
 * Staff can view bookings in their branch
 * Admins can view any booking
 * GET /api/bookings/:booking_id
 */
export const getBookingById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { booking_id } = req.params;

    const [bookings] = await db.query<Booking[]>(
      `SELECT b.*, 
              u.name as user_name, u.email as user_email, u.phone as user_phone,
              r.room_no, rt.type as room_type, rt.daily_rate, rt.capacity,
              hb.branch_name, hb.address as branch_address,
              su.name as staff_name, su.email as staff_email
       FROM booking b
       LEFT JOIN users u ON b.user_id = u.user_id
       LEFT JOIN rooms r ON b.room_id = r.room_id
       LEFT JOIN room_types rt ON r.room_type_id = rt.room_type_id
       LEFT JOIN hotel_branches hb ON b.branch_id = hb.branch_id
       LEFT JOIN staff st ON b.staff_id = st.staff_id
       LEFT JOIN users su ON st.staff_id = su.user_id
       WHERE b.booking_id = ?`,
      [booking_id]
    );

    if (bookings.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
      return;
    }

    const booking = bookings[0];
    
    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
      return;
    }

    // Check if user can access this booking
    if (!canAccessBooking(req, booking)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own bookings.'
      });
      return;
    }

    const totalDays = calculateTotalDays(
      new Date(booking.checking_datetime),
      new Date(booking.checkout_datetime)
    );
    const dailyRate = booking.daily_rate ? parseFloat(booking.daily_rate.toString()) : 0;
    const totalCost = calculateTotalCost(dailyRate, totalDays);

    res.status(200).json({
      success: true,
      message: 'Booking retrieved successfully.',
      data: {
        booking: {
          booking_id: booking.booking_id,
          user_id: booking.user_id,
          user_name: booking.user_name,
          user_email: booking.user_email,
          room_id: booking.room_id,
          room_no: booking.room_no,
          room_type: booking.room_type,
          branch_id: booking.branch_id,
          branch_name: booking.branch_name,
          checking_datetime: booking.checking_datetime,
          checkout_datetime: booking.checkout_datetime,
          booking_status: booking.booking_status,
          booking_date: booking.booking_date,
          staff_id: booking.staff_id,
          staff_name: booking.staff_name,
          daily_rate: dailyRate,
          total_days: totalDays,
          total_cost: totalCost,
          created_at: booking.created_at,
          updated_at: booking.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving the booking.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update booking
 * Users can update their own bookings (if not checked in)
 * Staff can update bookings in their branch
 * Admins can update any booking
 * PUT /api/bookings/:booking_id
 */
export const updateBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const connection = await db.getConnection();
  
  try {
    const { booking_id } = req.params;
    const { checking_datetime, checkout_datetime, staff_id, booking_status } = req.body;

    // Check if booking exists
    const [existingBookings] = await connection.query<Booking[]>(
      'SELECT * FROM booking WHERE booking_id = ?',
      [booking_id]
    );

    if (existingBookings.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
      return;
    }

    const existingBooking = existingBookings[0];

    if (!existingBooking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
      return;
    }

    // Check if user can access this booking
    if (!canAccessBooking(req, existingBooking)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own bookings.'
      });
      return;
    }

    // Guests cannot update bookings that are checked in or checked out
    if (req.user?.role === UserRole.GUEST) {
      if (existingBooking.booking_status === BookingStatus.CHECKED_IN || 
          existingBooking.booking_status === BookingStatus.CHECKED_OUT) {
        res.status(403).json({
          success: false,
          message: 'Cannot update booking after check-in. Please contact reception.'
        });
        return;
      }
    }

    await connection.beginTransaction();

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    // Validate and update dates
    if (checking_datetime !== undefined || checkout_datetime !== undefined) {
      const newCheckIn = checking_datetime ? new Date(checking_datetime) : new Date(existingBooking.checking_datetime);
      const newCheckOut = checkout_datetime ? new Date(checkout_datetime) : new Date(existingBooking.checkout_datetime);

      if (isNaN(newCheckIn.getTime()) || isNaN(newCheckOut.getTime())) {
        await connection.rollback();
        res.status(400).json({
          success: false,
          message: 'Invalid date format.'
        });
        return;
      }

      if (newCheckOut <= newCheckIn) {
        await connection.rollback();
        res.status(400).json({
          success: false,
          message: 'Check-out date must be after check-in date.'
        });
        return;
      }

      // Check for conflicts if dates are changing
      if (checking_datetime !== undefined || checkout_datetime !== undefined) {
        const [conflicts] = await connection.query<RowDataPacket[]>(
          `SELECT COUNT(*) as count FROM booking 
           WHERE room_id = ? 
           AND booking_id != ?
           AND booking_status NOT IN ('cancelled', 'checked_out')
           AND (
             (checking_datetime <= ? AND checkout_datetime > ?) OR
             (checking_datetime < ? AND checkout_datetime >= ?) OR
             (checking_datetime >= ? AND checkout_datetime <= ?)
           )`,
          [existingBooking.room_id, booking_id, newCheckOut, newCheckIn, newCheckOut, newCheckIn, newCheckIn, newCheckOut]
        );

        const conflictCount = conflicts[0]?.count ?? 0;

        if (conflictCount > 0) {
          await connection.rollback();
          res.status(409).json({
            success: false,
            message: 'Room is already booked for the selected dates.'
          });
          return;
        }
      }

      if (checking_datetime !== undefined) {
        updates.push('checking_datetime = ?');
        values.push(checking_datetime);
      }
      if (checkout_datetime !== undefined) {
        updates.push('checkout_datetime = ?');
        values.push(checkout_datetime);
      }
    }

    if (staff_id !== undefined) {
      if (staff_id !== null) {
        const [staff] = await connection.query<RowDataPacket[]>(
          'SELECT staff_id FROM staff WHERE staff_id = ?',
          [staff_id]
        );

        if (staff.length === 0) {
          await connection.rollback();
          res.status(404).json({
            success: false,
            message: 'Staff member not found.'
          });
          return;
        }
      }
      updates.push('staff_id = ?');
      values.push(staff_id);
    }

    if (booking_status !== undefined) {
      if (!Object.values(BookingStatus).includes(booking_status as BookingStatus)) {
        await connection.rollback();
        res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${Object.values(BookingStatus).join(', ')}`
        });
        return;
      }

      // Update room state based on booking status
      if (booking_status === BookingStatus.CHECKED_IN) {
        await connection.query(
          "UPDATE rooms SET state = 'occupied' WHERE room_id = ?",
          [existingBooking.room_id]
        );
      } else if (booking_status === BookingStatus.CHECKED_OUT) {
        await connection.query(
          "UPDATE rooms SET state = 'available' WHERE room_id = ?",
          [existingBooking.room_id]
        );
      }

      updates.push('booking_status = ?');
      values.push(booking_status);
    }

    if (updates.length === 0) {
      await connection.rollback();
      res.status(400).json({
        success: false,
        message: 'No fields to update.'
      });
      return;
    }

    values.push(booking_id);

    await connection.query(
      `UPDATE booking SET ${updates.join(', ')} WHERE booking_id = ?`,
      values
    );

    // Fetch updated booking
    const [updatedBookings] = await connection.query<Booking[]>(
      `SELECT b.*, 
              u.name as user_name, u.email as user_email,
              r.room_no, rt.type as room_type, rt.daily_rate,
              hb.branch_name,
              su.name as staff_name
       FROM booking b
       LEFT JOIN users u ON b.user_id = u.user_id
       LEFT JOIN rooms r ON b.room_id = r.room_id
       LEFT JOIN room_types rt ON r.room_type_id = rt.room_type_id
       LEFT JOIN hotel_branches hb ON b.branch_id = hb.branch_id
       LEFT JOIN staff st ON b.staff_id = st.staff_id
       LEFT JOIN users su ON st.staff_id = su.user_id
       WHERE b.booking_id = ?`,
      [booking_id]
    );

    await connection.commit();

    const booking = updatedBookings[0];

    if (!booking) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve updated booking.'
      });
      return;
    }

    const totalDays = calculateTotalDays(
      new Date(booking.checking_datetime),
      new Date(booking.checkout_datetime)
    );
    const dailyRate = booking.daily_rate ? parseFloat(booking.daily_rate.toString()) : 0;
    const totalCost = calculateTotalCost(dailyRate, totalDays);

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully.',
      data: {
        booking: {
          booking_id: booking.booking_id,
          user_id: booking.user_id,
          user_name: booking.user_name,
          user_email: booking.user_email,
          room_id: booking.room_id,
          room_no: booking.room_no,
          room_type: booking.room_type,
          branch_id: booking.branch_id,
          branch_name: booking.branch_name,
          checking_datetime: booking.checking_datetime,
          checkout_datetime: booking.checkout_datetime,
          booking_status: booking.booking_status,
          booking_date: booking.booking_date,
          staff_id: booking.staff_id,
          staff_name: booking.staff_name,
          daily_rate: dailyRate,
          total_days: totalDays,
          total_cost: totalCost,
          created_at: booking.created_at,
          updated_at: booking.updated_at
        }
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating the booking.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    connection.release();
  }
};

/**
 * Cancel booking
 * Users can cancel their own bookings
 * Staff can cancel bookings in their branch
 * Admins can cancel any booking
 * DELETE /api/bookings/:booking_id
 */
export const cancelBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const connection = await db.getConnection();
  
  try {
    const { booking_id } = req.params;

    // Check if booking exists
    const [bookings] = await connection.query<Booking[]>(
      'SELECT * FROM booking WHERE booking_id = ?',
      [booking_id]
    );

    if (bookings.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
      return;
    }

    const booking = bookings[0];

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
      return;
    }

    // Check if user can access this booking
    if (!canAccessBooking(req, booking)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own bookings.'
      });
      return;
    }

    // Cannot cancel already checked out bookings
    if (booking.booking_status === BookingStatus.CHECKED_OUT) {
      res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking.'
      });
      return;
    }

    // Cannot cancel already cancelled bookings
    if (booking.booking_status === BookingStatus.CANCELLED) {
      res.status(400).json({
        success: false,
        message: 'Booking is already cancelled.'
      });
      return;
    }

    await connection.beginTransaction();

    // Update booking status to cancelled
    await connection.query(
      'UPDATE booking SET booking_status = ? WHERE booking_id = ?',
      [BookingStatus.CANCELLED, booking_id]
    );

    // If room was occupied, make it available again
    if (booking.booking_status === BookingStatus.CHECKED_IN) {
      await connection.query(
        "UPDATE rooms SET state = 'available' WHERE room_id = ?",
        [booking.room_id]
      );
    }

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      data: {
        booking_id: booking_id,
        cancelled_at: new Date()
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while cancelling the booking.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    connection.release();
  }
};

/**
 * Get user's own bookings (my bookings)
 * GET /api/bookings/my-bookings
 */
export const getMyBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
      return;
    }

    const { status } = req.query;

    let query = `SELECT b.*, 
                        r.room_no, rt.type as room_type, rt.daily_rate,
                        hb.branch_name,
                        su.name as staff_name
                 FROM booking b
                 LEFT JOIN rooms r ON b.room_id = r.room_id
                 LEFT JOIN room_types rt ON r.room_type_id = rt.room_type_id
                 LEFT JOIN hotel_branches hb ON b.branch_id = hb.branch_id
                 LEFT JOIN staff st ON b.staff_id = st.staff_id
                 LEFT JOIN users su ON st.staff_id = su.user_id
                 WHERE b.user_id = ?`;
    const params: any[] = [user_id];

    if (status) {
      if (!Object.values(BookingStatus).includes(status as BookingStatus)) {
        res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${Object.values(BookingStatus).join(', ')}`
        });
        return;
      }
      query += ' AND b.booking_status = ?';
      params.push(status);
    }

    query += ' ORDER BY b.checking_datetime DESC';

    const [bookings] = await db.query<Booking[]>(query, params);

    const formattedBookings = bookings.map((booking: Booking) => {
      const totalDays = calculateTotalDays(
        new Date(booking.checking_datetime),
        new Date(booking.checkout_datetime)
      );
      const dailyRate = booking.daily_rate ? parseFloat(booking.daily_rate.toString()) : 0;
      const totalCost = calculateTotalCost(dailyRate, totalDays);

      return {
        booking_id: booking.booking_id,
        room_id: booking.room_id,
        room_no: booking.room_no,
        room_type: booking.room_type,
        branch_id: booking.branch_id,
        branch_name: booking.branch_name,
        checking_datetime: booking.checking_datetime,
        checkout_datetime: booking.checkout_datetime,
        booking_status: booking.booking_status,
        booking_date: booking.booking_date,
        staff_id: booking.staff_id,
        staff_name: booking.staff_name,
        daily_rate: dailyRate,
        total_days: totalDays,
        total_cost: totalCost,
        created_at: booking.created_at,
        updated_at: booking.updated_at
      };
    });

    res.status(200).json({
      success: true,
      message: 'Your bookings retrieved successfully.',
      data: {
        bookings: formattedBookings,
        count: formattedBookings.length
      }
    });

  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving your bookings.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Check in a guest
 * PATCH /api/bookings/:booking_id/checkin
 */
export const checkInGuest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const connection = await db.getConnection();
  
  try {
    const { booking_id } = req.params;
    const staffId = req.user?.staff_id || req.user?.user_id;
    
    if (!booking_id) {
      res.status(400).json({ error: 'Booking ID is required' });
      return;
    }
    
    await connection.beginTransaction();
    
    // Get booking details
    const [bookings] = await connection.query<Booking[]>(
      `SELECT * FROM booking WHERE booking_id = ?`,
      [booking_id]
    );
    
    if (bookings.length === 0) {
      await connection.rollback();
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    
    const booking = bookings[0];
    
    if (!booking) {
      await connection.rollback();
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    
    // Check if user has access
    if (!canAccessBooking(req, booking)) {
      await connection.rollback();
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    // Validate booking status
    if (booking.booking_status !== BookingStatus.CONFIRMED) {
      await connection.rollback();
      res.status(400).json({ 
        error: `Cannot check in booking with status: ${booking.booking_status}. Only confirmed bookings can be checked in.` 
      });
      return;
    }
    
    // Update booking status to checked_in
    // The trigger will automatically update room status to 'occupied'
    await connection.query(
      `UPDATE booking 
       SET booking_status = ?,
           staff_id = ?,
           checking_datetime = NOW()
       WHERE booking_id = ?`,
      [BookingStatus.CHECKED_IN, staffId, booking_id]
    );
    
    await connection.commit();
    
    // Fetch updated booking with room details
    const [updatedBooking] = await connection.query<Booking[]>(
      `SELECT b.*, r.room_no, r.state as room_state, rt.type as room_type
       FROM booking b
       JOIN rooms r ON b.room_id = r.room_id
       JOIN room_types rt ON r.room_type_id = rt.room_type_id
       WHERE b.booking_id = ?`,
      [booking_id]
    );
    
    res.json({
      success: true,
      message: 'Check-in successful',
      booking: updatedBooking[0],
      roomStatus: 'occupied'
    });
    
  } catch (error: any) {
    await connection.rollback();
    
    // Handle trigger errors (double-booking)
    if (error.sqlState === '45000') {
      res.status(400).json({
        error: 'Check-in validation failed',
        message: error.sqlMessage
      });
      return;
    }
    
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Check-in failed' });
  } finally {
    connection.release();
  }
};

/**
 * Check out a guest
 * PATCH /api/bookings/:booking_id/checkout
 */
export const checkOutGuest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const connection = await db.getConnection();
  
  try {
    const { booking_id } = req.params;
    const staffId = req.user?.staff_id || req.user?.user_id;
    
    if (!booking_id) {
      res.status(400).json({ error: 'Booking ID is required' });
      return;
    }
    
    await connection.beginTransaction();
    
    // Get booking details
    const [bookings] = await connection.query<Booking[]>(
      `SELECT * FROM booking WHERE booking_id = ?`,
      [booking_id]
    );
    
    if (bookings.length === 0) {
      await connection.rollback();
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    
    const booking = bookings[0];
    
    if (!booking) {
      await connection.rollback();
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    
    // Check if user has access
    if (!canAccessBooking(req, booking)) {
      await connection.rollback();
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    // Validate booking status
    if (booking.booking_status !== BookingStatus.CHECKED_IN) {
      await connection.rollback();
      res.status(400).json({ 
        error: `Cannot check out booking with status: ${booking.booking_status}. Only checked-in bookings can be checked out.` 
      });
      return;
    }
    
    // Pre-validate payment (for better error messages)
    const [payment] = await connection.query<RowDataPacket[]>(
      `SELECT payment_status, due_amount, total_charges 
       FROM payments 
       WHERE booking_id = ?`,
      [booking_id]
    );
    
    if (payment.length === 0) {
      await connection.rollback();
      res.status(400).json({
        error: 'No payment record found',
        message: 'Please generate the bill before checkout'
      });
      return;
    }
    
    if (payment[0]?.payment_status !== 'paid' || (payment[0]?.due_amount || 0) > 0) {
      await connection.rollback();
      res.status(400).json({
        error: 'Payment incomplete',
        message: `Outstanding balance: $${payment[0]?.due_amount || 0}`,
        totalCharges: payment[0]?.total_charges || 0,
        dueAmount: payment[0]?.due_amount || 0
      });
      return;
    }
    
    // Update booking status to checked_out
    // The trigger will automatically update room status to 'available'
    // The payment validation trigger will ensure payment is complete
    await connection.query(
      `UPDATE booking 
       SET booking_status = ?,
           checkout_datetime = NOW(),
           staff_id = ?
       WHERE booking_id = ?`,
      [BookingStatus.CHECKED_OUT, staffId, booking_id]
    );
    
    await connection.commit();
    
    // Fetch updated booking with room details
    const [updatedBooking] = await connection.query<Booking[]>(
      `SELECT b.*, r.room_no, r.state as room_state, rt.type as room_type,
              p.total_charges, p.amount_paid
       FROM booking b
       JOIN rooms r ON b.room_id = r.room_id
       JOIN room_types rt ON r.room_type_id = rt.room_type_id
       LEFT JOIN payments p ON b.booking_id = p.booking_id
       WHERE b.booking_id = ?`,
      [booking_id]
    );
    
    res.json({
      success: true,
      message: 'Check-out successful',
      booking: updatedBooking[0],
      roomStatus: 'available',
      payment: {
        totalCharges: updatedBooking[0]?.total_charges || 0,
        amountPaid: updatedBooking[0]?.amount_paid || 0,
        status: 'paid'
      }
    });
    
  } catch (error: any) {
    await connection.rollback();
    
    // Handle trigger errors
    if (error.sqlState === '45000') {
      res.status(400).json({
        error: 'Check-out validation failed',
        message: error.sqlMessage
      });
      return;
    }
    
    console.error('Check-out error:', error);
    res.status(500).json({ error: 'Check-out failed' });
  } finally {
    connection.release();
  }
};

/**
 * Validate checkout eligibility
 * GET /api/bookings/:booking_id/checkout-validation
 */
export const validateCheckout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { booking_id } = req.params;
    
    // Get booking and payment details
    const [result] = await db.query<RowDataPacket[]>(
      `SELECT 
        b.booking_id,
        b.booking_status,
        b.user_id,
        b.branch_id,
        p.payment_status,
        p.total_charges,
        p.amount_paid,
        p.due_amount
       FROM booking b
       LEFT JOIN payments p ON b.booking_id = p.booking_id
       WHERE b.booking_id = ?`,
      [booking_id]
    );
    
    if (result.length === 0) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    
    const booking = result[0];
    
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    
    // Check if user has access
    const tempBooking: any = {
      booking_id: booking.booking_id,
      user_id: booking.user_id,
      branch_id: booking.branch_id
    };
    
    if (!canAccessBooking(req, tempBooking)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    // Validation checks
    const validations = {
      bookingExists: true,
      isCheckedIn: booking.booking_status === BookingStatus.CHECKED_IN,
      paymentRecordExists: booking.payment_status !== null,
      paymentComplete: booking.payment_status === 'paid' && (booking.due_amount || 0) === 0,
      canCheckout: false
    };
    
    validations.canCheckout = validations.isCheckedIn 
                            && validations.paymentRecordExists 
                            && validations.paymentComplete;
    
    res.json({
      validations,
      bookingStatus: booking.booking_status,
      paymentDetails: {
        status: booking.payment_status,
        totalCharges: booking.total_charges || 0,
        amountPaid: booking.amount_paid || 0,
        dueAmount: booking.due_amount || 0
      }
    });
    
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
};

/**
 * Get available rooms for a specific date range (Public endpoint)
 * GET /api/bookings/available-rooms?branch_id=X&check_in=YYYY-MM-DD&check_out=YYYY-MM-DD
 */
export const getAvailableRooms = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { branch_id, check_in, check_out } = req.query;

    // If no dates provided, return all available rooms
    if (!check_in || !check_out) {
      res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required'
      });
      return;
    }

    // Validate dates
    const checkInDate = new Date(check_in as string);
    const checkOutDate = new Date(check_out as string);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
      return;
    }

    if (checkOutDate <= checkInDate) {
      res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
      return;
    }

    // Query to find rooms that are NOT booked for the given date range
    let query = `
      SELECT DISTINCT r.room_id, r.room_no, r.floor_no, r.state, r.branch_id, r.room_type_id
      FROM rooms r
      WHERE r.state = 'available'
    `;
    const params: any[] = [];

    // Add branch filter if provided
    if (branch_id) {
      query += ' AND r.branch_id = ?';
      params.push(branch_id);
    }

    // Exclude rooms with conflicting bookings
    query += `
      AND r.room_id NOT IN (
        SELECT b.room_id 
        FROM booking b
        WHERE b.booking_status NOT IN ('cancelled', 'checked_out')
        AND (
          (b.checking_datetime <= ? AND b.checkout_datetime > ?) OR
          (b.checking_datetime < ? AND b.checkout_datetime >= ?) OR
          (b.checking_datetime >= ? AND b.checkout_datetime <= ?)
        )
      )
    `;
    params.push(check_out, check_in, check_out, check_in, check_in, check_out);

    query += ' ORDER BY r.room_no';

    const [availableRooms] = await db.query<RowDataPacket[]>(query, params);

    res.json({
      success: true,
      availableRooms,
      count: availableRooms.length,
      dateRange: {
        check_in: checkInDate.toISOString().split('T')[0],
        check_out: checkOutDate.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available rooms',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
