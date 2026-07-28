/**
 * Centralized Configuration Module
 * All environment variables, secrets, and constants in one place.
 * 
 * IMPORTANT: In production, set these via environment variables.
 * Never commit real secrets to source control.
 */

const config = {
  // Server
  PORT: parseInt(process.env.PORT) || 9090,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Admin Authentication
  // In production, ADMIN_PASSWORD MUST be set via environment variable.
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || null,
  ADMIN_TOKEN_EXPIRY_HOURS: parseInt(process.env.ADMIN_TOKEN_EXPIRY_HOURS) || 24,

  // JWT (unified across all routes)
  JWT_SECRET: process.env.JWT_SECRET || 'ruractive_unified_jwt_secret_2026',
  JWT_CUSTOMER_EXPIRY: process.env.JWT_CUSTOMER_EXPIRY || '30d',
  JWT_LICENSE_EXPIRY: process.env.JWT_LICENSE_EXPIRY || '7d',

  // Razorpay Payment Gateway
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_ruractive2026',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'test_secret_key_2026',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_ruractive2026',

  // Email & SMTP Configuration
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'Ruractive Technology <noreply@ruractive.com>',
  ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL || 'support@ruractive.com',

  // CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
    : ['http://localhost:9090', 'http://127.0.0.1:9090', 'http://localhost:5173'],

  // Rate Limiting
  AUTH_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
  AUTH_RATE_LIMIT_MAX: 15,
  PAYMENT_RATE_LIMIT_WINDOW_MS: 60 * 1000,     // 1 minute
  PAYMENT_RATE_LIMIT_MAX: 30,
  ADMIN_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  ADMIN_RATE_LIMIT_MAX: 50,

  // Validation Patterns
  MOBILE_REGEX: /^[6-9]\d{9}$/,
  GSTIN_REGEX: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// Startup validation warnings
if (!process.env.ADMIN_PASSWORD) {
  console.warn('[Config] ⚠️  ADMIN_PASSWORD not set. Admin login is DISABLED in production mode.');
}
if (!process.env.JWT_SECRET) {
  console.warn('[Config] ⚠️  JWT_SECRET not set. Using default development secret.');
}
if (!process.env.RAZORPAY_KEY_ID) {
  console.warn('[Config] ⚠️  RAZORPAY_KEY_ID not set. Using test key.');
}

module.exports = config;
