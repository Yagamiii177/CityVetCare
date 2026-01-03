/**
 * Frontend Logger Utility
 * Provides consistent logging that respects environment mode
 */

const isDevelopment = import.meta.env.MODE === 'development';

class FrontendLogger {
  constructor(context = 'APP') {
    this.context = context;
  }

  log(...args) {
    if (isDevelopment) {
      console.log(`[${this.context}]`, ...args);
    }
  }

  error(...args) {
    // Always log errors, even in production
    console.error(`[${this.context}]`, ...args);
  }

  warn(...args) {
    if (isDevelopment) {
      console.warn(`[${this.context}]`, ...args);
    }
  }

  debug(...args) {
    if (isDevelopment) {
      console.debug(`[${this.context}]`, ...args);
    }
  }

  info(...args) {
    if (isDevelopment) {
      console.info(`[${this.context}]`, ...args);
    }
  }
}

export default FrontendLogger;
