const db = require('../../db/database');
const crypto = require('crypto');
const config = require('../../config');
const jwt = require('jsonwebtoken');
const { findOrCreateClient, bindMachine, createSubscription } = require('../../services/registrationService');
const AppError = require('../../utils/AppError');

class LicenseService {
  async registerTrial({ requestCode, firmName, mobileNo, tallySerial, macAddress }) {
    // Legacy function calls (can be refactored to Prisma later)
    const client = await findOrCreateClient({ mobileNo, firmName: firmName || 'Trial Client' });
    await bindMachine(client.id, requestCode, { tallySerial, macAddress });

    // Prisma: Check existing trial
    let sub = await db.prisma.subscription.findFirst({
      where: {
        client_id: client.id,
        status: 'TRIAL'
      }
    });

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

    return {
      success: true,
      mode: 'trial',
      plan: 'FREE_TRIAL',
      daysRemaining,
      expiresAt: sub.expires_at,
      token,
      apiKey: client.api_key
    };
  }

  async heartbeat({ requestCode }) {
    const binding = await db.prisma.machineBinding.findUnique({
      where: { request_code: requestCode }
    });

    if (!binding) {
      return { success: false, valid: false, mode: 'unregistered', message: 'Machine not registered on platform.' };
    }

    // Update heartbeat
    await db.prisma.machineBinding.update({
      where: { id: binding.id },
      data: { last_heartbeat_at: new Date() }
    });

    const sub = await db.prisma.subscription.findFirst({
      where: { client_id: binding.client_id },
      orderBy: { created_at: 'desc' }
    });

    if (!sub) {
      return { success: false, valid: false, mode: 'no_subscription', message: 'No active subscription found.' };
    }

    const now = new Date();
    const expires = new Date(sub.expires_at);
    const isExpired = now > expires;

    if (isExpired) {
      return {
        success: false,
        valid: false,
        mode: sub.status === 'TRIAL' ? 'trial_expired' : 'expired',
        message: 'Subscription has expired. Please renew or activate your key.'
      };
    }

    const daysRemaining = Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const token = jwt.sign(
      { clientId: binding.client_id, requestCode, plan: sub.plan_type, expiresAt: sub.expires_at },
      config.JWT_SECRET,
      { expiresIn: config.JWT_LICENSE_EXPIRY }
    );

    return {
      success: true,
      valid: true,
      mode: sub.status === 'TRIAL' ? 'trial' : 'paid',
      plan: sub.plan_type,
      daysRemaining,
      expiresAt: sub.expires_at,
      signedToken: token
    };
  }

  async validate({ requestCode, activationKey, serialNumber }) {
    let binding = null;
    let sub = null;

    if (db.isSqlite) {
      if (activationKey) {
        const subRows = await db.query('SELECT * FROM subscriptions WHERE activation_key = $1 ORDER BY created_at DESC', [activationKey]);
        sub = subRows[0];
        if (sub) {
          const bindingRows = await db.query('SELECT * FROM machine_bindings WHERE client_id = $1 ORDER BY last_heartbeat_at DESC', [sub.client_id]);
          binding = bindingRows[0];
        }
      } else if (requestCode) {
        const bindingRows = await db.query('SELECT * FROM machine_bindings WHERE request_code = $1', [requestCode]);
        binding = bindingRows[0];
        if (binding) {
          const subRows = await db.query('SELECT * FROM subscriptions WHERE client_id = $1 ORDER BY created_at DESC', [binding.client_id]);
          sub = subRows[0];
        }
      }
    } else {
      if (activationKey) {
        sub = await db.prisma.subscription.findFirst({
          where: { activation_key: activationKey },
          orderBy: { created_at: 'desc' }
        });
        if (sub) {
          binding = await db.prisma.machineBinding.findFirst({
            where: { client_id: sub.client_id },
            orderBy: { last_heartbeat_at: 'desc' }
          });
        }
      } else if (requestCode) {
        binding = await db.prisma.machineBinding.findUnique({
          where: { request_code: requestCode }
        });
        if (binding) {
          sub = await db.prisma.subscription.findFirst({
            where: { client_id: binding.client_id },
            orderBy: { created_at: 'desc' }
          });
        }
      }
    }

    if (!binding && !sub) {
      return { success: false, valid: false, status: 'UNREGISTERED', message: 'PC not registered or invalid Activation Key.' };
    }

    if (sub && sub.status === 'UNUSED') {
      return { success: false, valid: false, status: 'UNUSED', message: 'This key has not been activated yet. Please click Activate Software.' };
    }

    if (binding) {
      if (db.isSqlite) {
        await db.run('UPDATE machine_bindings SET last_heartbeat_at = CURRENT_TIMESTAMP WHERE id = $1', [binding.id]);
      } else {
        await db.prisma.machineBinding.update({
          where: { id: binding.id },
          data: { last_heartbeat_at: new Date() }
        });
      }
    }

    if (!sub) {
      return { success: false, valid: false, status: 'NO_SUBSCRIPTION', message: 'No active subscription found.' };
    }

    if (sub.status === 'SUSPENDED') {
      return { success: false, valid: false, status: 'SUSPENDED', message: 'Your subscription has been SUSPENDED by system admin. Software locked. Contact support.' };
    }

    const now = new Date();
    const expires = new Date(sub.expires_at);
    
    if (now > expires || sub.status === 'EXPIRED') {
      return { success: false, valid: false, status: 'EXPIRED', message: 'Subscription has EXPIRED. Software locked. Please enter a new Activation Key.' };
    }

    const daysRemaining = Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    return {
      success: true,
      valid: true,
      status: sub.status,
      planType: sub.plan_type,
      daysRemaining,
      activationKey: sub.activation_key,
      expiresAt: sub.expires_at
    };
  }

