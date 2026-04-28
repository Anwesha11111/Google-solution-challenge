// ============================================================
// logger.js — Structured logging for debugging & monitoring
// ============================================================

const fs = require('fs');
const path = require('path');

const LOG_DIR = process.env.LOG_DIR || './logs';

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_LEVELS = {
  ERROR:   0,
  WARN:    1,
  INFO:    2,
  DEBUG:   3
};

const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL || 'INFO'];

/**
 * Write a structured log entry to both console and file.
 * @param {string} level - ERROR, WARN, INFO, DEBUG
 * @param {string} message - Log message
 * @param {object} meta - Additional metadata (optional)
 */
function log(level, message, meta = {}) {
  if (LOG_LEVELS[level] > CURRENT_LEVEL) return;

  const timestamp = new Date().toISOString();
  const entry = {
    timestamp,
    level,
    message,
    ...meta
  };

  // Console output
  const color = {
    ERROR: '\x1b[31m',   // red
    WARN:  '\x1b[33m',   // yellow
    INFO:  '\x1b[36m',   // cyan
    DEBUG: '\x1b[90m'    // gray
  }[level] || '';
  const reset = '\x1b[0m';

  console.log(`${color}[${timestamp}] ${level}: ${message}${reset}`, meta);

  // File output (JSON lines format for easy parsing)
  const logFile = path.join(LOG_DIR, `${level.toLowerCase()}.log`);
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
}

module.exports = {
  error:   (msg, meta) => log('ERROR', msg, meta),
  warn:    (msg, meta) => log('WARN', msg, meta),
  info:    (msg, meta) => log('INFO', msg, meta),
  debug:   (msg, meta) => log('DEBUG', msg, meta)
};
