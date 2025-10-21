/**
 * Logger Utility
 * 
 * Provides centralized logging functionality using Winston.
 * Supports different log levels (error, warn, info, debug) and formats logs
 * for both console output and file storage.
 * 
 * Log Levels:
 * - error: Critical errors that need immediate attention
 * - warn: Warning messages for potentially harmful situations
 * - info: Informational messages about application state
 * - debug: Detailed diagnostic information (disabled in production)
 */

import winston from 'winston';
import path from 'path';

// Define custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = '\n' + JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// Determine log level based on environment
const getLogLevel = (): string => {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') return 'info';
  if (env === 'test') return 'error';
  return 'debug';
};

// Create logs directory path
const logsDir = path.join(__dirname, '../../logs');

// Create the logger instance
const logger = winston.createLogger({
  level: getLogLevel(),
  format: logFormat,
  defaultMeta: { service: 'skynest-hotels-backend' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

/**
 * Log an informational message
 * @param message - The message to log
 * @param meta - Optional metadata object
 */
export const logInfo = (message: string, meta?: Record<string, any>): void => {
  logger.info(message, meta);
};

/**
 * Log a warning message
 * @param message - The warning message to log
 * @param meta - Optional metadata object
 */
export const logWarn = (message: string, meta?: Record<string, any>): void => {
  logger.warn(message, meta);
};

/**
 * Log an error message
 * @param message - The error message to log
 * @param error - Optional error object
 * @param meta - Optional metadata object
 */
export const logError = (message: string, error?: any, meta?: Record<string, any>): void => {
  const errorMeta = {
    ...meta,
    ...(error && {
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        ...(error.sql && { sql: error.sql }),
        ...(error.sqlMessage && { sqlMessage: error.sqlMessage }),
      },
    }),
  };
  logger.error(message, errorMeta);
};

/**
 * Log a debug message (only in development)
 * @param message - The debug message to log
 * @param meta - Optional metadata object
 */
export const logDebug = (message: string, meta?: Record<string, any>): void => {
  logger.debug(message, meta);
};

/**
 * Log HTTP request information
 * @param method - HTTP method
 * @param url - Request URL
 * @param statusCode - Response status code
 * @param duration - Request duration in ms
 */
export const logHttpRequest = (
  method: string,
  url: string,
  statusCode: number,
  duration?: number
): void => {
  const meta = {
    method,
    url,
    statusCode,
    ...(duration && { duration: `${duration}ms` }),
  };
  logger.info('HTTP Request', meta);
};

export default logger;
