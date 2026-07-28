const express = require('express');
const router = express.Router();
const { requireAdminAuth } = require('../middleware/auth');
const SettingsService = require('../services/settingsService');
const { sendTestEmail } = require('../utils/emailService');

// Require Admin Authentication for all settings routes
router.use(requireAdminAuth);

/**
 * GET /api/v1/admin/settings
 * Fetch all system settings
 */
router.get('/', async (req, res) => {
  try {
    const settings = await SettingsService.getAllSettings();
    return res.json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/v1/admin/settings
 * Update system settings in bulk
 */
router.put('/', async (req, res) => {
  try {
    const settingsObj = req.body.settings;
    if (!settingsObj || typeof settingsObj !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid settings payload.' });
    }
    
    await SettingsService.updateSettings(settingsObj);
    return res.json({ success: true, message: 'Settings updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/admin/settings/test-smtp
 * Test SMTP connection with the currently saved settings
 */
router.post('/test-smtp', async (req, res) => {
  try {
    const { testEmail } = req.body;
    if (!testEmail) {
      return res.status(400).json({ success: false, error: 'testEmail is required.' });
    }

    const result = await sendTestEmail(testEmail);
    if (result.success) {
      return res.json({ success: true, message: 'Test email sent successfully!' });
    } else {
      return res.status(400).json({ success: false, error: result.error || 'Failed to send test email.' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
