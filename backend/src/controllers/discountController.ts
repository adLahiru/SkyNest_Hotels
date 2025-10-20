import { Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '../config/db';
import { UserRole, AuthenticatedRequest } from '../types/auth.types';

/**
 * Discount Controller
 * Handles CRUD operations for hotel discounts
 * Only admins can create, update, or delete discounts
 */

// Discount applies_to categories
export enum DiscountCategory {
  SERVICES = 'SERVICES',
  ROOMS = 'ROOMS',
  BOTH = 'SERVICES_AND_ROOMS'
}

// Discount type
export enum DiscountType {
  RATE = 'rate',      // Percentage discount (e.g., 10%)
  FIXED = 'fixed'     // Fixed amount discount (e.g., $50)
}

interface Discount extends RowDataPacket {
  discount_id: string;
  discount_name: string;
  type: DiscountType;
  discount_value: number;
  applies_to: DiscountCategory;
  start_date: Date | null;
  end_date: Date | null;
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
 * Validate discount category
 */
const isValidDiscountCategory = (category: string): boolean => {
  return Object.values(DiscountCategory).includes(category as DiscountCategory);
};

/**
 * Validate discount type
 */
const isValidDiscountType = (type: string): boolean => {
  return Object.values(DiscountType).includes(type as DiscountType);
};

/**
 * Check if discount is currently active
 */
const isDiscountActive = (discount: Discount): boolean => {
  const now = new Date();
  const startDate = discount.start_date ? new Date(discount.start_date) : null;
  const endDate = discount.end_date ? new Date(discount.end_date) : null;

  if (startDate && now < startDate) return false;
  if (endDate && now > endDate) return false;
  return true;
};

/**
 * Create a new discount
 * Admin only
 * POST /api/discounts
 */
export const createDiscount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const connection = await db.getConnection();
  
  try {
    // Validate admin access
    if (!validateAdminAccess(req)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can create discounts.'
      });
      return;
    }

    const { discount_name, type, discount_value, applies_to, start_date, end_date, room_type_ids, service_ids } = req.body;

    // Validate required fields
    if (!discount_name || !type || discount_value === undefined || !applies_to) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: discount_name, type, discount_value, and applies_to are required.'
      });
      return;
    }

    // Validate discount_name length
    if (discount_name.length > 100) {
      res.status(400).json({
        success: false,
        message: 'Discount name must be 100 characters or less.'
      });
      return;
    }

    // Validate discount type
    if (!isValidDiscountType(type)) {
      res.status(400).json({
        success: false,
        message: `Invalid discount type. Must be 'rate' (percentage) or 'fixed' (amount).`
      });
      return;
    }

    // Validate discount category
    if (!isValidDiscountCategory(applies_to)) {
      res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${Object.values(DiscountCategory).join(', ')}`
      });
      return;
    }

    // Validate discount value
    if (discount_value <= 0) {
      res.status(400).json({
        success: false,
        message: 'Discount value must be a positive number.'
      });
      return;
    }

    // Validate rate discount (must be between 0 and 100)
    if (type === DiscountType.RATE && (discount_value < 0 || discount_value > 100)) {
      res.status(400).json({
        success: false,
        message: 'Rate discount must be between 0 and 100 (percentage).'
      });
      return;
    }

    // Validate discount_value format (max 10 digits, 2 decimals)
    const valueString = discount_value.toString();
    const parts = valueString.split('.');
    if (parts[0].length > 8 || (parts[1] && parts[1].length > 2)) {
      res.status(400).json({
        success: false,
        message: 'Discount value format invalid. Maximum 8 digits before decimal and 2 after.'
      });
      return;
    }

    // Validate dates if provided
    if (start_date && end_date) {
      const startDateObj = new Date(start_date);
      const endDateObj = new Date(end_date);
      
      if (endDateObj <= startDateObj) {
        res.status(400).json({
          success: false,
          message: 'End date must be after start date.'
        });
        return;
      }
    }

    await connection.beginTransaction();

    // Check if discount name already exists (case-insensitive)
    const [existingDiscounts] = await connection.query<Discount[]>(
      'SELECT discount_id FROM discount WHERE LOWER(discount_name) = LOWER(?)',
      [discount_name]
    );

    if (existingDiscounts.length > 0) {
      await connection.rollback();
      res.status(409).json({
        success: false,
        message: `Discount with name "${discount_name}" already exists.`
      });
      return;
    }

    // Insert new discount
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO discount 
       (discount_name, type, discount_value, applies_to, start_date, end_date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [discount_name, type, discount_value, applies_to, start_date || null, end_date || null]
    );

    // Fetch the created discount
    const [newDiscount] = await connection.query<Discount[]>(
      'SELECT * FROM discount ORDER BY created_at DESC LIMIT 1'
    );

    if (!newDiscount[0]) {
      await connection.rollback();
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve created discount.'
      });
      return;
    }

    const discount = newDiscount[0];
    const discount_id = discount.discount_id;

    // Insert room type associations if provided
    if (room_type_ids && Array.isArray(room_type_ids) && room_type_ids.length > 0) {
      for (const room_type_id of room_type_ids) {
        await connection.query(
          'INSERT INTO discount_room_type (discount_id, room_type_id) VALUES (?, ?)',
          [discount_id, room_type_id]
        );
      }
    }

    // Insert service associations if provided
    if (service_ids && Array.isArray(service_ids) && service_ids.length > 0) {
      for (const service_id of service_ids) {
        await connection.query(
          'INSERT INTO discount_service (discount_id, service_id) VALUES (?, ?)',
          [discount_id, service_id]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Discount created successfully.',
      data: {
        discount: {
          discount_id: discount.discount_id,
          discount_name: discount.discount_name,
          type: discount.type,
          discount_value: parseFloat(discount.discount_value.toString()),
          applies_to: discount.applies_to,
          start_date: discount.start_date,
          end_date: discount.end_date,
          is_active: isDiscountActive(discount),
          room_type_ids: room_type_ids || [],
          service_ids: service_ids || [],
          created_at: discount.created_at,
          updated_at: discount.updated_at
        }
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating discount:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating the discount.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    connection.release();
  }
};

/**
 * Get all discounts
 * Authenticated users can view
 * GET /api/discounts
 */
export const getDiscounts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { applies_to, type, active_only } = req.query;

    let query = 'SELECT * FROM discount WHERE 1=1';
    const params: any[] = [];

    // Filter by category if provided
    if (applies_to) {
      if (!isValidDiscountCategory(applies_to as string)) {
        res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${Object.values(DiscountCategory).join(', ')}`
        });
        return;
      }
      query += ' AND applies_to = ?';
      params.push(applies_to);
    }

    // Filter by type if provided
    if (type) {
      if (!isValidDiscountType(type as string)) {
        res.status(400).json({
          success: false,
          message: `Invalid type. Must be 'rate' or 'fixed'.`
        });
        return;
      }
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const [discounts] = await db.query<Discount[]>(query, params);

    let filteredDiscounts = discounts.map((discount: Discount) => ({
      discount_id: discount.discount_id,
      discount_name: discount.discount_name,
      type: discount.type,
      discount_value: parseFloat(discount.discount_value.toString()),
      applies_to: discount.applies_to,
      start_date: discount.start_date,
      end_date: discount.end_date,
      is_active: isDiscountActive(discount),
      created_at: discount.created_at,
      updated_at: discount.updated_at
    }));

    // Filter by active status if requested
    if (active_only === 'true') {
      filteredDiscounts = filteredDiscounts.filter(d => d.is_active);
    }

    res.status(200).json({
      success: true,
      message: 'Discounts retrieved successfully.',
      data: {
        discounts: filteredDiscounts,
        count: filteredDiscounts.length
      }
    });

  } catch (error) {
    console.error('Error fetching discounts:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving discounts.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get discount by ID
 * Authenticated users can view
 * GET /api/discounts/:discount_id
 */
export const getDiscountById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { discount_id } = req.params;

    const [discounts] = await db.query<Discount[]>(
      'SELECT * FROM discount WHERE discount_id = ?',
      [discount_id]
    );

    if (discounts.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Discount not found.'
      });
      return;
    }

    const discount = discounts[0];
    
    if (!discount) {
      res.status(404).json({
        success: false,
        message: 'Discount not found.'
      });
      return;
    }

    // Fetch associated room types
    const [roomTypes] = await db.query<RowDataPacket[]>(
      'SELECT room_type_id FROM discount_room_type WHERE discount_id = ?',
      [discount_id]
    );
    const room_type_ids = roomTypes.map((rt: any) => rt.room_type_id);

    // Fetch associated services
    const [services] = await db.query<RowDataPacket[]>(
      'SELECT service_id FROM discount_service WHERE discount_id = ?',
      [discount_id]
    );
    const service_ids = services.map((s: any) => s.service_id);

    res.status(200).json({
      success: true,
      message: 'Discount retrieved successfully.',
      data: {
        discount: {
          discount_id: discount.discount_id,
          discount_name: discount.discount_name,
          type: discount.type,
          discount_value: parseFloat(discount.discount_value.toString()),
          applies_to: discount.applies_to,
          start_date: discount.start_date,
          end_date: discount.end_date,
          is_active: isDiscountActive(discount),
          room_type_ids,
          service_ids,
          created_at: discount.created_at,
          updated_at: discount.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Error fetching discount:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving the discount.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update a discount
 * Admin only
 * PUT /api/discounts/:discount_id
 */
export const updateDiscount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const connection = await db.getConnection();
  
  try {
    // Validate admin access
    if (!validateAdminAccess(req)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can update discounts.'
      });
      return;
    }

    const { discount_id } = req.params;
    const { discount_name, type, discount_value, applies_to, start_date, end_date, room_type_ids, service_ids } = req.body;

    // Check if discount exists
    const [existingDiscounts] = await connection.query<Discount[]>(
      'SELECT * FROM discount WHERE discount_id = ?',
      [discount_id]
    );

    if (existingDiscounts.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Discount not found.'
      });
      return;
    }

    // Validate discount_name if provided
    if (discount_name !== undefined) {
      if (discount_name.length === 0 || discount_name.length > 100) {
        res.status(400).json({
          success: false,
          message: 'Discount name must be between 1 and 100 characters.'
        });
        return;
      }

      // Check for duplicate discount name (excluding current discount)
      const [duplicates] = await connection.query<Discount[]>(
        'SELECT discount_id FROM discount WHERE LOWER(discount_name) = LOWER(?) AND discount_id != ?',
        [discount_name, discount_id]
      );

      if (duplicates.length > 0) {
        res.status(409).json({
          success: false,
          message: `Discount with name "${discount_name}" already exists.`
        });
        return;
      }
    }

    // Validate type if provided
    if (type !== undefined && !isValidDiscountType(type)) {
      res.status(400).json({
        success: false,
        message: `Invalid discount type. Must be 'rate' or 'fixed'.`
      });
      return;
    }

    // Validate applies_to if provided
    if (applies_to !== undefined && !isValidDiscountCategory(applies_to)) {
      res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${Object.values(DiscountCategory).join(', ')}`
      });
      return;
    }

    // Validate discount_value if provided
    if (discount_value !== undefined) {
      if (discount_value <= 0) {
        res.status(400).json({
          success: false,
          message: 'Discount value must be a positive number.'
        });
        return;
      }

      // Validate rate discount
      const discountType = type || existingDiscounts[0]?.type;
      if (discountType === DiscountType.RATE && (discount_value < 0 || discount_value > 100)) {
        res.status(400).json({
          success: false,
          message: 'Rate discount must be between 0 and 100 (percentage).'
        });
        return;
      }

      const valueString = discount_value.toString();
      const parts = valueString.split('.');
      if (parts[0].length > 8 || (parts[1] && parts[1].length > 2)) {
        res.status(400).json({
          success: false,
          message: 'Discount value format invalid. Maximum 8 digits before decimal and 2 after.'
        });
        return;
      }
    }

    // Validate dates if both provided
    if (start_date !== undefined && end_date !== undefined) {
      const startDateObj = new Date(start_date);
      const endDateObj = new Date(end_date);
      
      if (endDateObj <= startDateObj) {
        res.status(400).json({
          success: false,
          message: 'End date must be after start date.'
        });
        return;
      }
    }

    await connection.beginTransaction();

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (discount_name !== undefined) {
      updates.push('discount_name = ?');
      values.push(discount_name);
    }
    if (type !== undefined) {
      updates.push('type = ?');
      values.push(type);
    }
    if (discount_value !== undefined) {
      updates.push('discount_value = ?');
      values.push(discount_value);
    }
    if (applies_to !== undefined) {
      updates.push('applies_to = ?');
      values.push(applies_to);
    }
    if (start_date !== undefined) {
      updates.push('start_date = ?');
      values.push(start_date || null);
    }
    if (end_date !== undefined) {
      updates.push('end_date = ?');
      values.push(end_date || null);
    }

    if (updates.length === 0) {
      await connection.rollback();
      res.status(400).json({
        success: false,
        message: 'No fields to update.'
      });
      return;
    }

    values.push(discount_id);

    await connection.query(
      `UPDATE discount SET ${updates.join(', ')} WHERE discount_id = ?`,
      values
    );

    // Update room type associations if provided
    if (room_type_ids !== undefined) {
      // Delete existing associations
      await connection.query(
        'DELETE FROM discount_room_type WHERE discount_id = ?',
        [discount_id]
      );
      
      // Insert new associations
      if (Array.isArray(room_type_ids) && room_type_ids.length > 0) {
        for (const room_type_id of room_type_ids) {
          await connection.query(
            'INSERT INTO discount_room_type (discount_id, room_type_id) VALUES (?, ?)',
            [discount_id, room_type_id]
          );
        }
      }
    }

    // Update service associations if provided
    if (service_ids !== undefined) {
      // Delete existing associations
      await connection.query(
        'DELETE FROM discount_service WHERE discount_id = ?',
        [discount_id]
      );
      
      // Insert new associations
      if (Array.isArray(service_ids) && service_ids.length > 0) {
        for (const service_id of service_ids) {
          await connection.query(
            'INSERT INTO discount_service (discount_id, service_id) VALUES (?, ?)',
            [discount_id, service_id]
          );
        }
      }
    }

    // Fetch updated discount
    const [updatedDiscounts] = await connection.query<Discount[]>(
      'SELECT * FROM discount WHERE discount_id = ?',
      [discount_id]
    );

    await connection.commit();

    const discount = updatedDiscounts[0];
    
    if (!discount) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve updated discount.'
      });
      return;
    }

    // Fetch associated room types
    const [roomTypes] = await connection.query<RowDataPacket[]>(
      'SELECT room_type_id FROM discount_room_type WHERE discount_id = ?',
      [discount_id]
    );
    const updated_room_type_ids = roomTypes.map((rt: any) => rt.room_type_id);

    // Fetch associated services
    const [services] = await connection.query<RowDataPacket[]>(
      'SELECT service_id FROM discount_service WHERE discount_id = ?',
      [discount_id]
    );
    const updated_service_ids = services.map((s: any) => s.service_id);

    res.status(200).json({
      success: true,
      message: 'Discount updated successfully.',
      data: {
        discount: {
          discount_id: discount.discount_id,
          discount_name: discount.discount_name,
          type: discount.type,
          discount_value: parseFloat(discount.discount_value.toString()),
          applies_to: discount.applies_to,
          start_date: discount.start_date,
          end_date: discount.end_date,
          is_active: isDiscountActive(discount),
          room_type_ids: updated_room_type_ids,
          service_ids: updated_service_ids,
          created_at: discount.created_at,
          updated_at: discount.updated_at
        }
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error updating discount:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating the discount.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    connection.release();
  }
};

/**
 * Delete a discount
 * Admin only
 * DELETE /api/discounts/:discount_id
 */
export const deleteDiscount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const connection = await db.getConnection();
  
  try {
    // Validate admin access
    if (!validateAdminAccess(req)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can delete discounts.'
      });
      return;
    }

    const { discount_id } = req.params;

    // Check if discount exists
    const [discounts] = await connection.query<Discount[]>(
      'SELECT * FROM discount WHERE discount_id = ?',
      [discount_id]
    );

    if (discounts.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Discount not found.'
      });
      return;
    }

    await connection.beginTransaction();

    // Note: In a production system, you might want to check if the discount
    // is being used in any bookings or payments before allowing deletion
    // For now, we'll allow direct deletion

    // Delete the discount
    await connection.query(
      'DELETE FROM discount WHERE discount_id = ?',
      [discount_id]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Discount deleted successfully.',
      data: {
        deleted_discount_id: discount_id
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error deleting discount:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the discount.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    connection.release();
  }
};

/**
 * Get active discounts by category
 * Authenticated users can view
 * GET /api/discounts/active/:category
 */
export const getActiveDiscountsByCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.params;

    if (!category || !isValidDiscountCategory(category)) {
      res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${Object.values(DiscountCategory).join(', ')}`
      });
      return;
    }

    const [discounts] = await db.query<Discount[]>(
      'SELECT * FROM discount WHERE applies_to = ? ORDER BY discount_value DESC',
      [category]
    );

    const activeDiscounts = discounts
      .filter((discount: Discount) => isDiscountActive(discount))
      .map((discount: Discount) => ({
        discount_id: discount.discount_id,
        discount_name: discount.discount_name,
        type: discount.type,
        discount_value: parseFloat(discount.discount_value.toString()),
        applies_to: discount.applies_to,
        start_date: discount.start_date,
        end_date: discount.end_date,
        created_at: discount.created_at,
        updated_at: discount.updated_at
      }));

    res.status(200).json({
      success: true,
      message: `Active discounts for ${category} retrieved successfully.`,
      data: {
        discounts: activeDiscounts,
        count: activeDiscounts.length
      }
    });

  } catch (error) {
    console.error('Error fetching active discounts:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving active discounts.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
