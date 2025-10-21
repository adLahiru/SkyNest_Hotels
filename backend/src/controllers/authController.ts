import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';
import { db } from '../config/db';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { v4: uuidv4 } = require('uuid');
import {
  LoginRequest,
  LoginResponse,
  AuthUser,
  UserRole,
  JWTPayload,
  RefreshTokenPayload,
  UserSession,
  RefreshToken,
  RefreshTokenRequest,
  LogoutRequest,
  ApiResponse,
  TokenValidationResult
} from '../types';

interface DatabaseUserRow {
  user_id: string;
  name: string;
  is_guest: number;
  email: string;
  phone?: string;
  nic_no: string;
  nic_dl_photo?: string;
  username: string;
  password: string;
  created_at: Date;
  updated_at: Date;
  role?: string;
  branch_id?: string;
  staff_id?: string;
}

class AuthController {
  // JWT Secrets (should be in environment variables)
  private readonly ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'your-access-token-secret';
  private readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret';
  private readonly ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
  private readonly REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

  /**
   * User login with role-based authentication
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password }: LoginRequest = req.body;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: 'Username and password are required'
        } as LoginResponse);
        return;
      }

      // Get user with staff role information
      const user = await this.getUserWithRole(username);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        } as LoginResponse);
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        } as LoginResponse);
        return;
      }

      // Create session
      const sessionId = uuidv4();
      await this.createUserSession(user.user_id, sessionId, req);

      // Generate tokens
      const tokens = await this.generateTokens(user, sessionId);

      // Store refresh token
      await this.storeRefreshToken(tokens.refreshTokenJti, user.user_id, sessionId, tokens.refreshTokenHash);

      // Prepare response
      const response: LoginResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            branch_id: user.branch_id,
            is_guest: user.is_guest
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: 15 * 60 // 15 minutes in seconds
          }
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as LoginResponse);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        } as ApiResponse);
        return;
      }

      // Verify refresh token
      let decoded: RefreshTokenPayload;
      try {
        decoded = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
      } catch (error) {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        } as ApiResponse);
        return;
      }

      // Check if refresh token exists and is active
      const tokenRecord = await this.getRefreshToken(decoded.jti);
      if (!tokenRecord || !tokenRecord.is_active) {
        res.status(401).json({
          success: false,
          message: 'Refresh token not found or inactive'
        } as ApiResponse);
        return;
      }

      // Get user with role
      const user = await this.getUserById(decoded.user_id);
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found'
        } as ApiResponse);
        return;
      }

      // Generate new access token
      const newAccessToken = this.generateAccessToken(user, decoded.session_id);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          expiresIn: 15 * 60 // 15 minutes in seconds
        }
      } as ApiResponse);

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * User logout - invalidate tokens and session
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken }: LogoutRequest = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        } as ApiResponse);
        return;
      }

      // Decode refresh token to get session info
      let decoded: RefreshTokenPayload;
      try {
        decoded = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
      } catch (error) {
        // Even if token is invalid, we'll try to clean up
        res.status(200).json({
          success: true,
          message: 'Logged out successfully'
        } as ApiResponse);
        return;
      }

      // Invalidate refresh token
      await this.invalidateRefreshToken(decoded.jti);

      // Invalidate session
      await this.invalidateSession(decoded.session_id);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      } as ApiResponse);

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  /**
   * Get current user info (protected route)
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as any; // Will be populated by auth middleware
      const user = authReq.user as AuthUser;

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          username: user.username,
          phone: user.phone,
          nic_no: user.nic_no,
          role: user.role,
          branch_id: user.branch_id,
          is_guest: user.is_guest,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      } as ApiResponse);

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  // ===================== Private Helper Methods =====================

  /**
   * Get user with role information from database
   */
  private async getUserWithRole(username: string): Promise<AuthUser | null> {
    const query = `
      SELECT 
        u.user_id, u.name, u.is_guest, u.email, u.phone, u.nic_no, 
        u.nic_dl_photo, u.username, u.password, u.created_at, u.updated_at,
        s.role, s.branch_id, s.staff_id
      FROM users u
      LEFT JOIN staff s ON u.user_id = s.staff_id
      WHERE u.username = ? OR u.email = ?
      LIMIT 1
    `;

    try {
      const [rows] = await db.execute<RowDataPacket[]>(query, [username, username]);
      
      if (rows.length === 0) {
        return null;
      }

      const row = rows[0] as DatabaseUserRow;
      
      return {
        user_id: row.user_id,
        name: row.name,
        is_guest: Boolean(row.is_guest),
        email: row.email,
        phone: row.phone || undefined,
        nic_no: row.nic_no,
        nic_dl_photo: row.nic_dl_photo || undefined,
        username: row.username,
        password: row.password,
        created_at: row.created_at,
        updated_at: row.updated_at,
        role: row.role as UserRole || (row.is_guest ? UserRole.GUEST : undefined),
        branch_id: row.branch_id || undefined,
        staff_id: row.staff_id || undefined
      };
    } catch (error) {
      console.error('Database error in getUserWithRole:', error);
      return null;
    }
  }

