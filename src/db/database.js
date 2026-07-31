const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let prisma = null;
let pool = null;
let sqliteDb = null;
let isSqlite = false;

async function getDatabase() {
  if (pool || sqliteDb) return pool || sqliteDb;

  const connectionString = process.env.DATABASE_URL;

  try {
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });

    const client = await pool.connect();
    
    // Initialize schema
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
    
    await prisma.$connect();
    console.log('[CentralDB] ✅ Connected to PostgreSQL database (Prisma + pg)');
  } catch (err) {
    console.warn('[CentralDB] ℹ️ PostgreSQL not available. Initializing SQLite fallback for local Central Platform server...');
    try {
      const Database = require('better-sqlite3');
      const dataDir = path.join(__dirname, '../../data');
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      sqliteDb = new Database(path.join(dataDir, 'central_platform.db'));
      sqliteDb.pragma('journal_mode = WAL');
      
      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      sqliteDb.exec(schemaSql);

      isSqlite = true;
      console.log('[CentralDB] ✅ Connected to SQLite local fallback database (central_platform.db)');
    } catch (sqErr) {
      console.error('[CentralDB] ❌ Failed to initialize SQLite fallback:', sqErr);
      process.exit(1);
    }
  }

  return pool || sqliteDb;
}

/**
 * Execute a query and return rows
 */
async function query(sql, params = []) {
  if (isSqlite && sqliteDb) {
    const sqliteSql = sql.replace(/\$\d+/g, '?');
    const stmt = sqliteDb.prepare(sqliteSql);
    return stmt.all(...params);
  }
  if (!pool) throw new Error('Database not initialized');
  const result = await pool.query(sql, params);
  return result.rows;
}

/**
 * Execute a query and return the result object
 */
async function run(sql, params = []) {
  if (isSqlite && sqliteDb) {
    const sqliteSql = sql.replace(/\$\d+/g, '?');
    const stmt = sqliteDb.prepare(sqliteSql);
    return stmt.run(...params);
  }
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
  get prisma() { return prisma; },
  get isSqlite() { return isSqlite; }
};
