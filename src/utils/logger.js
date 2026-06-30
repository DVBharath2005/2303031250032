/**
 * Logging Middleware
 * ------------------
 * Centralised structured logger used across the entire application.
 * Levels: DEBUG < INFO < WARN < ERROR
 *
 * Each log entry is a structured object:
 * {
 *   timestamp : ISO string
 *   level     : 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
 *   context   : caller module / component name
 *   message   : human-readable description
 *   data      : optional payload (request params, response snippets, etc.)
 * }
 *
 * In production (NODE_ENV === 'production') DEBUG logs are suppressed.
 */

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

const MIN_LEVEL =
  process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

// ── colour map for console output ──────────────────────────────────────────────
const STYLES = {
  DEBUG: 'color:#9e9e9e; font-weight:400',
  INFO:  'color:#1976d2; font-weight:500',
  WARN:  'color:#ed6c02; font-weight:600',
  ERROR: 'color:#d32f2f; font-weight:700',
};

// in-memory ring buffer (last 200 entries) – useful for debug panels
const LOG_BUFFER_SIZE = 200;
const logBuffer = [];

function pushToBuffer(entry) {
  if (logBuffer.length >= LOG_BUFFER_SIZE) logBuffer.shift();
  logBuffer.push(entry);
}

// ── core log function ──────────────────────────────────────────────────────────
function log(level, context, message, data) {
  if (LOG_LEVELS[level] < MIN_LEVEL) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    context,
    message,
    ...(data !== undefined && { data }),
  };

  pushToBuffer(entry);

  const prefix = `[${entry.timestamp}] [${level}] [${context}]`;

  if (data !== undefined) {
    console[level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log'](
      `%c${prefix} ${message}`,
      STYLES[level],
      data,
    );
  } else {
    console[level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log'](
      `%c${prefix} ${message}`,
      STYLES[level],
    );
  }
}

// ── public API ─────────────────────────────────────────────────────────────────
const logger = {
  debug: (ctx, msg, data) => log('DEBUG', ctx, msg, data),
  info:  (ctx, msg, data) => log('INFO',  ctx, msg, data),
  warn:  (ctx, msg, data) => log('WARN',  ctx, msg, data),
  error: (ctx, msg, data) => log('ERROR', ctx, msg, data),

  /** Returns a copy of the in-memory log buffer */
  getBuffer: () => [...logBuffer],

  /**
   * Higher-order function: wraps an async API call with enter/exit logging.
   *
   * Usage:
   *   const data = await logger.withLogging('NotifService', 'fetchNotifications',
   *                  () => axios.get(url, { params }));
   */
  withLogging: async (context, operation, fn) => {
    logger.info(context, `→ ${operation} started`);
    const t0 = performance.now();
    try {
      const result = await fn();
      const ms = (performance.now() - t0).toFixed(1);
      logger.info(context, `← ${operation} completed`, { durationMs: ms });
      return result;
    } catch (err) {
      const ms = (performance.now() - t0).toFixed(1);
      logger.error(context, `✖ ${operation} failed`, {
        durationMs: ms,
        error: err?.message ?? String(err),
        status: err?.response?.status,
      });
      throw err;
    }
  },
};

export default logger;