  async activate({ requestCode, activationKey }) {
    if (!activationKey || !requestCode) {
      throw new AppError('Machine Request Code and Activation Key are required.', 400);
    }

    const keyClean = activationKey.trim().toUpperCase();

    // Check if the key exists and is valid
    const existingSub = await db.prisma.subscription.findUnique({
      where: { activation_key: keyClean }
    });

    if (!existingSub) {
      throw new AppError('Invalid Activation Key. Please purchase a valid key.', 404);
    }

    if (existingSub.status !== 'UNUSED') {
      throw new AppError('This Activation Key has already been used.', 400);
    }

    const binding = await db.prisma.machineBinding.findUnique({
      where: { request_code: requestCode }
    });

    if (!binding) {
      throw new AppError('Machine Request Code not found. Please register PC first.', 404);
    }

    const now = new Date();
    // Assuming 365 days valid duration for simplicity, or we can use existing expires_at - starts_at duration
    const validMs = existingSub.expires_at.getTime() - existingSub.starts_at.getTime();
    const expires = new Date(now.getTime() + validMs);

    // Bind the subscription
    await db.prisma.subscription.update({
      where: { id: existingSub.id },
      data: {
        client_id: binding.client_id,
        status: 'ACTIVE',
        starts_at: now,
        expires_at: expires
      }
    });

    const token = jwt.sign(
      { clientId: binding.client_id, requestCode, plan: existingSub.plan_type, expiresAt: expires.toISOString() },
      config.JWT_SECRET,
      { expiresIn: config.JWT_LICENSE_EXPIRY }
    );

    return {
      success: true,
      mode: 'paid',
      plan: 'ANNUAL_PRO',
      daysRemaining: 365,
      expiresAt: expires.toISOString(),
      token
    };
  }

  async bindAndActivate({ apiKey, activationKey, requestCode, tallySerial, macAddress }) {
    if (!apiKey || !activationKey || !requestCode) {
      throw new AppError('API Key, Activation Key, and Request Code are required.', 400);
    }

    const keyClean = activationKey.trim().toUpperCase();

    // 1. Verify Activation Key first
    const existingSub = await db.prisma.subscription.findUnique({
      where: { activation_key: keyClean }
    });

    if (!existingSub) {
      throw new AppError('Invalid Activation Key. Please contact support.', 404);
    }

    // 2. Verify Client via API Key, or infer from Subscription
    let client;
    if (apiKey && apiKey !== 'NO_API_KEY_YET') {
      client = await db.prisma.client.findFirst({
        where: { api_key: apiKey }
      });
      if (!client) {
        throw new AppError('Invalid SATHI API Key. Client not found.', 404);
      }
    } else if (existingSub.client_id) {
      client = await db.prisma.client.findUnique({
        where: { id: existingSub.client_id }
      });
    }

    if (!client) {
      throw new AppError('Could not determine Client for this license.', 404);
    }
    
    // If the key has a client_id and it doesn't match, throw error.
    if (existingSub.client_id && existingSub.client_id !== client.id) {
        throw new AppError('This Activation Key belongs to another customer.', 403);
    }

    if (existingSub.status !== 'UNUSED' && existingSub.client_id !== client.id) {
      throw new AppError('This Activation Key has already been used by another client.', 400);
    }

    // 3. Bind Machine (create MachineBinding for this requestCode and Client)
    const { bindMachine } = require('../../services/registrationService');
    await bindMachine(client.id, requestCode, { tallySerial, macAddress });

    // 4. Update Subscription
    const now = new Date();
    await db.prisma.subscription.update({
      where: { id: existingSub.id },
      data: {
        status: 'ACTIVE',
        client_id: client.id,
        starts_at: existingSub.starts_at || now,
      }
    });

    const expiresAt = new Date(existingSub.expires_at);
    const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    const token = jwt.sign(
      { clientId: client.id, requestCode, plan: existingSub.plan_type, expiresAt },
      config.JWT_SECRET,
      { expiresIn: config.JWT_LICENSE_EXPIRY }
    );

    // 5. Return Client Info and Activation Success
    return {
      success: true,
      valid: true,
      status: 'ACTIVE',
      planType: existingSub.plan_type,
      daysRemaining,
      expiresAt: existingSub.expires_at,
      token,
      message: 'Machine linked and software activated successfully.',
      clientDetails: {
        firmName: client.firm_name,
        ownerName: client.owner_name,
        mobileNo: client.mobile_no,
        email: client.email
      }
    };
  }
}

module.exports = new LicenseService();
