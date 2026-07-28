const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { query, run } = require('../db/database');
const { validateMobile, validateEmail } = require('../middleware/auth');
const { sendInquiryNotificationEmail } = require('../utils/emailService');
const logger = require('../utils/logger');

/**
 * POST /api/v1/inquiry/submit
 * Persist lead inquiry to database & send lead notification email
 */
router.post('/submit', async (req, res) => {
  try {
    const { name, mobile, email, service, message } = req.body;
    if (!name || !mobile) {
      return res.status(400).json({ success: false, error: 'Name and Mobile number are required.' });
    }

    const mobileErr = validateMobile(mobile);
    if (mobileErr) return res.status(400).json({ success: false, error: mobileErr });

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ success: false, error: emailErr });

    const id = 'inq_' + crypto.randomBytes(6).toString('hex');

    await run(
      `INSERT INTO inquiries (id, name, mobile, email, service, message) VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, name.trim(), mobile.trim(), email || '', service || 'General Inquiry', message || '']
    );

    logger.audit('INQUIRY', 'LEAD_INQUIRY_SUBMITTED', {
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      details: { name, mobile, email, service, message }
    });

    sendInquiryNotificationEmail({ name, mobile, email, service, message })
      .catch(err => logger.error('Email', 'Inquiry email notification error', { error: err.message }));

    return res.json({
      success: true,
      message: 'Thank you! Your inquiry has been received. Ruractive Technology team will contact you shortly.'
    });
  } catch (err) {
    logger.error('Inquiry', 'Inquiry submission error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
