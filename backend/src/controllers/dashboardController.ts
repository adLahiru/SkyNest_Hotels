import { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';
import { db } from '../config/db';
import { ApiResponse, AuthenticatedRequest } from '../types';

class DashboardController {
  /**
   * Get Admin Dashboard Statistics
   * - Total users, branches, rooms, bookings
   * - Revenue statistics
   * - Recent activities
   */
  async getAdminStats(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      
      // Get total counts
      // Count guests (users with is_guest = 1 or users not in staff table)
      // Count staff (users in staff table - staff_id is FK to users.user_id)
      const [userStats] = await db.execute<RowDataPacket[]>(
        `SELECT 
          COUNT(DISTINCT u.user_id) as total,
          COUNT(DISTINCT CASE WHEN u.is_guest = 1 THEN u.user_id END) as guests,
          COUNT(DISTINCT s.staff_id) as staff
        FROM users u
        LEFT JOIN staff s ON u.user_id = s.staff_id`
      );
      
      const [branchStats] = await db.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM hotel_branches'
      );

      
      const [roomStats] = await db.execute<RowDataPacket[]>(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN state = 'available' THEN 1 ELSE 0 END) as available,
          SUM(CASE WHEN state = 'occupied' THEN 1 ELSE 0 END) as occupied,
          SUM(CASE WHEN state = 'maintenance' THEN 1 ELSE 0 END) as maintenance
        FROM rooms`
      );
      
      const [bookingStats] = await db.execute<RowDataPacket[]>(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN booking_status = 'PENDING' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN booking_status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed,
          SUM(CASE WHEN booking_status = 'CHECKED_IN' THEN 1 ELSE 0 END) as checked_in,
          SUM(CASE WHEN booking_status = 'CHECKED_OUT' THEN 1 ELSE 0 END) as checked_out,
          SUM(CASE WHEN booking_status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled
        FROM booking`
      );
      
      // Get revenue statistics
      const [revenueStats] = await db.execute<RowDataPacket[]>(
        `SELECT 
          SUM(p.total_charges) as total_revenue,
          SUM(CASE WHEN MONTH(p.payment_date) = MONTH(CURRENT_DATE()) 
              AND YEAR(p.payment_date) = YEAR(CURRENT_DATE()) 
              THEN p.total_charges ELSE 0 END) as monthly_revenue,
          SUM(CASE WHEN DATE(p.payment_date) = CURRENT_DATE() 
              THEN p.total_charges ELSE 0 END) as daily_revenue
        FROM booking bk
        LEFT JOIN payments p ON bk.booking_id = p.booking_id
        WHERE bk.booking_status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')`
      );
      
      // Get branch-wise statistics
      const [branchWiseStats] = await db.execute<RowDataPacket[]>(
        `SELECT 
          b.branch_id,
          b.branch_name,
          b.address as location,
          COUNT(DISTINCT r.room_id) as total_rooms,
          COUNT(DISTINCT bk.booking_id) as total_bookings,
          SUM(CASE WHEN bk.booking_status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT') 
              THEN p.total_charges ELSE 0 END) as revenue
        FROM hotel_branches b
        LEFT JOIN rooms r ON b.branch_id = r.branch_id
        LEFT JOIN booking bk ON r.room_id = bk.room_id
        LEFT JOIN payments p ON bk.booking_id = p.booking_id
        GROUP BY b.branch_id, b.branch_name, b.address
        ORDER BY revenue DESC`
      );
      
      // Get recent bookings
      const [recentBookings] = await db.execute<RowDataPacket[]>(
        `SELECT 
          bk.booking_id,
          bk.checking_datetime as check_in,
          bk.checkout_datetime as check_out,
          bk.booking_status as status,
          p.total_charges as total_amount,
          u.name as guest_name,
          b.branch_name,
          r.room_no as room_number
        FROM booking bk
        JOIN users u ON bk.user_id = u.user_id
        JOIN rooms r ON bk.room_id = r.room_id
        JOIN hotel_branches b ON r.branch_id = b.branch_id
        LEFT JOIN payments p ON bk.booking_id = p.booking_id
        ORDER BY bk.created_at DESC
        LIMIT 10`
      );
      
      res.status(200).json({
        success: true,
        message: 'Admin dashboard stats retrieved successfully',
        data: {
          users: userStats[0],
          branches: branchStats[0],
          rooms: roomStats[0],
          bookings: bookingStats[0],
          revenue: revenueStats[0],
          branchWiseStats,
          recentBookings
        }
      } as ApiResponse);
      
    } catch (error) {
      console.error('Get admin stats error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard statistics',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      } as ApiResponse);
    }
  }

  /**
   * Get Manager Dashboard Statistics
   * - Branch-specific statistics
   * - Rooms and bookings in their branch
   * - Staff in their branch
   */
  async getManagerStats(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const branchId = authReq.user?.branch_id;
      
      if (!branchId) {
        res.status(400).json({
          success: false,
          message: 'Manager must be assigned to a branch'
        } as ApiResponse);
        return;
      }
      
      // Get branch details
      const [branchDetails] = await db.execute<RowDataPacket[]>(
        'SELECT * FROM hotel_branches WHERE branch_id = ?',
        [branchId]
      );
      
      if (branchDetails.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Branch not found'
        } as ApiResponse);
        return;
      }
      
      // Get room statistics for the branch
      const [roomStats] = await db.execute<RowDataPacket[]>(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN state = 'available' THEN 1 ELSE 0 END) as available,
          SUM(CASE WHEN state = 'occupied' THEN 1 ELSE 0 END) as occupied,
          SUM(CASE WHEN state = 'maintenance' THEN 1 ELSE 0 END) as maintenance
        FROM rooms 
        WHERE branch_id = ?`,
        [branchId]
      );
      
      // Get booking statistics for the branch
      const [bookingStats] = await db.execute<RowDataPacket[]>(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN bk.booking_status = 'PENDING' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN bk.booking_status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed,
          SUM(CASE WHEN bk.booking_status = 'CHECKED_IN' THEN 1 ELSE 0 END) as checked_in,
          SUM(CASE WHEN bk.booking_status = 'CHECKED_OUT' THEN 1 ELSE 0 END) as checked_out,
          SUM(CASE WHEN bk.booking_status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled
        FROM booking bk
        JOIN rooms r ON bk.room_id = r.room_id
        WHERE r.branch_id = ?`,
        [branchId]
      );
      
      // Get revenue statistics for the branch
      const [revenueStats] = await db.execute<RowDataPacket[]>(
        `SELECT 
          SUM(p.total_charges) as total_revenue,
          SUM(CASE WHEN MONTH(p.payment_date) = MONTH(CURRENT_DATE()) 
              AND YEAR(p.payment_date) = YEAR(CURRENT_DATE()) 
              THEN p.total_charges ELSE 0 END) as monthly_revenue,
          SUM(CASE WHEN DATE(p.payment_date) = CURRENT_DATE() 
              THEN p.total_charges ELSE 0 END) as daily_revenue
        FROM booking bk
        JOIN rooms r ON bk.room_id = r.room_id
        LEFT JOIN payments p ON bk.booking_id = p.booking_id
        WHERE r.branch_id = ? 
        AND bk.booking_status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')`,
        [branchId]
      );
      
      // Get staff count for the branch
      const [staffStats] = await db.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM staff WHERE branch_id = ?`,
        [branchId]
      );
      
      // Get recent bookings for the branch
      const [recentBookings] = await db.execute<RowDataPacket[]>(
        `SELECT 
          bk.booking_id,
          bk.checking_datetime as check_in,
          bk.checkout_datetime as check_out,
          bk.booking_status as status,
          p.total_charges as total_amount,
          u.name as guest_name,
          r.room_no as room_number
        FROM booking bk
        JOIN users u ON bk.user_id = u.user_id
        JOIN rooms r ON bk.room_id = r.room_id
        LEFT JOIN payments p ON bk.booking_id = p.booking_id
        WHERE r.branch_id = ?
        ORDER BY bk.created_at DESC
        LIMIT 10`,
        [branchId]
      );
      
      // Get today's check-ins
      const [todayCheckIns] = await db.execute<RowDataPacket[]>(
        `SELECT 
          bk.booking_id,
          bk.checking_datetime as check_in,
          bk.booking_status as status,
          u.name as guest_name,
          r.room_no as room_number
        FROM booking bk
        JOIN users u ON bk.user_id = u.user_id
        JOIN rooms r ON bk.room_id = r.room_id
        WHERE r.branch_id = ? 
        AND DATE(bk.checking_datetime) = CURRENT_DATE()
        AND bk.booking_status IN ('CONFIRMED', 'CHECKED_IN')
        ORDER BY bk.checking_datetime ASC`,
        [branchId]
      );
      
      // Get today's check-outs
      const [todayCheckOuts] = await db.execute<RowDataPacket[]>(
        `SELECT 
          bk.booking_id,
          bk.checkout_datetime as check_out,
          bk.booking_status as status,
          u.name as guest_name,
          r.room_no as room_number
        FROM booking bk
        JOIN users u ON bk.user_id = u.user_id
        JOIN rooms r ON bk.room_id = r.room_id
        WHERE r.branch_id = ? 
        AND DATE(bk.checkout_datetime) = CURRENT_DATE()
        AND bk.booking_status = 'CHECKED_IN'
        ORDER BY bk.checkout_datetime ASC`,
        [branchId]
      );
      
      res.status(200).json({
        success: true,
        message: 'Manager dashboard stats retrieved successfully',
        data: {
          branch: branchDetails[0],
          rooms: roomStats[0],
          bookings: bookingStats[0],
          revenue: revenueStats[0],
          staff: staffStats[0],
          recentBookings,
          todayCheckIns,
          todayCheckOuts
        }
      } as ApiResponse);
      
    } catch (error) {
      console.error('Get manager stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard statistics'
      } as ApiResponse);
    }
  }

  /**
   * Get Receptionist Dashboard Statistics
   * - Today's check-ins and check-outs
   * - Pending bookings
   * - Available rooms
   */
  async getReceptionistStats(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const branchId = authReq.user?.branch_id;
      
      if (!branchId) {
        res.status(400).json({
          success: false,
          message: 'Receptionist must be assigned to a branch'
        } as ApiResponse);
        return;
      }
      
      // Get branch details
      const [branchDetails] = await db.execute<RowDataPacket[]>(
        'SELECT * FROM hotel_branches WHERE branch_id = ?',
        [branchId]
      );
      
      // Get today's check-ins
      const [todayCheckIns] = await db.execute<RowDataPacket[]>(
        `SELECT 
          bk.booking_id,
          bk.checking_datetime as check_in,
          bk.checkout_datetime as check_out,
          bk.booking_status as status,
          u.name as guest_name,
          u.phone as guest_phone,
          u.email as guest_email,
          r.room_no as room_number,
          rt.type as room_type
        FROM booking bk
        JOIN users u ON bk.user_id = u.user_id
        JOIN rooms r ON bk.room_id = r.room_id
        JOIN room_types rt ON r.room_type_id = rt.room_type_id
        WHERE r.branch_id = ? 
        AND DATE(bk.checking_datetime) = CURRENT_DATE()
        AND bk.booking_status IN ('CONFIRMED', 'CHECKED_IN')
        ORDER BY bk.checking_datetime ASC`,
        [branchId]
      );
      
      // Get today's check-outs
      const [todayCheckOuts] = await db.execute<RowDataPacket[]>(
        `SELECT 
          bk.booking_id,
          bk.checking_datetime as check_in,
          bk.checkout_datetime as check_out,
          bk.booking_status as status,
          p.total_charges as total_amount,
          u.name as guest_name,
          u.phone as guest_phone,
          r.room_no as room_number,
          rt.type as room_type
        FROM booking bk
        JOIN users u ON bk.user_id = u.user_id
        JOIN rooms r ON bk.room_id = r.room_id
        JOIN room_types rt ON r.room_type_id = rt.room_type_id
        LEFT JOIN payments p ON bk.booking_id = p.booking_id
        WHERE r.branch_id = ? 
        AND DATE(bk.checkout_datetime) = CURRENT_DATE()
        AND bk.booking_status = 'CHECKED_IN'
        ORDER BY bk.checkout_datetime ASC`,
        [branchId]
      );
      
      // Get pending bookings
      const [pendingBookings] = await db.execute<RowDataPacket[]>(
        `SELECT 
          bk.booking_id,
          bk.checking_datetime as check_in,
          bk.checkout_datetime as check_out,
          p.total_charges as total_amount,
          u.name as guest_name,
          u.phone as guest_phone,
          r.room_no as room_number,
          rt.type as room_type
        FROM booking bk
        JOIN users u ON bk.user_id = u.user_id
        JOIN rooms r ON bk.room_id = r.room_id
        JOIN room_types rt ON r.room_type_id = rt.room_type_id
        LEFT JOIN payments p ON bk.booking_id = p.booking_id
        WHERE r.branch_id = ? 
        AND bk.booking_status = 'PENDING'
        ORDER BY bk.created_at DESC
        LIMIT 10`,
        [branchId]
      );
      
      // Get available rooms
      const [availableRooms] = await db.execute<RowDataPacket[]>(
        `SELECT 
          r.room_id,
          r.room_no as room_number,
          r.floor_no as floor,
          rt.type as room_type,
          rt.daily_rate as base_price,
          rt.capacity as max_occupancy
        FROM rooms r
        JOIN room_types rt ON r.room_type_id = rt.room_type_id
        WHERE r.branch_id = ? 
        AND r.state = 'available'
        ORDER BY r.room_no ASC`,
        [branchId]
      );
      
      // Get current guests (checked in)
      const [currentGuests] = await db.execute<RowDataPacket[]>(
        `SELECT 
          bk.booking_id,
          bk.checking_datetime as check_in,
          bk.checkout_datetime as check_out,
          u.name as guest_name,
          u.phone as guest_phone,
          r.room_no as room_number,
          rt.type as room_type
        FROM booking bk
        JOIN users u ON bk.user_id = u.user_id
        JOIN rooms r ON bk.room_id = r.room_id
        JOIN room_types rt ON r.room_type_id = rt.room_type_id
        WHERE r.branch_id = ? 
        AND bk.booking_status = 'CHECKED_IN'
        ORDER BY r.room_no ASC`,
        [branchId]
      );
      
      // Get quick stats
      const [quickStats] = await db.execute<RowDataPacket[]>(
        `SELECT 
          SUM(CASE WHEN r.state = 'available' THEN 1 ELSE 0 END) as available_rooms,
          SUM(CASE WHEN r.state = 'occupied' THEN 1 ELSE 0 END) as occupied_rooms,
          (SELECT COUNT(*) FROM booking bk2 
           JOIN rooms r2 ON bk2.room_id = r2.room_id 
           WHERE r2.branch_id = ? 
           AND DATE(bk2.checking_datetime) = CURRENT_DATE() 
           AND bk2.booking_status IN ('CONFIRMED', 'CHECKED_IN')) as today_checkins,
          (SELECT COUNT(*) FROM booking bk3 
           JOIN rooms r3 ON bk3.room_id = r3.room_id 
           WHERE r3.branch_id = ? 
           AND DATE(bk3.checkout_datetime) = CURRENT_DATE() 
           AND bk3.booking_status = 'CHECKED_IN') as today_checkouts
        FROM rooms r
        WHERE r.branch_id = ?`,
        [branchId, branchId, branchId]
      );
      
      res.status(200).json({
        success: true,
        message: 'Receptionist dashboard stats retrieved successfully',
        data: {
          branch: branchDetails[0],
          quickStats: quickStats[0],
          todayCheckIns,
          todayCheckOuts,
          pendingBookings,
          availableRooms,
          currentGuests
        }
      } as ApiResponse);
      
    } catch (error) {
      console.error('Get receptionist stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard statistics'
      } as ApiResponse);
    }
  }

  /**
   * Get Housekeeping Dashboard Statistics
   * - Same as receptionist dashboard but for housekeeping staff
   * - Today's check-ins and check-outs
   * - Pending bookings
   * - Available rooms
   */
  async getHousekeepingStats(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const branchId = authReq.user?.branch_id;
      
      if (!branchId) {
        res.status(400).json({
          success: false,
          message: 'Housekeeping staff must be assigned to a branch'
        } as ApiResponse);
        return;
      }
      
      // Get branch details
      const [branchDetails] = await db.execute<RowDataPacket[]>(
        'SELECT * FROM hotel_branches WHERE branch_id = ?',
        [branchId]
      );
      
      // Get today's check-ins
      const [todayCheckIns] = await db.execute<RowDataPacket[]>(
        `SELECT 
          bk.booking_id,
          bk.checking_datetime as check_in,
          bk.checkout_datetime as check_out,
          bk.booking_status as status,
          u.name as guest_name,
          u.phone as guest_phone,
          u.email as guest_email,
          r.room_no as room_number,
          rt.type as room_type
        FROM booking bk
        JOIN users u ON bk.user_id = u.user_id
        JOIN rooms r ON bk.room_id = r.room_id
        JOIN room_types rt ON r.room_type_id = rt.room_type_id
        WHERE r.branch_id = ? 
        AND DATE(bk.checking_datetime) = CURRENT_DATE()
        AND bk.booking_status IN ('CONFIRMED', 'CHECKED_IN')
        ORDER BY bk.checking_datetime ASC`,
        [branchId]
      );
      
      // Get today's check-outs
      const [todayCheckOuts] = await db.execute<RowDataPacket[]>(
        `SELECT 
          bk.booking_id,
          bk.checking_datetime as check_in,
          bk.checkout_datetime as check_out,
          bk.booking_status as status,
          p.total_charges as total_amount,
          u.name as guest_name,
          u.phone as guest_phone,
          r.room_no as room_number,
          rt.type as room_type
        FROM booking bk
        JOIN users u ON bk.user_id = u.user_id
        JOIN rooms r ON bk.room_id = r.room_id
        JOIN room_types rt ON r.room_type_id = rt.room_type_id
        LEFT JOIN payments p ON bk.booking_id = p.booking_id
        WHERE r.branch_id = ? 
        AND DATE(bk.checkout_datetime) = CURRENT_DATE()
        AND bk.booking_status = 'CHECKED_IN'
        ORDER BY bk.checkout_datetime ASC`,
        [branchId]
      );
      
      // Get pending bookings
      const [pendingBookings] = await db.execute<RowDataPacket[]>(
        `SELECT 
          bk.booking_id,
          bk.checking_datetime as check_in,
          bk.checkout_datetime as check_out,
          p.total_charges as total_amount,
          u.name as guest_name,
          u.phone as guest_phone,
          r.room_no as room_number,
          rt.type as room_type
        FROM booking bk
        JOIN users u ON bk.user_id = u.user_id
        JOIN rooms r ON bk.room_id = r.room_id
        JOIN room_types rt ON r.room_type_id = rt.room_type_id
        LEFT JOIN payments p ON bk.booking_id = p.booking_id
        WHERE r.branch_id = ? 
        AND bk.booking_status = 'PENDING'
        ORDER BY bk.created_at DESC
        LIMIT 10`,
        [branchId]
      );
      
      // Get available rooms
      const [availableRooms] = await db.execute<RowDataPacket[]>(
        `SELECT 
          r.room_id,
          r.room_no as room_number,
          r.floor_no as floor,
          rt.type as room_type,
          rt.daily_rate as price,
          rt.capacity as max_occupancy
        FROM rooms r
        JOIN room_types rt ON r.room_type_id = rt.room_type_id
        WHERE r.branch_id = ? 
        AND r.state = 'available'
        ORDER BY r.room_no ASC`,
        [branchId]
      );
      
      // Get current guests (checked in)
      const [currentGuests] = await db.execute<RowDataPacket[]>(
        `SELECT 
          bk.booking_id,
          bk.checking_datetime as check_in,
          bk.checkout_datetime as check_out,
          u.name as guest_name,
          u.phone as guest_phone,
          r.room_no as room_number,
          rt.type as room_type
        FROM booking bk
        JOIN users u ON bk.user_id = u.user_id
        JOIN rooms r ON bk.room_id = r.room_id
        JOIN room_types rt ON r.room_type_id = rt.room_type_id
        WHERE r.branch_id = ? 
        AND bk.booking_status = 'CHECKED_IN'
        ORDER BY r.room_no ASC`,
        [branchId]
      );
      
      // Get quick stats
      const [quickStats] = await db.execute<RowDataPacket[]>(
        `SELECT 
          SUM(CASE WHEN r.state = 'available' THEN 1 ELSE 0 END) as availableRooms,
          SUM(CASE WHEN r.state = 'occupied' THEN 1 ELSE 0 END) as occupiedRooms,
          (SELECT COUNT(*) FROM booking bk2 
           JOIN rooms r2 ON bk2.room_id = r2.room_id 
           WHERE r2.branch_id = ? 
           AND DATE(bk2.checking_datetime) = CURRENT_DATE() 
           AND bk2.booking_status IN ('CONFIRMED', 'CHECKED_IN')) as todayCheckIns,
          (SELECT COUNT(*) FROM booking bk3 
           JOIN rooms r3 ON bk3.room_id = r3.room_id 
           WHERE r3.branch_id = ? 
           AND DATE(bk3.checkout_datetime) = CURRENT_DATE() 
           AND bk3.booking_status = 'CHECKED_IN') as todayCheckOuts
        FROM rooms r
        WHERE r.branch_id = ?`,
        [branchId, branchId, branchId]
      );
      
      res.status(200).json({
        success: true,
        message: 'Housekeeping dashboard stats retrieved successfully',
        data: {
          branch: branchDetails[0],
          quickStats: quickStats[0],
          todayCheckIns,
          todayCheckOuts,
          pendingBookings,
          availableRooms,
          currentGuests
        }
      } as ApiResponse);
      
    } catch (error) {
      console.error('Get housekeeping stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard statistics'
      } as ApiResponse);
    }
  }
}

export default new DashboardController();
