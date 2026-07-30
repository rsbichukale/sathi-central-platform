const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let prisma = null;
let pool = null;

async function getDatabase() {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('[CentralDB] ❌ process.env.DATABASE_URL is not set. PostgreSQL connection failed.');
    process.exit(1);
  }

  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });

  try {
    const client = await pool.connect();
    
    // Initialize schema (Legacy method - eventually we will use Prisma Migrate)
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schemaSql);
    
    // Seed Default System Settings
    const { rows } = await client.query("SELECT COUNT(*) as c FROM system_settings");
    if (parseInt(rows[0].c) === 0) {
      const defaultSettings = {
        'smtp_host': 'smtp.gmail.com',
        'smtp_port': '465',
        'smtp_user': '',
        'smtp_pass': '',
        'smtp_from': 'SATHI Platform <noreply@yourdomain.com>',
        
        'razorpay_key_id': '',
        'razorpay_key_secret': '',
        
        'plan_trial_days': '3',
        'plan_annual_price': '499900',
        'plan_annual_days': '365',
        'plan_enterprise_price': '1299900',
        'plan_enterprise_days': '730'
      };
      for (const [key, val] of Object.entries(defaultSettings)) {
        await client.query("INSERT INTO system_settings (setting_key, setting_value) VALUES ($1, $2)", [key, val]);
      }
    }
    client.release();
    
    // Test Prisma Connection
    await prisma.$connect();
    console.log('[CentralDB] ✅ Connected to PostgreSQL database (Prisma + pg)');
  } catch (err) {
    console.error('[CentralDB] ❌ Database connection error:', err);
    process.exit(1);
  }

  return pool;
}

/**
 * Execute a query and return rows (Legacy support).
 */
async function query(sql, params = []) {
  if (!pool) throw new Error('Database not initialized');
  const result = await pool.query(sql, params);
  return result.rows;
}

/**
 * Execute a query and return the result object (Legacy support).
 */
async function run(sql, params = []) {
  if (!pool) throw new Error('Database not initialized');
  const result = await pool.query(sql, params);
  return result; 
}

function getDbFileSize() {
  return 0; // Not applicable for PostgreSQL
}

function exportDatabase() {
  throw new Error("Export is not supported in Postgres mode via this API.");
}

async function importDatabase(buffer) {
  throw new Error("Import is not supported in Postgres mode via this API.");
}

module.exports = {
  getDatabase,
  query,
  run,
  exportDatabase,
  importDatabase,
  getDbFileSize,
  prisma
};
