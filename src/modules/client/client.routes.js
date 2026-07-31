const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const config = require('../../config');
const { query, run } = require('../../db/database');
const { requireCustomerAuth, validateMobile, validateEmail, validateGstin } = require('../../middleware/auth');
const { generateRequestCode } = require('../../utils/keyGenerator');
const { findOrCreateClient, bindMachine, createSubscription } = require('../../services/registrationService');
const logger = require('../../utils/logger');

/**
 * POST /api/v1/client/register-company
 * Complete Company Registration & Dual Key Generation Engine
 */
router.post('/register-company', async (req, res) => {
  try {
    const {
      firmName,
      ownerName,
      mobileNo,
      email,
      gstin,
      address,
      tallySerial,
      requestCode,
      planType = 'TRIAL'
    } = req.body;

    if (!firmName || !mobileNo) {
      return res.status(400).json({
        success: false,
        error: 'Firm Name and Mobile Number are required.'
      });
    }

    // Input validation
    const mobileErr = validateMobile(mobileNo);
    if (mobileErr) return res.status(400).json({ success: false, error: mobileErr });

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ success: false, error: emailErr });

    const gstinErr = validateGstin(gstin);
    if (gstinErr) return res.status(400).json({ success: false, error: gstinErr });

    const finalRequestCode = requestCode || generateRequestCode(mobileNo);

    // 1. Find or Create Client
    const client = await findOrCreateClient({
      mobileNo, firmName, ownerName, email, gstin, address
    });

    // 2. Machine Binding
    await bindMachine(client.id, finalRequestCode, { tallySerial: tallySerial || null });

    // 3. Create Subscription (deduplication built in)
    const subResult = await createSubscription(client.id, finalRequestCode, planType);

    // Audit Log Entry
    logger.audit('REGISTRATION', 'COMPANY_REGISTERED', {
      clientId: client.id,
      requestCode: finalRequestCode,
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      details: { firmName, mobileNo, email, planType, activationKey: subResult.activationKey, isExisting: subResult.isExisting }
    });

    // Trigger Welcome & Activation Email (non-blocking)
    if (email) {
      sendActivationKeyEmail({
        toEmail: email,
        firmName,
        ownerName,
        activationKey: subResult.activationKey,
        userApiKey: client.api_key,
        planType,
        expiresAt: subResult.expiresAt,
        requestCode: finalRequestCode
      }).catch(err => logger.error('Email', 'Async activation email failed', { error: err.message }));
    }

    return res.json({
      success: true,
      firmName,
      mobileNo,
      requestCode: finalRequestCode,
      tallySerial: tallySerial || null,
      planType,
      activationKey: subResult.activationKey,
      userApiKey: client.api_key,
      validDays: subResult.validDays,
      expiresAt: subResult.expiresAt,
      isExistingSubscription: subResult.isExisting,
      message: subResult.isExisting
        ? 'Company already has an active subscription. Returning existing credentials.'
        : 'Company registration successful! Dual Key credentials generated.'
    });
  } catch (err) {
    logger.error('Registration', 'Company registration error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/client/settings/download
 */
router.get('/settings/download', async (req, res) => {
  try {
    const { requestCode, apiKey } = req.query;
    if (!requestCode && !apiKey) {
      return res.status(400).json({ success: false, error: 'requestCode or apiKey required.' });
    }

    let client = null;
    if (requestCode) {
      const rows = await query('SELECT * FROM machine_bindings WHERE request_code = $1', [requestCode]);
      const binding = rows[0];
      if (binding) {
        const clientRows = await query('SELECT * FROM clients WHERE id = $1', [binding.client_id]);
        client = clientRows[0];
      }
    } else if (apiKey) {
      const rows = await query('SELECT * FROM clients WHERE api_key = $1', [apiKey]);
      client = rows[0];
    }

    if (!client) {
      return res.status(404).json({ success: false, error: 'Client configuration not found.' });
    }

    const subRows = await query('SELECT * FROM subscriptions WHERE client_id = $1 ORDER BY created_at DESC LIMIT 1', [client.id]);
    const sub = subRows[0];

    return res.json({
      success: true,
      firmName: client.firm_name,
      ownerName: client.owner_name || '',
      mobileNo: client.mobile_no,
      email: client.email || '',
      gstin: client.gstin || '',
      address: client.address || '',
      autoSyncFarmers: client.auto_sync_farmers !== undefined ? client.auto_sync_farmers : 1,
      autoSyncDealers: client.auto_sync_dealers !== undefined ? client.auto_sync_dealers : 1,
      syncIntervalMins: client.sync_interval_mins || 15,
      voucherTypeMapping: 'Sales',
      activationKey: sub ? sub.activation_key : '',
      userApiKey: client.api_key,
      lastUpdated: client.updated_at
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/client/settings/update
 */
router.post('/settings/update', requireCustomerAuth, async (req, res) => {
  try {
    const { firmName, ownerName, email, gstin, address, autoSyncFarmers, autoSyncDealers, syncIntervalMins } = req.body;
    
    // Extract authenticated user's mobile number
    const mobileNo = req.customer.mobile_no;
    if (!mobileNo) return res.status(400).json({ success: false, error: 'Mobile Number missing from token.' });

    const rows = await query('SELECT * FROM clients WHERE mobile_no = $1', [mobileNo]);
    const client = rows[0];
    if (!client) return res.status(404).json({ success: false, error: 'Client not found.' });

    await run(
      `UPDATE clients
       SET firm_name = $1, owner_name = $2, email = $3, gstin = $4, address = $5,
           auto_sync_farmers = $6, auto_sync_dealers = $7, sync_interval_mins = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9`,
      [
        firmName || client.firm_name,
        ownerName || client.owner_name,
        email || client.email,
        gstin || client.gstin,
        address || client.address,
        autoSyncFarmers !== undefined ? (autoSyncFarmers ? 1 : 0) : client.auto_sync_farmers,
        autoSyncDealers !== undefined ? (autoSyncDealers ? 1 : 0) : client.auto_sync_dealers,
        syncIntervalMins || client.sync_interval_mins || 15,
        client.id
      ]
    );

    logger.audit('CLIENT', 'SETTINGS_UPDATED', { clientId: client.id, details: { firmName, mobileNo } });

    return res.json({ success: true, message: 'Cloud settings saved successfully! Desktop App will auto-download on next heartbeat.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/client/pair-desktop-machine
 */
router.post('/pair-desktop-machine', async (req, res) => {
  try {
    const { requestCode, pairingCode, mobileNo, tallySerial } = req.body;
    if (!requestCode || (!pairingCode && !mobileNo)) {
      return res.status(400).json({ success: false, error: 'requestCode and pairingCode (or mobileNo) are required.' });
    }

    let sub = null;
    let client = null;

    if (pairingCode) {
      const cleanKey = pairingCode.trim().toUpperCase();
      const subRows = await query('SELECT * FROM subscriptions WHERE activation_key = $1', [cleanKey]);
      sub = subRows[0];
      if (sub) {
        const clientRows = await query('SELECT * FROM clients WHERE id = $1', [sub.client_id]);
        client = clientRows[0];
      }
    }

    if (!client && mobileNo) {
      const clientRows = await query('SELECT * FROM clients WHERE mobile_no = $1', [mobileNo]);
      client = clientRows[0];
      if (client) {
        const subRows = await query('SELECT * FROM subscriptions WHERE client_id = $1 ORDER BY created_at DESC LIMIT 1', [client.id]);
        sub = subRows[0];
      }
    }

    if (!client || !sub) {
      return res.status(404).json({ success: false, error: 'Invalid pairing code or mobile number. Please check registration on Web Portal.' });
    }

    if (sub.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, error: 'Subscription is SUSPENDED by admin.' });
    }

    await bindMachine(client.id, requestCode, { tallySerial: tallySerial || null });

    const farmers = await query('SELECT * FROM shared_farmer_registry ORDER BY updated_at DESC LIMIT 200');
    const dealers = await query('SELECT * FROM shared_dealer_registry ORDER BY updated_at DESC LIMIT 200');

    const now = new Date();
    const expires = new Date(sub.expires_at);
    const daysRemaining = Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    logger.audit('LICENSE', 'DESKTOP_MACHINE_PAIRED', {
      clientId: client.id,
      requestCode,
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      details: { firmName: client.firm_name, tallySerial }
    });

    return res.json({
      success: true,
      paired: true,
      firmName: client.firm_name,
      ownerName: client.owner_name || '',
      mobileNo: client.mobile_no,
      email: client.email || '',
      gstin: client.gstin || '',
      address: client.address || '',
      userApiKey: client.api_key,
      activationKey: sub.activation_key,
      planType: sub.plan_type,
      status: sub.status,
      daysRemaining,
      expiresAt: sub.expires_at,
      autoSyncFarmers: client.auto_sync_farmers !== undefined ? client.auto_sync_farmers : 1,
      autoSyncDealers: client.auto_sync_dealers !== undefined ? client.auto_sync_dealers : 1,
      syncIntervalMins: client.sync_interval_mins || 15,
      initialFarmers: farmers,
      initialDealers: dealers,
      message: '🎉 Desktop Machine successfully paired with Cloud Portal Workspace!'
    });
  } catch (err) {
    logger.error('Pairing', 'Desktop pairing error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
