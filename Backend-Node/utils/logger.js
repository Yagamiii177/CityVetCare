/**
 * Professional Logging Utility
 * Provides structured logging with different levels
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[90m', // Gray
  RESET: '\x1b[0m'
};

class Logger {
  constructor(context = 'APP') {
    this.context = context;
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const color = COLORS[level] || '';
    const reset = COLORS.RESET;
    
    let logMessage = `${color}[${timestamp}] [${level}] [${this.context}] ${message}${reset}`;
    
    if (data && this.isDevelopment) {
      logMessage += '\n' + JSON.stringify(data, null, 2);
    }
    
    return logMessage;
  }

  error(message, error = null) {
    const logMessage = this.formatMessage(LOG_LEVELS.ERROR, message);
    console.error(logMessage);
    if (error && this.isDevelopment) {
      console.error(error.stack || error);
    }
  }

  warn(message, data = null) {
    const logMessage = this.formatMessage(LOG_LEVELS.WARN, message, data);
    console.warn(logMessage);
  }

  info(message, data = null) {
    const logMessage = this.formatMessage(LOG_LEVELS.INFO, message, data);
    console.log(logMessage);
  }

  debug(message, data = null) {
    if (this.isDevelopment) {
      const logMessage = this.formatMessage(LOG_LEVELS.DEBUG, message, data);
      console.log(logMessage);
    }
  }

  success(message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `\x1b[32m[${timestamp}] [SUCCESS] [${this.context}] ${message}\x1b[0m`;
    console.log(logMessage);
    if (data && this.isDevelopment) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

export default Logger;
