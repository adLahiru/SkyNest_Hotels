import { Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '../config/db';
import { UserRole, AuthenticatedRequest } from '../types/auth.types';

/**
 * Service Catalogue Controller
 * Handles CRUD operations for hotel services
 * Only admins can create, update, or delete services
 */

interface ServiceCatalogue extends RowDataPacket {
  service_id: string;
  service_name: string;
  category: string;
  unit_price: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Validate admin access
 */
const validateAdminAccess = (req: AuthenticatedRequest): boolean => {
  if (req.user?.role !== UserRole.ADMIN) {
    return false;
  }
  return true;
};

/**
 * Create a new service
 * Admin only
 * POST /api/services
 */
export const createService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const connection = await db.getConnection();
  
  try {
    // Validate admin access
    if (!validateAdminAccess(req)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can add services to the catalogue.'
      });
      return;
    }

    const { service_name, category, unit_price, is_active = true } = req.body;

    // Validate required fields
    if (!service_name || !category || unit_price === undefined) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: service_name, category, and unit_price are required.'
      });
      return;
    }

    // Validate service_name length
    if (service_name.length > 100) {
      res.status(400).json({
        success: false,
        message: 'Service name must be 100 characters or less.'
      });
      return;
    }

    // Validate category length
    if (category.length > 50) {
      res.status(400).json({
        success: false,
        message: 'Category must be 50 characters or less.'
      });
      return;
    }

    // Validate unit_price is positive
    if (unit_price <= 0) {
      res.status(400).json({
        success: false,
        message: 'Unit price must be a positive number.'
      });
      return;
    }

    // Validate unit_price format (max 10 digits, 2 decimals)
    const priceString = unit_price.toString();
    const parts = priceString.split('.');
    if (parts[0].length > 8 || (parts[1] && parts[1].length > 2)) {
      res.status(400).json({
        success: false,
        message: 'Unit price format invalid. Maximum 8 digits before decimal and 2 after.'
      });
      return;
    }

    await connection.beginTransaction();

    // Check if service name already exists (case-insensitive)
    const [existingServices] = await connection.query<ServiceCatalogue[]>(
      'SELECT service_id FROM service_catalogue WHERE LOWER(service_name) = LOWER(?)',
      [service_name]
    );

    if (existingServices.length > 0) {
      await connection.rollback();
      res.status(409).json({
        success: false,
        message: `Service with name "${service_name}" already exists.`
      });
      return;
    }

    // Insert new service
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO service_catalogue 
       (service_name, category, unit_price, is_active) 
       VALUES (?, ?, ?, ?)`,
      [service_name, category, unit_price, is_active ? 1 : 0]
    );

    // Fetch the created service
    const [newService] = await connection.query<ServiceCatalogue[]>(
      'SELECT * FROM service_catalogue WHERE service_id = (SELECT service_id FROM service_catalogue ORDER BY created_at DESC LIMIT 1)'
    );

    if (!newService[0]) {
      await connection.rollback();
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve created service.'
      });
      return;
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Service added to catalogue successfully.',
      data: {
        service: {
          service_id: newService[0].service_id,
          service_name: newService[0].service_name,
          category: newService[0].category,
          unit_price: parseFloat(newService[0].unit_price.toString()),
          is_active: Boolean(newService[0].is_active),
          created_at: newService[0].created_at,
          updated_at: newService[0].updated_at
        }
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while adding the service.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    connection.release();
  }
};

/**
 * Get all services
 * Authenticated users can view
 * GET /api/services
 */
export const getServices = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { category, is_active } = req.query;

    let query = 'SELECT * FROM service_catalogue WHERE 1=1';
    const params: any[] = [];

    // Filter by category if provided
    if (category) {
      query += ' AND LOWER(category) = LOWER(?)';
      params.push(category);
    }

    // Filter by active status if provided
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    query += ' ORDER BY category, service_name';

    const [services] = await db.query<ServiceCatalogue[]>(query, params);

    const formattedServices = services.map((service: ServiceCatalogue) => ({
      service_id: service.service_id,
      service_name: service.service_name,
      category: service.category,
      unit_price: parseFloat(service.unit_price.toString()),
      is_active: Boolean(service.is_active),
      created_at: service.created_at,
      updated_at: service.updated_at
    }));

    res.status(200).json({
      success: true,
      message: 'Services retrieved successfully.',
      data: {
        services: formattedServices,
        count: formattedServices.length
      }
    });

  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving services.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get service by ID
 * Authenticated users can view
 * GET /api/services/:service_id
 */
export const getServiceById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { service_id } = req.params;

    const [services] = await db.query<ServiceCatalogue[]>(
      'SELECT * FROM service_catalogue WHERE service_id = ?',
      [service_id]
    );

    if (services.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Service not found.'
      });
      return;
    }

    const service = services[0];
    
    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Service retrieved successfully.',
      data: {
        service: {
          service_id: service.service_id,
          service_name: service.service_name,
          category: service.category,
          unit_price: parseFloat(service.unit_price.toString()),
          is_active: Boolean(service.is_active),
          created_at: service.created_at,
          updated_at: service.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving the service.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update a service
 * Admin only
 * PUT /api/services/:service_id
 */
export const updateService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const connection = await db.getConnection();
  
  try {
    // Validate admin access
    if (!validateAdminAccess(req)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can update services.'
      });
      return;
    }

    const { service_id } = req.params;
    const { service_name, category, unit_price, is_active } = req.body;

    // Check if service exists
    const [existingServices] = await connection.query<ServiceCatalogue[]>(
      'SELECT * FROM service_catalogue WHERE service_id = ?',
      [service_id]
    );

    if (existingServices.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Service not found.'
      });
      return;
    }

    // Validate service_name if provided
    if (service_name !== undefined) {
      if (service_name.length === 0 || service_name.length > 100) {
        res.status(400).json({
          success: false,
          message: 'Service name must be between 1 and 100 characters.'
        });
        return;
      }

      // Check for duplicate service name (excluding current service)
      const [duplicates] = await connection.query<ServiceCatalogue[]>(
        'SELECT service_id FROM service_catalogue WHERE LOWER(service_name) = LOWER(?) AND service_id != ?',
        [service_name, service_id]
      );

      if (duplicates.length > 0) {
        res.status(409).json({
          success: false,
          message: `Service with name "${service_name}" already exists.`
        });
        return;
      }
    }

    // Validate category if provided
    if (category !== undefined && (category.length === 0 || category.length > 50)) {
      res.status(400).json({
        success: false,
        message: 'Category must be between 1 and 50 characters.'
      });
      return;
    }

    // Validate unit_price if provided
    if (unit_price !== undefined) {
      if (unit_price <= 0) {
        res.status(400).json({
          success: false,
          message: 'Unit price must be a positive number.'
        });
        return;
      }

      const priceString = unit_price.toString();
      const parts = priceString.split('.');
      if (parts[0].length > 8 || (parts[1] && parts[1].length > 2)) {
        res.status(400).json({
          success: false,
          message: 'Unit price format invalid. Maximum 8 digits before decimal and 2 after.'
        });
        return;
      }
    }

    await connection.beginTransaction();

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (service_name !== undefined) {
      updates.push('service_name = ?');
      values.push(service_name);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (unit_price !== undefined) {
      updates.push('unit_price = ?');
      values.push(unit_price);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      await connection.rollback();
      res.status(400).json({
        success: false,
        message: 'No fields to update.'
      });
      return;
    }

    values.push(service_id);

    await connection.query(
      `UPDATE service_catalogue SET ${updates.join(', ')} WHERE service_id = ?`,
      values
    );

    // Fetch updated service
    const [updatedServices] = await connection.query<ServiceCatalogue[]>(
      'SELECT * FROM service_catalogue WHERE service_id = ?',
      [service_id]
    );

    await connection.commit();

    const service = updatedServices[0];
    
    if (!service) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve updated service.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully.',
      data: {
        service: {
          service_id: service.service_id,
          service_name: service.service_name,
          category: service.category,
          unit_price: parseFloat(service.unit_price.toString()),
          is_active: Boolean(service.is_active),
          created_at: service.created_at,
          updated_at: service.updated_at
        }
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating the service.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    connection.release();
  }
};

/**
 * Delete a service
 * Admin only
 * DELETE /api/services/:service_id
 */
export const deleteService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const connection = await db.getConnection();
  
  try {
    // Validate admin access
    if (!validateAdminAccess(req)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can delete services.'
      });
      return;
    }

    const { service_id } = req.params;

    // Check if service exists
    const [services] = await connection.query<ServiceCatalogue[]>(
      'SELECT * FROM service_catalogue WHERE service_id = ?',
      [service_id]
    );

    if (services.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Service not found.'
      });
      return;
    }

    await connection.beginTransaction();

    // Check if service is being used in service_usage table
    const [usageRecords] = await connection.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM service_usage WHERE service_id = ?',
      [service_id]
    );

    const usageCount = usageRecords[0]?.count ?? 0;

    if (usageCount > 0) {
      await connection.rollback();
      res.status(409).json({
        success: false,
        message: 'Cannot delete service. It has associated usage records. Consider deactivating it instead.'
      });
      return;
    }

    // Delete the service
    await connection.query(
      'DELETE FROM service_catalogue WHERE service_id = ?',
      [service_id]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully.',
      data: {
        deleted_service_id: service_id
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the service.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    connection.release();
  }
};

/**
 * Get service categories (distinct)
 * Authenticated users can view
 * GET /api/services/categories/list
 */
export const getServiceCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [categories] = await db.query<RowDataPacket[]>(
      'SELECT DISTINCT category FROM service_catalogue ORDER BY category'
    );

    const categoryList = categories.map((row: RowDataPacket) => row.category);

    res.status(200).json({
      success: true,
      message: 'Service categories retrieved successfully.',
      data: {
        categories: categoryList,
        count: categoryList.length
      }
    });

  } catch (error) {
    console.error('Error fetching service categories:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving service categories.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Add service to a booking (create service usage record)
 * Staff can add services to bookings in their branch
 * POST /api/service-usage
 */
export const addServiceToBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const connection = await db.getConnection();
  
  try {
    const { booking_id, service_id, quantity } = req.body;
    const staffId = req.user?.staff_id || req.user?.user_id;
    
    // Validation
    if (!booking_id) {
      res.status(400).json({ 
        success: false,
        error: 'Booking ID is required' 
      });
      return;
    }
    
    if (!service_id) {
      res.status(400).json({ 
        success: false,
        error: 'Service ID is required' 
      });
      return;
    }
    
    if (!quantity || parseInt(quantity) <= 0) {
      res.status(400).json({ 
        success: false,
        error: 'Valid quantity is required' 
      });
      return;
    }
    
    await connection.beginTransaction();
    
    // Check if booking exists
    const [bookings] = await connection.query<RowDataPacket[]>(
      `SELECT booking_id, booking_status FROM booking WHERE booking_id = ?`,
      [booking_id]
    );
    
    if (bookings.length === 0) {
      await connection.rollback();
      res.status(404).json({ 
        success: false,
        error: 'Booking not found' 
      });
      return;
    }
    
    // Check if service exists and get unit price
    const [services] = await connection.query<ServiceCatalogue[]>(
      `SELECT * FROM service_catalogue WHERE service_id = ? AND is_active = 1`,
      [service_id]
    );
    
    if (services.length === 0) {
      await connection.rollback();
      res.status(404).json({ 
        success: false,
        error: 'Service not found or not active' 
      });
      return;
    }
    
    const service = services[0];
    if (!service) {
      await connection.rollback();
      res.status(404).json({ 
        success: false,
        error: 'Service not found' 
      });
      return;
    }
    const unitPrice = parseFloat(service.unit_price.toString());
    const total = unitPrice * parseInt(quantity);
    
    // Create service usage record
    const usage_id = require('uuid').v4();
    await connection.query(
      `INSERT INTO service_usage (
        usage_id, service_id, booking_id, usage_date, usage_time, quantity, total
      ) VALUES (?, ?, ?, CURDATE(), CURTIME(), ?, ?)`,
      [usage_id, service_id, booking_id, quantity, total]
    );
    
    await connection.commit();
    
    // Fetch the created record with service details
    const [createdUsage] = await connection.query<RowDataPacket[]>(
      `SELECT su.*, sc.service_name, sc.category, sc.unit_price
       FROM service_usage su
       JOIN service_catalogue sc ON su.service_id = sc.service_id
       WHERE su.usage_id = ?`,
      [usage_id]
    );
    
    res.json({
      success: true,
      message: 'Service added to booking successfully',
      data: {
        usage: createdUsage[0]
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Add service to booking error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to add service to booking',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    connection.release();
  }
};

/**
 * Get service usage for a booking
 * GET /api/service-usage/booking/:booking_id
 */
export const getBookingServices = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { booking_id } = req.params;
    
    const [services] = await db.query<RowDataPacket[]>(
      `SELECT su.*, sc.service_name, sc.category, sc.unit_price
       FROM service_usage su
       JOIN service_catalogue sc ON su.service_id = sc.service_id
       WHERE su.booking_id = ?
       ORDER BY su.usage_date DESC, su.usage_time DESC`,
      [booking_id]
    );
    
    const totalServicesCharges = services.reduce(
      (sum: number, s: any) => sum + parseFloat(s.total || '0'),
      0
    );
    
    res.json({
      success: true,
      message: 'Booking services retrieved successfully',
      data: {
        services,
        count: services.length,
        totalCharges: totalServicesCharges
      }
    });
    
  } catch (error) {
    console.error('Get booking services error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch booking services',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
