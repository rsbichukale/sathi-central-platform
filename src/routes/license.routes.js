const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { query, run } = require('../db/database');
const { findOrCreateClient, bindMachine, createSubscription } = require('../services/registrationService');
const logger = require('../utils/logger');

/**
 * POST /api/v1/license/register-trial
 * Registers a new machine for a 3-Day Free Trial
 */
router.post('/register-trial', async (req, res) => {
  try {
    const { requestCode, firmName, mobileNo, tallySerial, macAddress } = req.body;

    if (!requestCode || !mobileNo) {
      return res.status(400).json({ success: false, error: 'Request Code and Mobile Number are required.' });
    }

    // Use shared service
    const client = await findOrCreateClient({ mobileNo, firmName: firmName || 'Trial Client' });
    await bindMachine(client.id, requestCode, { tallySerial, macAddress });

    // Check for existing trial subscription
    const rows = await query("SELECT * FROM subscriptions WHERE client_id = $1 AND status = 'TRIAL'", [client.id]);
    let sub = rows[0];
    if (!sub) {
      const subResult = await createSubscription(client.id, requestCode, 'TRIAL');
      sub = subResult.subscription;
    }

    const expiresAt = new Date(sub.expires_at);
    const elapsedDays = Math.floor((Date.now() - new Date(sub.starts_at).getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 3 - elapsedDays);

    const token = jwt.sign(
      { clientId: client.id, requestCode, plan: 'TRIAL', expiresAt: sub.expires_at },
      config.JWT_SECRET,
      { expiresIn: config.JWT_LICENSE_EXPIRY }
    );

    logger.info('License', `Trial registered: ${mobileNo} (${requestCode})`);

    return res.json({
      success: true,
      mode: 'trial',
      plan: 'FREE_TRIAL',
      daysRemaining,
      expiresAt: sub.expires_at,
      token,
      apiKey: client.api_key
    });
  } catch (err) {
    logger.error('License', 'Trial registration error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/license/heartbeat
 * Subscription check-in endpoint
 */
router.post('/heartbeat', async (req, res) => {
  try {
    const { requestCode, macAddress, tallySerial } = req.body;
    if (!requestCode) {
      return res.status(400).json({ success: false, error: 'Request Code is required.' });
    }

    const bindRows = await query('SELECT * FROM machine_bindings WHERE request_code = $1', [requestCode]);
    const binding = bindRows[0];
    if (!binding) {
      return res.json({ success: false, valid: false, mode: 'unregistered', message: 'Machine not registered on platform.' });
    }

    // Update heartbeat
    await run('UPDATE machine_bindings SET last_heartbeat_at = CURRENT_TIMESTAMP WHERE id = $1', [binding.id]);

    const subRows = await query('SELECT * FROM subscriptions WHERE client_id = $1 ORDER BY created_at DESC LIMIT 1', [binding.client_id]);
    const sub = subRows[0];
    if (!sub) {
      return res.json({ success: false, valid: false, mode: 'no_subscription', message: 'No active subscription found.' });
    }

    const now = new Date();
    const expires = new Date(sub.expires_at);
    const isExpired = now > expires;

    if (isExpired) {
      return res.json({
        success: false,
        valid: false,
        mode: sub.status === 'TRIAL' ? 'trial_expired' : 'expired',
        message: 'Subscription has expired. Please renew or activate your key.'
      });
    }

    const daysRemaining = Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const token = jwt.sign(
      { clientId: binding.client_id, requestCode, plan: sub.plan_type, expiresAt: sub.expires_at },
      config.JWT_SECRET,
      { expiresIn: config.JWT_LICENSE_EXPIRY }
    );

    return res.json({
      success: true,
      valid: true,
      mode: sub.status === 'TRIAL' ? 'trial' : 'paid',
      plan: sub.plan_type,
      daysRemaining,
      expiresAt: sub.expires_at,
      signedToken: token
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/license/validate
 * Live Desktop App API validation with Suspension & Expiry enforcement
 */
router.post('/validate', async (req, res) => {
  try {
    const { requestCode, activationKey } = req.body;
    if (!requestCode) return res.status(400).json({ success: false, valid: false, message: 'Request Code required.' });

    const bindRows = await query('SELECT * FROM machine_bindings WHERE request_code = $1', [requestCode]);
    const binding = bindRows[0];
    if (!binding) {
      return res.json({ success: false, valid: false, status: 'UNREGISTERED', message: 'PC not registered. Please complete company registration.' });
    }

    // Update heartbeat
    await run('UPDATE machine_bindings SET last_heartbeat_at = CURRENT_TIMESTAMP WHERE id = $1', [binding.id]);

    const subRows = await query('SELECT * FROM subscriptions WHERE client_id = $1 ORDER BY created_at DESC LIMIT 1', [binding.client_id]);
    const sub = subRows[0];
    if (!sub) {
      return res.json({ success: false, valid: false, status: 'NO_SUBSCRIPTION', message: 'No active subscription found.' });
    }

    if (sub.status === 'SUSPENDED') {
      return res.json({
        success: false,
        valid: false,
        status: 'SUSPENDED',
        message: 'Your subscription has been SUSPENDED by system admin. Software locked. Contact support.'
      });
    }

    const now = new Date();
    const expires = new Date(sub.expires_at);
    if (now > expires || sub.status === 'EXPIRED') {
      return res.json({
        success: false,
        valid: false,
        status: 'EXPIRED',
        message: 'Subscription has EXPIRED. Software locked. Please enter a new Activation Key.'
      });
    }

    const daysRemaining = Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return res.json({
      success: true,
      valid: true,
      status: sub.status,
      planType: sub.plan_type,
      daysRemaining,
      activationKey: sub.activation_key,
      expiresAt: sub.expires_at
    });
  } catch (err) {
    return res.status(500).json({ success: false, valid: false, error: err.message });
  }
});

/**
 * POST /api/v1/license/activate
 * Binds 12-char activation key online
 */
router.post('/activate', async (req, res) => {
  try {
    const { requestCode, activationKey } = req.body;
    if (!requestCode || !activationKey) {
      return res.status(400).json({ success: false, error: 'Request Code and Activation Key are required.' });
    }

    const bindRows = await query('SELECT * FROM machine_bindings WHERE request_code = $1', [requestCode]);
    const binding = bindRows[0];
    if (!binding) {
      return res.status(404).json({ success: false, error: 'Machine Request Code not found.' });
    }

    const keyClean = activationKey.trim().toUpperCase();
    const now = new Date();
    const expires = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const subId = 'sub_' + crypto.randomBytes(8).toString('hex');

    await run(
      `INSERT INTO subscriptions (id, client_id, activation_key, plan_type, status, starts_at, expires_at)
       VALUES ($1, $2, $3, 'ANNUAL_PRO', 'ACTIVE', $4, $5)`,
      [subId, binding.client_id, keyClean, now.toISOString(), expires.toISOString()]
    );

    const token = jwt.sign(
      { clientId: binding.client_id, requestCode, plan: 'ANNUAL_PRO', expiresAt: expires.toISOString() },
      config.JWT_SECRET,
      { expiresIn: config.JWT_LICENSE_EXPIRY }
    );

    logger.info('License', `Key activated: ${requestCode} → ${keyClean}`);

    return res.json({
      success: true,
      mode: 'paid',
      plan: 'ANNUAL_PRO',
      daysRemaining: 365,
      expiresAt: expires.toISOString(),
      token
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
