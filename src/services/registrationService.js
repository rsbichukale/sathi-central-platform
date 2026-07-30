/**
 * Registration Service
 * 
 * Shared business logic for find-or-create client, bind machine, and create subscription.
 */
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { query, run } = require('../db/database');
const { generateActivationKey, getValidityDays, generateRequestCode } = require('../utils/keyGenerator');

/**
 * Find or create a client record by mobile number.
 * If existing client found, optionally update fields.
 */
async function findOrCreateClient({ mobileNo, firmName, ownerName, email, gstin, address, password }) {
  let rows = await query('SELECT * FROM clients WHERE mobile_no = $1', [mobileNo]);
  let client = rows[0];

  if (client) {
    // Update fields if provided
    const updates = {};
    if (firmName) updates.firm_name = firmName;
    if (ownerName) updates.owner_name = ownerName;
    if (email) updates.email = email;
    if (gstin) updates.gstin = gstin;
    if (address) updates.address = address;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.client_secret_hash = await bcrypt.hash(password, salt);
    }

    if (Object.keys(updates).length > 0) {
      const setClauses = Object.keys(updates).map((k, i) => `${k} = $${i + 1}`).join(', ');
      const values = [...Object.values(updates), client.id];
      await run(`UPDATE clients SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length}`, values);
      rows = await query('SELECT * FROM clients WHERE id = $1', [client.id]);
      client = rows[0];
    }

    return client;
  }

  // Create new client
  const id = 'cli_' + crypto.randomBytes(8).toString('hex');
  const clientId = id;
  const apiKey = 'sk_live_' + crypto.randomBytes(16).toString('hex');

  let passHash = 'unset'; // Indicates password not yet set
  if (password) {
    const salt = await bcrypt.genSalt(10);
    passHash = await bcrypt.hash(password, salt);
  }

  await run(
    `INSERT INTO clients (id, client_id, client_secret_hash, api_key, firm_name, owner_name, mobile_no, email, gstin, address)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [id, clientId, passHash, apiKey, firmName || 'Client ' + mobileNo, ownerName || '', mobileNo, email || '', gstin || '', address || '']
  );

  rows = await query('SELECT * FROM clients WHERE id = $1', [id]);
  return rows[0];
}

/**
 * Bind a machine request code to a client.
 */
async function bindMachine(clientId, requestCode, { tallySerial, macAddress } = {}) {
  let rows = await query('SELECT * FROM machine_bindings WHERE request_code = $1', [requestCode]);
  let binding = rows[0];

  if (binding) {
    const updates = ['client_id = $1', 'last_heartbeat_at = CURRENT_TIMESTAMP'];
    const values = [clientId];
    let paramIndex = 2;

    if (tallySerial) {
      updates.push(`tally_serial_number = $${paramIndex++}`);
      values.push(tallySerial);
    }
    if (macAddress) {
      updates.push(`hardware_mac_address = $${paramIndex++}`);
      values.push(macAddress);
    }

    values.push(binding.id);
    await run(`UPDATE machine_bindings SET ${updates.join(', ')} WHERE id = $${paramIndex}`, values);
    
    rows = await query('SELECT * FROM machine_bindings WHERE id = $1', [binding.id]);
    return rows[0];
  }

  const bindingId = 'bind_' + crypto.randomBytes(8).toString('hex');
  await run(
    `INSERT INTO machine_bindings (id, client_id, request_code, tally_serial_number, hardware_mac_address) VALUES ($1, $2, $3, $4, $5)`,
    [bindingId, clientId, requestCode, tallySerial || null, macAddress || null]
  );

  rows = await query('SELECT * FROM machine_bindings WHERE id = $1', [bindingId]);
  return rows[0];
}

/**
 * Create a subscription for a client.
 */
async function createSubscription(clientId, requestCode, planType, { forceNew = false } = {}) {
  if (!forceNew) {
    const rows = await query(
      `SELECT * FROM subscriptions 
       WHERE client_id = $1 AND status IN ('ACTIVE', 'TRIAL') AND expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC LIMIT 1`,
      [clientId]
    );
    const existing = rows[0];

    if (existing) {
      const expires = new Date(existing.expires_at);
      const daysRemaining = Math.max(0, Math.ceil((expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      return {
        subscription: existing,
        activationKey: existing.activation_key,
        validDays: daysRemaining,
        expiresAt: existing.expires_at,
        isExisting: true
      };
    }
  }

  const validDays = await getValidityDays(planType);
  const now = new Date();
  const expires = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000);
  const activationKey = generateActivationKey(expires);
  
  const subId = 'sub_' + crypto.randomBytes(8).toString('hex');

  await run(
    `INSERT INTO subscriptions (id, client_id, activation_key, plan_type, status, starts_at, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [subId, clientId, activationKey, planType, planType === 'TRIAL' ? 'TRIAL' : 'ACTIVE', now.toISOString(), expires.toISOString()]
  );

  const rows = await query('SELECT * FROM subscriptions WHERE id = $1', [subId]);
  return {
    subscription: rows[0],
    activationKey,
    validDays,
    expiresAt: expires.toISOString(),
    isExisting: false
  };
}

module.exports = {
  findOrCreateClient,
  bindMachine,
  createSubscription
};
