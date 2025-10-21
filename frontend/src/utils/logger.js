/**
 * Frontend Logger Utility
 * 
 * Provides centralized logging functionality for the frontend application.
 * In production, logs are suppressed to avoid exposing sensitive information.
 * 
 * Usage:
 * - logger.info('User logged in', { userId: 123 })
 * - logger.error('API call failed', error)
 * - logger.warn('Invalid input detected')
 * - logger.debug('Component rendered', { props })
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Format log message with timestamp
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @returns {string} Formatted message
 */
const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
};

/**
 * Logger class for frontend logging
 */
class Logger {
  /**
   * Log an informational message
   * @param {string} message - The message to log
   * @param {*} data - Optional data to log
   */
  info(message, data) {
    if (isDevelopment) {
      if (data !== undefined) {
        console.log(formatMessage('info', message), data);
      } else {
        console.log(formatMessage('info', message));
      }
    }
  }

  /**
   * Log a warning message
   * @param {string} message - The warning message to log
   * @param {*} data - Optional data to log
   */
  warn(message, data) {
    if (isDevelopment) {
      if (data !== undefined) {
        console.warn(formatMessage('warn', message), data);
      } else {
        console.warn(formatMessage('warn', message));
      }
    }
  }

  /**
   * Log an error message
   * @param {string} message - The error message to log
   * @param {Error|*} error - Optional error object or data
   */
  error(message, error) {
    if (isDevelopment) {
      if (error !== undefined) {
        console.error(formatMessage('error', message), error);
      } else {
        console.error(formatMessage('error', message));
      }
    } else if (isProduction) {
      // In production, only log critical errors to a monitoring service
      // This is where you would integrate with services like Sentry, LogRocket, etc.
      // Example: Sentry.captureException(error);
    }
  }

  /**
   * Log a debug message (only in development)
   * @param {string} message - The debug message to log
   * @param {*} data - Optional data to log
   */
  debug(message, data) {
    if (isDevelopment) {
      if (data !== undefined) {
        console.debug(formatMessage('debug', message), data);
      } else {
        console.debug(formatMessage('debug', message));
      }
    }
  }

  /**
   * Log API request information
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {*} data - Optional request data
   */
  apiRequest(method, url, data) {
    if (isDevelopment) {
      const message = `API Request: ${method.toUpperCase()} ${url}`;
      if (data !== undefined) {
        console.log(formatMessage('api', message), data);
      } else {
        console.log(formatMessage('api', message));
      }
    }
  }

  /**
   * Log API response information
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {number} status - Response status code
   * @param {*} data - Optional response data
   */
  apiResponse(method, url, status, data) {
    if (isDevelopment) {
      const message = `API Response: ${method.toUpperCase()} ${url} - ${status}`;
      if (data !== undefined) {
        console.log(formatMessage('api', message), data);
      } else {
        console.log(formatMessage('api', message));
      }
    }
  }

  /**
   * Log API error information
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {Error|*} error - Error object
   */
  apiError(method, url, error) {
    const message = `API Error: ${method.toUpperCase()} ${url}`;
    this.error(message, error);
  }
}

// Export singleton instance
const logger = new Logger();

export default logger;
