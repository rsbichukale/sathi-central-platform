/**
 * Complete Email & SMTP Management Engine
 * Handles HTML email dispatch, DB log tracking, and templates for:
 * - 🔑 Welcome & Activation Keys
 * - 📩 Sales Lead Notifications
 * - ⏰ License Expiry & Renewal Reminders
 * - 🔒 License Status Change Alerts (Revoked / Suspended / Reactivated)
 * - 🔑 Password Reset OTP Emails
 * - 🧪 Admin SMTP Connection Test Emails
 */
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const config = require('../config');
const { query, run } = require('../db/database');
const logger = require('./logger');

const SettingsService = require('../services/settingsService');

/**
 * Check if SMTP credentials are configured
 */
async function isSmtpConfigured(settings) {
  if (!settings) {
    settings = await SettingsService.getAllSettings();
  }
  return Boolean(settings.smtp_host && settings.smtp_user && settings.smtp_pass);
}

/**
 * Get Nodemailer Transporter dynamically using current settings
 */
async function getTransporter() {
  const settings = await SettingsService.getAllSettings();
  if (!(await isSmtpConfigured(settings))) {
    return null;
  }

  return nodemailer.createTransport({
    host: settings.smtp_host,
    port: parseInt(settings.smtp_port, 10) || 465,
    secure: parseInt(settings.smtp_port, 10) === 465, // True for 465, false for other ports
    auth: {
      user: settings.smtp_user,
      pass: settings.smtp_pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Log email dispatch in `email_logs` SQLite table
 */
function logEmailToDb(recipientEmail, subject, templateType, status, messageId = '', errorMessage = '') {
  try {
    const id = 'elog_' + crypto.randomBytes(8).toString('hex');
    run(
      `INSERT INTO email_logs (id, recipient_email, subject, template_type, status, message_id, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, recipientEmail, subject, templateType, status, messageId || null, errorMessage || null]
    ).catch(err => console.error('[EmailDBErr]', err.message));
  } catch (_) {}
}

/**
 * Core send mail wrapper with DB Outbox Logging & Dev Mode Preview Fallback
 */
async function sendMail({ to, subject, html, text, templateType = 'GENERAL' }) {
  const mailTransporter = await getTransporter();

  if (!mailTransporter) {
    logger.info('Email', `[Dev Mode Preview] Email to <${to}> (${templateType}): "${subject}"`);
    logEmailToDb(to, subject, templateType, 'DEV_MODE', 'dev_preview_id');
    return {
      success: true,
      devMode: true,
      message: 'SMTP credentials not configured. Email logged in console preview mode.'
    };
  }

  try {
    const settings = SettingsService.getAllSettings();
    const info = await mailTransporter.sendMail({
      from: settings.smtp_from || 'noreply@yourdomain.com',
      to,
      subject,
      text: text || subject,
      html
    });

    logEmailToDb(to, subject, templateType, 'SENT', info.messageId);
    logger.audit('EMAIL', 'EMAIL_DISPATCH_SUCCESS', { details: { to, subject, templateType, messageId: info.messageId } });

    return {
      success: true,
      devMode: false,
      messageId: info.messageId
    };
  } catch (err) {
    logEmailToDb(to, subject, templateType, 'FAILED', '', err.message);
    logger.error('Email', `Failed to send email to <${to}>: ${err.message}`, { error: err.message });
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * 🔑 Send Welcome & Activation Key Email
 */
async function sendActivationKeyEmail({ toEmail, firmName, ownerName, activationKey, userApiKey, planType, expiresAt, requestCode }) {
  if (!toEmail) return { success: false, error: 'No recipient email provided.' };

  const subject = `🔑 Welcome to SATHI Connector - Your Activation Key (${firmName})`;
  const formattedDate = expiresAt ? new Date(expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '1 Year';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px rgba(15,23,42,0.08); }
        .header { background: linear-gradient(135deg, #059669, #2563eb); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
        .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 14px; }
        .body { padding: 32px 24px; }
        .key-box { background: #f0fdf4; border: 2px dashed #059669; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .key-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #059669; font-weight: 800; margin-bottom: 6px; }
        .key-code { font-family: monospace; font-size: 28px; font-weight: 900; color: #0f172a; letter-spacing: 2px; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .details-table td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .details-table td.label { font-weight: 700; color: #64748b; width: 40%; }
        .details-table td.value { font-weight: 600; color: #0f172a; }
        .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .badge { display: inline-block; background: #2563eb; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>⚡ Ruractive Technology</h1>
          <p>SATHI Tally Connector & Cloud Workspace</p>
        </div>
        <div class="body">
          <h2>Hello, ${ownerName || firmName}! 🎉</h2>
          <p>Thank you for choosing SATHI Connector. Your software subscription has been successfully provisioned!</p>
          
          <div class="key-box">
            <div class="key-title">Your 12-Character Activation Key</div>
            <div class="key-code">${activationKey}</div>
          </div>

          <table class="details-table">
            <tr><td class="label">Firm Name</td><td class="value">${firmName}</td></tr>
            <tr><td class="label">Subscription Plan</td><td class="value"><span class="badge">${planType}</span></td></tr>
            <tr><td class="label">Valid Until</td><td class="value">${formattedDate}</td></tr>
            <tr><td class="label">Request Code</td><td class="value" style="font-family:monospace;">${requestCode || 'Auto-Paired'}</td></tr>
            <tr><td class="label">User API Key</td><td class="value" style="font-family:monospace;">${userApiKey}</td></tr>
          </table>

          <h3>🚀 Next Steps for Installation:</h3>
          <ol style="font-size: 14px; line-height: 1.6; color: #334155;">
            <li>Launch <strong>SATHI Desktop Application</strong> on your PC.</li>
            <li>Enter your <strong>Activation Key</strong> (<code>${activationKey}</code>).</li>
            <li>Your software will automatically connect and sync with Tally & Cloud Registry!</li>
          </ol>
        </div>
        <div class="footer">
          &copy; 2026 Ruractive Technology. All rights reserved.<br>
          Need support? Contact us at support@ruractive.com
        </div>
      </div>
    </body>
    </html>
  `;

  return sendMail({
    to: toEmail,
    subject,
    text: `Welcome to SATHI Connector! Firm: ${firmName}, Key: ${activationKey}, Plan: ${planType}, Expires: ${formattedDate}`,
    html,
    templateType: 'ACTIVATION_KEY'
  });
}

/**
 * 📩 Send Sales Lead Inquiry Notification to Admin
 */
async function sendInquiryNotificationEmail({ name, mobile, email, service, message }) {
  const adminEmail = config.ADMIN_NOTIFICATION_EMAIL;
  const subject = `📩 New Sales Inquiry: ${name} (${service || 'General'})`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; color: #0f172a; padding: 24px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 10px 25px rgba(15,23,42,0.08); }
        .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; }
        .table td { padding: 8px 0; font-size: 14px; }
        .table td.label { font-weight: 700; color: #64748b; width: 35%; }
        .msg-box { background: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 14px; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h2 style="margin:0; color:#2563eb;">📩 New Quote Inquiry Submitted</h2>
        </div>
        <table class="table">
          <tr><td class="label">Customer Name</td><td><strong>${name}</strong></td></tr>
          <tr><td class="label">Mobile Number</td><td><a href="tel:${mobile}">${mobile}</a></td></tr>
          <tr><td class="label">Email Address</td><td>${email || 'N/A'}</td></tr>
          <tr><td class="label">Service Requested</td><td><span style="background:#e0e7ff; color:#3730a3; padding:2px 8px; border-radius:4px; font-weight:700;">${service || 'General Inquiry'}</span></td></tr>
          <tr><td class="label">Submitted At</td><td>${new Date().toLocaleString('en-IN')}</td></tr>
        </table>
        <div class="msg-box">
          <strong>Customer Message:</strong><br>
          ${message || 'No additional details provided.'}
        </div>
      </div>
    </body>
    </html>
  `;

  return sendMail({
    to: adminEmail,
    subject,
    text: `New Inquiry from ${name} (${mobile}). Service: ${service}. Message: ${message}`,
    html,
    templateType: 'SALES_INQUIRY'
  });
}

/**
 * ⏰ Send Subscription Expiry Warning Email
 */
async function sendExpiryWarningEmail({ toEmail, firmName, daysRemaining, expiresAt, activationKey }) {
  if (!toEmail) return { success: false, error: 'No email recipient.' };

  const subject = `⚠️ Subscription Expiring in ${daysRemaining} Days - SATHI Connector (${firmName})`;
  const formattedDate = new Date(expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #fde68a; padding: 24px;">
      <h2 style="color: #b45309; margin-top: 0;">⚠️ Subscription Expiry Warning</h2>
      <p>Dear ${firmName},</p>
      <p>Your <strong>SATHI Tally Connector</strong> subscription is set to expire in <strong style="color:#b45309;">${daysRemaining} Days</strong> (on ${formattedDate}).</p>
      <div style="background: #fffbeb; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 18px; text-align: center; font-weight: 800; color: #78350f; margin: 16px 0;">
        Activation Key: ${activationKey}
      </div>
      <p>To ensure uninterrupted Tally data synchronization, please renew your subscription or purchase an annual pro key online.</p>
      <p><a href="http://127.0.0.1:9090/register" style="display: inline-block; background: #059669; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none;">Renew Subscription Now 💳</a></p>
    </div>
  `;

  return sendMail({ to: toEmail, subject, text: subject, html, templateType: 'EXPIRY_WARNING' });
}

/**
 * 🔒 Send License Status Change Notification Email
 */
async function sendLicenseStatusEmail({ toEmail, firmName, status, requestCode }) {
  if (!toEmail) return { success: false, error: 'No email recipient.' };

  const isSuspended = status === 'SUSPENDED';
  const isRevoked = status === 'EXPIRED';
  const subject = `🔔 License Status Alert: Subscription ${status} (${firmName})`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px;">
      <h2 style="color: ${isSuspended || isRevoked ? '#dc2626' : '#059669'}; margin-top: 0;">
        ${isSuspended ? '⛔ Subscription Suspended' : isRevoked ? '❌ License Revoked' : '✅ Subscription Reactivated'}
      </h2>
      <p>Dear ${firmName},</p>
      <p>The subscription status for your PC Machine (Request Code: <code>${requestCode}</code>) has been updated to <strong style="text-transform: uppercase;">${status}</strong> by system admin.</p>
      ${isSuspended || isRevoked ? '<p style="color: #b91c1c;">Software functionality on your desktop app may be temporarily locked. Contact support@ruractive.com for assistance.</p>' : '<p style="color: #15803d;">Your SATHI Desktop Application has been reactivated and is fully operational.</p>'}
    </div>
  `;

  return sendMail({ to: toEmail, subject, text: subject, html, templateType: 'STATUS_CHANGE' });
}

/**
 * 🔑 Send Password Reset OTP Email
 */
async function sendPasswordResetOtpEmail({ toEmail, firmName, otpCode }) {
  if (!toEmail) return { success: false, error: 'No email recipient.' };

  const subject = `🔐 Password Reset Verification Code: ${otpCode} - Ruractive`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px;">
      <h2 style="color: #2563eb; margin-top: 0;">🔐 Password Reset Verification</h2>
      <p>Hello ${firmName || 'Customer'},</p>
      <p>You requested a password reset for your Ruractive Customer Workspace account. Your 6-digit verification code is:</p>
      <div style="background: #eff6ff; border: 2px dashed #2563eb; padding: 18px; border-radius: 10px; font-family: monospace; font-size: 32px; text-align: center; font-weight: 900; color: #1e40af; letter-spacing: 4px; margin: 20px 0;">
        ${otpCode}
      </div>
      <p style="font-size: 12px; color: #64748b;">This verification code is valid for 15 minutes. Do not share this code with anyone.</p>
    </div>
  `;

  return sendMail({ to: toEmail, subject, text: `Password Reset OTP: ${otpCode}`, html, templateType: 'PASSWORD_OTP' });
}

/**
 * ⏰ Send License Expiry Warning Email
 */
async function sendExpiryWarningEmail({ toEmail, firmName, daysRemaining, expiresAt, activationKey }) {
  const subject = daysRemaining === 0 
    ? `⚠️ Action Required: SATHI License Expired for ${firmName}`
    : `⏰ Reminder: SATHI License Expiring in ${daysRemaining} Days`;

  const dateStr = new Date(expiresAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const html = `
    <div style="font-family: sans-serif; padding: 24px; background: #fffbeb; border: 2px solid #d97706; border-radius: 12px;">
      <h2 style="color: #d97706; margin-top: 0;">${daysRemaining === 0 ? 'Your License Has Expired' : 'Your License is Expiring Soon'}</h2>
      <p>Dear <strong>${firmName}</strong>,</p>
      <p>This is an automated notification regarding your SATHI Connector license.</p>
      <ul>
        <li><strong>Activation Key:</strong> ${activationKey}</li>
        <li><strong>Expiration Date:</strong> ${dateStr}</li>
        <li><strong>Status:</strong> <strong style="color: #d97706;">${daysRemaining === 0 ? 'EXPIRED' : `Expiring in ${daysRemaining} days`}</strong></li>
      </ul>
      <p>To avoid any disruption in your Tally data synchronization services, please contact support or renew your subscription through the platform.</p>
    </div>
  `;

  return sendMail({ to: toEmail, subject, text: `License expires on ${dateStr}`, html, templateType: 'EXPIRY_WARNING' });
}

/**
 * 🧪 Send Test Email
 */
async function sendTestEmail(toEmail) {
  const subject = `🧪 SMTP Test Email - Ruractive Technology`;
  const html = `
    <div style="font-family: sans-serif; padding: 24px; background: #f0fdf4; border: 2px solid #059669; border-radius: 12px;">
      <h2 style="color: #059669; margin-top: 0;">✅ SMTP Connection Test Successful!</h2>
      <p>This email verifies that your SMTP server configuration on <strong>SATHI Central Platform</strong> is functioning properly.</p>
      <ul>
        <li><strong>SMTP Host:</strong> ${config.SMTP_HOST || 'Dev Localhost (Preview Mode)'}</li>
        <li><strong>SMTP Port:</strong> ${config.SMTP_PORT}</li>
        <li><strong>Sender:</strong> ${config.SMTP_FROM}</li>
        <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
      </ul>
    </div>
  `;

  return sendMail({ to: toEmail, subject, text: 'SMTP Test Email Successful!', html, templateType: 'TEST_EMAIL' });
}

module.exports = {
  isSmtpConfigured,
  sendMail,
  sendActivationKeyEmail,
  sendInquiryNotificationEmail,
  sendExpiryWarningEmail,
  sendLicenseStatusEmail,
  sendPasswordResetOtpEmail,
  sendTestEmail
};
