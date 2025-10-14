import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2/promise';
import { db } from '../config/db';
import { AuthenticatedRequest, UserRole, ApiResponse } from '../types/auth.types';

// Interface for room type creation request
interface CreateRoomTypeRequest {
  type: string;
  capacity: number;
  daily_rate: number;
  amenities?: string;
  description?: string;
  photo?: string; // Base64 encoded image string
}

// Interface for room type update request
interface UpdateRoomTypeRequest {
  type?: string;
  capacity?: number;
  daily_rate?: number;
  amenities?: string;
  description?: string;
  photo?: string; // Base64 encoded image string
}

// Interface for database room type row
interface DatabaseRoomTypeRow extends RowDataPacket {
  room_type_id: string;
  type: string;
  capacity: number;
  daily_rate: number;
  amenities?: string;
  description?: string;
  photo?: Buffer; // BLOB data from database
  created_at: Date;
  updated_at: Date;
  room_count?: number;
}

export class RoomTypeController {
  // Validate if user is admin
  private validateAdminAccess(req: AuthenticatedRequest, res: Response): boolean {
    if (req.user?.role !== UserRole.ADMIN) {
      res.status(403).json({
        success: false,
        message: 'Only administrators can perform this action'
      } as ApiResponse);
      return false;
    }
    return true;
  }

  // Create a new room type
  public createRoomType = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Validate admin access
      if (!this.validateAdminAccess(req, res)) {
        return;
      }

      const {
        type,
        capacity,
        daily_rate,
        amenities,
        description,
        photo
      } = req.body as CreateRoomTypeRequest;