  /**
   * Get user by ID with role information
   */
  private async getUserById(userId: string): Promise<AuthUser | null> {
    const query = `
      SELECT 
        u.user_id, u.name, u.is_guest, u.email, u.phone, u.nic_no, 
        u.nic_dl_photo, u.username, u.password, u.created_at, u.updated_at,
        s.role, s.branch_id, s.staff_id
      FROM users u
      LEFT JOIN staff s ON u.user_id = s.staff_id
      WHERE u.user_id = ?
      LIMIT 1
    `;

    try {
      const [rows] = await db.execute<RowDataPacket[]>(query, [userId]);
      
      if (rows.length === 0) {
        return null;
      }

      const row = rows[0] as DatabaseUserRow;
      
      return {
        user_id: row.user_id,
        name: row.name,
        is_guest: Boolean(row.is_guest),
        email: row.email,
        phone: row.phone || undefined,
        nic_no: row.nic_no,
        nic_dl_photo: row.nic_dl_photo || undefined,
        username: row.username,
        password: row.password,
        created_at: row.created_at,
        updated_at: row.updated_at,
        role: row.role as UserRole || (row.is_guest ? UserRole.GUEST : undefined),
        branch_id: row.branch_id || undefined,
        staff_id: row.staff_id || undefined
      };
    } catch (error) {
      console.error('Database error in getUserById:', error);
      return null;
    }
  }

  /**
   * Create user session in database
   */
  private async createUserSession(userId: string, sessionId: string, req: Request): Promise<void> {
    const query = `
      INSERT INTO user_session (session_id, user_id, device_info, ip_address, user_agent, is_active, expires_at, last_activity)
      VALUES (?, ?, ?, ?, ?, 1, DATE_ADD(NOW(), INTERVAL 7 DAY), NOW())
    `;

    const deviceInfo = req.get('User-Agent') || 'Unknown Device';
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown IP';
    const userAgent = req.get('User-Agent') || 'Unknown';

    try {
      await db.execute(query, [sessionId, userId, deviceInfo, ipAddress, userAgent]);
    } catch (error) {
      console.error('Error creating user session:', error);
      throw error;
    }
  }

  /**
   * Generate both access and refresh tokens
   */
  private async generateTokens(user: AuthUser, sessionId: string) {
    const accessTokenJti = uuidv4();
    const refreshTokenJti = uuidv4();

    // Access token payload
    const accessTokenPayload: JWTPayload = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      branch_id: user.branch_id,
      is_guest: user.is_guest,
      session_id: sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
      jti: accessTokenJti
    };

    // Refresh token payload
    const refreshTokenPayload: RefreshTokenPayload = {
      user_id: user.user_id,
      session_id: sessionId,
      jti: refreshTokenJti,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };

    const accessToken = jwt.sign(accessTokenPayload, this.ACCESS_TOKEN_SECRET);
    const refreshToken = jwt.sign(refreshTokenPayload, this.REFRESH_TOKEN_SECRET);

    // Hash refresh token for storage
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    return {
      accessToken,
      refreshToken,
      refreshTokenJti,
      refreshTokenHash
    };
  }

  /**
   * Generate new access token
   */
  private generateAccessToken(user: AuthUser, sessionId: string): string {
    const jti = uuidv4();
    const payload: JWTPayload = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      branch_id: user.branch_id,
      is_guest: user.is_guest,
      session_id: sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
      jti
    };

    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET);
  }

  /**
   * Store refresh token in database
   */
  private async storeRefreshToken(jti: string, userId: string, sessionId: string, tokenHash: string): Promise<void> {
    const query = `
      INSERT INTO refresh_token (jti, user_id, session_id, token_hash, is_active, expires_at)
      VALUES (?, ?, ?, ?, 1, DATE_ADD(NOW(), INTERVAL 7 DAY))
    `;

    try {
      await db.execute(query, [jti, userId, sessionId, tokenHash]);
    } catch (error) {
      console.error('Error storing refresh token:', error);
      throw error;
    }
  }

  /**
   * Get refresh token from database
   */
  private async getRefreshToken(jti: string): Promise<RefreshToken | null> {
    const query = `SELECT * FROM refresh_token WHERE jti = ? AND is_active = 1 LIMIT 1`;

    try {
      const [rows] = await db.execute<RowDataPacket[]>(query, [jti]);
      return rows.length > 0 ? rows[0] as RefreshToken : null;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Invalidate refresh token
   */
  private async invalidateRefreshToken(jti: string): Promise<void> {
    const query = `UPDATE refresh_token SET is_active = 0 WHERE jti = ?`;

    try {
      await db.execute(query, [jti]);
    } catch (error) {
      console.error('Error invalidating refresh token:', error);
    }
  }

  /**
   * Invalidate user session
   */
  private async invalidateSession(sessionId: string): Promise<void> {
    const query = `UPDATE user_session SET is_active = 0 WHERE session_id = ?`;

    try {
      await db.execute(query, [sessionId]);
    } catch (error) {
      console.error('Error invalidating session:', error);
    }
  }

  /**
   * Validate access token and return user info
   */
  async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      const decoded = jwt.verify(token, this.ACCESS_TOKEN_SECRET) as JWTPayload;
      
      // Check if session is still active
      const sessionQuery = `SELECT * FROM user_session WHERE session_id = ? AND is_active = 1 LIMIT 1`;
      const [sessionRows] = await db.execute<RowDataPacket[]>(sessionQuery, [decoded.session_id]);
      
      if (sessionRows.length === 0) {
        return { success: false, error: 'Session expired or inactive' };
      }

      // Get fresh user data
      const user = await this.getUserById(decoded.user_id);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      return {
        success: true,
        user,
        session_id: decoded.session_id
      };

    } catch (error) {
      return { success: false, error: 'Invalid token' };
    }
  }
}

export default new AuthController();