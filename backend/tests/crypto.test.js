jest.mock('../src/config/env', () => ({
  credentialsEncryptionKey: '0123456789abcdef'.repeat(4),
}));

const { encryptCredentials, decryptCredentials } = require('../src/services/crypto');

describe('credentials crypto', () => {
  it('round-trips a payload through encrypt then decrypt', () => {
    const payload = { accessToken: 'gho_abc', refreshToken: null, expiresAt: null };

    const encrypted = encryptCredentials(payload);

    expect(encrypted).toEqual({
      iv: expect.any(String),
      tag: expect.any(String),
      ciphertext: expect.any(String),
    });
    expect(decryptCredentials(encrypted)).toEqual(payload);
  });

  it('returns null when nothing is stored', () => {
    expect(decryptCredentials(null)).toBeNull();
  });

  it('fails to decrypt with a tampered ciphertext', () => {
    const encrypted = encryptCredentials({ accessToken: 'gho_abc' });
    encrypted.ciphertext = encrypted.ciphertext.replace(/.$/, (c) => (c === '0' ? '1' : '0'));

    expect(() => decryptCredentials(encrypted)).toThrow();
  });
});