      // Validate required fields
      if (!type || !capacity || !daily_rate) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: type, capacity, daily_rate'
        } as ApiResponse);
        return;
      }

      // Validate capacity
      if (capacity < 1 || capacity > 20) {
        res.status(400).json({
          success: false,
          message: 'Capacity must be between 1 and 20'
        } as ApiResponse);
        return;
      }

      // Validate daily_rate
      if (daily_rate < 0) {
        res.status(400).json({
          success: false,
          message: 'Daily rate must be a positive number'
        } as ApiResponse);
        return;
      }

      // Convert Base64 photo to Buffer if provided
      let photoBuffer: Buffer | null = null;
      if (photo && photo.trim() !== '') {
        try {
          // Remove data:image/...;base64, prefix if present
          const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
          photoBuffer = Buffer.from(base64Data, 'base64');
        } catch (error) {
          res.status(400).json({
            success: false,
            message: 'Invalid photo format'
          } as ApiResponse);
          return;
        }
      }

      const connection = await db.getConnection();

      try {
        // Check if room type already exists
        const [existingType] = await connection.execute<RowDataPacket[]>(
          `SELECT room_type_id FROM room_types WHERE type = ?`,
          [type]
        );

        if (existingType.length > 0) {
          res.status(409).json({
            success: false,
            message: 'Room type with this name already exists'
          } as ApiResponse);
          return;
        }

        // Create room type
        const roomTypeId = uuidv4();
        await connection.execute(
          `INSERT INTO room_types (room_type_id, type, capacity, daily_rate, amenities, description, photo)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [roomTypeId, type, capacity, daily_rate, amenities || null, description || null, photoBuffer]
        );

        // Fetch created room type
        const [roomTypeRows] = await connection.execute<DatabaseRoomTypeRow[]>(
          `SELECT room_type_id, type, capacity, daily_rate, amenities, description, photo, created_at, updated_at
           FROM room_types
           WHERE room_type_id = ?`,
          [roomTypeId]
        );

        const newRoomType = roomTypeRows[0];

        if (!newRoomType) {
          throw new Error('Failed to retrieve created room type');
        }

        // Convert photo Buffer to Base64 for response
        const photoBase64 = newRoomType.photo 
          ? `data:image/jpeg;base64,${newRoomType.photo.toString('base64')}`
          : null;

        res.status(201).json({
          success: true,
          message: 'Room type created successfully',
          data: {
            room_type_id: newRoomType.room_type_id,
            type: newRoomType.type,
            capacity: newRoomType.capacity,
            daily_rate: parseFloat(newRoomType.daily_rate.toString()),
            amenities: newRoomType.amenities,
            description: newRoomType.description,
            photo: photoBase64,
            created_at: newRoomType.created_at,
            updated_at: newRoomType.updated_at
          }
        } as ApiResponse);

      } finally {
        connection.release();
      }

    } catch (error) {
      console.error('Error creating room type:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating room type'
      } as ApiResponse);
    }
  };

  // Get all room types
  public getRoomTypes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const connection = await db.getConnection();

      try {
        const [rows] = await connection.execute<DatabaseRoomTypeRow[]>(
          `SELECT rt.room_type_id, rt.type, rt.capacity, rt.daily_rate, rt.amenities, 
                  rt.description, rt.photo, rt.created_at, rt.updated_at,
                  COUNT(r.room_id) as room_count
           FROM room_types rt
           LEFT JOIN rooms r ON rt.room_type_id = r.room_type_id
           GROUP BY rt.room_type_id
           ORDER BY rt.created_at DESC`
        );

        const roomTypes = rows.map(roomType => ({
          room_type_id: roomType.room_type_id,
          type: roomType.type,
          capacity: roomType.capacity,
          daily_rate: parseFloat(roomType.daily_rate.toString()),
          amenities: roomType.amenities,
          description: roomType.description,
          photo: roomType.photo 
            ? `data:image/jpeg;base64,${roomType.photo.toString('base64')}`
            : null,
          room_count: roomType.room_count || 0,
          created_at: roomType.created_at,
          updated_at: roomType.updated_at
        }));

        res.status(200).json({
          success: true,
          message: 'Room types retrieved successfully',
          data: roomTypes
        } as ApiResponse);

      } finally {
        connection.release();
      }

    } catch (error) {
      console.error('Error retrieving room types:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving room types'
      } as ApiResponse);
    }
  };

  // Get room type by ID
  public getRoomTypeById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { roomTypeId } = req.params;

      if (!roomTypeId) {
        res.status(400).json({
          success: false,
          message: 'Room type ID is required'
        } as ApiResponse);
        return;
      }

      const connection = await db.getConnection();

      try {
        const [rows] = await connection.execute<DatabaseRoomTypeRow[]>(
          `SELECT rt.room_type_id, rt.type, rt.capacity, rt.daily_rate, rt.amenities, 
                  rt.description, rt.photo, rt.created_at, rt.updated_at,
                  COUNT(r.room_id) as room_count
           FROM room_types rt
           LEFT JOIN rooms r ON rt.room_type_id = r.room_type_id
           WHERE rt.room_type_id = ?
           GROUP BY rt.room_type_id`,
          [roomTypeId]
        );

        const roomType = rows[0];

        if (!roomType) {
          res.status(404).json({
            success: false,
            message: 'Room type not found'
          } as ApiResponse);
          return;
        }

        res.status(200).json({
          success: true,
          message: 'Room type retrieved successfully',
          data: {
            room_type_id: roomType.room_type_id,
            type: roomType.type,
            capacity: roomType.capacity,
            daily_rate: parseFloat(roomType.daily_rate.toString()),
            amenities: roomType.amenities,
            description: roomType.description,
            photo: roomType.photo 
              ? `data:image/jpeg;base64,${roomType.photo.toString('base64')}`
              : null,
            room_count: roomType.room_count || 0,
            created_at: roomType.created_at,
            updated_at: roomType.updated_at
          }
        } as ApiResponse);

      } finally {
        connection.release();
      }

    } catch (error) {
      console.error('Error retrieving room type:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving room type'
      } as ApiResponse);
    }
  };

  // Update room type
  public updateRoomType = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Validate admin access
      if (!this.validateAdminAccess(req, res)) {
        return;
      }

      const { roomTypeId } = req.params;
      const {
        type,
        capacity,
        daily_rate,
        amenities,
        description,
        photo
      } = req.body as UpdateRoomTypeRequest;

      if (!roomTypeId) {
        res.status(400).json({
          success: false,
          message: 'Room type ID is required'
        } as ApiResponse);
        return;
      }

      // Validate capacity if provided
      if (capacity !== undefined && (capacity < 1 || capacity > 20)) {
        res.status(400).json({
          success: false,
          message: 'Capacity must be between 1 and 20'
        } as ApiResponse);
        return;
      }

      // Validate daily_rate if provided
      if (daily_rate !== undefined && daily_rate < 0) {
        res.status(400).json({
          success: false,
          message: 'Daily rate must be a positive number'
        } as ApiResponse);
        return;
      }

      // Convert Base64 photo to Buffer if provided
      let photoBuffer: Buffer | null = null;
      if (photo !== undefined) {
        if (photo && photo.trim() !== '') {
          try {
            // Remove data:image/...;base64, prefix if present
            const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
            photoBuffer = Buffer.from(base64Data, 'base64');
          } catch (error) {
            res.status(400).json({
              success: false,
              message: 'Invalid photo format'
            } as ApiResponse);
            return;
          }
        }
      }

      const connection = await db.getConnection();

      try {
        // Check if room type exists
        const [existingRoomType] = await connection.execute<RowDataPacket[]>(
          `SELECT room_type_id FROM room_types WHERE room_type_id = ?`,
          [roomTypeId]
        );

        if (existingRoomType.length === 0) {
          res.status(404).json({
            success: false,
            message: 'Room type not found'
          } as ApiResponse);
          return;
        }

        // Build dynamic update query
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (type !== undefined) {
          // Check if new type name already exists
          const [duplicateType] = await connection.execute<RowDataPacket[]>(
            `SELECT room_type_id FROM room_types WHERE type = ? AND room_type_id != ?`,
            [type, roomTypeId]
          );

          if (duplicateType.length > 0) {
            res.status(409).json({
              success: false,
              message: 'Room type with this name already exists'
            } as ApiResponse);
            return;
          }

          updateFields.push('type = ?');
          updateValues.push(type);
        }
        if (capacity !== undefined) {
          updateFields.push('capacity = ?');
          updateValues.push(capacity);
        }
        if (daily_rate !== undefined) {
          updateFields.push('daily_rate = ?');
          updateValues.push(daily_rate);
        }
        if (amenities !== undefined) {
          updateFields.push('amenities = ?');
          updateValues.push(amenities);
        }
        if (description !== undefined) {
          updateFields.push('description = ?');
          updateValues.push(description);
        }
        if (photo !== undefined) {
          updateFields.push('photo = ?');
          updateValues.push(photoBuffer);
        }

        if (updateFields.length === 0) {
          res.status(400).json({
            success: false,
            message: 'No fields to update'
          } as ApiResponse);
          return;
        }

        // Add updated_at and room_type_id for WHERE clause
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(roomTypeId);

        // Update room type
        await connection.execute(
          `UPDATE room_types SET ${updateFields.join(', ')} WHERE room_type_id = ?`,
          updateValues
        );

        // Fetch updated room type
        const [roomTypeRows] = await connection.execute<DatabaseRoomTypeRow[]>(
          `SELECT rt.room_type_id, rt.type, rt.capacity, rt.daily_rate, rt.amenities, 
                  rt.description, rt.photo, rt.created_at, rt.updated_at,
                  COUNT(r.room_id) as room_count
           FROM room_types rt
           LEFT JOIN rooms r ON rt.room_type_id = r.room_type_id
           WHERE rt.room_type_id = ?
           GROUP BY rt.room_type_id`,
          [roomTypeId]
        );

        const updatedRoomType = roomTypeRows[0];

        if (!updatedRoomType) {
          throw new Error('Failed to retrieve updated room type');
        }

        res.status(200).json({
          success: true,
          message: 'Room type updated successfully',
          data: {
            room_type_id: updatedRoomType.room_type_id,
            type: updatedRoomType.type,
            capacity: updatedRoomType.capacity,
            daily_rate: parseFloat(updatedRoomType.daily_rate.toString()),
            amenities: updatedRoomType.amenities,
            description: updatedRoomType.description,
            photo: updatedRoomType.photo 
              ? `data:image/jpeg;base64,${updatedRoomType.photo.toString('base64')}`
              : null,
            room_count: updatedRoomType.room_count || 0,
            created_at: updatedRoomType.created_at,
            updated_at: updatedRoomType.updated_at
          }
        } as ApiResponse);

      } finally {
        connection.release();
      }

    } catch (error) {
      console.error('Error updating room type:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating room type'
      } as ApiResponse);
    }
  };

  // Delete room type
  public deleteRoomType = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Validate admin access
      if (!this.validateAdminAccess(req, res)) {
        return;
      }

      const { roomTypeId } = req.params;

      if (!roomTypeId) {
        res.status(400).json({
          success: false,
          message: 'Room type ID is required'
        } as ApiResponse);
        return;
      }

      const connection = await db.getConnection();

      try {
        // Check if room type exists
        const [existingRoomType] = await connection.execute<RowDataPacket[]>(
          `SELECT room_type_id FROM room_types WHERE room_type_id = ?`,
          [roomTypeId]
        );

        if (existingRoomType.length === 0) {
          res.status(404).json({
            success: false,
            message: 'Room type not found'
          } as ApiResponse);
          return;
        }

        // Check if room type has associated rooms
        const [associatedRooms] = await connection.execute<RowDataPacket[]>(
          `SELECT COUNT(*) as room_count FROM rooms WHERE room_type_id = ?`,
          [roomTypeId]
        );

        const roomCount = associatedRooms[0]?.room_count || 0;

        if (roomCount > 0) {
          res.status(400).json({
            success: false,
            message: `Cannot delete room type with ${roomCount} associated rooms. Please reassign or delete rooms first.`
          } as ApiResponse);
          return;
        }

        // Delete room type
        await connection.execute(
          `DELETE FROM room_types WHERE room_type_id = ?`,
          [roomTypeId]
        );

        res.status(200).json({
          success: true,
          message: 'Room type deleted successfully'
        } as ApiResponse);

      } finally {
        connection.release();
      }

    } catch (error) {
      console.error('Error deleting room type:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting room type'
      } as ApiResponse);
    }
  };
}

export default new RoomTypeController();