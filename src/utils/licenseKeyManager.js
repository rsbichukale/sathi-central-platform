const crypto = require('crypto');

// Custom Base32 Alphabet (Excludes 0, 1, O, I for readability)
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const SECRET_KEY = 'SATHI_LICENSE_SECRET_KEY_2026'; // Symmetric key for checksums
const EPOCH_START = new Date('2024-01-01T00:00:00Z').getTime();

class LicenseKeyManager {
  /**
   * Calculate days since Jan 1, 2024
   */
  static _dateToEpochDays(dateString) {
    const d = new Date(dateString).getTime();
    return Math.floor((d - EPOCH_START) / (1000 * 60 * 60 * 24));
  }

  static _epochDaysToDate(days) {
    return new Date(EPOCH_START + days * 1000 * 60 * 60 * 24);
  }

  /**
   * Encode Buffer to 25-character Base32 string
   * @param {Buffer} buffer - 15 bytes buffer
   */
  static _encodeBase32(buffer) {
    let bits = 0;
    let value = 0;
    let output = '';

    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;
      while (bits >= 5) {
        output += ALPHABET[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    if (bits > 0) {
      output += ALPHABET[(value << (5 - bits)) & 31];
    }
    
    // Ensure exactly 25 characters by truncating or padding
    output = output.padEnd(25, '2').substring(0, 25);
    
    // Format into XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
    return output.match(/.{1,5}/g).join('-');
  }

  /**
   * Decode 25-character Base32 string to Buffer
   */
  static _decodeBase32(str) {
    const cleanStr = str.replace(/-/g, '').toUpperCase();
    if (cleanStr.length !== 25) throw new Error('Invalid License Key format.');

    let bits = 0;
    let value = 0;
    const buffer = [];

    for (let i = 0; i < cleanStr.length; i++) {
      const idx = ALPHABET.indexOf(cleanStr[i]);
      if (idx === -1) throw new Error('Invalid characters in License Key.');
      
      value = (value << 5) | idx;
      bits += 5;

      if (bits >= 8) {
        buffer.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }
    return Buffer.from(buffer.slice(0, 15)); // Return exactly 15 bytes
  }

  /**
   * Generate a 25-character Microsoft-style Product Key
   * @param {number} serialNumber - Random 32-bit integer for uniqueness
   * @param {string} expiryDate - ISO Date String (e.g. '2027-01-01')
   */
  static generateKey(serialNumber, expiryDate) {
    const payload = Buffer.alloc(6);
    payload.writeUInt32BE(serialNumber, 0);
    const expiryDays = this._dateToEpochDays(expiryDate);
    payload.writeUInt16BE(Math.max(0, expiryDays), 4);

    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(payload);
    const checksum = hmac.digest().slice(0, 9); // Take first 9 bytes

    const finalBuffer = Buffer.concat([payload, checksum]); // 15 bytes
    return this._encodeBase32(finalBuffer);
  }

  /**
   * Verify and decode a License Key locally
   * @param {string} licenseKey - The formatted key (XXXXX-XXXXX-XXXXX-XXXXX-XXXXX)
   * @returns {{ valid: boolean, serialNumber?: number, expiryDate?: string, isExpired?: boolean, error?: string }}
   */
  static decodeAndVerify(licenseKey) {
    try {
      const buffer = this._decodeBase32(licenseKey);
      if (buffer.length < 15) return { valid: false, error: 'Key too short' };

      const payload = buffer.slice(0, 6);
      const providedChecksum = buffer.slice(6, 15);

      const hmac = crypto.createHmac('sha256', SECRET_KEY);
      hmac.update(payload);
      const expectedChecksum = hmac.digest().slice(0, 9);

      if (!providedChecksum.equals(expectedChecksum)) {
        return { valid: false, error: 'Invalid checksum. Key has been tampered with or is incorrect.' };
      }

      const serialNumber = payload.readUInt32BE(0);
      const expiryDays = payload.readUInt16BE(4);
      const expiryDate = this._epochDaysToDate(expiryDays);
      const isExpired = Date.now() > expiryDate.getTime();

      return {
        valid: true,
        serialNumber,
        expiryDate: expiryDate.toISOString(),
        isExpired
      };
    } catch (e) {
      return { valid: false, error: e.message };
    }
  }
}

module.exports = LicenseKeyManager;
