/**
 * Express HTTP Request Audit Middleware
 * Automatically logs all incoming API calls with method, path, IP, response time, and status code.
 */
const logger = require('../utils/logger');

function auditLoggerMiddleware(req, res, next) {
  // Skip static assets
  if (req.path.startsWith('/assets') || req.path.endsWith('.png') || req.path.endsWith('.css') || req.path.endsWith('.js')) {
    return next();
  }

  const start = Date.now();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    let logLevel = 'info';
    if (statusCode >= 500) logLevel = 'error';
    else if (statusCode >= 400) logLevel = 'warn';

    // Extract category from path (e.g. /api/v1/client -> CLIENT)
    const pathParts = req.path.split('/');
    const category = pathParts[3] ? pathParts[3].toUpperCase() : 'HTTP';

    logger[logLevel]('HTTP', `${req.method} ${req.path} ${statusCode} - ${duration}ms`, {
      action: `HTTP_${req.method}_${req.path}`,
      ipAddress: clientIp,
      details: {
        statusCode,
        durationMs: duration,
        userAgent: req.headers['user-agent'] || ''
      }
    });
  });

  next();
}

module.exports = auditLoggerMiddleware;
