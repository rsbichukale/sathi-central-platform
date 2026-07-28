/**
 * Cron Jobs — Scheduled Background Tasks
 */

const { query, run } = require('../db/database');
const logger = require('./logger');
const { sendExpiryWarningEmail } = require('./emailService');

/**
 * Check for expiring subscriptions and send warning emails.
 * Also auto-expires subscriptions past their expiry date.
 */
async function checkExpiringSubscriptions() {
  try {
    logger.info('CRON', 'Running subscription expiry check...');

    // 1. Auto-expire subscriptions past their expiry date
    const expiredSubs = await query(`
      SELECT s.*, c.firm_name, c.email, c.mobile_no, mb.request_code
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      LEFT JOIN machine_bindings mb ON mb.client_id = c.id
      WHERE s.status IN ('ACTIVE', 'TRIAL')
      AND s.expires_at < CURRENT_TIMESTAMP
    `);

    for (const sub of expiredSubs) {
      await run("UPDATE subscriptions SET status = 'EXPIRED' WHERE id = $1", [sub.id]);

      logger.audit('CRON', 'SUBSCRIPTION_AUTO_EXPIRED', {
        clientId: sub.client_id,
        requestCode: sub.request_code,
        details: { firmName: sub.firm_name, expiredAt: sub.expires_at, planType: sub.plan_type }
      });

      // Send expiry notification email
      if (sub.email) {
        try {
          await sendExpiryWarningEmail({
            toEmail: sub.email,
            firmName: sub.firm_name,
            daysRemaining: 0,
            expiresAt: sub.expires_at,
            activationKey: sub.activation_key
          });
        } catch (emailErr) {
          logger.error('CRON', 'Expiry email failed', { error: emailErr.message, email: sub.email });
        }
      }
    }

    if (expiredSubs.length > 0) {
      logger.info('CRON', `Auto-expired ${expiredSubs.length} subscription(s).`);
    }

    // 2. Send warning emails for subscriptions expiring within 7 days
    const warningSubs = await query(`
      SELECT s.*, c.firm_name, c.email, c.mobile_no, mb.request_code
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      LEFT JOIN machine_bindings mb ON mb.client_id = c.id
      WHERE s.status IN ('ACTIVE', 'TRIAL')
      AND s.expires_at >= CURRENT_TIMESTAMP
      AND s.expires_at <= CURRENT_TIMESTAMP + INTERVAL '7 days'
    `);

    for (const sub of warningSubs) {
      const expiresAt = new Date(sub.expires_at);
      const now = new Date();
      const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      if (sub.email) {
        try {
          await sendExpiryWarningEmail({
            toEmail: sub.email,
            firmName: sub.firm_name,
            daysRemaining,
            expiresAt: sub.expires_at,
            activationKey: sub.activation_key
          });

          logger.audit('CRON', 'EXPIRY_WARNING_SENT', {
            clientId: sub.client_id,
            requestCode: sub.request_code,
            details: { firmName: sub.firm_name, daysRemaining, email: sub.email }
          });
        } catch (emailErr) {
          logger.error('CRON', 'Warning email failed', { error: emailErr.message, email: sub.email });
        }
      }
    }

    if (warningSubs.length > 0) {
      logger.info('CRON', `Sent ${warningSubs.length} expiry warning email(s).`);
    }

    if (expiredSubs.length === 0 && warningSubs.length === 0) {
      logger.info('CRON', 'No expiring subscriptions found.');
    }
  } catch (err) {
    logger.error('CRON', 'Subscription expiry check failed', { error: err.message });
  }
}

/**
 * Start all cron jobs.
 */
function startCronJobs() {
  logger.info('CRON', 'Cron job scheduler started.');

  // Run expiry check once on startup (after 30s delay for DB warmup)
  setTimeout(() => {
    checkExpiringSubscriptions();
  }, 30000);

  // Then run every 24 hours (86400000 ms)
  setInterval(() => {
    checkExpiringSubscriptions();
  }, 24 * 60 * 60 * 1000);

  logger.info('CRON', 'Scheduled: Subscription expiry check — every 24 hours.');
}

module.exports = { startCronJobs, checkExpiringSubscriptions };
