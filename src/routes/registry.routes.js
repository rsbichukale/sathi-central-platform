const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { query, run } = require('../db/database');
const { requireApiKey } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * POST /api/v1/registry/farmers/sync
 * Upload local farmer records from Desktop App to Central Cloud Platform
 */
router.post('/farmers/sync', requireApiKey, async (req, res) => {
  try {
    const { farmers } = req.body;
    const clientId = req.authenticatedClient.id;

    if (!Array.isArray(farmers) || farmers.length === 0) {
      return res.json({ success: true, uploaded: 0, merged: 0 });
    }

    let mergedCount = 0;
    for (const f of farmers) {
      const name = String(f.farmer_name || '').trim();
      const mobile = String(f.mobile_no || '').trim();
      const village = String(f.village_name || '').trim();

      if (!name || !mobile) continue;

      const globalId = crypto.createHash('md5').update(`${name.toLowerCase()}_${mobile}_${village.toLowerCase()}`).digest('hex');
      const rows = await query('SELECT * FROM shared_farmer_registry WHERE global_farmer_id = $1', [globalId]);
      const existing = rows[0];

      if (existing) {
        await run(
          `UPDATE shared_farmer_registry
           SET block_name = $1, district_name = $2, state_name = $3, pincode = $4, updated_at = CURRENT_TIMESTAMP
           WHERE global_farmer_id = $5`,
          [f.block_name || existing.block_name, f.district_name || existing.district_name, f.state_name || existing.state_name, f.pincode || existing.pincode, globalId]
        );
      } else {
        const id = 'fmr_' + crypto.randomBytes(8).toString('hex');
        await run(
          `INSERT INTO shared_farmer_registry
           (id, global_farmer_id, farmer_name, mobile_no, village_name, block_name, district_name, state_name, pincode, contributed_by_client)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [id, globalId, name, mobile, village, f.block_name || '', f.district_name || '', f.state_name || '', f.pincode || '', clientId]
        );
      }
      mergedCount++;
    }

    logger.info('Registry', `Farmer sync: ${mergedCount}/${farmers.length} from client ${clientId}`);
    return res.json({ success: true, uploaded: farmers.length, merged: mergedCount });
  } catch (err) {
    logger.error('Registry', 'Farmer sync error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/registry/farmers/updates
 * Download incremental shared farmer records modified after since timestamp
 */
router.get('/farmers/updates', async (req, res) => {
  try {
    const { since, limit = '1000' } = req.query;
    let sql = 'SELECT * FROM shared_farmer_registry WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (since) {
      sql += ` AND updated_at > $${paramIndex++}`;
      params.push(since);
    }

    const safeLimit = Math.min(Math.max(parseInt(limit) || 100, 1), 1000);
    sql += ` ORDER BY updated_at ASC LIMIT $${paramIndex++}`;
    params.push(safeLimit);

    const records = await query(sql, params);
    return res.json({ success: true, farmers: records, total: records.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/registry/dealers/sync
 * Upload local dealer records from Desktop App to Central Cloud Platform
 */
router.post('/dealers/sync', requireApiKey, async (req, res) => {
  try {
    const { dealers } = req.body;
    const clientId = req.authenticatedClient.id;

    if (!Array.isArray(dealers) || dealers.length === 0) {
      return res.json({ success: true, uploaded: 0, merged: 0 });
    }

    let mergedCount = 0;
    for (const d of dealers) {
      const name = String(d.dealer_name || d.firm_name || '').trim();
      const mobile = String(d.mobile_no || '').trim();
      const gstin = String(d.gstin || '').trim().toUpperCase();

      if (!name) continue;

      let existing = null;
      if (gstin) {
        const rows = await query('SELECT * FROM shared_dealer_registry WHERE gstin = $1', [gstin]);
        existing = rows[0];
      }
      if (!existing && mobile) {
        const rows = await query('SELECT * FROM shared_dealer_registry WHERE mobile_no = $1 AND dealer_name = $2', [mobile, name]);
        existing = rows[0];
      }

      if (existing) {
        await run(
          `UPDATE shared_dealer_registry
           SET firm_name = $1, city_village = $2, district_name = $3, state_name = $4, updated_at = CURRENT_TIMESTAMP
           WHERE id = $5`,
          [d.firm_name || existing.firm_name, d.city_village || existing.city_village, d.district_name || existing.district_name, d.state_name || existing.state_name, existing.id]
        );
      } else {
        const id = 'dlr_' + crypto.randomBytes(8).toString('hex');
        await run(
          `INSERT INTO shared_dealer_registry
           (id, gstin, dealer_name, firm_name, mobile_no, city_village, district_name, state_name, contributed_by_client)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [id, gstin || null, name, d.firm_name || name, mobile, d.city_village || '', d.district_name || '', d.state_name || '', clientId]
        );
      }
      mergedCount++;
    }

    logger.info('Registry', `Dealer sync: ${mergedCount}/${dealers.length} from client ${clientId}`);
    return res.json({ success: true, uploaded: dealers.length, merged: mergedCount });
  } catch (err) {
    logger.error('Registry', 'Dealer sync error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/registry/dealers/updates
 * Download incremental shared dealer records modified after since timestamp
 */
router.get('/dealers/updates', async (req, res) => {
  try {
    const { since, limit = '1000' } = req.query;
    let sql = 'SELECT * FROM shared_dealer_registry WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (since) {
      sql += ` AND updated_at > $${paramIndex++}`;
      params.push(since);
    }

    const safeLimit = Math.min(Math.max(parseInt(limit) || 100, 1), 1000);
    sql += ` ORDER BY updated_at ASC LIMIT $${paramIndex++}`;
    params.push(safeLimit);

    const records = await query(sql, params);
    return res.json({ success: true, dealers: records, total: records.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
