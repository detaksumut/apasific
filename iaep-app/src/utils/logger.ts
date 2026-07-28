/**
 * Simple Logger Abstraction
 * Allows replacing console with advanced loggers (like Sentry, OpenTelemetry, etc) later
 * without changing business code.
 */

export const AuditLogger = {
  info: (message: string, context?: any) => {
    console.info(`[INFO] ${message}`, context ? context : '');
  },
  warn: (message: string, context?: any) => {
    console.warn(`[WARN] ${message}`, context ? context : '');
  },
  error: (message: string, error?: any, context?: any) => {
    console.error(`[ERROR] ${message}`, error ? error : '', context ? context : '');
  },
  debug: (message: string, context?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}`, context ? context : '');
    }
  }
};
