const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const { query, run } = require('../../db/database');
const { requireAdminAuth } = require('../../middleware/auth');
const { isSmtpConfigured, sendTestEmail, sendLicenseStatusEmail } = require('../../utils/emailService');
const logger = require('../../utils/logger');

/**
 * POST /api/v1/admin/login
 */
router.post('/login', (req, res) => {
  const { password } = req.body;
  const adminPass = config.ADMIN_PASSWORD || (config.NODE_ENV !== 'production' ? 'admin123' : null);

  if (!adminPass) {
    logger.security('ADMIN', 'LOGIN_DISABLED_NO_PASS', { ipAddress: req.socket.remoteAddress });
    return res.status(503).json({ success: false, error: 'Admin login not configured. Set ADMIN_PASSWORD environment variable.' });
  }

  if (password === adminPass) {
    const adminToken = jwt.sign(
      { role: 'admin', issuedAt: Date.now() },
      config.JWT_SECRET,
      { expiresIn: `${config.ADMIN_TOKEN_EXPIRY_HOURS}h` }
    );

    logger.audit('ADMIN', 'ADMIN_LOGIN_SUCCESS', {
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      details: { role: 'admin' }
    });

    return res.json({ success: true, token: adminToken, message: 'Admin login successful.' });
  }

  logger.security('ADMIN', 'ADMIN_LOGIN_FAILED', {
    ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    details: { reason: 'Invalid password' }
  });

  return res.status(401).json({ success: false, error: 'Invalid admin password.' });
});

router.use(requireAdminAuth);

/**
 * GET /api/v1/admin/dashboard-stats
 */
