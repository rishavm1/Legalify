import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

export class Encryption {
  private static getKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
  }

  static encrypt(text: string, password?: string): string {
    try {
      const masterPassword = password || process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
      const salt = crypto.randomBytes(SALT_LENGTH);
      const key = this.getKey(masterPassword, salt);
      const iv = crypto.randomBytes(IV_LENGTH);
      
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      // Combine: salt + iv + tag + encrypted
      const combined = Buffer.concat([
        salt,
        iv,
        tag,
        Buffer.from(encrypted, 'hex')
      ]);
      
      return combined.toString('base64');
    } catch (error) {
      console.error('Encryption failed:', error);
      return text; // Fallback to unencrypted
    }
  }

  static decrypt(encryptedData: string, password?: string): string {
    try {
      const masterPassword = password || process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
      const combined = Buffer.from(encryptedData, 'base64');
      
      const salt = combined.subarray(0, SALT_LENGTH);
      const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
      const tag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
      const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
      
      const key = this.getKey(masterPassword, salt);
      
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData; // Fallback to returning as-is
    }
  }

  static hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  static generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
