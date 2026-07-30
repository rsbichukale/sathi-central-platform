const { prisma } = require('../../db/database');
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
    let sub = await prisma.subscription.findFirst({
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
    const binding = await prisma.machineBinding.findUnique({
      where: { request_code: requestCode }
    });

    if (!binding) {
      return { success: false, valid: false, mode: 'unregistered', message: 'Machine not registered on platform.' };
    }

    // Update heartbeat
    await prisma.machineBinding.update({
      where: { id: binding.id },
      data: { last_heartbeat_at: new Date() }
    });

    const sub = await prisma.subscription.findFirst({
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

    if (activationKey) {
      sub = await prisma.subscription.findFirst({
        where: { activation_key: activationKey },
        orderBy: { created_at: 'desc' }
      });
      if (sub) {
        binding = await prisma.machineBinding.findFirst({
          where: { client_id: sub.client_id },
          orderBy: { last_heartbeat_at: 'desc' }
        });
      }
    } else if (requestCode) {
      binding = await prisma.machineBinding.findUnique({
        where: { request_code: requestCode }
      });
      if (binding) {
        sub = await prisma.subscription.findFirst({
          where: { client_id: binding.client_id },
          orderBy: { created_at: 'desc' }
        });
      }
    }

    if (!binding && !sub) {
      return { success: false, valid: false, status: 'UNREGISTERED', message: 'PC not registered or invalid Activation Key.' };
    }

    if (binding) {
      await prisma.machineBinding.update({
        where: { id: binding.id },
        data: { last_heartbeat_at: new Date() }
      });
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
    const binding = await prisma.machineBinding.findUnique({
      where: { request_code: requestCode }
    });

    if (!binding) {
      throw new AppError('Machine Request Code not found.', 404);
    }

    const keyClean = activationKey.trim().toUpperCase();
    const now = new Date();
    const expires = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const newSub = await prisma.subscription.create({
      data: {
        client_id: binding.client_id,
        activation_key: keyClean,
        plan_type: 'ANNUAL_PRO',
        status: 'ACTIVE',
        starts_at: now,
        expires_at: expires
      }
    });

    const token = jwt.sign(
      { clientId: binding.client_id, requestCode, plan: 'ANNUAL_PRO', expiresAt: expires.toISOString() },
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
}

module.exports = new LicenseService();
