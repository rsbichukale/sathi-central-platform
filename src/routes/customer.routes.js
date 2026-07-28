const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { query, run } = require('../db/database');
const { requireCustomerAuth, validateMobile, validateEmail } = require('../middleware/auth');
const { generateRequestCode } = require('../utils/keyGenerator');
const { findOrCreateClient, bindMachine, createSubscription } = require('../services/registrationService');
const logger = require('../utils/logger');

/**
 * POST /api/v1/customer/register
 * Customer Signup
 */
router.post('/register', async (req, res) => {
  try {
    const { firmName, ownerName, mobileNo, email, password } = req.body;

    if (!firmName || !mobileNo || !password) {
      return res.status(400).json({ success: false, error: 'Firm Name, Mobile Number, and Password are required.' });
    }

    const mobileErr = validateMobile(mobileNo);
    if (mobileErr) return res.status(400).json({ success: false, error: mobileErr });

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ success: false, error: emailErr });

    const rows = await query('SELECT * FROM clients WHERE mobile_no = $1', [mobileNo]);
    let existing = rows[0];
    if (existing && existing.client_secret_hash && existing.client_secret_hash !== 'unset') {
      return res.status(400).json({ success: false, error: 'An account with this mobile number already exists.' });
    }

    const client = await findOrCreateClient({
      mobileNo, firmName, ownerName, email, password
    });

    const token = jwt.sign(
      { clientId: client.client_id, mobileNo: client.mobile_no },
      config.JWT_SECRET,
      { expiresIn: config.JWT_CUSTOMER_EXPIRY }
    );

    logger.info('Customer', `New customer registered: ${firmName} (${mobileNo})`);

    return res.json({
      success: true,
      token,
      customer: {
        clientId: client.client_id,
        firmName: client.firm_name,
        ownerName: client.owner_name || '',
        mobileNo: client.mobile_no,
        email: client.email || '',
        apiKey: client.api_key
      }
    });
  } catch (err) {
    logger.error('Customer', 'Registration error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/customer/login
 * Customer Login
 */
router.post('/login', async (req, res) => {
  try {
    const { mobileNo, password } = req.body;
    if (!mobileNo || !password) {
      return res.status(400).json({ success: false, error: 'Mobile Number and Password are required.' });
    }

    const rows = await query('SELECT * FROM clients WHERE mobile_no = $1', [mobileNo]);
    const client = rows[0];
    if (!client) {
      return res.status(404).json({ success: false, error: 'Account not found. Please sign up first.' });
    }

    if (client.client_secret_hash === 'unset' || client.client_secret_hash === 'secret') {
      return res.status(403).json({
        success: false,
        error: 'Password not set for this account. Please register first to set your password.',
        requiresRegistration: true
      });
    }

    const isMatch = await bcrypt.compare(password, client.client_secret_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid password. Please try again.' });
    }

    const token = jwt.sign(
      { clientId: client.client_id, mobileNo: client.mobile_no },
      config.JWT_SECRET,
      { expiresIn: config.JWT_CUSTOMER_EXPIRY }
    );

    logger.info('Customer', `Customer login: ${client.firm_name} (${mobileNo})`);

    return res.json({
      success: true,
      token,
      customer: {
        clientId: client.client_id,
        firmName: client.firm_name,
        ownerName: client.owner_name,
        mobileNo: client.mobile_no,
        email: client.email,
        apiKey: client.api_key
      }
    });
  } catch (err) {
    logger.error('Customer', 'Login error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/customer/me
 * Fetch Customer Dashboard Data
 */
router.get('/me', requireCustomerAuth, async (req, res) => {
  try {
    const client = req.customer;

    const bindings = await query('SELECT * FROM machine_bindings WHERE client_id = $1', [client.id]);
    const subscriptions = await query('SELECT * FROM subscriptions WHERE client_id = $1 ORDER BY created_at DESC', [client.id]);

    const formattedSubs = subscriptions.map(s => {
      const expires = new Date(s.expires_at);
      const now = new Date();
      const daysRemaining = Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      return {
        id: s.id,
        activationKey: s.activation_key,
        planType: s.plan_type,
        status: s.status,
        expiresAt: s.expires_at,
        daysRemaining
      };
    });

    return res.json({
      success: true,
      customer: {
        firmName: client.firm_name,
        ownerName: client.owner_name,
        mobileNo: client.mobile_no,
        email: client.email,
        apiKey: client.api_key
      },
      machines: bindings,
      subscriptions: formattedSubs
    });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid token: ' + err.message });
  }
});

/**
 * POST /api/v1/customer/purchase
 * Process Subscription Purchase & Generate Key
 */
router.post('/purchase', async (req, res) => {
  try {
    const { mobileNo, requestCode, planType = 'ANNUAL_PRO' } = req.body;
    if (!mobileNo) {
      return res.status(400).json({ success: false, error: 'Mobile Number is required.' });
    }

    const finalRequestCode = requestCode || generateRequestCode(mobileNo);

    const client = await findOrCreateClient({ mobileNo });
    await bindMachine(client.id, finalRequestCode);
    const subResult = await createSubscription(client.id, finalRequestCode, planType);

    logger.info('Customer', `Purchase: ${mobileNo} → ${planType} (${subResult.activationKey})`);

    return res.json({
      success: true,
      planType,
      activationKey: subResult.activationKey,
      validDays: subResult.validDays,
      expiresAt: subResult.expiresAt,
      isExistingSubscription: subResult.isExisting,
      message: `Subscription purchase successful! Your activation key is ${subResult.activationKey}`
    });
  } catch (err) {
    logger.error('Customer', 'Purchase error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
