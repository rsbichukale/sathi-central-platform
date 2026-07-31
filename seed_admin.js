require('dotenv').config();
const { run, query, getDatabase } = require('./src/db/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

(async () => {
  try {
    await getDatabase();
    console.log('Seeding admin user...');
    const username = 'admin_rohit';
    const passwordHash = await bcrypt.hash('Rohit@987', 12);
    const userId = crypto.randomUUID();
    
    // Check if exists
    const existing = await query('SELECT id FROM admin_users WHERE username = $1', [username]);
    if (existing.length > 0) {
      console.log('User already exists, updating password...');
      await run('UPDATE admin_users SET password_hash = $1 WHERE username = $2', [passwordHash, username]);
    } else {
      await run('INSERT INTO admin_users (id, username, password_hash, role) VALUES ($1, $2, $3, $4)',
        [userId, username, passwordHash, 'SUPER_ADMIN']);
    }
    console.log('Done seeding admin_rohit.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
