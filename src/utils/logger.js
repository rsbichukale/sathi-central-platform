/**
 * Comprehensive Multi-Destination Logger & Audit Trail Engine
 * 
 * Writes log events to:
 * 1. Console (formatted, timestamped)
 * 2. Disk Log File (`data/logs/system_activity.log`)
 * 3. SQLite Database (`system_logs` table for live Admin Explorer)
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, SECURITY: 4 };
const currentLevel = LOG_LEVELS[String(process.env.LOG_LEVEL || 'INFO').toUpperCase()] || LOG_LEVELS.INFO;

const logDir = path.join(__dirname, '../../data/logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logFilePath = path.join(logDir, 'system_activity.log');

function formatTimestamp() {
  return new Date().toISOString();
}

/**
 * Write log entry to disk file asynchronously
 */
function appendToFile(formattedLine) {
  fs.appendFile(logFilePath, formattedLine + '\n', (err) => {
    if (err) console.error('[LoggerFileErr]', err.message);
  });
}

/**
 * Write audit log entry into SQLite database
 */
function writeToDatabase(level, category, action, { clientId, requestCode, ipAddress, details }) {
  try {
    const { run } = require('../db/database');
    const id = 'log_' + crypto.randomBytes(8).toString('hex');
    const detailStr = typeof details === 'object' ? JSON.stringify(details) : String(details || '');

    run(
      `INSERT INTO system_logs (id, level, category, event_action, client_id, request_code, ip_address, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, level, category.toUpperCase(), action, clientId || null, requestCode || null, ipAddress || null, detailStr]
    ).catch(err => {
      // Fire and forget, but log to console if it fails
      console.error('[LoggerDBErr]', err.message);
    });
  } catch (_) {
    // Fail silently if DB is not ready yet during bootstrap
  }
}

/**
 * Core log handler
 */
function log(level, category, message, meta = {}) {
  if (LOG_LEVELS[level] !== undefined && LOG_LEVELS[level] < currentLevel) return;

  const timestamp = formatTimestamp();
  const catUpper = category.toUpperCase();
  const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
  const consoleLine = `${timestamp} [${level.padEnd(8)}] [${catUpper.padEnd(12)}] ${message} ${metaStr}`.trim();
  const fileLine = `${timestamp} | ${level} | ${catUpper} | ${message} | ${metaStr}`;

  // 1. Console
  if (level === 'ERROR' || level === 'SECURITY') {
    console.error(consoleLine);
  } else if (level === 'WARN') {
    console.warn(consoleLine);
  } else {
    console.log(consoleLine);
  }

  // 2. File
  appendToFile(fileLine);

  // 3. Database Audit Record
  if (meta.action || meta.saveToDb || ['INFO', 'WARN', 'ERROR', 'SECURITY'].includes(level)) {
    writeToDatabase(level, catUpper, meta.action || message, {
      clientId: meta.clientId,
      requestCode: meta.requestCode,
      ipAddress: meta.ipAddress,
      details: meta.details || meta
    });
  }
}

module.exports = {
  debug: (cat, msg, meta) => log('DEBUG', cat, msg, meta),
  info: (cat, msg, meta) => log('INFO', cat, msg, meta),
  warn: (cat, msg, meta) => log('WARN', cat, msg, meta),
  error: (cat, msg, meta) => log('ERROR', cat, msg, meta),
  security: (cat, msg, meta) => log('SECURITY', cat, msg, meta),

  /**
   * Record structured audit trail entry for business actions
   */
  audit: (category, eventAction, { clientId, requestCode, ipAddress, details } = {}) => {
    log('INFO', category, eventAction, {
      action: eventAction,
      clientId,
      requestCode,
      ipAddress,
      details,
      saveToDb: true
    });
  }
};
