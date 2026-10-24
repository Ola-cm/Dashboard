// Encrypts third-party credentials (OAuth tokens, API keys, ...) before they ever touch the
// database — ServiceSubscription.credentials never holds plaintext secrets at rest.
const crypto = require('crypto');
const { credentialsEncryptionKey } = require('../config/env');

const ALGORITHM = 'aes-256-gcm';

function getKey() {
  if (!credentialsEncryptionKey) {
    throw new Error('CREDENTIALS_ENCRYPTION_KEY is not set');
  }
  const key = Buffer.from(credentialsEncryptionKey, 'hex');
  if (key.length !== 32) {
    throw new Error('CREDENTIALS_ENCRYPTION_KEY must be a 32-byte value encoded as hex');
  }
  return key;
}

function encryptCredentials(payload) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final(),
  ]);
  return {
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex'),
    ciphertext: ciphertext.toString('hex'),
  };
}

function decryptCredentials(stored) {
  if (!stored) {
    return null;
  }
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(stored.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(stored.tag, 'hex'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(stored.ciphertext, 'hex')),
    decipher.final(),
  ]);
  return JSON.parse(plaintext.toString('utf8'));
}

module.exports = { encryptCredentials, decryptCredentials };
