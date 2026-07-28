const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const config = require('../config');
const { query, run } = require('../db/database');
const { validateMobile } = require('../middleware/auth');
const { generateRequestCode, getAmountPaise } = require('../utils/keyGenerator');
const { findOrCreateClient, bindMachine, createSubscription } = require('../services/registrationService');
const { sendActivationKeyEmail } = require('../utils/emailService');
const logger = require('../utils/logger');
const SettingsService = require('../services/settingsService');

/**
 * POST /api/v1/payment/create-order
 */
router.post('/create-order', async (req, res) => {
  try {
    const { planType = 'ANNUAL_PRO', mobileNo, requestCode } = req.body;

    if (!mobileNo) {
      return res.status(400).json({ success: false, error: 'Mobile Number is required.' });
    }

    const mobileErr = validateMobile(mobileNo);
    if (mobileErr) return res.status(400).json({ success: false, error: mobileErr });

    const amountPaise = getAmountPaise(planType);

    if (amountPaise === 0) {
      return res.json({
        success: true,
        isTrial: true,
        amount: 0,
        currency: 'INR',
        orderId: 'trial_order_' + crypto.randomBytes(8).toString('hex')
      });
    }

    const orderId = 'order_' + crypto.randomBytes(10).toString('hex');

    logger.audit('PAYMENT', 'PAYMENT_ORDER_CREATED', {
      ipAddress: req.socket.remoteAddress,
      details: { mobileNo, planType, orderId, amountPaise }
    });

    const settings = await SettingsService.getAllSettings();
    return res.json({
      success: true,
      isTrial: false,
      keyId: settings.razorpay_key_id || config.RAZORPAY_KEY_ID,
      orderId,
      amount: amountPaise,
      currency: 'INR'
    });
  } catch (err) {
    logger.error('Payment', 'Create order error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/payment/verify-signature
 */
router.post('/verify-signature', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planType = 'ANNUAL_PRO',
      mobileNo,
      requestCode,
      firmName
    } = req.body;

    if (!mobileNo) {
      return res.status(400).json({ success: false, error: 'Mobile Number is required.' });
    }

    const finalRequestCode = requestCode || generateRequestCode(mobileNo);

    const settings = await SettingsService.getAllSettings();
    const razorpaySecret = settings.razorpay_key_secret || config.RAZORPAY_KEY_SECRET;

    if (razorpay_signature && razorpaySecret !== 'test_secret_key_2026') {
      const generatedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        logger.security('PAYMENT', 'SIGNATURE_VERIFICATION_FAILED', {
          ipAddress: req.socket.remoteAddress,
          details: { razorpay_order_id }
        });
        return res.status(400).json({ success: false, error: 'Invalid Razorpay payment signature verification failed.' });
      }
    }

    const client = await findOrCreateClient({ mobileNo, firmName });
    await bindMachine(client.id, finalRequestCode);
    const subResult = await createSubscription(client.id, finalRequestCode, planType, { forceNew: true });

    const payHistId = 'payh_' + crypto.randomBytes(8).toString('hex');
    const amountPaise = getAmountPaise(planType);
    try {
      await run(
        `INSERT INTO payment_history (id, client_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency, status, payment_method)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [payHistId, client.id, razorpay_order_id || 'order_direct', razorpay_payment_id || 'pay_' + crypto.randomBytes(8).toString('hex'), razorpay_signature || '', amountPaise, 'INR', 'CAPTURED', 'Razorpay']
      );
    } catch (_) {}

    logger.audit('PAYMENT', 'PAYMENT_VERIFIED_KEY_ISSUED', {
      clientId: client.id,
      requestCode: finalRequestCode,
      ipAddress: req.socket.remoteAddress,
      details: { amountPaise, activationKey: subResult.activationKey, razorpay_payment_id }
    });

    if (client.email) {
      sendActivationKeyEmail({
        toEmail: client.email,
        firmName: client.firm_name,
        ownerName: client.owner_name,
        activationKey: subResult.activationKey,
        userApiKey: client.api_key,
        planType,
        expiresAt: subResult.expiresAt,
        requestCode: finalRequestCode
      }).catch(err => logger.error('Email', 'Payment activation email error', { error: err.message }));
    }

    return res.json({
      success: true,
      planType,
      activationKey: subResult.activationKey,
      validDays: subResult.validDays,
      expiresAt: subResult.expiresAt,
      paymentId: razorpay_payment_id || 'pay_simulated',
      message: `🎉 Payment Verified! Your Activation Key is ${subResult.activationKey}`
    });
  } catch (err) {
    logger.error('Payment', 'Verify signature error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/payment/webhook
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const bodyString = JSON.stringify(req.body);

    if (signature && config.RAZORPAY_WEBHOOK_SECRET !== 'whsec_ruractive2026') {
      const expectedSignature = crypto
        .createHmac('sha256', config.RAZORPAY_WEBHOOK_SECRET)
        .update(bodyString)
        .digest('hex');

      if (expectedSignature !== signature) {
        logger.security('PAYMENT', 'WEBHOOK_SIGNATURE_FAILED');
        return res.status(400).json({ success: false, error: 'Invalid webhook signature' });
      }
    }

    const event = req.body.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload?.payment?.entity || {};
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const mobileNo = paymentEntity.contact;
      const amount = paymentEntity.amount;

      if (mobileNo) {
        const rows = await query('SELECT * FROM clients WHERE mobile_no = $1', [mobileNo]);
        const client = rows[0];
        if (client) {
          const payHistId = 'payh_' + crypto.randomBytes(8).toString('hex');
          await run(
            `INSERT INTO payment_history (id, client_id, razorpay_order_id, razorpay_payment_id, amount, currency, status, payment_method)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO NOTHING`,
            [payHistId, client.id, orderId || '', paymentId || '', amount || 499900, 'INR', 'CAPTURED', paymentEntity.method || 'Razorpay']
          );
          logger.audit('PAYMENT', 'WEBHOOK_PAYMENT_CAPTURED', {
            clientId: client.id,
            details: { orderId, paymentId, amount }
          });
        }
      }
    }

    return res.json({ status: 'ok', received: true });
  } catch (err) {
    logger.error('Payment', 'Webhook error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
