import { Request } from 'express';

// User role enum based on staff table
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  RECEPTIONIST = 'RECEPTIONIST',
  HOUSEKEEPING = 'HOUSEKEEPING',
  GUEST = 'GUEST'
}

// User interface based on users table
export interface User {
  user_id: string;
  name: string;
  is_guest: boolean;
  email: string;
  phone?: string | undefined;
  nic_no: string;
  nic_dl_photo?: string | undefined;
  username: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

// Staff interface based on staff table
export interface Staff {
  staff_id: string;
  branch_id?: string | undefined;
  role: UserRole;
  hire_date?: Date | undefined;
  retired_date?: Date | undefined;
  salary?: number | undefined;
  created_at: Date;
  updated_at: Date;
}

// Combined user with staff info for authentication
export interface AuthUser extends User {
  role?: UserRole | undefined;
  branch_id?: string | undefined;
  staff_id?: string | undefined;
}

// Login request interface
export interface LoginRequest {
  username: string;
  password: string;
}

// Login response interface
export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      user_id: string;
      name: string;
      email: string;
      username: string;
      role?: UserRole | undefined;
      branch_id?: string | undefined;
      is_guest: boolean;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  };
}

// JWT payload interface
export interface JWTPayload {
  user_id: string;
  username: string;
  email: string;
  role?: UserRole | undefined;
  branch_id?: string | undefined;
  is_guest: boolean;
  session_id: string;
  iat: number;
  exp: number;
  jti: string;
}

// Refresh token payload
export interface RefreshTokenPayload {
  user_id: string;
  session_id: string;
  jti: string;
  iat: number;
  exp: number;
}

// Session interface based on user_session table
export interface UserSession {
  session_id: string;
  user_id: string;
  device_info?: string;
  ip_address?: string;
  user_agent?: string;
  location?: string;
  is_active: boolean;
  expires_at?: Date;
  last_activity?: Date;
  created_at: Date;
}

// Refresh token interface based on refresh_token table
export interface RefreshToken {
  jti: string;
  user_id: string;
  session_id: string;
  token_hash?: string;
  is_active: boolean;
  created_at: Date;
  expires_at?: Date;
}

// Extended Express Request with user info
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  session_id?: string | undefined;
}

// Token validation result
export interface TokenValidationResult {
  success: boolean;
  user?: AuthUser;
  session_id?: string;
  error?: string;
}

// Role permission levels (for middleware)
export const RoleHierarchy = {
  [UserRole.ADMIN]: 4,
  [UserRole.MANAGER]: 3,
  [UserRole.RECEPTIONIST]: 2,
  [UserRole.HOUSEKEEPING]: 1,
  [UserRole.GUEST]: 0
};

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Logout request
export interface LogoutRequest {
  refreshToken: string;
}

// Token refresh request
export interface RefreshTokenRequest {
  refreshToken: string;
}