router.get('/dashboard-stats', async (req, res) => {
  try {
    const totalClients = (await query('SELECT COUNT(*) as count FROM clients'))[0]?.count || 0;
    const totalBindings = (await query('SELECT COUNT(*) as count FROM machine_bindings'))[0]?.count || 0;
    const activePaid = (await query("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'ACTIVE' AND plan_type != 'TRIAL'"))[0]?.count || 0;
    const activeTrials = (await query("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'TRIAL'"))[0]?.count || 0;
    const totalFarmers = (await query('SELECT COUNT(*) as count FROM shared_farmer_registry'))[0]?.count || 0;
    const totalDealers = (await query('SELECT COUNT(*) as count FROM shared_dealer_registry'))[0]?.count || 0;
    const totalInquiries = (await query('SELECT COUNT(*) as count FROM inquiries'))[0]?.count || 0;
    const totalPayments = (await query('SELECT COUNT(*) as count FROM payment_history'))[0]?.count || 0;
    const totalLogs = (await query('SELECT COUNT(*) as count FROM system_logs'))[0]?.count || 0;
    const totalEmails = (await query('SELECT COUNT(*) as count FROM email_logs'))[0]?.count || 0;

    return res.json({
      success: true,
      stats: {
        totalClients,
        totalBindings,
        activePaid,
        activeTrials,
        totalFarmers,
        totalDealers,
        totalInquiries,
        totalPayments,
        totalLogs,
        totalEmails
      }
    });
  } catch (err) {
    logger.error('Admin', 'Dashboard stats error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/admin/clients
 */
router.get('/clients', async (req, res) => {
  try {
    const clients = await query('SELECT * FROM clients ORDER BY created_at DESC');
    const result = [];
    
    for (const c of clients) {
      const bindingRows = await query('SELECT * FROM machine_bindings WHERE client_id = $1 LIMIT 1', [c.id]);
      const binding = bindingRows[0] || {};
      const subRows = await query('SELECT * FROM subscriptions WHERE client_id = $1 ORDER BY created_at DESC LIMIT 1', [c.id]);
      const sub = subRows[0] || {};

      let daysRemaining = 0;
      if (sub.expires_at) {
        const expires = new Date(sub.expires_at);
        const now = new Date();
        daysRemaining = Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      }

      result.push({
        id: c.id,
        firmName: c.firm_name,
        ownerName: c.owner_name,
        mobileNo: c.mobile_no,
        email: c.email,
        apiKey: c.api_key,
        requestCode: binding.request_code || 'Unbound',
        tallySerial: binding.tally_serial_number || '-',
        macAddress: binding.hardware_mac_address || '-',
        planType: sub.plan_type || 'NONE',
        status: sub.status || 'NO_SUB',
        activationKey: sub.activation_key || '-',
        expiresAt: sub.expires_at || '-',
        daysRemaining,
        lastHeartbeat: binding.last_heartbeat_at || '-'
      });
    }

    return res.json({ success: true, clients: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/admin/logs
 */
router.get('/logs', async (req, res) => {
  try {
    const { level, category, search, limit = '200' } = req.query;
    let sql = 'SELECT * FROM system_logs WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (level && level !== 'ALL') {
      sql += ` AND level = $${paramIndex++}`;
      params.push(level.toUpperCase());
    }

    if (category && category !== 'ALL') {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category.toUpperCase());
    }

    if (search) {
      sql += ` AND (event_action ILIKE $${paramIndex} OR details ILIKE $${paramIndex} OR ip_address ILIKE $${paramIndex} OR request_code ILIKE $${paramIndex})`;
      const term = `%${search}%`;
      params.push(term);
      paramIndex++;
    }

    const safeLimit = Math.min(Math.max(parseInt(limit) || 100, 1), 500);
    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++}`;
    params.push(safeLimit);

    const logs = await query(sql, params);
    const total = (await query('SELECT COUNT(*) as count FROM system_logs'))[0]?.count || 0;

    return res.json({ success: true, logs, total });
  } catch (err) {
    logger.error('Admin', 'Fetch logs error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/admin/email/logs
 */
router.get('/email/logs', async (req, res) => {
  try {
    const emailLogs = await query('SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 300');
    return res.json({ success: true, logs: emailLogs, total: emailLogs.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/admin/email/status
 */
router.get('/email/status', async (req, res) => {
  return res.json({
    success: true,
    configured: await isSmtpConfigured(),
    host: config.SMTP_HOST || 'Not Configured (Console Preview Mode)',
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    from: config.SMTP_FROM,
    adminNotificationEmail: config.ADMIN_NOTIFICATION_EMAIL
  });
});

/**
 * POST /api/v1/admin/email/test
 */
router.post('/email/test', async (req, res) => {
  try {
    const { toEmail } = req.body;
    if (!toEmail) return res.status(400).json({ success: false, error: 'Recipient email required.' });

    const result = await sendTestEmail(toEmail);

    logger.audit('EMAIL', 'SMTP_TEST_SENT', {
      ipAddress: req.socket.remoteAddress,
      details: { toEmail, result }
    });

    return res.json(result);
  } catch (err) {
    logger.error('Admin', 'SMTP test error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/admin/generate-key
 */
router.post('/generate-key', async (req, res) => {
  try {
    let { requestCode, validDays = 365, planType = 'ANNUAL_PRO' } = req.body;
    
    // If requestCode is provided, we bind to that client
    if (requestCode) {
      requestCode = requestCode.trim();
      const { findOrCreateClient, bindMachine, createSubscription } = require('../../services/registrationService');
      
      const { prisma } = require('../../db/database');
      const binding = await prisma.machineBinding.findUnique({
        where: { request_code: requestCode }
      });
      
      let clientId;
      if (!binding) {
        const client = await findOrCreateClient({ mobileNo: '9999999999', firmName: 'Client ' + requestCode });
        await bindMachine(client.id, requestCode);
        clientId = client.id;
      } else {
        clientId = binding.client_id;
      }

      const result = await createSubscription(clientId, requestCode, planType, { forceNew: true, validDays });

      logger.audit('ADMIN', 'KEY_GENERATED_BOUND', {
        clientId,
        requestCode,
        ipAddress: req.socket.remoteAddress,
        details: { activationKey: result.activationKey, validDays, planType }
      });

      return res.json({
        success: true,
        requestCode,
        activationKey: result.activationKey,
        validDays: result.validDays,
        expiresAt: result.expiresAt,
        message: `Generated key: ${result.activationKey}`
      });
    } else {
      // Generate an UNUSED universal key
      const { generateActivationKey } = require('../../utils/keyGenerator');
      const { prisma } = require('../../db/database');
      
      const newKey = generateActivationKey();
      const now = new Date();
      const expires = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000);
      
      await prisma.subscription.create({
        data: {
          activation_key: newKey,
          plan_type: planType,
          status: 'UNUSED',
          starts_at: now,
          expires_at: expires
        }
      });

      logger.audit('ADMIN', 'KEY_GENERATED_UNIVERSAL', {
        ipAddress: req.socket.remoteAddress,
        details: { activationKey: newKey, validDays, planType }
      });

      return res.json({
        success: true,
        requestCode: 'UNIVERSAL',
        activationKey: newKey,
        validDays: validDays,
        expiresAt: expires,
        message: `Generated Universal Key: ${newKey}`
      });
    }
  } catch (err) {
    logger.error('Admin', 'Key generation error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/admin/farmers
 */
router.get('/farmers', async (req, res) => {
  try {
    const farmers = await query('SELECT * FROM shared_farmer_registry ORDER BY updated_at DESC LIMIT 500');
    return res.json({ success: true, farmers, total: farmers.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/admin/dealers
 */
router.get('/dealers', async (req, res) => {
  try {
    const dealers = await query('SELECT * FROM shared_dealer_registry ORDER BY updated_at DESC LIMIT 500');
    return res.json({ success: true, dealers, total: dealers.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/admin/inquiries
 */
router.get('/inquiries', async (req, res) => {
  try {
    const inquiries = await query('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 500');
    return res.json({ success: true, inquiries, total: inquiries.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/admin/payments
 */
router.get('/payments', async (req, res) => {
  try {
    const payments = await query(
      `SELECT p.*, c.firm_name, c.mobile_no
       FROM payment_history p
       LEFT JOIN clients c ON p.client_id = c.id
       ORDER BY p.created_at DESC LIMIT 500`
    );
    return res.json({ success: true, payments, total: payments.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/admin/clients/revoke
 */
router.post('/clients/revoke', async (req, res) => {
  try {
    const { requestCode } = req.body;
    if (!requestCode) return res.status(400).json({ success: false, error: 'Request Code is required.' });

    const bindRows = await query('SELECT * FROM machine_bindings WHERE request_code = $1', [requestCode]);
    const binding = bindRows[0];
    if (binding) {
      await run("UPDATE subscriptions SET status = 'EXPIRED' WHERE client_id = $1", [binding.client_id]);
      const clientRows = await query('SELECT * FROM clients WHERE id = $1', [binding.client_id]);
      const client = clientRows[0];

      logger.audit('ADMIN', 'LICENSE_REVOKED', {
        clientId: binding.client_id,
        requestCode,
        ipAddress: req.socket.remoteAddress
      });

      if (client && client.email) {
        sendLicenseStatusEmail({ toEmail: client.email, firmName: client.firm_name, status: 'EXPIRED', requestCode })
          .catch(err => logger.error('Email', 'Revoke notification email failed', { error: err.message }));
      }
    }
    return res.json({ success: true, message: `License for ${requestCode} revoked.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/admin/clients/toggle-suspend
 */
router.post('/clients/toggle-suspend', async (req, res) => {
  try {
    const { requestCode, action = 'suspend' } = req.body;
    if (!requestCode) return res.status(400).json({ success: false, error: 'Request Code required.' });

    const bindRows = await query('SELECT * FROM machine_bindings WHERE request_code = $1', [requestCode]);
    const binding = bindRows[0];
    if (binding) {
      const newStatus = action === 'reactivate' ? 'ACTIVE' : 'SUSPENDED';
      await run('UPDATE subscriptions SET status = $1 WHERE client_id = $2', [newStatus, binding.client_id]);
      const clientRows = await query('SELECT * FROM clients WHERE id = $1', [binding.client_id]);
      const client = clientRows[0];

      logger.audit('ADMIN', action === 'reactivate' ? 'SUBSCRIPTION_REACTIVATED' : 'SUBSCRIPTION_SUSPENDED', {
        clientId: binding.client_id,
        requestCode,
        ipAddress: req.socket.remoteAddress
      });

      if (client && client.email) {
        sendLicenseStatusEmail({ toEmail: client.email, firmName: client.firm_name, status: newStatus, requestCode })
          .catch(err => logger.error('Email', 'Status change notification email failed', { error: err.message }));
      }

      return res.json({ success: true, newStatus, message: `Subscription for ${requestCode} ${action === 'reactivate' ? 'reactivated' : 'suspended'}.` });
    }
    return res.status(404).json({ success: false, error: 'Machine binding not found.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/admin/export/:table
 */
router.get('/export/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const tableMap = {
      clients: { sql: 'SELECT c.id, c.firm_name, c.owner_name, c.mobile_no, c.email, c.gstin, c.city, c.state, c.api_key, c.created_at FROM clients c ORDER BY c.created_at DESC', filename: 'clients' },
      payments: { sql: 'SELECT p.id, c.firm_name, c.mobile_no, p.razorpay_order_id, p.razorpay_payment_id, p.amount, p.currency, p.status, p.payment_method, p.created_at FROM payment_history p LEFT JOIN clients c ON p.client_id = c.id ORDER BY p.created_at DESC', filename: 'payments' },
      farmers: { sql: 'SELECT * FROM shared_farmer_registry ORDER BY updated_at DESC', filename: 'farmers' },
      dealers: { sql: 'SELECT * FROM shared_dealer_registry ORDER BY updated_at DESC', filename: 'dealers' },
      inquiries: { sql: 'SELECT * FROM inquiries ORDER BY created_at DESC', filename: 'inquiries' },
      logs: { sql: 'SELECT id, level, category, event_action, client_id, request_code, ip_address, details, created_at FROM system_logs ORDER BY created_at DESC LIMIT 5000', filename: 'audit_logs' },
      emails: { sql: 'SELECT * FROM email_logs ORDER BY created_at DESC', filename: 'email_logs' }
    };

    const config_entry = tableMap[table];
    if (!config_entry) {
      return res.status(400).json({ success: false, error: `Invalid table: ${table}. Valid: ${Object.keys(tableMap).join(', ')}` });
    }

    const rows = await query(config_entry.sql);
    if (!rows.length) {
      return res.status(200).send('No data found.');
    }

    const headers = Object.keys(rows[0]);
    const csvEscape = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvLines = [
      headers.join(','),
      ...rows.map(row => headers.map(h => csvEscape(row[h])).join(','))
    ];

    const csvContent = csvLines.join('\n');
    const timestamp = new Date().toISOString().slice(0, 10);

    logger.audit('ADMIN', 'DATA_EXPORTED_CSV', {
      ipAddress: req.socket.remoteAddress,
      details: { table, rowCount: rows.length }
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="sathi_${config_entry.filename}_${timestamp}.csv"`);
    return res.send(csvContent);
  } catch (err) {
    logger.error('Admin', 'CSV export error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/admin/analytics/charts
 */
router.get('/analytics/charts', async (req, res) => {
  try {
    const licenseBreakdown = {
      active: (await query("SELECT COUNT(*) as c FROM subscriptions WHERE status = 'ACTIVE' AND plan_type != 'TRIAL'"))[0]?.c || 0,
      trial: (await query("SELECT COUNT(*) as c FROM subscriptions WHERE status = 'TRIAL'"))[0]?.c || 0,
      expired: (await query("SELECT COUNT(*) as c FROM subscriptions WHERE status = 'EXPIRED'"))[0]?.c || 0,
      suspended: (await query("SELECT COUNT(*) as c FROM subscriptions WHERE status = 'SUSPENDED'"))[0]?.c || 0
    };

    const monthlyRegistrations = await query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count
      FROM clients
      WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '12 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month ASC
    `);

    const monthlyRevenue = await query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month, SUM(amount) as total
      FROM payment_history
      WHERE status = 'CAPTURED' AND created_at >= CURRENT_TIMESTAMP - INTERVAL '12 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month ASC
    `);

    const totalRevenue = (await query("SELECT SUM(amount) as total FROM payment_history WHERE status = 'CAPTURED'"))[0]?.total || 0;

    const dailyActivity = await query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as day, COUNT(*) as count
      FROM system_logs
      WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '14 days'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY day ASC
    `);

    const weeklyRegs = (await query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as day, COUNT(*) as count
      FROM clients
      WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY day DESC
      LIMIT 14
    `)).reverse();

    const emailsSent = (await query("SELECT COUNT(*) as c FROM email_logs WHERE status = 'SENT'"))[0]?.c || 0;
    const emailsFailed = (await query("SELECT COUNT(*) as c FROM email_logs WHERE status = 'FAILED'"))[0]?.c || 0;
    const emailsDevMode = (await query("SELECT COUNT(*) as c FROM email_logs WHERE status = 'DEV_MODE'"))[0]?.c || 0;

    return res.json({
      success: true,
      charts: {
        licenseBreakdown,
        monthlyRegistrations,
        monthlyRevenue,
        totalRevenue,
        dailyActivity,
        weeklyRegs,
        emailStats: { sent: emailsSent, failed: emailsFailed, devMode: emailsDevMode }
      }
    });
  } catch (err) {
    logger.error('Admin', 'Analytics charts error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/admin/backup/info
 */
router.get('/backup/info', async (req, res) => {
  try {
    const tableCounts = {
      clients: (await query('SELECT COUNT(*) as c FROM clients'))[0]?.c || 0,
      machine_bindings: (await query('SELECT COUNT(*) as c FROM machine_bindings'))[0]?.c || 0,
      subscriptions: (await query('SELECT COUNT(*) as c FROM subscriptions'))[0]?.c || 0,
      payment_history: (await query('SELECT COUNT(*) as c FROM payment_history'))[0]?.c || 0,
      inquiries: (await query('SELECT COUNT(*) as c FROM inquiries'))[0]?.c || 0,
      farmers: (await query('SELECT COUNT(*) as c FROM shared_farmer_registry'))[0]?.c || 0,
      dealers: (await query('SELECT COUNT(*) as c FROM shared_dealer_registry'))[0]?.c || 0,
      system_logs: (await query('SELECT COUNT(*) as c FROM system_logs'))[0]?.c || 0,
      email_logs: (await query('SELECT COUNT(*) as c FROM email_logs'))[0]?.c || 0,
    };

    return res.json({
      success: true,
      dbSizeBytes: 0,
      dbSizeFormatted: 'N/A',
      tableCounts,
      totalRows: Object.values(tableCounts).reduce((a, b) => parseInt(a) + parseInt(b), 0)
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/admin/backup/download
 */
router.get('/backup/download', (req, res) => {
  return res.status(400).json({ success: false, error: 'Backup download is not available on PostgreSQL backend.' });
});

/**
 * POST /api/v1/admin/backup/restore
 */
router.post('/backup/restore', (req, res) => {
  return res.status(400).json({ success: false, error: 'Backup restore is not available on PostgreSQL backend.' });
});

/**
 * GET /api/v1/admin/users
 */
router.get('/users', async (req, res) => {
  try {
    const users = await query('SELECT id, username, role, last_login_at, created_at FROM admin_users ORDER BY created_at ASC');
    return res.json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/admin/users
 */
router.post('/users', async (req, res) => {
  try {
    const { username, password, role = 'ADMIN' } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    if (!['SUPER_ADMIN', 'ADMIN', 'VIEWER'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role. Must be SUPER_ADMIN, ADMIN, or VIEWER.' });
    }

    const existing = await query('SELECT id FROM admin_users WHERE username = $1', [username.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'Username already exists.' });
    }

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 12);
    const userId = crypto.randomUUID();

    await run('INSERT INTO admin_users (id, username, password_hash, role) VALUES ($1, $2, $3, $4)',
      [userId, username.toLowerCase(), passwordHash, role]);

    logger.audit('ADMIN', 'ADMIN_USER_CREATED', {
      ipAddress: req.socket.remoteAddress,
      details: { username: username.toLowerCase(), role }
    });

    return res.json({ success: true, message: `Admin user "${username}" created with role ${role}.`, userId });
  } catch (err) {
    logger.error('Admin', 'Create admin user error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/v1/admin/users/:id
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userRows = await query('SELECT * FROM admin_users WHERE id = $1', [id]);
    const user = userRows[0];
    if (!user) return res.status(404).json({ success: false, error: 'Admin user not found.' });

    if (user.role === 'SUPER_ADMIN') {
      const superAdminCount = (await query("SELECT COUNT(*) as c FROM admin_users WHERE role = 'SUPER_ADMIN'"))[0]?.c || 0;
      if (superAdminCount <= 1) {
        return res.status(400).json({ success: false, error: 'Cannot delete the last Super Admin.' });
      }
    }

    await run('DELETE FROM admin_users WHERE id = $1', [id]);

    logger.audit('ADMIN', 'ADMIN_USER_DELETED', {
      ipAddress: req.socket.remoteAddress,
      details: { deletedUser: user.username, role: user.role }
    });

    return res.json({ success: true, message: `Admin user "${user.username}" deleted.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/admin/users/change-password
 */
router.post('/users/change-password', async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, error: 'userId and newPassword are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const userRows = await query('SELECT * FROM admin_users WHERE id = $1', [userId]);
    const user = userRows[0];
    if (!user) return res.status(404).json({ success: false, error: 'Admin user not found.' });

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await run('UPDATE admin_users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);

    logger.audit('ADMIN', 'ADMIN_PASSWORD_CHANGED', {
      ipAddress: req.socket.remoteAddress,
      details: { username: user.username }
    });

    return res.json({ success: true, message: `Password updated for "${user.username}".` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
