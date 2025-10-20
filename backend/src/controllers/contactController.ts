import { Request, Response } from 'express';
import { db } from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';

interface AuthenticatedRequest extends Request {
  user?: {
    user_id: string;
    role: string;
    branch_id?: string;
  };
}

interface Contact extends RowDataPacket {
  contact_id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  inquiry_type: string;
  subject: string;
  message: string;
  status: 'pending' | 'read' | 'replied' | 'closed';
  created_at: Date;
  updated_at: Date;
}

/**
 * Submit contact form (Public - anyone can submit)
 * POST /api/contact
 */
export const submitContactForm = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, inquiry_type, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are required fields.'
      });
      return;
    }

    // Email validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email address.'
      });
      return;
    }

    // Message length validation
    if (message.trim().length < 10) {
      res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters long.'
      });
      return;
    }

    const contact_id = uuidv4();
    const user_id = req.user?.user_id || null; // If user is logged in, attach their ID

    const insertQuery = `
      INSERT INTO contact (
        contact_id,
        user_id,
        name,
        email,
        phone,
        inquiry_type,
        subject,
        message,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    await db.query(insertQuery, [
      contact_id,
      user_id,
      name,
      email,
      phone || null,
      inquiry_type || 'general',
      subject,
      message
    ]);

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully! We will respond within 24 hours.',
      data: {
        contact_id,
        name,
        email,
        subject,
        inquiry_type: inquiry_type || 'general'
      }
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while submitting your message. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all contact messages (Admin only)
 * GET /api/contact
 */
export const getAllContactMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, inquiry_type, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        c.*,
        u.name as user_name,
        u.email as user_email
      FROM contact c
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (inquiry_type) {
      query += ' AND c.inquiry_type = ?';
      params.push(inquiry_type);
    }

    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const [messages] = await db.query<Contact[]>(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM contact WHERE 1=1';
    const countParams: any[] = [];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (inquiry_type) {
      countQuery += ' AND inquiry_type = ?';
      countParams.push(inquiry_type);
    }

    const [countResult]: any = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.status(200).json({
      success: true,
      message: 'Contact messages retrieved successfully.',
      data: {
        messages,
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });

  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving contact messages.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get contact message by ID (Admin only)
 * GET /api/contact/:contact_id
 */
export const getContactMessageById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { contact_id } = req.params;

    const [messages] = await db.query<Contact[]>(
      `SELECT 
        c.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone
      FROM contact c
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE c.contact_id = ?`,
      [contact_id]
    );

    if (messages.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Contact message not found.'
      });
      return;
    }

    const message = messages[0];

    // Mark as read if it's pending
    if (message && message.status === 'pending') {
      await db.query(
        'UPDATE contact SET status = ? WHERE contact_id = ?',
        ['read', contact_id]
      );
      message.status = 'read';
    }

    res.status(200).json({
      success: true,
      message: 'Contact message retrieved successfully.',
      data: message
    });

  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving the contact message.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update contact message status (Admin only)
 * PATCH /api/contact/:contact_id/status
 */
export const updateContactStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { contact_id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'read', 'replied', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
      return;
    }

    await db.query(
      'UPDATE contact SET status = ? WHERE contact_id = ?',
      [status, contact_id]
    );

    res.status(200).json({
      success: true,
      message: 'Contact message status updated successfully.',
      data: { contact_id, status }
    });

  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating the contact message status.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete contact message (Admin only)
 * DELETE /api/contact/:contact_id
 */
export const deleteContactMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { contact_id } = req.params;

    await db.query('DELETE FROM contact WHERE contact_id = ?', [contact_id]);

    res.status(200).json({
      success: true,
      message: 'Contact message deleted successfully.'
    });

  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the contact message.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
