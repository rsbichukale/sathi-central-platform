/**
 * Activation Key Generator Utility
 * 
 * Generates 12-character activation keys in XXXX-XXXX-XXXX format.
 * Previously copy-pasted across 4 route files — now centralized.
 */
const crypto = require('crypto');
const LicenseKeyManager = require('./licenseKeyManager');

/**
 * Generate a 25-character Microsoft-style Product Key
 * 
 * @param {Date|string} expiryDate - Expiry Date
 * @returns {string} Formatted key like "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
 */
function generateActivationKey(expiryDate) {
  const serialNumber = crypto.randomBytes(4).readUInt32BE(0);
  return LicenseKeyManager.generateKey(serialNumber, expiryDate instanceof Date ? expiryDate.toISOString() : expiryDate);
}

const SettingsService = require('../services/settingsService');

/**
 * Get validity days for a given plan type
 * @param {string} planType
 * @returns {number}
 */
function getValidityDays(planType) {
  const settings = SettingsService.getAllSettings();
  switch (planType) {
    case 'TRIAL': return parseInt(settings.plan_trial_days, 10) || 3;
    case 'ENTERPRISE': return parseInt(settings.plan_enterprise_days, 10) || 730;
    case 'ANNUAL_PRO':
    default: return parseInt(settings.plan_annual_days, 10) || 365;
  }
}

/**
 * Get amount in paise for a given plan type
 * @param {string} planType
 * @returns {number}
 */
function getAmountPaise(planType) {
  const settings = SettingsService.getAllSettings();
  switch (planType) {
    case 'TRIAL': return 0;
    case 'ENTERPRISE': return parseInt(settings.plan_enterprise_price, 10) || 1299900;
    case 'ANNUAL_PRO':
    default: return parseInt(settings.plan_annual_price, 10) || 499900;
  }
}

/**
 * Generate a request code from mobile number (auto-generate when not provided)
 * @param {string} mobileNo
 * @returns {string}
 */
function generateRequestCode(mobileNo) {
  const digits = String(mobileNo).replace(/[^0-9]/g, '');
  const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `REQ-${digits}-${suffix}`;
}

module.exports = {
  generateActivationKey,
  getValidityDays,
  getAmountPaise,
  generateRequestCode
};
