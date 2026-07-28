const { query, run } = require('../db/database');

class SettingsService {
  /**
   * Get all system settings as a key-value object
   * @returns {Promise<Object>} { setting_key: 'setting_value' }
   */
  static async getAllSettings() {
    const rows = await query('SELECT * FROM system_settings');
    const settings = {};
    for (const row of rows) {
      settings[row.setting_key] = row.setting_value;
    }
    return settings;
  }

  /**
   * Get a specific setting by key
   * @param {string} key 
   * @param {string} defaultValue 
   * @returns {Promise<string>}
   */
  static async getSetting(key, defaultValue = '') {
    const rows = await query('SELECT setting_value FROM system_settings WHERE setting_key = $1', [key]);
    return rows.length > 0 ? rows[0].setting_value : defaultValue;
  }

  /**
   * Update multiple settings at once
   * @param {Object} settingsObj { key: 'value' }
   */
  static async updateSettings(settingsObj) {
    if (!settingsObj || typeof settingsObj !== 'object') return;
    for (const [key, val] of Object.entries(settingsObj)) {
      // Upsert: PostgreSQL uses ON CONFLICT DO UPDATE
      await run(
        `INSERT INTO system_settings (setting_key, setting_value, updated_at) 
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (setting_key) 
         DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP`,
        [key, String(val)]
      );
    }
  }
}

module.exports = SettingsService;
