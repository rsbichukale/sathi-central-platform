const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { getDatabase, query } = require('./db/database');
const auditLoggerMiddleware = require('./middleware/auditLogger');
const logger = require('./utils/logger');

const app = express();

// Hide server fingerprinting for PCI-DSS Compliance
app.disable('x-powered-by');

// Real PCI-DSS & 256-Bit SSL Security Enforcement via Helmet
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'sameorigin' }
}));

// Automatic HTTPS Enforcement Middleware
app.use((req, res, next) => {
  if (config.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Restricted CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (config.CORS_ORIGINS.includes(origin)) return callback(null, true);
    if (config.NODE_ENV !== 'production') return callback(null, true);
    return callback(new Error('CORS policy: Origin not allowed.'));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP Access Audit Logging Middleware
app.use(auditLoggerMiddleware);

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: config.AUTH_RATE_LIMIT_WINDOW_MS,
  max: config.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts. Please try again in 15 minutes.' }
});

const paymentLimiter = rateLimit({
  windowMs: config.PAYMENT_RATE_LIMIT_WINDOW_MS,
  max: config.PAYMENT_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many payment requests. Please try again shortly.' }
});

const adminLimiter = rateLimit({
  windowMs: config.ADMIN_RATE_LIMIT_WINDOW_MS,
  max: config.ADMIN_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many admin requests. Please try again later.' }
});

app.use('/api/v1/admin', adminLimiter);
app.use('/api/v1/customer/login', authLimiter);
app.use('/api/v1/customer/register', authLimiter);
app.use('/api/v1/payment/create-order', paymentLimiter);
app.use('/api/v1/payment/verify-signature', paymentLimiter);

const { startCronJobs } = require('./utils/cronJobs');

// Initialize Central Database
getDatabase()
  .then(() => {
    logger.info('Database', 'Central Database Initialized.');
    startCronJobs();
  })
  .catch(err => logger.error('Database', 'Database init failed:', { error: err.message }));

const fs = require('fs');

// Serve React/Vite Web UI production build
const webUiDist = path.join(__dirname, '../web-ui/dist');
if (fs.existsSync(webUiDist)) {
  app.use(express.static(webUiDist));
} else {
  app.use(express.static(path.join(__dirname, '../public')));
}

// Health check endpoint with DB status
app.get('/health', async (req, res) => {
  let dbStatus = 'UNKNOWN';
  try {
    const result = await query('SELECT COUNT(*) as count FROM clients');
    dbStatus = 'CONNECTED';
  } catch (err) {
    dbStatus = 'ERROR: ' + err.message;
  }

  res.json({
    status: 'ONLINE',
    service: 'SATHI Central License & Registry Platform',
    database: dbStatus,
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/admin/settings', require('./routes/settings.routes'));
app.use('/api/v1/admin', require('./routes/admin.routes'));
app.use('/api/v1/customer', require('./routes/customer.routes'));
app.use('/api/v1/payment', require('./routes/payment.routes'));
app.use('/api/v1/inquiry', require('./routes/inquiry.routes'));
app.use('/api/v1/license', require('./routes/license.routes'));
app.use('/api/v1/client', require('./routes/client.routes'));
app.use('/api/v1/registry', require('./routes/registry.routes'));

// Wild-card SPA Fallback Route for HTML5 History API routing
app.get('*', (req, res) => {
  if (fs.existsSync(webUiDist)) {
    res.sendFile(path.join(webUiDist, 'index.html'));
  } else {
    res.status(200).send('Ruractive Technology API Server');
  }
});

app.listen(config.PORT, () => {
  console.log(`=======================================================`);
  console.log(`  SATHI Central Platform Server running on port ${config.PORT}`);
  console.log(`  Environment: ${config.NODE_ENV}`);
  console.log(`  Health Check: http://127.0.0.1:${config.PORT}/health`);
  console.log(`=======================================================`);
});

module.exports = app;
