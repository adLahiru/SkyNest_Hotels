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
  service_type_id: string;
  service_name: string;
  price: number;
  branch_id: string | null;
  photo: Buffer | null;
  description: string | null;
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

    const { service_name, price, branch_id, photo, description } = req.body;

    // Validate required fields
    if (!service_name || price === undefined || !branch_id) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: service_name, price, and branch_id are required.'
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

    // Validate price is positive
    if (price <= 0) {
      res.status(400).json({
        success: false,
        message: 'Price must be a positive number.'
      });
      return;
    }

    // Validate price format (max 10 digits, 2 decimals)
    const priceString = price.toString();
    const parts = priceString.split('.');
    if (parts[0].length > 8 || (parts[1] && parts[1].length > 2)) {
      res.status(400).json({
        success: false,
        message: 'Price format invalid. Maximum 8 digits before decimal and 2 after.'
      });
      return;
    }

    // Validate branch_id
    const [branches] = await connection.query<RowDataPacket[]>(
      'SELECT branch_id FROM hotel_branches WHERE branch_id = ?',
      [branch_id]
    );
    if (branches.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid branch_id provided.'
      });
      return;
    }

    await connection.beginTransaction();

    // Check if service name already exists in the same branch (case-insensitive)
    const [existingServices] = await connection.query<ServiceCatalogue[]>(
      `SELECT service_type_id FROM service_types 
       WHERE LOWER(service_name) = LOWER(?) 
       AND branch_id = ?`,
      [service_name, branch_id]
    );

    if (existingServices.length > 0) {
      await connection.rollback();
      res.status(409).json({
        success: false,
        message: `Service with name "${service_name}" already exists in this branch.`
      });
      return;
    }

    // Process photo - strip data URL prefix if present
    let processedPhoto = photo;
    if (photo && typeof photo === 'string' && photo.includes('base64,')) {
      processedPhoto = photo.split('base64,')[1];
    }

    // Insert new service
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO service_types 
       (service_name, price, branch_id, photo, description) 
       VALUES (?, ?, ?, ?, ?)`,
      [service_name, price, branch_id, processedPhoto || null, description || null]
    );

    // Fetch the created service
    const [newService] = await connection.query<ServiceCatalogue[]>(
      'SELECT * FROM service_types WHERE service_type_id = (SELECT service_type_id FROM service_types ORDER BY created_at DESC LIMIT 1)'
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
          service_type_id: newService[0].service_type_id,
          service_name: newService[0].service_name,
          price: parseFloat(newService[0].price.toString()),
          branch_id: newService[0].branch_id,
          photo: newService[0].photo ? newService[0].photo.toString('base64') : null,
          description: newService[0].description,
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
    const { branch_id } = req.query;

    let query = `SELECT st.*, hb.branch_name 
                 FROM service_types st 
                 LEFT JOIN hotel_branches hb ON st.branch_id = hb.branch_id 
                 WHERE 1=1`;
    const params: any[] = [];

    // Filter by branch if provided
    if (branch_id) {
      query += ' AND st.branch_id = ?';
      params.push(branch_id);
    }

    query += ' ORDER BY st.service_name';

    const [services] = await db.query<ServiceCatalogue[]>(query, params);

    const formattedServices = services.map((service: any) => ({
      service_type_id: service.service_type_id,
      service_name: service.service_name,
      price: parseFloat(service.price.toString()),
      branch_id: service.branch_id,
      branch_name: service.branch_name || 'Unknown Branch',
      photo: service.photo ? service.photo.toString('base64') : null,
      description: service.description,
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
