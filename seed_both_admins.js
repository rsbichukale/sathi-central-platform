require('dotenv').config();
const { run, query, getDatabase } = require('./src/db/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

(async () => {
  try {
    await getDatabase();
    console.log('Seeding admin users...');
    
    // 1. admin_rohit / Rohit@987
    const hashRohit = await bcrypt.hash('Rohit@987', 12);
    const existingRohit = await query('SELECT id FROM admin_users WHERE username = ?', ['admin_rohit']);
    if (existingRohit.length > 0) {
      await run('UPDATE admin_users SET password_hash = ? WHERE username = ?', [hashRohit, 'admin_rohit']);
    } else {
      await run('INSERT INTO admin_users (id, username, password_hash, role) VALUES (?, ?, ?, ?)',
        [crypto.randomUUID(), 'admin_rohit', hashRohit, 'SUPER_ADMIN']);
    }

    // 2. admin / admin123
    const hashAdmin = await bcrypt.hash('admin123', 12);
    const existingAdmin = await query('SELECT id FROM admin_users WHERE username = ?', ['admin']);
    if (existingAdmin.length > 0) {
      await run('UPDATE admin_users SET password_hash = ? WHERE username = ?', [hashAdmin, 'admin']);
    } else {
      await run('INSERT INTO admin_users (id, username, password_hash, role) VALUES (?, ?, ?, ?)',
        [crypto.randomUUID(), 'admin', hashAdmin, 'SUPER_ADMIN']);
    }

    // 3. Dev API Key Client
    const existingClient = await query('SELECT id FROM clients WHERE api_key = ?', ['dev_key_2026']);
    if (existingClient.length === 0) {
      await run(
        `INSERT INTO clients (id, client_id, client_secret_hash, api_key, api_key_status, firm_name, owner_name, mobile_no)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), 'CLI_DEV_123', 'hash', 'dev_key_2026', 'ACTIVE', 'Ruractive Tech Dev', 'Rohit Bichukale', '9545036060']
      );
    }

    console.log('✅ Admin accounts ready:');
    console.log('   Account 1: admin_rohit / Rohit@987');
    console.log('   Account 2: admin / admin123');
    console.log('   Dev API Key: dev_key_2026');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
