/**
 * Shared Authentication & Validation Middleware
 */
const jwt = require('jsonwebtoken');
const config = require('../config');
const { query } = require('../db/database');

// In-memory store for admin session tokens with expiry
const adminSessions = new Map();

/**
 * Admin Auth Middleware
 * Validates JWT-based admin session tokens with expiry.
 */
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '') || req.headers['x-admin-token'];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Admin authorization token required.' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden. Admin role required.' });
    }
    req.adminSession = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Admin session expired or invalid. Please login again.' });
  }
}

/**
 * API Key Authentication Middleware
 * Validates x-api-key header against the clients table.
 * Attaches req.authenticatedClient on success.
 */
async function requireApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  if (!apiKey) {
    return res.status(401).json({ success: false, error: 'API Key required. Pass x-api-key header.' });
  }

  try {
    const rows = await query("SELECT * FROM clients WHERE api_key = $1 AND api_key_status = 'ACTIVE'", [apiKey]);
    const client = rows[0];
    if (!client) {
      return res.status(401).json({ success: false, error: 'Invalid or revoked API Key.' });
    }

    req.authenticatedClient = client;
    return next();
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Database error validating API key.' });
  }
}

/**
 * Customer JWT Auth Middleware
 * Validates Bearer JWT token for customer routes.
 * Attaches req.customer on success.
 */
async function requireCustomerAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const rows = await query('SELECT * FROM clients WHERE client_id = $1 OR mobile_no = $2', [decoded.clientId, decoded.mobileNo]);
    const client = rows[0];

    if (!client) {
      return res.status(404).json({ success: false, error: 'Customer account not found.' });
    }

    req.customer = client;
    req.customerToken = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token. Please login again.' });
  }
}

/**
 * Input Validation Helpers
 */
function validateMobile(mobileNo) {
  if (!mobileNo) return 'Mobile number is required.';
  let clean = String(mobileNo).trim().replace(/[\s\-+]/g, '');

  // Strip leading 0
  if (clean.startsWith('0')) clean = clean.substring(1);

  // Strip country code 91 ONLY if length > 10
  if (clean.startsWith('91') && clean.length > 10) {
    clean = clean.substring(2);
  }

  if (!config.MOBILE_REGEX.test(clean)) {
    return 'Invalid mobile number. Must be a 10-digit Indian mobile number starting with 6-9.';
  }
  return null; // valid
}

function validateEmail(email) {
  if (!email) return null; // optional
  if (!config.EMAIL_REGEX.test(String(email).trim())) {
    return 'Invalid email address format.';
  }
  return null;
}

function validateGstin(gstin) {
  if (!gstin) return null; // optional
  const clean = String(gstin).trim().toUpperCase();
  if (clean.length > 0 && !config.GSTIN_REGEX.test(clean)) {
    return 'Invalid GSTIN format. Expected 15-character alphanumeric (e.g., 22AAAAA0000A1Z5).';
  }
  return null;
}

module.exports = {
  requireAdminAuth,
  requireApiKey,
  requireCustomerAuth,
  validateMobile,
  validateEmail,
  validateGstin,
  adminSessions
};
