import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// 32-byte key is expected (64 hex characters)
function getEncryptionKey(): Buffer {
  const keyHex = process.env.NOTE_ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error('NOTE_ENCRYPTION_KEY environment variable is not set');
  }
  
  const keyBuffer = Buffer.from(keyHex, 'hex');
  if (keyBuffer.length !== 32) {
    throw new Error('NOTE_ENCRYPTION_KEY must be a 32-byte hex string');
  }
  
  return keyBuffer;
}

export interface EncryptedData {
  encryptedContent: string; // hex
  iv: string; // hex
  authTag: string; // hex
}

/**
 * Encrypts a plaintext string using AES-256-GCM
 */
export function encryptNote(plaintext: string): EncryptedData {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    encryptedContent: encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
}

/**
 * Decrypts an encrypted hex string using AES-256-GCM
 */
export function decryptNote(encryptedContentHex: string, ivHex: string, authTagHex: string): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedContentHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
